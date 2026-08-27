"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type {
  BiomatesEvent,
  EmailBatchLog,
  EventFormValues,
  MessageBatchLog,
  MessageSendStatus,
  MessageTemplateKey,
  Registration,
  RegistrationFormValues,
  SmsMessageType,
} from "./types";
import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/is-configured";
import { rowToEvent, rowToRegistration, eventFormValuesToRow } from "./supabase/mappers";
import { submitRegistration, fetchRegistrationById } from "./registration-api";
import { useAdminAuth } from "./auth-context";

const STORAGE_KEY = "biomates_web_state_v1";

/**
 * The only things left in browser-local storage: which registration ids
 * "belong" to this browser (for My Registration), and the SMS/email send
 * history summary (not participant data itself, just a convenience log --
 * see the DB migration plan notes for why this piece stays local for now).
 * Events/Registrations themselves live in Supabase (see fetch* below).
 */
interface PersistedState {
  myRegistrationIds: string[];
  messageLogs: MessageBatchLog[];
  emailLogs: EmailBatchLog[];
}

function freshState(): PersistedState {
  return { myRegistrationIds: [], messageLogs: [], emailLogs: [] };
}

function normalizeState(raw: Partial<PersistedState> | null): PersistedState {
  if (!raw) return freshState();
  return {
    myRegistrationIds: raw.myRegistrationIds ?? [],
    messageLogs: raw.messageLogs ?? [],
    emailLogs: raw.emailLogs ?? [],
  };
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw) as Partial<PersistedState>);
  } catch {
    return null;
  }
}

function saveToStorage(state: PersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — best-effort.
  }
}

const SERVER_SNAPSHOT: PersistedState = freshState();
let clientState: PersistedState = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function getClientSnapshot(): PersistedState {
  if (clientState === SERVER_SNAPSHOT) {
    clientState = loadFromStorage() ?? freshState();
  }
  return clientState;
}

