import type { BiomatesEvent, PaymentStatus, Registration, RegistrationStatus } from "./types";
import { fmtDate, fmtMoney } from "./format";

export const REG_LABEL: Record<RegistrationStatus, string> = {
  REGISTERED: "신청완료",
  PAYMENT_PENDING: "결제대기",
  CONFIRMED: "참가확정",
  CHECKED_IN: "체크인 완료",
  ATTENDED: "참석완료",
  CANCELLED: "취소",
  NO_SHOW: "노쇼",
};

export const REG_TONE: Record<RegistrationStatus, "neutral" | "warn" | "accent" | "success" | "danger"> = {
  REGISTERED: "neutral",
  PAYMENT_PENDING: "warn",
  CONFIRMED: "accent",
  CHECKED_IN: "accent",
  ATTENDED: "success",
  CANCELLED: "neutral",
  NO_SHOW: "danger",
};

export const PAY_LABEL: Record<PaymentStatus, string> = {
  PENDING: "결제대기",
  PAID: "결제완료",
  REFUND_PENDING: "환불대기",
  REFUNDED: "환불완료",
};

export const PAY_TONE: Record<PaymentStatus, "neutral" | "warn" | "accent" | "success" | "danger"> = {
  PENDING: "warn",
  PAID: "success",
  REFUND_PENDING: "warn",
  REFUNDED: "neutral",
};

/** Guide §5.1: free events skip REGISTERED/PAYMENT_PENDING and start CONFIRMED/PAID. */
export function initialStatusFor(event: BiomatesEvent): {
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
} {
  if (event.fee > 0) {
    return { registrationStatus: "PAYMENT_PENDING", paymentStatus: "PENDING" };
  }
  return { registrationStatus: "CONFIRMED", paymentStatus: "PAID" };
}

export function statusGuidance(reg: Registration, event: BiomatesEvent): string {
  switch (reg.registrationStatus) {
    case "PAYMENT_PENDING": {
      const bank = event.bankInfo
        ? `${event.bankInfo.bank} ${event.bankInfo.account} (${event.bankInfo.holder})로 ${fmtMoney(event.fee)} 입금`
        : "";
      return `계좌이체 확인 대기 중입니다. ${bank} 후 운영자 확인을 기다려 주세요. 입금 기한: ${fmtDate(event.registrationEnd)}.`;
    }
    case "REGISTERED":
      return "신청이 접수되었습니다. 참가비 결제 안내를 확인해 주세요.";
    case "CONFIRMED":
      return `참가가 확정되었습니다. 행사 D-7, D-1에 일정 안내 이메일이 발송될 예정입니다. 준비사항: ${event.prep.join(", ")}.`;
    case "CHECKED_IN":
      return "현재 체크인이 완료되었습니다. 즐거운 행사 되세요!";
    case "ATTENDED":
      return "참석해 주셔서 감사합니다. 아래에서 발표자료와 사진을 확인하실 수 있습니다.";
    case "CANCELLED":
      return "신청이 취소되었습니다. 결제하신 경우 환불 절차가 진행됩니다.";
    case "NO_SHOW":
      return "행사에 참석하지 못한 것으로 기록되었습니다. 다음 행사에서 뵙기를 바랍니다.";
    default:
      return "";
  }
}

/** Admin-facing combined label per guide §4.3 / §5.1 (kept here for reuse once Admin is built). */
export function combinedStatusLabel(reg: Registration): string {
  if (reg.registrationStatus === "CANCELLED") {
    if (reg.paymentStatus === "REFUND_PENDING") return "취소(환불대기)";
    if (reg.paymentStatus === "REFUNDED") return "취소(환불완료)";
    return "취소";
  }
  if (reg.paymentStatus === "PAID") return "신청완료(결제완료)";
  return "신청완료(결제대기)";
}
