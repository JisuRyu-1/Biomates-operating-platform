"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/auth-context";
import { addAdmin, listAdmins, removeAdmin } from "@/lib/admin-whitelist";
import { useToast } from "@/components/Toast";
import type { AdminAccount } from "@/lib/types";

interface FieldErrors {
  name?: string;
  email?: string;
}

export default function AdminTeamPage() {
  const { currentAdmin } = useAdminAuth();
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState<AdminAccount[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const reload = useCallback(() => {
    listAdmins()
      .then(setAccounts)
      .catch((err) => showToast(err instanceof Error ? err.message : "운영진 목록을 불러오지 못했습니다."));
  }, [showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors: FieldErrors = {};
    if (!name.trim()) fieldErrors.name = "이름을 입력해 주세요.";
    if (!email.trim() || !email.includes("@")) fieldErrors.email = "올바른 이메일 주소를 입력해 주세요.";
    else if (accounts?.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
      fieldErrors.email = "이미 등록된 이메일입니다.";
    }
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      showToast("입력 내용을 확인해 주세요.");
      return;
    }
    try {
      await addAdmin(name.trim(), email.trim().toLowerCase());
      showToast(`${name.trim()}님을 운영진으로 추가했습니다. 다음 로그인부터 이 Google 계정으로 접근할 수 있습니다.`);
      setName("");
      setEmail("");
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "운영진 추가에 실패했습니다.");
    }
  }

  async function handleRemove(id: string, accountName: string) {
    if (!window.confirm(`${accountName}님을 운영진에서 제거할까요? 이후 이 계정으로는 운영자 페이지에 로그인할 수 없습니다.`)) return;
    try {
      await removeAdmin(id);
      showToast(`${accountName}님을 운영진에서 제거했습니다.`);
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "운영진 제거에 실패했습니다.");
    }
  }

  return (
    <div className="stack">
      <h2 className="h2 brand-font">Team</h2>
      <p className="faint" style={{ marginTop: -6 }}>
        운영자 페이지에 접근할 수 있는 Google 계정 화이트리스트를 관리합니다(Supabase <code>admin_whitelist</code>{" "}
        테이블). 여기서 추가한 계정은 다음 로그인부터 그 Google 계정으로 바로 접근할 수 있습니다.
      </p>

      <div className="card">
        <div className="section-title">현재 운영진 {accounts ? `(${accounts.length}명)` : ""}</div>
        {accounts === null ? (
          <p className="faint">불러오는 중…</p>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {accounts.map((a) => {
              const isSelf = currentAdmin?.email === a.email;
              const canRemove = !isSelf && accounts.length > 1;
              return (
                <div key={a.id} className="resource-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="sso-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                      {a.name.slice(0, 1)}
                    </span>
                    <div>
                      <div className="cell-name">
                        {a.name}
                        {isSelf && <span className="faint"> (본인)</span>}
                      </div>
                      <div className="cell-sub">{a.email}</div>
                    </div>
                  </div>
                  {canRemove ? (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemove(a.id, a.name)}>
                      제거
                    </button>
                  ) : (
                    <span className="faint">{isSelf ? "본인 계정" : "마지막 운영진"}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-title">운영진 추가</div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className={`field${errors.name ? " has-error" : ""}`}>
              <label className="req" htmlFor="admin-name">
                이름
              </label>
              <input id="admin-name" type="text" placeholder="예: 홍길동" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <div className="error-text">{errors.name}</div>}
            </div>
            <div className={`field${errors.email ? " has-error" : ""}`}>
              <label className="req" htmlFor="admin-email">
                Google 계정 이메일
              </label>
              <input id="admin-email" type="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }}>
            운영진 추가
          </button>
        </form>
      </div>
    </div>
  );
}
