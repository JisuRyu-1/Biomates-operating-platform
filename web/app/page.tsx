"use client";

import Image from "next/image";
import { useBiomatesData } from "@/lib/data-context";
import { EventCard } from "@/components/EventCard";

export default function HomePage() {
  const { events, isHydrated } = useBiomatesData();
  const upcoming = events.filter((e) => e.status === "UPCOMING" && e.published);
  const past = events.filter((e) => e.status === "COMPLETED" && e.published);

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  return (
    <div className="stack">
      <div className="card hero-card">
        <div className="hero-brand-row">
          <Image className="hero-brand-icon" src="/brand/biomates-icon-mark.png" alt="" width={2161} height={2161} priority />
          <Image className="hero-brand-wordmark" src="/brand/biomates-logo-turquoise.png" alt="Biomates" width={2038} height={306} priority />
        </div>
        <h1 className="h1 brand-font hero-headline" style={{ marginTop: 8 }}>
          좋은 사람들과 연결되고, 경험을 나누고, 함께 성장하는{" "}
          <br className="hero-linebreak" />
          진단, 의료기기 및 헬스케어 커뮤니티
        </h1>
        <p className="muted hero-sub">
          Biomates에서 다양한 사람들과 만나 서로의 경험과 생각을 나누고 새로운 가능성을 발견해 보세요.{" "}
          <br className="hero-linebreak" />
          아래에서 예정 행사를 확인하고 편하게 신청해 주세요.
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
