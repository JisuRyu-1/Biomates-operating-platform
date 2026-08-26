"use client";

import type { ReactNode } from "react";
import { useAdminAuth } from "@/lib/auth-context";

export function AdminGate({ children }: { children: ReactNode }) {
  const { isConfigured, isLoading, isAuthed, accessDenied, deniedEmail, loginWithGoogle, dismissAccessDenied } = useAdminAuth();

  if (!isConfigured) {
    return (
      <div className="card empty-state">
        <p>
          <strong>Supabase 설정이 필요합니다.</strong>
        </p>
        <p className="faint" style={{ marginTop: 8 }}>
          <code>web/docs/google-sso-setup.md</code> 안내에 따라 Supabase 프로젝트와 Google OAuth를 연결하고
          <code> .env.local</code>을 채운 뒤 다시 시작해 주세요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="card empty-state">불러오는 중…</div>;
  }

  if (isAuthed) {
    return <>{children}</>;
  }

  return (
    <div className="sso-overlay" role="dialog" aria-modal="true" aria-labelledby="sso-title">
      <div className="sso-modal">
        <h2 className="h3" id="sso-title">
          운영자 페이지 로그인
        </h2>
        {accessDenied ? (
          <>
            <div className="callout callout-warn" style={{ marginTop: 14, textAlign: "left" }}>
              <strong>{deniedEmail}</strong> 계정은 운영진 화이트리스트에 등록되어 있지 않습니다. 접근 권한이 있는
              운영진에게 Team 화면에서 계정을 추가해 달라고 요청해 주세요.
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: 16 }}
              onClick={() => {
                dismissAccessDenied();
                void loginWithGoogle();
              }}
            >
              다른 Google 계정으로 로그인
            </button>
          </>
        ) : (
          <>
            <p className="faint" style={{ marginTop: 6 }}>
              사전에 등록된 운영진 Google 계정만 접근할 수 있습니다.
            </p>
            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={() => void loginWithGoogle()}>
              Google 계정으로 로그인
            </button>
          </>
        )}
      </div>
    </div>
  );
}
