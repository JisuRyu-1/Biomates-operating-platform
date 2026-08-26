import type { PaymentStatus, RegistrationStatus } from "@/lib/types";
import { PAY_LABEL, PAY_TONE, REG_LABEL, REG_TONE } from "@/lib/status";

export function RegistrationStatusPill({ status }: { status: RegistrationStatus }) {
  return <span className={`pill pill-${REG_TONE[status]}`}>{REG_LABEL[status]}</span>;
}

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return <span className={`pill pill-${PAY_TONE[status]}`}>{PAY_LABEL[status]}</span>;
}
