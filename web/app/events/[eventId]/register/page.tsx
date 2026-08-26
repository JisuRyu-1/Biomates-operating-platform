"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { RegistrationForm } from "@/components/RegistrationForm";
import { fmtDate } from "@/lib/format";

export default function RegisterPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { getEvent } = useBiomatesData();
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

  return (
    <div>
      <div className="breadcrumb">
        <Link href={`/events/${event.id}`}>← {event.title}</Link>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <h2 className="h2 brand-font">Registration</h2>
        <p className="muted" style={{ marginTop: 4 }}>
          {event.title} · {fmtDate(event.date)}
        </p>
        <hr className="divider" style={{ margin: "16px 0" }} />
        <RegistrationForm eventId={event.id} />
      </div>
    </div>
  );
}
