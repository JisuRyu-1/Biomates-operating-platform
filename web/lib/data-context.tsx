"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import type {
  AdminAccount,
  BiomatesEvent,
  EmailBatchLog,
  EventFormValues,
  MessageBatchLog,
  MessageTemplateKey,
  Registration,
  RegistrationFormValues,
} from "./types";
import { seedAdminAccounts, seedEvents } from "./seed-data";
import { initialStatusFor } from "./status";
import { resolveTemplate } from "./message-templates";

const STORAGE_KEY = "biomates_web_state_v1";

interface PersistedState {
  events: BiomatesEvent[];
  registrations: Registration[];
  myRegistrationIds: string[];
  adminAccounts: AdminAccount[];
  messageLogs: MessageBatchLog[];
  emailLogs: EmailBatchLog[];
}

function freshState(): PersistedState {
  return {
    events: seedEvents(),
    registrations: [],
    myRegistrationIds: [],
    adminAccounts: seedAdminAccounts(),
    messageLogs: [],
    emailLogs: [],
  };
}

/**
 * Fills in fields that didn't exist yet in state a browser may already have
 * persisted from an earlier version of this app (e.g. before adminAccounts
 * existed) — without this, `.map`/`.filter` on a missing field throws.
 */
function normalizeState(raw: Partial<PersistedState> | null): PersistedState {
  if (!raw) return freshState();
  return {
    events: raw.events ?? seedEvents(),
    registrations: (raw.registrations ?? []).map((r) => ({ ...r, smsLog: r.smsLog ?? [], emailLog: r.emailLog ?? [] })),
    myRegistrationIds: raw.myRegistrationIds ?? [],
    adminAccounts: raw.adminAccounts?.length ? raw.adminAccounts : seedAdminAccounts(),
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
    // localStorage unavailable (private mode, quota, etc.) — mock persistence is best-effort.
  }
}

/**
 * Tiny external store backing the mock "backend". Reading/writing goes
 * through useSyncExternalStore so localStorage hydration never fights
 * React's render (no setState-in-effect), and the store's snapshot
 * reference only changes when the data actually changes.
 */
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

function updateState(updater: (prev: PersistedState) => PersistedState) {
  clientState = updater(getClientSnapshot());
  saveToStorage(clientState);
  listeners.forEach((l) => l());
}

function patchRegistration(prev: PersistedState, id: string, patch: Partial<Registration>): PersistedState {
  return { ...prev, registrations: prev.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r)) };
}

interface RegisterResult {
  registration: Registration;
  duplicate: boolean;
}

interface BiomatesDataContextValue {
  events: BiomatesEvent[];
  adminAccounts: AdminAccount[];
  messageLogs: MessageBatchLog[];
  emailLogs: EmailBatchLog[];
  isHydrated: boolean;
  getEvent: (eventId: string) => BiomatesEvent | undefined;
  activeRegistrationsForEvent: (eventId: string) => Registration[];
  registrationsForEvent: (eventId: string) => Registration[];
  myRegistrations: () => Registration[];
  getRegistration: (registrationId: string) => Registration | undefined;
  registerForEvent: (eventId: string, values: RegistrationFormValues) => RegisterResult;
  createEvent: (values: EventFormValues) => BiomatesEvent;
  updateEvent: (eventId: string, values: EventFormValues) => void;
  setSurveyFormUrl: (eventId: string, url: string) => void;
  markPaid: (registrationId: string) => void;
  cancelRegistration: (registrationId: string) => void;
  completeRefund: (registrationId: string) => void;
  checkIn: (registrationId: string) => void;
  undoCheckIn: (registrationId: string) => void;
  markAttended: (registrationId: string) => void;
  markNoShow: (registrationId: string) => void;
  sendMessages: (eventId: string, registrationIds: string[], templateKey: MessageTemplateKey, body: string) => void;
  sendSurveyEmails: (eventId: string, registrationIds: string[], subject: string, body: string) => void;
  addAdminAccount: (name: string, email: string) => void;
  removeAdminAccount: (id: string) => void;
}

