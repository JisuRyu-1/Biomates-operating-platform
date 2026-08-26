"use client";

import type { SmsSendRequestItem, SmsSendResult } from "./types";

export interface SendSmsBatchResponse {
  configured: boolean;
  results: SmsSendResult[];
}

export async function sendSmsBatch(recipients: SmsSendRequestItem[]): Promise<SendSmsBatchResponse> {
  const res = await fetch("/api/admin/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipients }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `발송 요청이 실패했습니다. (${res.status})`);
  }

  return (await res.json()) as SendSmsBatchResponse;
}
