"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useBiomatesData } from "@/lib/data-context";
import { useToast } from "@/components/Toast";
import { fileToCompressedDataUrl } from "@/lib/image";
import type { BiomatesEvent, EventFormErrors, EventFormValues, ProgramItem, Speaker } from "@/lib/types";

/** Local editing shape: bank fields flattened, bio always present so inputs stay controlled. */
interface FormState {
  title: string;
  subtitle: string;
  status: "UPCOMING" | "COMPLETED";
  date: string;
  time: string;
  venue: string;
  mapUrl: string;
  capacity: number;
  fee: number;
  registrationStart: string;
  registrationEnd: string;
  audience: string;
  program: ProgramItem[];
  speakers: Speaker[];
  refundPolicy: string;
  contact: string;
  bankBank: string;
  bankAccount: string;
  bankHolder: string;
  published: boolean;
}

function newProgramRow(): ProgramItem {
  return { time: "", item: "", speaker: "" };
}

function newSpeakerRow(): Speaker {
  return { name: "", org: "", bio: { summary: "" } };
}

export function emptyFormState(): FormState {
  return {
    title: "",
    subtitle: "",
    status: "UPCOMING",
    date: "",
    time: "",
    venue: "",
    mapUrl: "",
    capacity: 0,
    fee: 0,
    registrationStart: "",
    registrationEnd: "",
    audience: "",
    program: [newProgramRow()],
    speakers: [newSpeakerRow()],
    refundPolicy: "",
    contact: "",
    bankBank: "",
    bankAccount: "",
    bankHolder: "",
    published: true,
  };
}

export function eventToFormState(event: BiomatesEvent): FormState {
  return {
    title: event.title,
    subtitle: event.subtitle,
    status: event.status,
    date: event.date,
    time: event.time,
    venue: event.venue,
    mapUrl: event.mapUrl ?? "",
    capacity: event.capacity,
    fee: event.fee,
    registrationStart: event.registrationStart,
    registrationEnd: event.registrationEnd,
    audience: event.audience,
    program: event.program.length ? event.program.map((p) => ({ ...p })) : [newProgramRow()],
    speakers: event.speakers.length
      ? event.speakers.map((s) => ({ ...s, bio: { summary: s.bio?.summary ?? "", photoUrl: s.bio?.photoUrl } }))
      : [newSpeakerRow()],
    refundPolicy: event.refundPolicy,
    contact: event.contact,
    bankBank: event.bankInfo?.bank ?? "",
    bankAccount: event.bankInfo?.account ?? "",
    bankHolder: event.bankInfo?.holder ?? "",
    published: event.published,
  };
}

function validate(state: FormState): EventFormErrors {
  const errors: EventFormErrors = {};
  if (!state.title.trim()) errors.title = "행사명을 입력해 주세요.";
  if (!state.date) errors.date = "날짜를 선택해 주세요.";
  if (!state.venue.trim()) errors.venue = "장소를 입력해 주세요.";
  if (!state.capacity || state.capacity < 1) errors.capacity = "모집 인원을 1명 이상 입력해 주세요.";
  return errors;
}

