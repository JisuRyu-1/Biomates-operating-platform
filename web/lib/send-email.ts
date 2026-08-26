"use client";

import type { EmailSendRequestItem, EmailSendResult } from "./types";

export interface SendEmailBatchResponse {
  configured: boolean;
  results: EmailSendResult[];
}

export async function sendEmailBatch(recipients: EmailSendRequestItem[]): Promise<SendEmailBatchResponse> {
  const res = await fetch("/api/admin/emails/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipients }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `발송 요청이 실패했습니다. (${res.status})`);
  }

  return (await res.json()) as SendEmailBatchResponse;
}
