"use client";

import { useBiomatesData } from "@/lib/data-context";
import { EventCard } from "@/components/EventCard";

export default function HomePage() {
  const { events } = useBiomatesData();
  const upcoming = events.filter((e) => e.status === "UPCOMING" && e.published);
  const past = events.filter((e) => e.status === "COMPLETED" && e.published);

  return (
    <div className="stack">
      <div className="card hero-card">
        <span className="eyebrow">Biomates</span>
        <h1 className="h1 brand-font" style={{ marginTop: 8 }}>
          Where Bio Meets People
        </h1>
        <p className="muted hero-sub">
          행사 공지부터 신청, 결제, 참가 확정, Check-in, Follow-up까지 하나의 흐름으로 운영합니다. 의료 AI·헬스케어
          커뮤니티를 위한 Biomates의 다음 행사를 이곳에서 확인하고 신청하세요.
        </p>
      </div>

      <div>
        <div className="section-title">Upcoming Events</div>
        <div className="stack">
          {upcoming.length ? (
            upcoming.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="card empty-state">예정된 행사가 없습니다.</div>
          )}
        </div>
      </div>

      <div>
        <div className="section-title">Recent Events</div>
        <div className="stack">
          {past.length ? (
            past.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="card empty-state">지난 행사가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