function buildSubmitValues(state: FormState): EventFormValues {
  const program = state.program
    .map((p) => ({ time: p.time.trim(), item: p.item.trim(), speaker: p.speaker?.trim() || undefined }))
    .filter((p) => p.time || p.item);

  const speakers = state.speakers
    .map((s) => {
      const summary = s.bio?.summary.trim() ?? "";
      const photoUrl = s.bio?.photoUrl;
      const bio = summary || photoUrl ? { summary, photoUrl } : undefined;
      return { name: s.name.trim(), org: s.org.trim(), bio };
    })
    .filter((s) => s.name || s.org);

  return {
    title: state.title.trim(),
    subtitle: state.subtitle.trim() || "새로 등록된 행사",
    status: state.status,
    date: state.date,
    time: state.time.trim() || "-",
    venue: state.venue.trim(),
    mapUrl: state.mapUrl.trim() || "#",
    capacity: state.capacity,
    fee: state.fee || 0,
    registrationStart: state.registrationStart || state.date,
    registrationEnd: state.registrationEnd || state.date,
    audience: state.audience.trim() || "누구나 참여 가능",
    program,
    speakers,
    prep: [],
    refundPolicy: state.refundPolicy.trim() || "행사 문의처로 별도 문의해 주세요.",
    contact: state.contact.trim() || "-",
    bankInfo:
      state.fee > 0
        ? { bank: state.bankBank.trim() || "-", account: state.bankAccount.trim() || "-", holder: state.bankHolder.trim() || "-" }
        : null,
    published: state.published,
  };
}

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialState?: FormState;
}

