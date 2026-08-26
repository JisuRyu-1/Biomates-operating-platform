"use client";

import Link from "next/link";
import { useBiomatesData } from "@/lib/data-context";
import { fmtDate, fmtMoney } from "@/lib/format";

export default function AdminEventsPage() {
  const { events, activeRegistrationsForEvent, setEventPublished } = useBiomatesData();

  return (
    <div className="stack">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 className="h2 brand-font">Admin · Events</h2>
        <Link href="/admin/events/new" className="btn btn-primary btn-sm">
          + 새 행사 만들기
        </Link>
      </div>
      <p className="faint" style={{ marginTop: -6 }}>
        행사를 생성하면 참가자 화면의 Home/Events 목록에 즉시 노출됩니다. &quot;참가자에게 공개&quot; 체크를 해제하면 목록에서 숨길 수 있습니다.
      </p>

      <div className="stack" style={{ gap: 12 }}>
        {events.length === 0 && <div className="card empty-state">등록된 행사가 없습니다.</div>}
        {events.map((ev) => {
          const regCount = activeRegistrationsForEvent(ev.id).length;
          return (
            <div key={ev.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className={`pill ${ev.status === "UPCOMING" ? "pill-accent" : "pill-neutral"}`}>{ev.status === "UPCOMING" ? "예정" : "종료"}</span>
                    <span className={`pill ${ev.published ? "pill-success" : "pill-warn"}`}>{ev.published ? "참가자 공개" : "비공개"}</span>
                  </div>
                  <h3 className="h3 brand-font" style={{ marginTop: 8 }}>
                    {ev.title}
                  </h3>
                  <p className="faint">
                    {fmtDate(ev.date)} · {ev.venue.split(",")[0]} · 신청 {regCount} / {ev.capacity}명 · {fmtMoney(ev.fee)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setEventPublished(ev.id, !ev.published)}
                  >
                    {ev.published ? "비공개로 전환" : "공개로 전환"}
                  </button>
                  <Link href={`/admin/events/${ev.id}/edit`} className="btn btn-sm btn-ghost">
                    수정
                  </Link>
                  <Link href={`/events/${ev.id}`} className="btn btn-sm btn-ghost">
                    참가자 화면 보기
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
