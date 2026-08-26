"use client";

import { useState } from "react";
import { useBiomatesData } from "@/lib/data-context";
import { useToast } from "@/components/Toast";
import { SURVEY_EMAIL_BODY, SURVEY_EMAIL_SUBJECT } from "@/lib/message-templates";
import { fmtDateTimeShort } from "@/lib/format";
import type { BiomatesEvent, Registration } from "@/lib/types";

interface SurveyPanelProps {
  event: BiomatesEvent;
  recipients: Registration[];
  onClose: () => void;
  onSent: () => void;
}

export function SurveyPanel({ event, recipients, onClose, onSent }: SurveyPanelProps) {
  const { sendSurveyEmails, setSurveyFormUrl, emailLogs } = useBiomatesData();
  const { showToast } = useToast();
  const [formUrl, setFormUrl] = useState(event.surveyFormUrl ?? "");
  const [subject, setSubject] = useState(SURVEY_EMAIL_SUBJECT);
  const [body, setBody] = useState(SURVEY_EMAIL_BODY);

  const notAttended = recipients.filter((r) => r.registrationStatus !== "ATTENDED").length;
  const logs = emailLogs.filter((l) => l.eventId === event.id).slice(0, 10);

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
    if (formUrl.trim() !== (event.surveyFormUrl ?? "")) setSurveyFormUrl(event.id, formUrl.trim());
    sendSurveyEmails(event.id, recipients.map((r) => r.id), subject, body);
    showToast(`${recipients.length}명에게 설문 이메일을 발송했습니다. (시뮬레이션)`);
    onSent();
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
        행사 종료 후 참석자에게 만족도 설문(Google Forms) 링크를 이메일로 보냅니다. 실제 메일 발송은 이뤄지지 않는
        프로토타입 시뮬레이션입니다.
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
        <button type="button" className="btn btn-primary" disabled={recipients.length === 0} onClick={handleSend}>
          선택한 {recipients.length}명에게 이메일 발송하기
        </button>
      </div>
      {logs.length > 0 && (
        <div className="stack" style={{ gap: 10, marginTop: 16 }}>
          <div className="section-title">발송 내역 (최근 시뮬레이션 로그)</div>
          {logs.map((l) => {
            const extra = l.recipientNames.length > 4 ? ` 외 ${l.recipientNames.length - 4}명` : "";
            return (
              <div key={l.id} className="resource-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <strong>{l.subject}</strong>
                  <span className="faint mono">{fmtDateTimeShort(l.sentAt)}</span>
                </div>
                <div className="faint">
                  수신 {l.recipientCount}명 · {l.recipientNames.slice(0, 4).join(", ")}
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