export function EventForm({ mode, eventId, initialState }: EventFormProps) {
  const { createEvent, updateEvent } = useBiomatesData();
  const { showToast } = useToast();
  const router = useRouter();

  const [state, setState] = useState<FormState>(initialState ?? emptyFormState());
  const [errors, setErrors] = useState<EventFormErrors>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    const errorKey = key as unknown as keyof EventFormErrors;
    setErrors((prev) => (prev[errorKey] ? { ...prev, [errorKey]: undefined } : prev));
  }

  function updateProgramRow(index: number, patch: Partial<ProgramItem>) {
    setState((prev) => ({
      ...prev,
      program: prev.program.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }
  function addProgramRow() {
    setState((prev) => ({ ...prev, program: [...prev.program, newProgramRow()] }));
  }
  function removeProgramRow(index: number) {
    setState((prev) => ({ ...prev, program: prev.program.filter((_, i) => i !== index) }));
  }

  function updateSpeaker(index: number, patch: Partial<Speaker>) {
    setState((prev) => ({
      ...prev,
      speakers: prev.speakers.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }
  function updateSpeakerBio(index: number, summary: string) {
    setState((prev) => ({
      ...prev,
      speakers: prev.speakers.map((s, i) => (i === index ? { ...s, bio: { ...s.bio, summary } } : s)),
    }));
  }
  function addSpeakerRow() {
    setState((prev) => ({ ...prev, speakers: [...prev.speakers, newSpeakerRow()] }));
  }
  function removeSpeakerRow(index: number) {
    setState((prev) => ({ ...prev, speakers: prev.speakers.filter((_, i) => i !== index) }));
  }

  async function handlePhotoChange(index: number, file: File | null) {
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setState((prev) => ({
        ...prev,
        speakers: prev.speakers.map((s, i) => (i === index ? { ...s, bio: { summary: s.bio?.summary ?? "", photoUrl: dataUrl } } : s)),
      }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "사진 업로드에 실패했습니다.");
    }
  }
  function removePhoto(index: number) {
    setState((prev) => ({
      ...prev,
      speakers: prev.speakers.map((s, i) => (i === index ? { ...s, bio: { summary: s.bio?.summary ?? "", photoUrl: undefined } } : s)),
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validate(state);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      showToast("입력 내용을 확인해 주세요.");
      return;
    }

    const values = buildSubmitValues(state);
    try {
      if (mode === "create") {
        const created = await createEvent(values);
        showToast(`새 행사 "${created.title}"가 생성되었습니다.`);
      } else if (eventId) {
        await updateEvent(eventId, values);
        showToast("행사 정보를 저장했습니다.");
      }
      router.push("/admin/events");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="stack" style={{ gap: 16 }}>
        <div className="form-grid">
          <div className={`field${errors.title ? " has-error" : ""}`}>
            <label className="req" htmlFor="ev-title">
              행사명
            </label>
            <input id="ev-title" type="text" placeholder="예: 2026 Biomates Winter Meetup" value={state.title} onChange={(e) => set("title", e.target.value)} />
            {errors.title && <div className="error-text">{errors.title}</div>}
          </div>
          <div className="field">
            <label htmlFor="ev-subtitle">부제 / 한 줄 소개</label>
            <input id="ev-subtitle" type="text" placeholder="행사를 한 문장으로 소개해 주세요" value={state.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </div>
        </div>

        {mode === "edit" && (
          <div className="field" style={{ maxWidth: 240 }}>
            <label htmlFor="ev-status">행사 상태</label>
            <select id="ev-status" value={state.status} onChange={(e) => set("status", e.target.value as "UPCOMING" | "COMPLETED")}>
              <option value="UPCOMING">예정</option>
              <option value="COMPLETED">종료</option>
            </select>
          </div>
        )}

        <div className="form-grid">
          <div className={`field${errors.date ? " has-error" : ""}`}>
            <label className="req" htmlFor="ev-date">
              날짜
            </label>
            <input id="ev-date" type="date" value={state.date} onChange={(e) => set("date", e.target.value)} />
            {errors.date && <div className="error-text">{errors.date}</div>}
          </div>
          <div className="field">
            <label htmlFor="ev-time">시간</label>
            <input id="ev-time" type="text" placeholder="예: 19:00 - 21:00" value={state.time} onChange={(e) => set("time", e.target.value)} />
          </div>
        </div>

        <div className={`field${errors.venue ? " has-error" : ""}`}>
          <label className="req" htmlFor="ev-venue">
            장소
          </label>
          <input id="ev-venue" type="text" placeholder="예: 서울 강남구 테헤란로 501, 3F" value={state.venue} onChange={(e) => set("venue", e.target.value)} />
          {errors.venue && <div className="error-text">{errors.venue}</div>}
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="ev-map">지도 링크</label>
            <input id="ev-map" type="text" placeholder="https://maps.google.com/..." value={state.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ev-audience">참가 대상</label>
            <input id="ev-audience" type="text" placeholder="예: 의료 AI 실무자 및 연구자" value={state.audience} onChange={(e) => set("audience", e.target.value)} />
          </div>
        </div>

        <div className="form-grid">
          <div className={`field${errors.capacity ? " has-error" : ""}`}>
            <label className="req" htmlFor="ev-capacity">
              모집 인원
            </label>
            <input
              id="ev-capacity"
              type="number"
              min={1}
              placeholder="80"
              value={state.capacity || ""}
              onChange={(e) => set("capacity", e.target.value === "" ? 0 : Number(e.target.value))}
            />
            {errors.capacity && <div className="error-text">{errors.capacity}</div>}
          </div>
          <div className="field">
            <label htmlFor="ev-fee">참가비 (원, 무료는 0)</label>
            <input id="ev-fee" type="number" min={0} step={1000} placeholder="0" value={state.fee || ""} onChange={(e) => set("fee", e.target.value === "" ? 0 : Number(e.target.value))} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="ev-reg-start">신청 시작일</label>
            <input id="ev-reg-start" type="date" value={state.registrationStart} onChange={(e) => set("registrationStart", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ev-reg-end">신청 종료일</label>
            <input id="ev-reg-end" type="date" value={state.registrationEnd} onChange={(e) => set("registrationEnd", e.target.value)} />
          </div>
        </div>

        {state.fee > 0 && (
          <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div className="field">
              <label htmlFor="ev-bank-name">입금 은행</label>
              <input id="ev-bank-name" type="text" placeholder="예: 국민은행" value={state.bankBank} onChange={(e) => set("bankBank", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ev-bank-account">계좌번호</label>
              <input id="ev-bank-account" type="text" placeholder="123456-04-789012" value={state.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ev-bank-holder">예금주</label>
              <input id="ev-bank-holder" type="text" placeholder="(주)바이오메이트" value={state.bankHolder} onChange={(e) => set("bankHolder", e.target.value)} />
            </div>
          </div>
        )}

        <div className="field">
          <label>프로그램</label>
          <div className="stack" style={{ gap: 8 }}>
            {state.program.map((p, i) => (
              <div className="dyn-row" key={i}>
                <input className="dyn-time" type="text" placeholder="시간" value={p.time} onChange={(e) => updateProgramRow(i, { time: e.target.value })} />
                <input className="dyn-item" type="text" placeholder="프로그램 내용" value={p.item} onChange={(e) => updateProgramRow(i, { item: e.target.value })} />
                <input
                  className="dyn-name"
                  type="text"
                  placeholder="연사 (선택)"
                  value={p.speaker ?? ""}
                  onChange={(e) => updateProgramRow(i, { speaker: e.target.value })}
                />
                <button type="button" className="btn btn-ghost btn-sm dyn-row-remove" aria-label="행 삭제" onClick={() => removeProgramRow(i)}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 8 }} onClick={addProgramRow}>
            + 프로그램 추가
          </button>
        </div>

        <div className="field">
          <label>연사</label>
          <p className="faint" style={{ marginTop: -4 }}>
            한 줄 소개(bio)를 입력하면 참가자 화면에서 해당 연사를 클릭했을 때 소개와 사진이 담긴 상세 정보가 열립니다. 비워두면 이름·소속만 표시됩니다.
          </p>
          <div className="stack" style={{ gap: 10 }}>
            {state.speakers.map((s, i) => (
              <div className="speaker-row" key={i}>
                <div className="dyn-row">
                  <input className="dyn-name" type="text" placeholder="연사 이름" value={s.name} onChange={(e) => updateSpeaker(i, { name: e.target.value })} />
                  <input className="dyn-org" type="text" placeholder="소속" value={s.org} onChange={(e) => updateSpeaker(i, { org: e.target.value })} />
                  <button type="button" className="btn btn-ghost btn-sm dyn-row-remove" aria-label="연사 삭제" onClick={() => removeSpeakerRow(i)}>
                    ×
                  </button>
                </div>
                <textarea placeholder="한 줄 소개 (선택) — 예: 분당서울대병원 영상의학과 교수, 유방영상 AI 연구 다수" value={s.bio?.summary ?? ""} onChange={(e) => updateSpeakerBio(i, e.target.value)} />
                <div className="photo-upload-row">
                  {s.bio?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL preview, not a static asset
                    <img className="photo-preview" src={s.bio.photoUrl} alt={`${s.name || "연사"} 사진 미리보기`} />
                  ) : (
                    <div className="photo-preview-empty" aria-hidden="true" />
                  )}
                  <label className="btn btn-sm btn-ghost" style={{ cursor: "pointer" }}>
                    사진 업로드
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        void handlePhotoChange(i, e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {s.bio?.photoUrl && (
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => removePhoto(i)}>
                      사진 제거
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-sm btn-ghost" style={{ marginTop: 8 }} onClick={addSpeakerRow}>
            + 연사 추가
          </button>
        </div>

        <div className="field">
          <label htmlFor="ev-refund">취소/환불 정책</label>
          <textarea id="ev-refund" placeholder="예: 행사 D-3일 전까지 전액 환불, 이후 환불 불가" value={state.refundPolicy} onChange={(e) => set("refundPolicy", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ev-contact">문의 방법</label>
          <input id="ev-contact" type="text" placeholder="예: events@biomates.example" value={state.contact} onChange={(e) => set("contact", e.target.value)} />
        </div>

        <label className="check-row">
          <input type="checkbox" checked={state.published} onChange={(e) => set("published", e.target.checked)} />
          <span>저장 즉시 참가자 화면에 공개합니다. (해제하면 비공개 초안으로 저장되어 참가자에게 보이지 않습니다)</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button type="submit" className="btn btn-primary">
          {mode === "create" ? "행사 생성" : "저장"}
        </button>
      </div>
    </form>
  );
}