const BiomatesDataContext = createContext<BiomatesDataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const isHydrated = state !== SERVER_SNAPSHOT;

  const getEvent = useCallback((eventId: string) => state.events.find((e) => e.id === eventId), [state.events]);

  const activeRegistrationsForEvent = useCallback(
    (eventId: string) =>
      state.registrations.filter((r) => r.eventId === eventId && r.registrationStatus !== "CANCELLED"),
    [state.registrations]
  );

  const registrationsForEvent = useCallback(
    (eventId: string) => state.registrations.filter((r) => r.eventId === eventId),
    [state.registrations]
  );

  const myRegistrations = useCallback(
    () => state.registrations.filter((r) => state.myRegistrationIds.includes(r.id)),
    [state.registrations, state.myRegistrationIds]
  );

  const getRegistration = useCallback(
    (registrationId: string) => state.registrations.find((r) => r.id === registrationId),
    [state.registrations]
  );

  const registerForEvent = useCallback((eventId: string, values: RegistrationFormValues): RegisterResult => {
    const current = getClientSnapshot();
    const event = current.events.find((e) => e.id === eventId);
    if (!event) throw new Error(`Unknown event: ${eventId}`);

    const existing = current.registrations.find(
      (r) => r.eventId === eventId && current.myRegistrationIds.includes(r.id) && r.registrationStatus !== "CANCELLED"
    );
    if (existing) {
      return { registration: existing, duplicate: true };
    }

    const { registrationStatus, paymentStatus } = initialStatusFor(event);
    const registration: Registration = {
      id: `r-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      eventId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      organization: values.organization,
      purpose: values.purpose,
      marketingOptIn: values.marketingOptIn,
      registrationStatus,
      paymentStatus,
      registeredAt: new Date().toISOString(),
      checkinAt: null,
      depositorName: values.name,
      note: "",
      smsLog: [],
      emailLog: [],
    };

    updateState((prev) => ({
      ...prev,
      registrations: [...prev.registrations, registration],
      myRegistrationIds: [...prev.myRegistrationIds, registration.id],
    }));

    return { registration, duplicate: false };
  }, []);

  const createEvent = useCallback((values: EventFormValues): BiomatesEvent => {
    const event: BiomatesEvent = {
      id: `evt-${Date.now()}`,
      ...values,
      resources: [],
      surveyFormUrl: "",
    };
    updateState((prev) => ({ ...prev, events: [...prev.events, event] }));
    return event;
  }, []);

  const updateEvent = useCallback((eventId: string, values: EventFormValues) => {
    updateState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === eventId ? { ...e, ...values } : e)),
    }));
  }, []);

  const setSurveyFormUrl = useCallback((eventId: string, url: string) => {
    updateState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === eventId ? { ...e, surveyFormUrl: url } : e)),
    }));
  }, []);

  const markPaid = useCallback((registrationId: string) => {
    updateState((prev) => patchRegistration(prev, registrationId, { paymentStatus: "PAID", registrationStatus: "CONFIRMED" }));
  }, []);

  const cancelRegistration = useCallback((registrationId: string) => {
    updateState((prev) => {
      const reg = prev.registrations.find((r) => r.id === registrationId);
      if (!reg) return prev;
      const paymentStatus = reg.paymentStatus === "PAID" ? "REFUND_PENDING" : reg.paymentStatus;
      return patchRegistration(prev, registrationId, { registrationStatus: "CANCELLED", paymentStatus });
    });
  }, []);

  const completeRefund = useCallback((registrationId: string) => {
    updateState((prev) => patchRegistration(prev, registrationId, { paymentStatus: "REFUNDED" }));
  }, []);

  const checkIn = useCallback((registrationId: string) => {
    updateState((prev) =>
      patchRegistration(prev, registrationId, { registrationStatus: "CHECKED_IN", checkinAt: new Date().toISOString() })
    );
  }, []);

  const undoCheckIn = useCallback((registrationId: string) => {
    updateState((prev) => patchRegistration(prev, registrationId, { registrationStatus: "CONFIRMED", checkinAt: null }));
  }, []);

  const markAttended = useCallback((registrationId: string) => {
    updateState((prev) => patchRegistration(prev, registrationId, { registrationStatus: "ATTENDED" }));
  }, []);

  const markNoShow = useCallback((registrationId: string) => {
    updateState((prev) => patchRegistration(prev, registrationId, { registrationStatus: "NO_SHOW" }));
  }, []);

  const sendMessages = useCallback(
    (eventId: string, registrationIds: string[], templateKey: MessageTemplateKey, body: string) => {
      updateState((prev) => {
        const event = prev.events.find((e) => e.id === eventId);
        if (!event || !registrationIds.length) return prev;
        const now = new Date().toISOString();
        const targets = prev.registrations.filter((r) => registrationIds.includes(r.id));
        const registrations = prev.registrations.map((r) =>
          registrationIds.includes(r.id)
            ? { ...r, smsLog: [...(r.smsLog ?? []), { templateKey, body: resolveTemplate(body, r, event), sentAt: now }] }
            : r
        );
        const batch: MessageBatchLog = {
          id: `msg-${Date.now()}`,
          eventId,
          templateKey,
          recipientCount: targets.length,
          recipientNames: targets.map((r) => r.name),
          sentAt: now,
        };
        return { ...prev, registrations, messageLogs: [batch, ...prev.messageLogs] };
      });
    },
    []
  );

  const sendSurveyEmails = useCallback((eventId: string, registrationIds: string[], subject: string, body: string) => {
    updateState((prev) => {
      const event = prev.events.find((e) => e.id === eventId);
      if (!event || !registrationIds.length) return prev;
      const now = new Date().toISOString();
      const targets = prev.registrations.filter((r) => registrationIds.includes(r.id));
      const registrations = prev.registrations.map((r) =>
        registrationIds.includes(r.id)
          ? {
              ...r,
              emailLog: [
                ...(r.emailLog ?? []),
                { subject: resolveTemplate(subject, r, event), body: resolveTemplate(body, r, event), sentAt: now },
              ],
            }
          : r
      );
      const batch: EmailBatchLog = {
        id: `email-${Date.now()}`,
        eventId,
        subject,
        recipientCount: targets.length,
        recipientNames: targets.map((r) => r.name),
        sentAt: now,
      };
      return { ...prev, registrations, emailLogs: [batch, ...prev.emailLogs] };
    });
  }, []);

  const addAdminAccount = useCallback((name: string, email: string) => {
    updateState((prev) => ({
      ...prev,
      adminAccounts: [...prev.adminAccounts, { id: `admin-${Date.now()}`, name, email }],
    }));
  }, []);

  const removeAdminAccount = useCallback((id: string) => {
    updateState((prev) => {
      if (prev.adminAccounts.length <= 1) return prev;
      return { ...prev, adminAccounts: prev.adminAccounts.filter((a) => a.id !== id) };
    });
  }, []);

  const value: BiomatesDataContextValue = {
    events: state.events,
    adminAccounts: state.adminAccounts,
    messageLogs: state.messageLogs,
    emailLogs: state.emailLogs,
    isHydrated,
    getEvent,
    activeRegistrationsForEvent,
    registrationsForEvent,
    myRegistrations,
    getRegistration,
    registerForEvent,
    createEvent,
    updateEvent,
    setSurveyFormUrl,
    markPaid,
    cancelRegistration,
    completeRefund,
    checkIn,
    undoCheckIn,
    markAttended,
    markNoShow,
    sendMessages,
    sendSurveyEmails,
    addAdminAccount,
    removeAdminAccount,
  };

  return <BiomatesDataContext.Provider value={value}>{children}</BiomatesDataContext.Provider>;
}

export function useBiomatesData(): BiomatesDataContextValue {
  const ctx = useContext(BiomatesDataContext);
  if (!ctx) throw new Error("useBiomatesData must be used within a DataProvider");
  return ctx;
}
