import type { PaymentStatus, RegistrationStatus } from "./types";

export type QuickFilterKey = "confirmed_plus" | "checked_in_plus" | "attended" | "no_show" | "cancelled";

export const QUICK_FILTERS: Record<QuickFilterKey, { label: string; statuses: RegistrationStatus[] }> = {
  confirmed_plus: { label: "참가 확정자 이상", statuses: ["CONFIRMED", "CHECKED_IN", "ATTENDED"] },
  checked_in_plus: { label: "체크인 완료", statuses: ["CHECKED_IN", "ATTENDED"] },
  attended: { label: "참석자", statuses: ["ATTENDED"] },
  no_show: { label: "노쇼", statuses: ["NO_SHOW"] },
  cancelled: { label: "취소", statuses: ["CANCELLED"] },
};

export function isQuickFilterKey(value: string | null): value is QuickFilterKey {
  return !!value && value in QUICK_FILTERS;
}

export function isPaymentStatus(value: string | null): value is PaymentStatus {
  return value === "PENDING" || value === "PAID" || value === "REFUND_PENDING" || value === "REFUNDED";
}

export function isRegistrationStatus(value: string | null): value is RegistrationStatus {
  return (
    value === "REGISTERED" ||
    value === "PAYMENT_PENDING" ||
    value === "CONFIRMED" ||
    value === "CHECKED_IN" ||
    value === "ATTENDED" ||
    value === "CANCELLED" ||
    value === "NO_SHOW"
  );
}
