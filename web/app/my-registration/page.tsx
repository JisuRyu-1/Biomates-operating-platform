"use client";

import Link from "next/link";
import { useBiomatesData } from "@/lib/data-context";
import { RegistrationStatusPill, PaymentStatusPill } from "@/components/StatusPill";
import { statusGuidance } from "@/lib/status";
import { fmtDate } from "@/lib/format";

export default function MyRegistrationPage() {
  const { myRegistrations, getEvent, isHydrated } = useBiomatesData();

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  const mine = myRegistrations();

  if (!mine.length) {
    return (
      <div className="card empty-state">
        <p>아직 이 브라우저에서 신청한 내역이 없습니다.</p>
        <Link className="btn btn-primary" style={{ marginTop: 12 }} href="/events">
          행사 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="stack">
      {mine.map((reg) => {
        const event = getEvent(reg.eventId);
        if (!event) return null;
        const visibleResources =
          reg.registrationStatus === "ATTENDED"
            ? event.resources.filter((r) => r.accessLevel === "PUBLIC" || r.accessLevel === "ATTENDED")
            : [];

        return (
          <div key={reg.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div>
                <h3 className="h3 brand-font">{event.title}</h3>
                <p className="faint">
                  {fmtDate(event.date)} · {event.time}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <RegistrationStatusPill status={reg.registrationStatus} />
                <PaymentStatusPill status={reg.paymentStatus} />
              </div>
            </div>
            <div className="callout callout-accent" style={{ marginTop: 14 }}>
              {statusGuidance(reg, event)}
            </div>
            {reg.registrationStatus === "ATTENDED" && (
              <div style={{ marginTop: 14 }}>
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
