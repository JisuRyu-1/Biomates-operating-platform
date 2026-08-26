import type { SmsMessageType } from "./types";

/** ALIGO public rate reference (VAT excl.), 가이드 §3 — confirm against ALIGO's current pricing before relying on this for real budgeting. */
export const SMS_UNIT_PRICE_KRW = 8.4;
export const LMS_UNIT_PRICE_KRW = 25.9;

export function estimateCostKrw(recipientCount: number, msgType: SmsMessageType): number {
  const unit = msgType === "LMS" ? LMS_UNIT_PRICE_KRW : SMS_UNIT_PRICE_KRW;
  return Math.round(recipientCount * unit);
}
