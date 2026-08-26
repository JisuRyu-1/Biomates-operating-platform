import type { BiomatesEvent, MessageTemplateKey, Registration } from "./types";
import { fmtDate, fmtMoney } from "./format";

export const MESSAGE_TEMPLATES: Record<MessageTemplateKey, string> = {
  payment:
    "[Biomates] {이름}님, {행사명} 참가 신청이 접수되었습니다.\n참가비 {참가비}을 {계좌정보}로 입금해 주세요.\n입금 확인 후 참가가 확정됩니다.\n문의: {문의처}",
  paidConfirm:
    "[Biomates] {이름}님, 입금이 확인되어 {행사명} 참가가 확정되었습니다.\n일시: {일시}\n장소: {장소}\n행사 전 별도 안내를 다시 보내드리겠습니다. 문의: {문의처}",
  cancelRefund:
    "[Biomates] {이름}님, {행사명} 참가가 취소 처리되었습니다.\n결제하신 참가비는 환불이 필요한 경우 영업일 기준 3~5일 내 처리됩니다.\n문의: {문의처}",
  reminder:
    "[Biomates] {이름}님, {행사명}이 곧 시작됩니다!\n일시: {일시}\n장소: {장소}\n준비물을 확인하시고 즐거운 시간 되세요.\n문의: {문의처}",
  custom: "",
};

export const MESSAGE_LABELS: Record<MessageTemplateKey, string> = {
  payment: "입금 안내",
  paidConfirm: "입금 확인",
  cancelRefund: "취소 완료",
  reminder: "행사 전 리마인더",
  custom: "직접 작성",
};

export function resolveTemplate(body: string, reg: Registration, event: BiomatesEvent): string {
  return (body || "")
    .replace(/\{이름\}/g, reg.name)
    .replace(/\{행사명\}/g, event.title)
    .replace(/\{일시\}/g, `${fmtDate(event.date)} ${event.time}`)
    .replace(/\{장소\}/g, event.venue)
    .replace(/\{계좌정보\}/g, event.bankInfo ? `${event.bankInfo.bank} ${event.bankInfo.account} (${event.bankInfo.holder})` : "-")
    .replace(/\{참가비\}/g, fmtMoney(event.fee))
    .replace(/\{설문링크\}/g, event.surveyFormUrl?.trim() ? event.surveyFormUrl.trim() : "(설문 링크 미입력)")
    .replace(/\{문의처\}/g, event.contact);
}

export const SURVEY_EMAIL_SUBJECT = "[Biomates] {행사명} 참가 후기를 들려주세요!";
export const SURVEY_EMAIL_BODY =
  "{이름}님, 안녕하세요.\n\n{행사명}에 참석해 주셔서 진심으로 감사합니다.\n더 나은 다음 행사를 준비하기 위해 잠시 시간을 내어 설문에 참여해 주시면 큰 도움이 되겠습니다.\n\n설문 링크: {설문링크}\n\n소중한 의견 기다리겠습니다. 감사합니다.\n\nBiomates 드림\n문의: {문의처}";

/** SMS is ~1 byte/ASCII char and ~2 bytes/other char (EUC-KR-ish approximation); over 90 bytes auto-upgrades to LMS. */
export function byteLength(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    bytes += text.charCodeAt(i) > 127 ? 2 : 1;
  }
  return bytes;
}
