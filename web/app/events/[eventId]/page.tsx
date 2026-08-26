"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { SpeakerModal } from "@/components/SpeakerModal";
import { fmtDate, fmtMoney, todayStr } from "@/lib/format";
import type { Speaker } from "@/lib/types";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { getEvent, activeRegistrationsForEvent } = useBiomatesData();
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);

  const event = getEvent(eventId);

  if (!event) {
    return (
      <div className="card empty-state">
        <p>행사를 찾을 수 없습니다.</p>
        <Link className="btn btn-primary" style={{ marginTop: 12 }} href="/events">
          행사 목록으로
        </Link>
      </div>
    );
  }

  const regCount = activeRegistrationsForEvent(event.id).length;
  const isUpcoming = event.status === "UPCOMING";
  const today = todayStr();
  const regOpen = isUpcoming && today >= event.registrationStart && today <= event.registrationEnd && regCount < event.capacity;
  let closeReason = "";
  if (isUpcoming && regCount >= event.capacity) closeReason = "정원이 마감되었습니다.";
  else if (isUpcoming && today > event.registrationEnd) closeReason = `신청 기간이 종료되었습니다 (${fmtDate(event.registrationEnd)} 마감).`;
  else if (isUpcoming && today < event.registrationStart) closeReason = `신청은 ${fmtDate(event.registrationStart)}부터 시작됩니다.`;

  const visibleResources = event.resources.filter((r) => r.accessLevel === "PUBLIC");
  const lockedCount = event.resources.length - visibleResources.length;

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/events">← 행사 목록으로</Link>
      </div>
      <div className="grid-2">
        <div className="stack">
          <div className="card">
            <div className="eyebrow">{isUpcoming ? "예정 행사" : "지난 행사"}</div>
            <h1 className="h2 brand-font" style={{ marginTop: 4 }}>
              {event.title}
            </h1>
            <p className="muted" style={{ marginTop: 6 }}>
              {event.subtitle}
            </p>
            <hr className="divider" style={{ margin: "16px 0" }} />
            <div className="kv">
              <span className="kv-label">일시</span>
              <span className="kv-value">
                {fmtDate(event.date)} · {event.time}
              </span>
            </div>
            <div className="kv">
              <span className="kv-label">장소</span>
              <span className="kv-value">{event.venue}</span>
            </div>
            <div className="kv">
              <span className="kv-label">참가 대상</span>
              <span className="kv-value">{event.audience}</span>
            </div>
            <div className="kv">
              <span className="kv-label">참가비</span>
              <span className="kv-value">{fmtMoney(event.fee)}</span>
            </div>
            <div className="kv">
              <span className="kv-label">신청 기간</span>
              <span className="kv-value">
                {fmtDate(event.registrationStart)} - {fmtDate(event.registrationEnd)}
              </span>
            </div>
            <div className="kv">
              <span className="kv-label">정원</span>
              <span className="kv-value">
                {regCount} / {event.capacity}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="section-title">프로그램</div>
            <div className="stack" style={{ gap: 8 }}>
              {event.program.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <span className="mono faint" style={{ width: 52, flex: "none" }}>
                    {p.time}
                  </span>
                  <span>
                    {p.item}
                    {p.speaker && (
                      <div className="faint" style={{ marginTop: 2 }}>
                        {p.speaker}
                      </div>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title">연사</div>
            <div className="chip-list">
              {event.speakers.map((s, i) =>
                s.bio ? (
                  <button
                    key={i}
                    type="button"
                    className="chip chip-btn"
                    aria-haspopup="dialog"
                    onClick={() => setActiveSpeaker(s)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    {s.bio.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- data URL from local mock storage
                      <img className="speaker-avatar-sm" src={s.bio.photoUrl} alt="" />
                    )}
                    {s.name} · {s.org} <span aria-hidden="true" style={{ opacity: 0.7 }}>ⓘ</span>
                  </button>
                ) : (
                  <span key={i} className="chip">
                    {s.name} · {s.org}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="card">
            <div className="section-title">준비사항</div>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
              {event.prep.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {event.status === "COMPLETED" && (
            <div className="card">
              <div className="section-title">행사 자료 (Resources)</div>
              {visibleResources.length ? (
                <div className="list-resources">
                  {visibleResources.map((r) => (
                    <div key={r.id} className="resource-row">
                      <span>{r.title}</span>
                      <span className="pill pill-neutral">{r.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="faint">공개된 자료가 없습니다.</p>
              )}
              {lockedCount > 0 && (
                <div className="lock-note">잠긴 자료 {lockedCount}건 — 참석 확인(Check-in) 후 열람 가능합니다.</div>
              )}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="card">
            {isUpcoming ? (
              regOpen ? (
                <>
                  <Link href={`/events/${event.id}/register`} className="btn btn-primary btn-block">
                    참가 신청하기
                  </Link>
                  <p className="faint" style={{ marginTop: 10 }}>
                    신청 후 계좌이체 안내가 제공됩니다. 입금 확인 후 참가가 확정됩니다.
                  </p>
                </>
              ) : (
                <>
                  <button className="btn btn-block" disabled>
                    참가 신청 불가
                  </button>
                  <p className="faint" style={{ marginTop: 10 }}>
                    {closeReason}
                  </p>
                </>
              )
            ) : (
              <p className="muted">
                이 행사는 이미 종료되었습니다. 참석하신 경우 <strong>My Registration</strong>에서 자료를 확인하세요.
              </p>
            )}
          </div>
          <div className="card">
            <div className="section-title">취소/환불 정책</div>
            <p className="muted" style={{ fontSize: 13.5 }}>
              {event.refundPolicy}
            </p>
          </div>
          <div className="card">
            <div className="section-title">문의</div>
            <p className="muted" style={{ fontSize: 13.5 }}>
              {event.contact}
            </p>
          </div>
        </div>
      </div>

      {activeSpeaker && <SpeakerModal speaker={activeSpeaker} onClose={() => setActiveSpeaker(null)} />}
    </div>
  );
}
