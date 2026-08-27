"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { fmtDate, fmtMoney } from "@/lib/format";

function statTile(num: number, label: string, tone: string, href?: string) {
  const body = (
    <>
      <div className={`stat-num mono${tone ? ` stat-num-${tone}` : ""}`}>{num}</div>
      <div className="stat-label">{label}</div>
    </>
  );
  return href ? (
    <Link href={href} className={`stat-tile stat-tile-link${tone ? ` ${tone}` : ""}`}>
      {body}
    </Link>
  ) : (
    <div className={`stat-tile${tone ? ` ${tone}` : ""}`}>{body}</div>
  );
}

export default function AdminDashboardPage() {
  const { events, registrationsForEvent, isHydrated } = useBiomatesData();
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = searchParams.get("event") || events[0]?.id;
  const event = events.find((e) => e.id === eventId);

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  if (!event) {
    return <div className="card empty-state">등록된 행사가 없습니다.</div>;
  }

  const all = registrationsForEvent(event.id);
  const active = all.filter((r) => r.registrationStatus !== "CANCELLED");
  const stats = {
    total: active.length,
    paid: all.filter((r) => r.paymentStatus === "PAID").length,
    pending: all.filter((r) => r.paymentStatus === "PENDING").length,
    confirmed: active.filter((r) => ["CONFIRMED", "CHECKED_IN", "ATTENDED"].includes(r.registrationStatus)).length,
    checkedIn: active.filter((r) => ["CHECKED_IN", "ATTENDED"].includes(r.registrationStatus)).length,
    noShow: all.filter((r) => r.registrationStatus === "NO_SHOW").length,
    cancelled: all.filter((r) => r.registrationStatus === "CANCELLED").length,
  };
  const pct = event.capacity > 0 ? Math.min(100, Math.round((stats.total / event.capacity) * 100)) : 0;
  const base = `/admin/participants?event=${event.id}`;

  return (
    <div className="stack">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="h2 brand-font">Dashboard</h2>
          <p className="faint">
            {event.title} · {fmtDate(event.date)} · 정원 {event.capacity}명 · {fmtMoney(event.fee)}
          </p>
        </div>
        <select
          value={event.id}
          onChange={(e) => router.push(`/admin/dashboard?event=${e.target.value}`)}
          aria-label="조회할 행사 선택"
          style={{ width: "auto" }}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
              {e.status === "COMPLETED" ? " (종료)" : ""}
            </option>
          ))}
        </select>
      </div>
      <p className="faint" style={{ marginTop: -6 }}>아래 숫자를 클릭하면 해당 조건으로 필터링된 Participants로 바로 이동합니다.</p>

      <div className="stat-grid">
        {statTile(stats.total, `신청 (정원 ${event.capacity})`, "", base)}
        {statTile(stats.paid, "결제 완료", "accent", `${base}&payment=PAID`)}
        {statTile(stats.pending, "결제 대기", "warn", `${base}&payment=PENDING`)}
        {statTile(stats.confirmed, "참가 확정", "accent", `${base}&quick=confirmed_plus`)}
        {statTile(stats.checkedIn, "체크인 완료", "accent", `${base}&quick=checked_in_plus`)}
        {statTile(stats.noShow, "노쇼", "danger", `${base}&quick=no_show`)}
        {statTile(stats.cancelled, "취소", "", `${base}&quick=cancelled`)}
        {statTile(Math.max(event.capacity - stats.total, 0), "잔여석", "")}
      </div>

      <div className="card">
        <div className="section-title">정원 현황</div>
        <div className="cap-bar" style={{ height: 10 }}>
          <div className="cap-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="faint" style={{ marginTop: 6 }}>
          {stats.total} / {event.capacity} ({pct}%)
        </p>
      </div>

      <div className="card">
        <div className="section-title">빠른 작업</div>
        <div className="chip-list">
          <Link href="/admin/events/new" className="btn btn-sm">
            새 행사 만들기
          </Link>
          <Link href={base} className="btn btn-sm">
            전체 참가자 보기
          </Link>
          <Link href={`${base}&quick=confirmed_plus&autoselect=1&panel=messages`} className="btn btn-sm">
            참가 확정자에게 문자 발송
          </Link>
          <Link href={`${base}&quick=confirmed_plus&autoselect=1&panel=nametags`} className="btn btn-sm">
            최종 명단 네임택 인쇄
          </Link>
          <Link href={`${base}&quick=attended&autoselect=1&panel=survey`} className="btn btn-sm">
            참석자에게 설문 발송
          </Link>
        </div>
      </div>
    </div>
  );
}
