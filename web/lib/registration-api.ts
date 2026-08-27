"use client";

import type { Registration, RegistrationFormValues } from "./types";

export interface SubmitRegistrationResponse {
  duplicate: boolean;
  registration: Registration;
}

export async function submitRegistration(eventId: string, values: RegistrationFormValues): Promise<SubmitRegistrationResponse> {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, ...values }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `신청 처리가 실패했습니다. (${res.status})`);
  }

  return (await res.json()) as SubmitRegistrationResponse;
}

export async function fetchRegistrationById(id: string): Promise<Registration | undefined> {
  const res = await fetch(`/api/registrations/${id}`);
  if (!res.ok) return undefined;
  const body = (await res.json()) as { registration: Registration };
  return body.registration;
}
