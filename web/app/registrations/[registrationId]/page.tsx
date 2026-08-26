"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { RegistrationStatusPill, PaymentStatusPill } from "@/components/StatusPill";
import { fmtDate, fmtMoney } from "@/lib/format";

export default function RegistrationCompletePage() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const { getRegistration, getEvent, isHydrated } = useBiomatesData();

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  const registration = getRegistration(registrationId);
  if (!registration) {
    return (
      <div className="card empty-state">
        <p>신청 정보를 찾을 수 없습니다.</p>
        <Link className="btn btn-primary" style={{ marginTop: 12 }} href="/events">
          행사 목록으로
        </Link>
      </div>
    );
  }

  const event = getEvent(registration.eventId);
  if (!event) return null;

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <RegistrationStatusPill status={registration.registrationStatus} />
        <PaymentStatusPill status={registration.paymentStatus} />
      </div>
      <h2 className="h2" style={{ marginTop: 12 }}>
        신청이 접수되었습니다
      </h2>
      <p className="muted" style={{ marginTop: 4 }}>
        {event.title} · {fmtDate(event.date)}
      </p>

      {event.fee > 0 && event.bankInfo ? (
        <>
          <div className="callout callout-warn" style={{ marginTop: 16 }}>
            <div className="section-title" style={{ color: "var(--warn)" }}>
              계좌이체 안내
            </div>
            <div className="kv">
              <span className="kv-label">은행</span>
              <span className="kv-value">{event.bankInfo.bank}</span>
            </div>
            <div className="kv">
              <span className="kv-label">계좌번호</span>
              <span className="kv-value mono">{event.bankInfo.account}</span>
            </div>
            <div className="kv">
              <span className="kv-label">예금주</span>
              <span className="kv-value">{event.bankInfo.holder}</span>
            </div>
            <div className="kv">
              <span className="kv-label">참가비</span>
              <span className="kv-value">{fmtMoney(event.fee)}</span>
            </div>
            <div className="kv">
              <span className="kv-label">입금자명</span>
              <span className="kv-value">{registration.depositorName}</span>
            </div>
            <div className="kv">
              <span className="kv-label">입금 기한</span>
              <span className="kv-value">{fmtDate(event.registrationEnd)}</span>
            </div>
          </div>
          <p className="faint" style={{ marginTop: 10 }}>
            운영자가 입금을 확인하면 참가 상태가 <strong>참가확정(CONFIRMED)</strong>으로 갱신됩니다. My Registration에서
            진행 상황을 확인하실 수 있습니다.
          </p>
        </>
      ) : (
        <p className="muted" style={{ marginTop: 16 }}>
          무료 행사로 별도 결제 없이 참가가 확정되었습니다.
        </p>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Link href="/my-registration" className="btn btn-primary">
          내 신청 확인하러 가기
        </Link>
        <Link href="/" className="btn btn-ghost">
          홈으로
        </Link>
      </div>
    </div>
  );
}
