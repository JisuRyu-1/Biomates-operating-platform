import type { BiomatesEvent, Registration } from "./types";
import { fmtDate, fmtMoney } from "./format";

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
