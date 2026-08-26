"use client";

import { useState } from "react";
import { useBiomatesData } from "@/lib/data-context";
import { useToast } from "@/components/Toast";
import { SURVEY_EMAIL_BODY, SURVEY_EMAIL_SUBJECT, resolveTemplate } from "@/lib/message-templates";
import { sendEmailBatch } from "@/lib/send-email";
import { fmtDateTimeShort } from "@/lib/format";
import type { BiomatesEvent, EmailSendRequestItem, Registration } from "@/lib/types";

interface SurveyPanelProps {
  event: BiomatesEvent;
  recipients: Registration[];
  onClose: () => void;
  onSent: () => void;
}

interface FailedItem {
  registrationId: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  errorMessage: string;
}

interface SendOutcome {
  successCount: number;
  failed: FailedItem[];
}

export function SurveyPanel({ event, recipients, onClose, onSent }: SurveyPanelProps) {
  const { recordEmailBatch, setSurveyFormUrl, emailLogs } = useBiomatesData();
  const { showToast } = useToast();
  const [formUrl, setFormUrl] = useState(event.surveyFormUrl ?? "");
  const [subject, setSubject] = useState(SURVEY_EMAIL_SUBJECT);
  const [body, setBody] = useState(SURVEY_EMAIL_BODY);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<SendOutcome | null>(null);

  const notAttended = recipients.filter((r) => r.registrationStatus !== "ATTENDED").length;
  const logs = emailLogs.filter((l) => l.eventId === event.id).slice(0, 10);

  async function doSend(items: EmailSendRequestItem[]) {
    if (!items.length) return;
    setSending(true);
    try {
      const response = await sendEmailBatch(items);
      if (!response.configured) {
        showToast("Resend 설정이 필요합니다. web/docs/resend-email-setup.md 문서를 참고해 주세요.");
        return;
      }
      const itemById = new Map(items.map((i) => [i.registrationId, i]));
      const entries = response.results.map((res) => {
        const item = itemById.get(res.registrationId)!;
        return {
          registrationId: res.registrationId,
          name: item.name,
          subject: item.subject,
          body: item.body,
          status: res.success ? ("SENT" as const) : ("FAILED" as const),
          providerMessageId: res.providerMessageId,
          errorMessage: res.errorMessage,
        };
      });
      recordEmailBatch(event.id, subject, entries);

      const successCount = response.results.filter((r) => r.success).length;
      const failed: FailedItem[] = response.results
        .filter((r) => !r.success)
        .map((r) => {
          const item = itemById.get(r.registrationId)!;
          return { registrationId: r.registrationId, name: item.name, email: item.email, subject: item.subject, body: item.body, errorMessage: r.errorMessage || "발송 실패" };
        });
      setLastResult({ successCount, failed });
      showToast(`${successCount}명 발송 성공${failed.length ? ` · ${failed.length}명 실패` : ""}`);
      if (!failed.length) onSent();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "발송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  function handleSend() {
    if (!recipients.length) {
      showToast("발송할 대상을 선택해 주세요.");
      return;
    }
    if (!formUrl.trim()) {
      showToast("Google Form 설문 링크를 입력해 주세요.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      showToast("이메일 제목과 본문을 입력해 주세요.");
      return;
    }
    const confirmed = window.confirm(`${recipients.length}명에게 이메일을 발송합니다.\n\n이 작업은 발송 후 취소할 수 없습니다.`);
    if (!confirmed) return;

    if (formUrl.trim() !== (event.surveyFormUrl ?? "")) setSurveyFormUrl(event.id, formUrl.trim());
    const eventWithUrl: BiomatesEvent = { ...event, surveyFormUrl: formUrl.trim() };
    const items: EmailSendRequestItem[] = recipients.map((r) => ({
      registrationId: r.id,
      email: r.email,
      name: r.name,
      subject: resolveTemplate(subject, r, eventWithUrl),
      body: resolveTemplate(body, r, eventWithUrl),
    }));
    void doSend(items);
  }

  function handleRetry() {
    if (!lastResult?.failed.length || sending) return;
    const confirmed = window.confirm(`실패한 ${lastResult.failed.length}명에게 다시 발송할까요?`);
    if (!confirmed) return;
    const items: EmailSendRequestItem[] = lastResult.failed.map((f) => ({
      registrationId: f.registrationId,
      email: f.email,
      name: f.name,
      subject: f.subject,
      body: f.body,
    }));
    void doSend(items);
  }

  return (
    <div className="card no-print">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          설문 이메일 발송 · 선택 {recipients.length}명
        </div>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
          닫기
        </button>
      </div>
      <p className="faint" style={{ marginTop: 8 }}>
        행사 종료 후 참석자에게 만족도 설문(Google Forms) 링크를 이메일로 보냅니다. 발송은 서버를 거쳐 Resend API로
        이뤄지며, 로그인한 운영진이면 누구나 같은 발신 주소로 발송할 수 있습니다.
      </p>
      {notAttended > 0 && (
        <div className="callout callout-warn" style={{ marginTop: 10 }}>
          선택한 인원 중 {notAttended}명은 참석완료 상태가 아닙니다. 설문은 보통 실제 참석자에게만 발송합니다.
        </div>
      )}
      <div className="chip-list" style={{ marginTop: 10 }}>
        {recipients.length ? (
          recipients.slice(0, 8).map((r) => (
            <span key={r.id} className="chip">
              {r.name}
            </span>
          ))
        ) : (
          <span className="faint">수신자가 없습니다.</span>
        )}
        {recipients.length > 8 && <span className="chip">+{recipients.length - 8}명</span>}
      </div>
      <div className="stack" style={{ gap: 12, marginTop: 14 }}>
        <div className="field">
          <label htmlFor="survey-url">Google Form 설문 링크</label>
          <input id="survey-url" type="text" placeholder="https://forms.gle/..." value={formUrl} onChange={(e) => setFormUrl(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="survey-subject">이메일 제목</label>
          <input id="survey-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="survey-body">이메일 본문</label>
          <textarea id="survey-body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <p className="faint">병합 필드: {"{이름} {행사명} {설문링크} {문의처}"} — 발송 시 각 수신자에 맞게 자동으로 채워집니다.</p>
        <button type="button" className="btn btn-primary" disabled={recipients.length === 0 || sending} onClick={handleSend}>
          {sending ? "발송 중…" : `선택한 ${recipients.length}명에게 이메일 발송하기`}
        </button>
      </div>

      {lastResult && (
        <div className="callout callout-accent" style={{ marginTop: 14 }}>
          <strong>
            발송 결과: 성공 {lastResult.successCount}명{lastResult.failed.length ? `, 실패 ${lastResult.failed.length}명` : ""}
          </strong>
          {lastResult.failed.length > 0 && (
            <div className="stack" style={{ gap: 6, marginTop: 10 }}>
              {lastResult.failed.map((f) => (
                <div key={f.registrationId} className="faint">
                  {f.name} · {f.email} — {f.errorMessage}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-danger"
                style={{ marginTop: 4, alignSelf: "flex-start" }}
                onClick={handleRetry}
                disabled={sending}
              >
                실패 대상 다시 발송
              </button>
            </div>
          )}
        </div>
      )}

      {logs.length > 0 && (
        <div className="stack" style={{ gap: 10, marginTop: 16 }}>
          <div className="section-title">발송 내역 (최근 로그)</div>
          {logs.map((l) => {
            const extra = l.recipientNames.length > 4 ? ` 외 ${l.recipientNames.length - 4}명` : "";
            return (
              <div key={l.id} className="resource-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <strong>{l.subject}</strong>
                  <span className="faint mono">{fmtDateTimeShort(l.sentAt)}</span>
                </div>
                <div className="faint">
                  수신 {l.recipientCount}명(성공 {l.successCount}, 실패 {l.failedCount}) · {l.recipientNames.slice(0, 4).join(", ")}
                  {extra}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
