"use client";

import Link from "next/link";
import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <div className="breadcrumb">
        <Link href="/admin/events">← 행사 목록으로</Link>
      </div>
      <div className="card" style={{ maxWidth: 760 }}>
        <h2 className="h2 brand-font">새 행사 만들기</h2>
        <p className="muted" style={{ marginTop: 4 }}>
          참가자가 Event Detail에서 보게 될 정보를 입력하세요. 저장하면 바로 참가자 화면 목록에 반영됩니다.
        </p>
        <hr className="divider" style={{ margin: "16px 0" }} />
        <EventForm mode="create" />
      </div>
    </div>
  );
}
