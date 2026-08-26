"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { EventForm, eventToFormState } from "@/components/admin/EventForm";

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { getEvent, isHydrated } = useBiomatesData();

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  const event = getEvent(eventId);
  if (!event) {
    return (
      <div className="card empty-state">
        <p>행사를 찾을 수 없습니다.</p>
        <Link className="btn btn-primary" style={{ marginTop: 12 }} href="/admin/events">
          행사 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/admin/events">← 행사 목록으로</Link>
      </div>
      <div className="card" style={{ maxWidth: 760 }}>
        <h2 className="h2 brand-font">행사 수정</h2>
        <p className="muted" style={{ marginTop: 4 }}>
          {event.title}
        </p>
        <hr className="divider" style={{ margin: "16px 0" }} />
        <EventForm key={event.id} mode="edit" eventId={event.id} initialState={eventToFormState(event)} />
      </div>
    </div>
  );
}
