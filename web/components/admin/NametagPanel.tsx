"use client";

import type { Registration } from "@/lib/types";

interface NametagPanelProps {
  recipients: Registration[];
  onClose: () => void;
}

const PER_PAGE = 6;

function nameFontSizePt(text: string): number {
  const len = text.length;
  if (len <= 6) return 27;
  if (len <= 10) return 24;
  if (len <= 16) return 21;
  if (len <= 24) return 18;
  return 16;
}

function orgFontSizePt(text: string): number {
  const len = text.length;
  if (len <= 10) return 16;
  if (len <= 18) return 14.5;
  if (len <= 28) return 12.5;
  if (len <= 40) return 11;
  return 10;
}

function NametagCell({ registration }: { registration: Registration | null }) {
  if (!registration) return <div className="nametag-cell is-empty" />;
  return (
    <div className="nametag-cell">
      {/* eslint-disable-next-line @next/next/no-img-element -- print sheet, not a responsive UI image */}
      <img className="nametag-logo" src="/brand/biomates-logo-full.png" alt="BioMates" />
      <div className="nametag-name" style={{ fontSize: nameFontSizePt(registration.name) }}>
        {registration.name}
      </div>
      {registration.organization && (
        <div className="nametag-org" style={{ fontSize: orgFontSizePt(registration.organization) }}>
          {registration.organization}
        </div>
      )}
    </div>
  );
}

export function NametagPanel({ recipients, onClose }: NametagPanelProps) {
  const pages: (Registration | null)[][] = [];
  for (let i = 0; i < recipients.length; i += PER_PAGE) {
    const page = recipients.slice(i, i + PER_PAGE);
    while (page.length < PER_PAGE) page.push(null as unknown as Registration);
    pages.push(page);
  }

  return (
    <div className="card" id="nametag-panel">
      <div className="no-print">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            네임택 인쇄 · 선택 {recipients.length}명
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
            닫기
          </button>
        </div>
        <p className="faint" style={{ marginTop: 8 }}>
          A4 가로, 92.5×88mm, 3×2 배열 라벨 용지 규격에 맞춰 배치됩니다.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 10 }}
          disabled={recipients.length === 0}
          onClick={() => window.print()}
        >
          선택한 {recipients.length}명 네임택 인쇄하기
        </button>
        <p className="faint" style={{ marginTop: 8 }}>
          인쇄 대화상자에서 &quot;PDF로 저장&quot;을 선택하면 파일로 내보낼 수도 있습니다. 실제 정렬은 사용 중인 라벨
          용지·프린터에 따라 미세 조정이 필요할 수 있습니다.
        </p>
      </div>
      <div className="nametag-sheet-wrap" style={{ marginTop: 16 }}>
        {recipients.length === 0 ? (
          <div className="empty-state" style={{ background: "var(--surface)", borderRadius: 12 }}>
            선택된 참가자가 없습니다. 위 목록에서 인원을 선택해 주세요.
          </div>
        ) : (
          pages.map((page, pageIndex) => (
            <div className="nametag-page" key={pageIndex}>
              {page.map((r, i) => (
                <NametagCell key={r?.id ?? `empty-${i}`} registration={r} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
