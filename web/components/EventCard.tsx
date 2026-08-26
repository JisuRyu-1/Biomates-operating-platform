import Link from "next/link";
import type { BiomatesEvent } from "@/lib/types";
import { fmtDate, fmtMoney } from "@/lib/format";
import { useBiomatesData } from "@/lib/data-context";

export function EventCard({ event }: { event: BiomatesEvent }) {
  const { activeRegistrationsForEvent } = useBiomatesData();
  const isUpcoming = event.status === "UPCOMING";
  const regCount = activeRegistrationsForEvent(event.id).length;
  const pct = Math.min(100, Math.round((regCount / event.capacity) * 100));

  return (
    <Link href={`/events/${event.id}`} className="event-card">
      <div className="event-card-top">
        <span className="eyebrow">{isUpcoming ? "예정 행사" : "지난 행사"}</span>
        <span className={`pill ${isUpcoming ? "pill-accent" : "pill-neutral"}`}>
          {isUpcoming ? "모집중" : "종료"}
        </span>
      </div>
      <h3 className="h3 brand-font">{event.title}</h3>
      <p className="faint">{event.subtitle}</p>
      <div className="event-meta-row">
        <span className="meta-chip">{fmtDate(event.date)}</span>
        <span className="meta-chip">{event.time}</span>
        <span className="meta-chip">{event.venue.split(",")[0]}</span>
        <span className="meta-chip">{fmtMoney(event.fee)}</span>
      </div>
      {isUpcoming && (
        <div>
          <div className="cap-bar">
            <div className="cap-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="faint" style={{ marginTop: 4 }}>
            신청 {regCount} / 정원 {event.capacity}
          </div>
        </div>
      )}
    </Link>
  );
}
