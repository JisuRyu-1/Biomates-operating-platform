"use client";

import { useBiomatesData } from "@/lib/data-context";
import { combinedStatusLabel, combinedStatusTone } from "@/lib/status";
import { MESSAGE_LABELS } from "@/lib/message-templates";
import type { BiomatesEvent, Registration } from "@/lib/types";

interface ParticipantsTableProps {
  event: BiomatesEvent;
  registrations: Registration[];
  selected: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
}

function lastSentLabel(r: Registration): string | null {
  const log = r.smsLog;
  if (!log || !log.length) return null;
  return MESSAGE_LABELS[log[log.length - 1].templateKey] ?? "메시지";
}

export function ParticipantsTable({ event, registrations, selected, onToggleOne, onToggleAll }: ParticipantsTableProps) {
  const { markPaid, cancelRegistration, completeRefund, checkIn, undoCheckIn, markAttended, markNoShow } = useBiomatesData();
  const isPast = event.status === "COMPLETED";

  function actionsFor(r: Registration) {
    const actions: { key: string; label: string; cls: string; onClick: () => void }[] = [];
    if (r.paymentStatus === "PENDING" && r.registrationStatus !== "CANCELLED") {
      actions.push({ key: "mark-paid", label: "입금 확인", cls: "btn-primary", onClick: () => markPaid(r.id) });
    }
    if (r.paymentStatus === "REFUND_PENDING") {
      actions.push({ key: "refund-complete", label: "환불 완료", cls: "btn-primary", onClick: () => completeRefund(r.id) });
    }
    if (r.registrationStatus === "CONFIRMED") {
      actions.push({ key: "checkin", label: "체크인", cls: "btn-primary", onClick: () => checkIn(r.id) });
      if (isPast) actions.push({ key: "mark-noshow", label: "노쇼 처리", cls: "btn-danger", onClick: () => markNoShow(r.id) });
    }
    if (r.registrationStatus === "CHECKED_IN") {
      actions.push({ key: "undo-checkin", label: "체크인 취소", cls: "btn-ghost", onClick: () => undoCheckIn(r.id) });
      actions.push({ key: "mark-attended", label: "참석완료", cls: "btn-primary", onClick: () => markAttended(r.id) });
    }
    if (!["CANCELLED", "ATTENDED", "NO_SHOW"].includes(r.registrationStatus)) {
      actions.push({
        key: "cancel",
        label: "취소",
        cls: "btn-danger",
        onClick: () => {
          if (window.confirm(`${r.name}님의 참가를 취소 처리할까요?`)) cancelRegistration(r.id);
        },
      });
    }
    return actions;
  }

  const allSelected = registrations.length > 0 && registrations.every((r) => selected.has(r.id));

  return (
    <div className="table-wrap responsive-cards">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                aria-label="전체 선택"
                checked={allSelected}
                disabled={registrations.length === 0}
                onChange={(e) => onToggleAll(e.target.checked)}
              />
            </th>
            <th>참가자</th>
            <th>연락처</th>
            <th>소속</th>
            <th>신청상태</th>
            <th>최근 발송</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="empty-state">조건에 맞는 참가자가 없습니다.</div>
              </td>
            </tr>
          ) : (
            registrations.map((r) => {
              const label = combinedStatusLabel(r);
              const cls = `pill-${combinedStatusTone(r)}`;
              const lastSent = lastSentLabel(r);
              return (
                <tr key={r.id}>
                  <td data-label="선택">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => onToggleOne(r.id)}
                      aria-label={`${r.name} 선택`}
                    />
                  </td>
                  <td data-label="참가자">
                    <div className="cell-name">{r.name}</div>
                    <div className="cell-sub">{r.email}</div>
                  </td>
                  <td data-label="연락처">{r.phone}</td>
                  <td data-label="소속">{r.organization || "-"}</td>
                  <td data-label="신청상태">
                    <span className={`pill ${cls}`}>{label}</span>
                  </td>
                  <td data-label="최근 발송">{lastSent ? <span className="pill pill-neutral">{lastSent}</span> : <span className="faint">-</span>}</td>
                  <td data-label="액션">
                    <div className="row-actions">
                      {actionsFor(r).length === 0 ? (
                        <span className="faint">-</span>
                      ) : (
                        actionsFor(r).map((a) => (
                          <button key={a.key} type="button" className={`btn btn-sm ${a.cls}`} onClick={a.onClick}>
                            {a.label}
                          </button>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
