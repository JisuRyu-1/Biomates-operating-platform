"use client";

import { useBiomatesData } from "@/lib/data-context";
import { EventCard } from "@/components/EventCard";

export default function EventsPage() {
  const { events, isHydrated } = useBiomatesData();
  const upcoming = events.filter((e) => e.status === "UPCOMING" && e.published);
  const past = events.filter((e) => e.status === "COMPLETED" && e.published);

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  return (
    <div className="stack">
      <div>
        <div className="section-title">예정 행사</div>
        <div className="stack">
          {upcoming.length ? (
            upcoming.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="card empty-state">예정된 행사가 없습니다.</div>
          )}
        </div>
      </div>
      <div>
        <div className="section-title">지난 행사</div>
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
