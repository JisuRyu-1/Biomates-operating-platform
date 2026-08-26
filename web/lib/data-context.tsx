"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { BiomatesEvent, EventFormValues, Registration, RegistrationFormValues } from "./types";
import { seedEvents } from "./seed-data";
import { initialStatusFor } from "./status";

const STORAGE_KEY = "biomates_web_state_v1";

interface PersistedState {
  events: BiomatesEvent[];
  registrations: Registration[];
  myRegistrationIds: string[];
}

function freshState(): PersistedState {
  return { events: seedEvents(), registrations: [], myRegistrationIds: [] };
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
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

interface RegisterResult {
  registration: Registration;
  duplicate: boolean;
}

interface BiomatesDataContextValue {
  events: BiomatesEvent[];
  isHydrated: boolean;
  getEvent: (eventId: string) => BiomatesEvent | undefined;
  activeRegistrationsForEvent: (eventId: string) => Registration[];
  myRegistrations: () => Registration[];
  getRegistration: (registrationId: string) => Registration | undefined;
  registerForEvent: (eventId: string, values: RegistrationFormValues) => RegisterResult;
  createEvent: (values: EventFormValues) => BiomatesEvent;
  updateEvent: (eventId: string, values: EventFormValues) => void;
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

  const value: BiomatesDataContextValue = {
    events: state.events,
    isHydrated,
    getEvent,
    activeRegistrationsForEvent,
    myRegistrations,
    getRegistration,
    registerForEvent,
    createEvent,
    updateEvent,
  };

  return <BiomatesDataContext.Provider value={value}>{children}</BiomatesDataContext.Provider>;
}

export function useBiomatesData(): BiomatesDataContextValue {
  const ctx = useContext(BiomatesDataContext);
  if (!ctx) throw new Error("useBiomatesData must be used within a DataProvider");
  return ctx;
}
