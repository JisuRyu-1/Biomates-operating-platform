"use client";

import { useState } from "react";
import { useBiomatesData } from "@/lib/data-context";
import { useToast } from "@/components/Toast";
import { MESSAGE_LABELS, MESSAGE_TEMPLATES, byteLength, resolveTemplate } from "@/lib/message-templates";
import { sendSmsBatch } from "@/lib/send-sms";
import { fmtDateTimeShort, maskPhone } from "@/lib/format";
import type { BiomatesEvent, MessageTemplateKey, Registration, SmsMessageType, SmsSendRequestItem } from "@/lib/types";

interface MessagePanelProps {
  event: BiomatesEvent;
  recipients: Registration[];
  onClose: () => void;
  onSent: () => void;
}

interface FailedItem {
  registrationId: string;
  name: string;
  phone: string;
  message: string;
  errorMessage: string;
}

interface SendOutcome {
  successCount: number;
  failed: FailedItem[];
}

export function MessagePanel({ event, recipients, onClose, onSent }: MessagePanelProps) {
  const { recordMessageBatch, messageLogs } = useBiomatesData();
  const { showToast } = useToast();
  const [templateKey, setTemplateKey] = useState<MessageTemplateKey>("payment");
  const [body, setBody] = useState(MESSAGE_TEMPLATES.payment);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<SendOutcome | null>(null);

  const bytes = byteLength(body);
  const msgType: SmsMessageType = bytes > 90 ? "LMS" : "SMS";
  const logs = messageLogs.filter((l) => l.eventId === event.id).slice(0, 10);

  async function doSend(items: SmsSendRequestItem[]) {
    if (!items.length) return;
    setSending(true);
    try {
      const response = await sendSmsBatch(items);
      if (!response.configured) {
        showToast("SOLAPI 설정이 필요합니다. web/docs/solapi-sms-setup.md 문서를 참고해 주세요.");
        return;
      }
      const itemById = new Map(items.map((i) => [i.registrationId, i]));
      const entries = response.results.map((res) => {
        const item = itemById.get(res.registrationId)!;
        return {
          registrationId: res.registrationId,
          name: item.name,
          body: item.message,
          status: res.success ? ("SENT" as const) : ("FAILED" as const),
          msgType: res.msgType,
          providerMessageId: res.providerMessageId,
          errorMessage: res.errorMessage,
        };
      });
      recordMessageBatch(event.id, templateKey, entries);

      const successCount = response.results.filter((r) => r.success).length;
      const failed: FailedItem[] = response.results
        .filter((r) => !r.success)
        .map((r) => {
          const item = itemById.get(r.registrationId)!;
          return { registrationId: r.registrationId, name: item.name, phone: item.phone, message: item.message, errorMessage: r.errorMessage || "발송 실패" };
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
    if (!body.trim()) {
      showToast("메시지 내용을 입력해 주세요.");
      return;
    }
    const confirmed = window.confirm(`${recipients.length}명에게 문자를 발송합니다.\n\n이 작업은 발송 후 취소할 수 없습니다.`);
    if (!confirmed) return;

    const items: SmsSendRequestItem[] = recipients.map((r) => ({
      registrationId: r.id,
      phone: r.phone,
      name: r.name,
      message: resolveTemplate(body, r, event),
    }));
    void doSend(items);
  }

  function handleRetry() {
    if (!lastResult?.failed.length || sending) return;
    const confirmed = window.confirm(`실패한 ${lastResult.failed.length}명에게 다시 발송할까요?`);
    if (!confirmed) return;
    const items: SmsSendRequestItem[] = lastResult.failed.map((f) => ({
      registrationId: f.registrationId,
      phone: f.phone,
      name: f.name,
      message: f.message,
    }));
    void doSend(items);
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
        발송은 서버를 거쳐 SOLAPI API로 이뤄지며, 로그인한 운영진이면 누구나 같은 발신번호로 발송할 수 있습니다.
      </p>
      <div className="chip-list" style={{ marginTop: 10 }}>
        {recipients.length ? (
          recipients.slice(0, 8).map((r) => (
            <span key={r.id} className="chip">
              {r.name} · {maskPhone(r.phone)}
            </span>
          ))
        ) : (
          <span className="faint">수신자가 없습니다.</span>
        )}
        {recipients.length > 8 && <span className="chip">+{recipients.length - 8}명</span>}
      </div>
      <div className="stack" style={{ gap: 12, marginTop: 14 }}>
        <div className="field">
          <label htmlFor="msg-template">템플릿</label>
          <select
            id="msg-template"
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
        </div>
        <div className="field">
          <label htmlFor="msg-body">메시지 내용</label>
          <textarea id="msg-body" rows={7} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <p className="faint">
          병합 필드: {"{이름} {행사명} {일시} {장소} {계좌정보} {참가비} {문의처}"} — 발송 시 각 수신자에 맞게 자동으로 채워집니다.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="faint">{bytes} bytes</span>
          <span className={`pill ${msgType === "LMS" ? "pill-warn" : "pill-neutral"}`}>{msgType}</span>
        </div>
        <button type="button" className="btn btn-primary" disabled={recipients.length === 0 || sending} onClick={handleSend}>
          {sending ? "발송 중…" : `선택한 ${recipients.length}명에게 문자 발송하기`}
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
                  {f.name} · {maskPhone(f.phone)} — {f.errorMessage}
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
                  <strong>{MESSAGE_LABELS[l.templateKey]}</strong>
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