function getServerSnapshot(): PersistedState {
  return SERVER_SNAPSHOT;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function updateLocalState(updater: (prev: PersistedState) => PersistedState) {
  clientState = updater(getClientSnapshot());
  saveToStorage(clientState);
  listeners.forEach((l) => l());
}

interface RegisterResult {
  registration: Registration;
  duplicate: boolean;
}

interface BiomatesDataContextValue {
  events: BiomatesEvent[];
  messageLogs: MessageBatchLog[];
  emailLogs: EmailBatchLog[];
  isHydrated: boolean;
  getEvent: (eventId: string) => BiomatesEvent | undefined;
  activeRegistrationsForEvent: (eventId: string) => Registration[];
  registrationsForEvent: (eventId: string) => Registration[];
  registrationCountForEvent: (eventId: string) => number;
  myRegistrations: () => Registration[];
  getRegistration: (registrationId: string) => Promise<Registration | undefined>;
  registerForEvent: (eventId: string, values: RegistrationFormValues) => Promise<RegisterResult>;
  createEvent: (values: EventFormValues) => Promise<BiomatesEvent>;
  updateEvent: (eventId: string, values: EventFormValues) => Promise<void>;
  setSurveyFormUrl: (eventId: string, url: string) => Promise<void>;
  setEventPublished: (eventId: string, published: boolean) => Promise<void>;
  markPaid: (registrationId: string) => Promise<void>;
  cancelRegistration: (registrationId: string) => Promise<void>;
  completeRefund: (registrationId: string) => Promise<void>;
  checkIn: (registrationId: string) => Promise<void>;
  undoCheckIn: (registrationId: string) => Promise<void>;
  markAttended: (registrationId: string) => Promise<void>;
  markNoShow: (registrationId: string) => Promise<void>;
  recordMessageBatch: (eventId: string, templateKey: MessageTemplateKey, entries: MessageBatchEntry[]) => Promise<void>;
  recordEmailBatch: (eventId: string, subject: string, entries: EmailBatchEntry[]) => Promise<void>;
}

export interface MessageBatchEntry {
  registrationId: string;
  name: string;
  body: string;
  status: MessageSendStatus;
  msgType: SmsMessageType;
  providerMessageId?: string;
  errorMessage?: string;
}

export interface EmailBatchEntry {
  registrationId: string;
  name: string;
  subject: string;
  body: string;
  status: MessageSendStatus;
  providerMessageId?: string;
  errorMessage?: string;
}

const BiomatesDataContext = createContext<BiomatesDataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const local = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const { isAuthed } = useAdminAuth();

  const [events, setEvents] = useState<BiomatesEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [myRegistrationsList, setMyRegistrationsList] = useState<Registration[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setEventsLoaded(true);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (!cancelled) {
        setEvents((data ?? []).map(rowToEvent));
        setEventsLoaded(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const { data } = await supabase.from("registration_counts").select("event_id, active_count");
      if (cancelled) return;
      const map: Record<string, number> = {};
      (data ?? []).forEach((row: { event_id: string; active_count: number }) => {
        map[row.event_id] = row.active_count;
      });
      setRegistrationCounts(map);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isAuthed || !isSupabaseConfigured()) {
        if (!cancelled) setRegistrations([]);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.from("registrations").select("*");
      if (!cancelled) setRegistrations((data ?? []).map(rowToRegistration));
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.all(local.myRegistrationIds.map((id) => fetchRegistrationById(id)));
      if (!cancelled) setMyRegistrationsList(results.filter((r): r is Registration => Boolean(r)));
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [local.myRegistrationIds]);

  const getEvent = useCallback((eventId: string) => events.find((e) => e.id === eventId), [events]);

  const activeRegistrationsForEvent = useCallback(
    (eventId: string) => registrations.filter((r) => r.eventId === eventId && r.registrationStatus !== "CANCELLED"),
    [registrations]
  );

  const registrationsForEvent = useCallback(
    (eventId: string) => registrations.filter((r) => r.eventId === eventId),
    [registrations]
  );

  const registrationCountForEvent = useCallback((eventId: string) => registrationCounts[eventId] ?? 0, [registrationCounts]);

  const myRegistrations = useCallback(() => myRegistrationsList, [myRegistrationsList]);

  const getRegistration = useCallback((registrationId: string) => fetchRegistrationById(registrationId), []);

  const registerForEvent = useCallback(async (eventId: string, values: RegistrationFormValues): Promise<RegisterResult> => {
    const { duplicate, registration } = await submitRegistration(eventId, values);
    updateLocalState((prev) =>
      prev.myRegistrationIds.includes(registration.id)
        ? prev
        : { ...prev, myRegistrationIds: [...prev.myRegistrationIds, registration.id] }
    );
    return { registration, duplicate };
  }, []);

  const createEvent = useCallback(async (values: EventFormValues): Promise<BiomatesEvent> => {
    const id = `evt-${Date.now()}`;
    const supabase = createClient();
    const { data, error } = await supabase.from("events").insert(eventFormValuesToRow(id, values)).select("*").single();
    if (error || !data) throw new Error(error?.message || "행사 생성에 실패했습니다.");
    const event = rowToEvent(data);
    setEvents((prev) => [...prev, event]);
    return event;
  }, []);

  const updateEvent = useCallback(async (eventId: string, values: EventFormValues) => {
    const supabase = createClient();
    const { error } = await supabase.from("events").update(eventFormValuesToRow(eventId, values)).eq("id", eventId);
    if (error) {
      console.error(error);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...values } : e)));
  }, []);

  const setSurveyFormUrl = useCallback(async (eventId: string, url: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("events").update({ survey_form_url: url }).eq("id", eventId);
    if (error) {
      console.error(error);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, surveyFormUrl: url } : e)));
  }, []);

  const setEventPublished = useCallback(async (eventId: string, published: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from("events").update({ published }).eq("id", eventId);
    if (error) {
      console.error(error);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, published } : e)));
  }, []);

  const patchRegistrationRemote = useCallback(
    async (registrationId: string, remotePatch: Record<string, unknown>, localPatch: Partial<Registration>) => {
      setRegistrations((prev) => prev.map((r) => (r.id === registrationId ? { ...r, ...localPatch } : r)));
      const supabase = createClient();
      const { error } = await supabase.from("registrations").update(remotePatch).eq("id", registrationId);
      if (error) console.error(error);
    },
    []
  );

  const markPaid = useCallback(
    (registrationId: string) =>
      patchRegistrationRemote(
        registrationId,
        { payment_status: "PAID", registration_status: "CONFIRMED" },
        { paymentStatus: "PAID", registrationStatus: "CONFIRMED" }
      ),
    [patchRegistrationRemote]
  );

  const cancelRegistration = useCallback(
    (registrationId: string) => {
      const reg = registrations.find((r) => r.id === registrationId);
      if (!reg) return Promise.resolve();
      const paymentStatus = reg.paymentStatus === "PAID" ? "REFUND_PENDING" : reg.paymentStatus;
      return patchRegistrationRemote(
        registrationId,
        { registration_status: "CANCELLED", payment_status: paymentStatus },
        { registrationStatus: "CANCELLED", paymentStatus }
      );
    },
    [registrations, patchRegistrationRemote]
  );

  const completeRefund = useCallback(
    (registrationId: string) => patchRegistrationRemote(registrationId, { payment_status: "REFUNDED" }, { paymentStatus: "REFUNDED" }),
    [patchRegistrationRemote]
  );

  const checkIn = useCallback(
    (registrationId: string) => {
      const now = new Date().toISOString();
      return patchRegistrationRemote(
        registrationId,
        { registration_status: "CHECKED_IN", checkin_at: now },
        { registrationStatus: "CHECKED_IN", checkinAt: now }
      );
    },
    [patchRegistrationRemote]
  );

  const undoCheckIn = useCallback(
    (registrationId: string) =>
      patchRegistrationRemote(registrationId, { registration_status: "CONFIRMED", checkin_at: null }, { registrationStatus: "CONFIRMED", checkinAt: null }),
    [patchRegistrationRemote]
  );

  const markAttended = useCallback(
    (registrationId: string) => patchRegistrationRemote(registrationId, { registration_status: "ATTENDED" }, { registrationStatus: "ATTENDED" }),
    [patchRegistrationRemote]
  );

  const markNoShow = useCallback(
    (registrationId: string) => patchRegistrationRemote(registrationId, { registration_status: "NO_SHOW" }, { registrationStatus: "NO_SHOW" }),
    [patchRegistrationRemote]
  );

  const recordMessageBatch = useCallback(
    async (eventId: string, templateKey: MessageTemplateKey, entries: MessageBatchEntry[]) => {
      if (!entries.length) return;
      const now = new Date().toISOString();
      const entryByRegId = new Map(entries.map((e) => [e.registrationId, e]));

      const merged = registrations.map((r) => {
        const entry = entryByRegId.get(r.id);
        if (!entry) return r;
        return {
          ...r,
          smsLog: [
            ...(r.smsLog ?? []),
            {
              templateKey,
              body: entry.body,
              sentAt: now,
              status: entry.status,
              msgType: entry.msgType,
              providerMessageId: entry.providerMessageId,
              errorMessage: entry.errorMessage,
            },
          ],
        };
      });
      setRegistrations(merged);

      const supabase = createClient();
      await Promise.all(
        entries.map(async (entry) => {
          const reg = merged.find((r) => r.id === entry.registrationId);
          if (!reg) return;
          const { error } = await supabase.from("registrations").update({ sms_log: reg.smsLog }).eq("id", entry.registrationId);
          if (error) console.error(error);
        })
      );

      const successCount = entries.filter((e) => e.status === "SENT").length;
      const batch: MessageBatchLog = {
        id: `msg-${Date.now()}`,
        eventId,
        templateKey,
        recipientCount: entries.length,
        recipientNames: entries.map((e) => e.name),
        sentAt: now,
        successCount,
        failedCount: entries.length - successCount,
      };
      updateLocalState((prev) => ({ ...prev, messageLogs: [batch, ...prev.messageLogs] }));
    },
    [registrations]
  );

  const recordEmailBatch = useCallback(
    async (eventId: string, subject: string, entries: EmailBatchEntry[]) => {
      if (!entries.length) return;
      const now = new Date().toISOString();
      const entryByRegId = new Map(entries.map((e) => [e.registrationId, e]));

      const merged = registrations.map((r) => {
        const entry = entryByRegId.get(r.id);
        if (!entry) return r;
        return {
          ...r,
          emailLog: [
            ...(r.emailLog ?? []),
            {
              subject: entry.subject,
              body: entry.body,
              sentAt: now,
              status: entry.status,
              providerMessageId: entry.providerMessageId,
              errorMessage: entry.errorMessage,
            },
          ],
        };
      });
      setRegistrations(merged);

      const supabase = createClient();
      await Promise.all(
        entries.map(async (entry) => {
          const reg = merged.find((r) => r.id === entry.registrationId);
          if (!reg) return;
          const { error } = await supabase.from("registrations").update({ email_log: reg.emailLog }).eq("id", entry.registrationId);
          if (error) console.error(error);
        })
      );

      const successCount = entries.filter((e) => e.status === "SENT").length;
      const batch: EmailBatchLog = {
        id: `email-${Date.now()}`,
        eventId,
        subject,
        recipientCount: entries.length,
        recipientNames: entries.map((e) => e.name),
        sentAt: now,
        successCount,
        failedCount: entries.length - successCount,
      };
      updateLocalState((prev) => ({ ...prev, emailLogs: [batch, ...prev.emailLogs] }));
    },
    [registrations]
  );

  const value: BiomatesDataContextValue = {
    events,
    messageLogs: local.messageLogs,
    emailLogs: local.emailLogs,
    isHydrated: eventsLoaded,
    getEvent,
    activeRegistrationsForEvent,
    registrationsForEvent,
    registrationCountForEvent,
    myRegistrations,
    getRegistration,
    registerForEvent,
    createEvent,
    updateEvent,
    setSurveyFormUrl,
    setEventPublished,
    markPaid,
    cancelRegistration,
    completeRefund,
    checkIn,
    undoCheckIn,
    markAttended,
    markNoShow,
    recordMessageBatch,
    recordEmailBatch,
  };

  return <BiomatesDataContext.Provider value={value}>{children}</BiomatesDataContext.Provider>;
}

export function useBiomatesData(): BiomatesDataContextValue {
  const ctx = useContext(BiomatesDataContext);
  if (!ctx) throw new Error("useBiomatesData must be used within a DataProvider");
  return ctx;
}
