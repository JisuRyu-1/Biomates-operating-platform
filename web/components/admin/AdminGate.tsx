"use client";

import type { ReactNode } from "react";
import { useBiomatesData } from "@/lib/data-context";
import { useAdminAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";

const GUEST_ID = "__guest__";

export function AdminGate({ children }: { children: ReactNode }) {
  const { adminAccounts, isHydrated } = useBiomatesData();
  const { isAuthed, login } = useAdminAuth();
  const { showToast } = useToast();

  if (!isHydrated) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  if (isAuthed) {
    return <>{children}</>;
  }

  function handleChoose(id: string) {
    if (id === GUEST_ID) {
      showToast("접근 권한이 없는 계정입니다. 운영진 화이트리스트에 등록된 계정만 접근할 수 있습니다.");
      return;
    }
    login(id);
  }

  return (
    <div className="sso-overlay" role="dialog" aria-modal="true" aria-labelledby="sso-title">
      <div className="sso-modal">
        <h2 className="h3" id="sso-title">
          운영자 페이지 로그인
        </h2>
        <p className="faint" style={{ marginTop: 6 }}>
          Google 계정으로 로그인하세요. 사전에 등록된 운영진 계정만 접근할 수 있습니다.
        </p>
        <div className="sso-account-list">
          {adminAccounts.map((a) => (
            <button key={a.id} type="button" className="sso-account-btn" onClick={() => handleChoose(a.id)}>
              <span className="sso-avatar">{a.name.slice(0, 1)}</span>
              <span>
                <strong>{a.name}</strong>
                <span className="faint">{a.email} · 운영진</span>
              </span>
            </button>
          ))}
          <button type="button" className="sso-account-btn" onClick={() => handleChoose(GUEST_ID)}>
            <span className="sso-avatar">?</span>
            <span>
              <strong>다른 계정 사용</strong>
              <span className="faint">guest@gmail.com · 운영진 아님</span>
            </span>
          </button>
        </div>
        <p className="faint" style={{ marginTop: 14 }}>
          이 화면은 실제 Google 로그인이 아닌 프로토타입 시뮬레이션입니다. 실제 구현 시 Google OAuth 화면으로 대체되며,
          화이트리스트에 없는 계정은 접근이 거부됩니다.
        </p>
      </div>
    </div>
  );
}
