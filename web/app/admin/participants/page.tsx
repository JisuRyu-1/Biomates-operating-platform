"use client";

import { useState } from "react";
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { NametagPanel } from "@/components/admin/NametagPanel";
import { SurveyPanel } from "@/components/admin/SurveyPanel";
import { QUICK_FILTERS, isPaymentStatus, isQuickFilterKey, isRegistrationStatus, type QuickFilterKey } from "@/lib/participant-filters";
import type { BiomatesEvent, PaymentStatus, RegistrationStatus } from "@/lib/types";
import { REG_LABEL, PAY_LABEL } from "@/lib/status";

type PanelKey = "nametags" | "survey";

function EventSelector({ events, eventId }: { events: BiomatesEvent[]; eventId: string }) {
  const router = useRouter();
  return (
    <select
      value={eventId}
      onChange={(e) => router.push(`/admin/participants?event=${e.target.value}`)}
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
  );
}

function ParticipantsWorkspace({ event, initialParams }: { event: BiomatesEvent; initialParams: ReadonlyURLSearchParams }) {
  const { events, registrationsForEvent } = useBiomatesData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "ALL">(() => {
    const p = initialParams.get("status");
    return isRegistrationStatus(p) ? p : "ALL";
  });
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "ALL">(() => {
    const p = initialParams.get("payment");
    return isPaymentStatus(p) ? p : "ALL";
  });
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey | null>(() => {
    const p = initialParams.get("quick");
    return isQuickFilterKey(p) ? p : null;
  });
  const [panel, setPanel] = useState<PanelKey | null>(() => {
    const p = initialParams.get("panel");
    return p === "nametags" || p === "survey" ? p : null;
  });
  const autoselect = initialParams.get("autoselect") === "1";

  const all = registrationsForEvent(event.id);
  const filtered = all.filter((r) => {
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/-/g, "");
    const matchesQ =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.organization.toLowerCase().includes(q) ||
      r.phone.replace(/-/g, "").includes(qDigits);
    const matchesStatus = statusFilter === "ALL" || r.registrationStatus === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || r.paymentStatus === paymentFilter;
    const matchesQuick = !quickFilter || QUICK_FILTERS[quickFilter].statuses.includes(r.registrationStatus);
    return matchesQ && matchesStatus && matchesPayment && matchesQuick;
  });

  // Auto-select tracks the filtered list until the operator manually touches
  // a checkbox — after that, `manualSelected` takes over. This avoids
  // syncing selection via a setState-in-effect.
  const [manualSelected, setManualSelected] = useState<Set<string> | null>(null);
  const selected = manualSelected ?? (autoselect ? new Set(filtered.map((r) => r.id)) : new Set<string>());
  const selectedList = all.filter((r) => selected.has(r.id));

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setManualSelected(next);
  }
  function toggleAll(checked: boolean) {
    const next = new Set(selected);
    filtered.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
    setManualSelected(next);
  }
  function clearSelection() {
    setManualSelected(new Set());
    setPanel(null);
  }

  function openPanel(key: PanelKey) {
    setPanel((current) => (current === key ? null : key));
  }

  const quick = quickFilter ? QUICK_FILTERS[quickFilter] : null;

  return (
    <div className="stack">
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 className="h2 brand-font">Participants</h2>
        <EventSelector events={events} eventId={event.id} />
      </div>

      {quick && (
        <div className="callout callout-accent no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span>
            빠른 필터: <strong>{quick.label}</strong>
          </span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setQuickFilter(null)}>
            필터 해제
          </button>
        </div>
      )}

      <div className="search-row no-print">
        <input type="text" placeholder="이름, 이메일, 소속, 전화번호 검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | "ALL")}>
          <option value="ALL">전체 신청상태</option>
          {(Object.keys(REG_LABEL) as RegistrationStatus[]).map((k) => (
            <option key={k} value={k}>
              {REG_LABEL[k]}
            </option>
          ))}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | "ALL")}>
          <option value="ALL">전체 결제상태</option>
          {(Object.keys(PAY_LABEL) as PaymentStatus[]).map((k) => (
            <option key={k} value={k}>
              {PAY_LABEL[k]}
            </option>
          ))}
        </select>
        <span className="faint">{filtered.length}건 표시</span>
      </div>

      {selected.size > 0 && (
        <div className="card bulk-bar no-print">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span>
              <strong>{selected.size}</strong>명 선택됨
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => openPanel("nametags")}>
                네임택 인쇄
              </button>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => openPanel("survey")}>
                설문 이메일 발송
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={clearSelection}>
                선택 해제
              </button>
            </div>
          </div>
        </div>
      )}

      {panel === "nametags" && <NametagPanel recipients={selectedList} onClose={() => setPanel(null)} />}
      {panel === "survey" && <SurveyPanel event={event} recipients={selectedList} onClose={() => setPanel(null)} onSent={clearSelection} />}

      <ParticipantsTable event={event} registrations={filtered} selected={selected} onToggleOne={toggleOne} onToggleAll={toggleAll} />
    </div>
  );
}

export default function AdminParticipantsPage() {
  const { events, isHydrated } = useBiomatesData();
  const searchParams = useSearchParams();

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  const eventId = searchParams.get("event") || events[0]?.id;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return <div className="card empty-state">등록된 행사가 없습니다.</div>;
  }

  return <ParticipantsWorkspace key={event.id} event={event} initialParams={searchParams} />;
}
