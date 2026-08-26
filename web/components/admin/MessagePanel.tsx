"use client";

import { useState } from "react";
import { useBiomatesData } from "@/lib/data-context";
import { useToast } from "@/components/Toast";
import { MESSAGE_LABELS, MESSAGE_TEMPLATES, byteLength } from "@/lib/message-templates";
import { fmtDateTimeShort } from "@/lib/format";
import type { BiomatesEvent, MessageTemplateKey, Registration } from "@/lib/types";

interface MessagePanelProps {
  event: BiomatesEvent;
  recipients: Registration[];
  onClose: () => void;
  onSent: () => void;
}

export function MessagePanel({ event, recipients, onClose, onSent }: MessagePanelProps) {
  const { sendMessages, messageLogs } = useBiomatesData();
  const { showToast } = useToast();
  const [templateKey, setTemplateKey] = useState<MessageTemplateKey>("payment");
  const [body, setBody] = useState(MESSAGE_TEMPLATES.payment);

  const bytes = byteLength(body);
  const kind = bytes > 90 ? "LMS(장문)로 자동 전환" : "SMS(단문)";
  const logs = messageLogs.filter((l) => l.eventId === event.id).slice(0, 10);

  function handleSend() {
    if (!recipients.length) {
      showToast("발송할 대상을 선택해 주세요.");
      return;
    }
    if (!body.trim()) {
      showToast("메시지 내용을 입력해 주세요.");
      return;
    }
    sendMessages(event.id, recipients.map((r) => r.id), templateKey, body);
    showToast(`${recipients.length}명에게 메시지를 발송했습니다. (시뮬레이션)`);
    onSent();
  }

  return (
    <div className="card no-print">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          문자 발송 · 선택 {recipients.length}명
        </div>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
          닫기
        </button>
      </div>
      <p className="faint" style={{ marginTop: 8 }}>
        문자 발송은 프로토타입 시뮬레이션입니다. 실제 SMS/카카오 알림톡 연동은 Phase 2에서 고려합니다.
      </p>
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
        <select
          value={templateKey}
          onChange={(e) => {
            const key = e.target.value as MessageTemplateKey;
            setTemplateKey(key);
            if (key !== "custom") setBody(MESSAGE_TEMPLATES[key]);
          }}
        >
          {(Object.keys(MESSAGE_LABELS) as MessageTemplateKey[]).map((key) => (
            <option key={key} value={key}>
              {MESSAGE_LABELS[key]}
            </option>
          ))}
        </select>
        <textarea rows={6} placeholder="메시지 내용을 입력하세요" value={body} onChange={(e) => setBody(e.target.value)} />
        <p className="faint">
          병합 필드: {"{이름} {행사명} {일시} {장소} {계좌정보} {참가비} {문의처}"} — 발송 시 각 수신자에 맞게 자동으로
          채워집니다.
        </p>
        <p className="faint mono">
          {body.length}자 · 약 {bytes}byte · {kind}
        </p>
        <button type="button" className="btn btn-primary" disabled={recipients.length === 0} onClick={handleSend}>
          선택한 {recipients.length}명에게 발송하기
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
                  <strong>{MESSAGE_LABELS[l.templateKey]}</strong>
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
