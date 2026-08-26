"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { useToast } from "@/components/Toast";
import type { RegistrationFormErrors, RegistrationFormValues } from "@/lib/types";

const EMPTY_VALUES: RegistrationFormValues = {
  name: "",
  phone: "",
  email: "",
  organization: "",
  purpose: "",
  marketingOptIn: false,
  consent: false,
};

export function RegistrationForm({ eventId }: { eventId: string }) {
  const { registerForEvent } = useBiomatesData();
  const { showToast } = useToast();
  const router = useRouter();

  const [values, setValues] = useState<RegistrationFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<RegistrationFormErrors>({});

  function handleChange<K extends keyof RegistrationFormValues>(key: K, value: RegistrationFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(v: RegistrationFormValues): RegistrationFormErrors {
    const next: RegistrationFormErrors = {};
    if (!v.name.trim()) next.name = "이름을 입력해 주세요.";
    if (!v.phone.trim()) next.phone = "휴대전화 번호를 입력해 주세요.";
    if (!v.email.trim() || !v.email.includes("@")) next.email = "올바른 이메일 주소를 입력해 주세요.";
    if (!v.consent) next.consent = "개인정보 수집 및 이용에 동의해야 신청할 수 있습니다.";
    return next;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      showToast("입력 내용을 확인해 주세요.");
      return;
    }

    const { registration, duplicate } = registerForEvent(eventId, values);
    if (duplicate) {
      showToast("이미 이 행사에 신청하셨습니다.");
    } else {
      showToast("신청이 접수되었습니다.");
    }
    router.push(`/registrations/${registration.id}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="stack" style={{ gap: 14 }}>
        <div className="form-grid">
          <div className={`field${errors.name ? " has-error" : ""}`}>
            <label className="req" htmlFor="f-name">
              이름
            </label>
            <input
              id="f-name"
              type="text"
              placeholder="홍길동"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          <div className={`field${errors.phone ? " has-error" : ""}`}>
            <label className="req" htmlFor="f-phone">
              휴대전화
            </label>
            <input
              id="f-phone"
              type="tel"
              placeholder="010-0000-0000"
              value={values.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>
        </div>

        <div className="form-grid">
          <div className={`field${errors.email ? " has-error" : ""}`}>
            <label className="req" htmlFor="f-email">
              이메일
            </label>
            <input
              id="f-email"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          <div className="field">
            <label htmlFor="f-org">소속</label>
            <input
              id="f-org"
              type="text"
              placeholder="회사/기관명"
              value={values.organization}
              onChange={(e) => handleChange("organization", e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="f-purpose">참가 목적</label>
          <textarea
            id="f-purpose"
            placeholder="이 행사에서 얻고 싶은 것을 알려주세요 (선택)"
            value={values.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          />
        </div>

        <label className="check-row">
          <input
            type="checkbox"
            checked={values.marketingOptIn}
            onChange={(e) => handleChange("marketingOptIn", e.target.checked)}
          />
          <span>향후 Biomates 행사 안내 수신에 동의합니다. (선택)</span>
        </label>

        <div className={`field${errors.consent ? " has-error" : ""}`}>
          <label className="check-row req" style={{ alignItems: "flex-start" }} htmlFor="f-consent">
            <input
              id="f-consent"
              type="checkbox"
              checked={values.consent}
              onChange={(e) => handleChange("consent", e.target.checked)}
            />
            <span>
              개인정보 수집 및 이용에 동의합니다. (필수) — 수집 항목: 이름, 이메일, 휴대전화, 소속 / 이용 목적: 행사
              운영 및 안내
            </span>
          </label>
          {errors.consent && <div className="error-text">{errors.consent}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button type="submit" className="btn btn-primary">
          신청 제출
        </button>
      </div>
    </form>
  );
}
