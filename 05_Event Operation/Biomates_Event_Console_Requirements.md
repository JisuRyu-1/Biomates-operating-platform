---
title: "Biomates Event Console — 요구사항 문서 (v1.0)"
sources:
  - source_path: "Biomates_Event_Operations_MVP_Guide(1).md"
    source_mtime: "2026-08-16T11:48:30"
  - source_path: "Biomates_Event_Console_Prototype.html"
    source_mtime: "2026-08-17T13:40:45"
  - source_path: "Biomates_Event_Console_Standalone.html"
    source_mtime: "2026-08-17T13:40:45"
generated_date: "2026-08-17"
status: "Draft — 실제 구현 착수용"
---

# Biomates Event Console — 요구사항 문서 (v1.0)

## 0. 문서 목적 및 배경

이 문서는 `Biomates_Event_Operations_MVP_Guide(1).md`에서 정의한 제품 비전을, 실제로 클릭 가능한 HTML 프로토타입(`Biomates_Event_Console_Prototype.html` / `Biomates_Event_Console_Standalone.html`)으로 구현하고 여러 차례 반복 검증하는 과정에서 확정된 화면 구조·데이터 모델·운영 흐름을 바탕으로, **실제 사이트 개발에 바로 착수할 수 있는 수준의 요구사항**으로 정리한 것이다.

프로토타입에서 실제로 클릭해보며 검증된 내용:
- 참가자 등록 → 계좌이체 안내 → 운영자 입금 확인 → 참가 확정 → 체크인 → 참석 완료로 이어지는 전체 생애주기
- 운영자 화면을 Dashboard 중심 허브 구조로 재편하고, Participants를 참가자 관리의 단일 작업 공간으로 통합(결제·체크인·문자 발송·네임택 인쇄·설문 발송이 모두 참가자 선택 기반의 하나의 워크플로우로 연결됨)
- 라이트/다크 모드, 모바일 반응형(하단 탭바, 카드형 리스트 전환), 실제 브라우저 인쇄를 통한 A4 네임택 라벨 출력
- 브랜드 자산(로고, 컬러, 나눔스퀘어/Orbitron 서체) 적용

이 문서는 그 검증된 결과물을 **"무엇을 만들 것인가"의 기준선**으로 삼아, 실제 개발 시 필요한 인증/보안, 데이터 모델, 비기능 요구사항까지 포함해 작성한다.

> **참고**: 프로토타입은 브라우저 `localStorage`에만 데이터를 저장하고, 문자·이메일 발송은 시뮬레이션이다. 이 문서의 목적은 그 "동작하는 것처럼 보이는" 화면과 흐름을 실제 백엔드로 치환하기 위한 요구사항을 정의하는 것이다.

---

## 1. 목표 및 범위 (Phase 1 MVP)

### 1.1 핵심 목표

> "Biomates 행사 하나를 이 시스템만으로 처음부터 끝까지 운영할 수 있는가?"

원본 가이드의 MVP 성공 기준을 그대로 유지한다. 첫 번째 마일스톤은 "웹사이트 완성"이 아니라 **실제 행사 하나를 end-to-end로 운영하는 것**이다.

### 1.2 Phase 1 포함 범위 (Must Have)

| 영역 | 기능 |
|---|---|
| 참가자 화면 | Home, Events(예정/지난 행사), Event Detail, Registration Form, Registration Complete, My Registration(조회) |
| 운영자 화면 | Google SSO 로그인, Dashboard(허브), Events(생성/공개 관리), Participants(통합 관리: 필터·검색·일괄 선택·행별 상태 변경) |
| 결제 | 계좌이체 안내 표시 + 운영자 수동 확인 (PG 미연동) |
| 커뮤니케이션 | 문자 안내(입금안내/입금확인/취소완료/행사전리마인더/직접작성) — 발송 채널은 §8.4 참고, 설문 이메일 발송(Google Form 링크 기반) |
| 체크인 | Participants 내 행별 체크인/체크인취소/참석완료/노쇼 처리 |
| 네임택 | 최종 명단 기준 A4 라벨 시트(92.5×88mm, 3×2) 브라우저 인쇄 |
| 접근 제어 | 참가자: 로그인 불필요, 자유 접근 / 운영자: Google SSO + 4인 화이트리스트 |
| 기타 | 다크모드 수동 전환, 모바일 반응형 |

### 1.3 Phase 1 제외 범위 (Not Required — Phase 2 이후)

- 자체 PG 결제, 자동 환불
- 카카오 알림톡, QR 체크인
- Payment Webhook 자동 연동
- 자동 리마인더(예약 발송)
- Survey 응답 수집·분석 (Phase 1은 Google Form "링크 발송"까지만. 응답 데이터 연동은 제외)
- Community Member Directory, Networking Matching, Advanced Analytics
- 행사 상태(예정/종료) 자동 전환 로직 — Phase 1은 운영자가 수동으로 관리하거나 날짜 기준 단순 계산으로 시작 (§6.1 참고)

---

## 2. 사용자 및 권한 (Users & Access Control)

### 2.1 참가자 (Public)

- **인증 불필요.** 별도 로그인 없이 Home/Events/Event Detail을 자유롭게 열람하고 참가 신청서를 제출할 수 있어야 한다.
- 참가 신청 시 입력한 이메일이 유일한 식별 수단이 된다. 회원가입/비밀번호 개념은 두지 않는다.

### 2.2 운영자 (Admin)

- **현재 운영진 4명**에게만 운영자 화면 접근 권한을 부여한다.
- 인증 방식은 **Google SSO(OAuth 2.0)**를 사용한다.
- Google 계정으로 로그인에 성공하더라도, **사전에 등록된 4개의 이메일 화이트리스트에 없으면 접근을 거부**한다. (도메인 전체 허용이 아니라 개별 이메일 단위 allowlist)
- 화이트리스트는 하드코딩 대신 환경변수 또는 관리용 테이블(`admin_users`)로 관리해, 운영진 변경 시 재배포 없이 수정 가능하도록 한다.
- 화이트리스트에 없는 계정으로 로그인 시도 시: 명확한 안내 메시지("이 계정은 운영자 권한이 없습니다")와 함께 공개 페이지로 리다이렉트한다. (§7 참고)

### 2.3 네비게이션 변경 요구사항

현재 프로토타입은 상단에 "참가자 화면 / 운영자 화면"을 클릭 한 번에 전환되는 로컬 토글로 구현되어 있다. **실제 구현에서는 다음과 같이 변경한다.**

- 공개 사이트 상단(또는 푸터)에 **"운영자 페이지"** 라벨의 링크/버튼을 노출한다. (기존 "운영자 화면" 명칭 → "운영자 페이지"로 변경)
- 이 버튼을 클릭하면 클라이언트 사이드 전환이 아니라 **`/admin` 경로로 이동 → 미인증 상태면 Google SSO 로그인 플로우로 리다이렉트**되는 실제 인증 게이트로 동작해야 한다.
- 로그인 성공 + 화이트리스트 통과 시에만 `/admin` 이하 페이지(Dashboard/Events/Participants)에 접근 가능하다.
- 세션 만료 또는 로그아웃 시 다시 로그인 플로우로 돌아간다.

---

## 3. 정보 구조 (Information Architecture)

### 3.1 공개 사이트 (인증 불필요)

```
/                     Home (Upcoming/Recent Events, 브랜드 히어로)
/events               Events List (예정 행사 / 지난 행사, 공개된 행사만 노출)
/events/[id]          Event Detail (프로그램/연사/준비사항/참가비/신청기간/자료)
/events/[id]/register Registration Form
/events/[id]/complete Registration Complete (계좌이체 안내)
/my-registration      My Registration 조회 (§5.6 — 실제 백엔드 전환 방식 결정 필요)
```

### 3.2 운영자 사이트 (Google SSO 인증 필요)

```
/admin                로그인 게이트 (미인증 시 Google SSO로 리다이렉트)
/admin/dashboard       Dashboard (허브: 통계 타일 클릭 → Participants 필터 이동, 빠른 작업)
/admin/events          Events 목록 + 새 행사 생성 폼 + 공개/비공개 토글
/admin/participants    Participants 통합 관리 (검색/필터/선택/행별 액션/문자·이메일·네임택 패널)
```

Payments·Check-in·Messages·Name Tags는 별도 페이지가 아니라 **Participants 안에서 선택 기반으로 동작하는 패널**로 구현한다 (프로토타입에서 검증된 구조 그대로 유지).

---

## 4. 데이터 모델

프로토타입의 in-memory 객체 구조를 실제 DB 스키마의 기준으로 삼는다. (Postgres 기준, Supabase 사용 가정 — §8 참고)

### 4.1 Event

| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid | PK |
| title | text | 필수 |
| subtitle | text | |
| status | enum(UPCOMING, COMPLETED) | §6.1 참고 — 자동 계산 여부 결정 필요 |
| event_date | date | 필수 |
| event_time | text | 자유 텍스트 ("14:00 - 18:00") |
| venue | text | 필수 |
| map_url | text | |
| capacity | int | 필수, ≥1 |
| fee | int | 원 단위, 0=무료 |
| registration_start | date | |
| registration_end | date | |
| audience | text | |
| program | jsonb | `[{time, item}]` |
| speakers | jsonb | `[{name, org}]` |
| prep | jsonb | `[string]` |
| refund_policy | text | |
| contact | text | |
| bank_name / bank_account / bank_holder | text | fee > 0일 때만 사용 |
| survey_form_url | text | Google Form 링크, 이벤트별 저장 |
| published | boolean | **참가자 화면 노출 여부** — 기본값 true |
| resources | jsonb / 별도 테이블 | 자료 목록 (§4.6) |
| created_at / updated_at | timestamptz | |

### 4.2 Registration

| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK |
| name / email / phone / organization | text | |
| purpose | text | |
| registration_status | enum(REGISTERED, PAYMENT_PENDING, CONFIRMED, CHECKED_IN, ATTENDED, CANCELLED, NO_SHOW) | |
| payment_status | enum(PENDING, PAID, REFUND_PENDING, REFUNDED) | registration_status와 독립 관리 (원본 가이드 5장 원칙 유지) |
| depositor_name | text | |
| note | text | 운영자 메모 |
| registered_at / checkin_at | timestamptz | |
| marketing_opt_in | boolean | 향후 안내 수신 동의 (§7.3 관련) |

### 4.3 SMS Log (`registration_sms_log`)

| 필드 | 타입 |
|---|---|
| id | uuid |
| registration_id | uuid FK |
| template_key | enum(payment, paidConfirm, cancelRefund, reminder, custom) |
| body | text (치환 완료된 실제 발송 내용) |
| sent_at | timestamptz |

### 4.4 Email/Survey Log (`registration_email_log`)

| 필드 | 타입 |
|---|---|
| id | uuid |
| registration_id | uuid FK |
| subject / body | text |
| sent_at | timestamptz |

### 4.5 Admin Users (`admin_users`)

| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid | |
| email | text | Google 계정 이메일, 화이트리스트 |
| name | text | |
| is_active | boolean | 비활성화 시 즉시 접근 차단 |

### 4.6 Event Resources (원본 가이드 12장)

Phase 1 MVP에도 기본 자료 업로드/공개 범위 설정을 포함하는 것을 권장한다 (원본 가이드에서도 MVP 포함 항목으로 명시). 필드는 원본 가이드 12.3절의 `EventResource` 구조를 그대로 채택한다.

---

## 5. 기능 요구사항

### 5.1 Home / Events List

- Upcoming/Recent Events는 **`published = true`인 행사만** 노출한다.
- 지난 행사(COMPLETED)도 `published`가 꺼져 있으면 목록에서 숨겨야 한다 (운영자가 지난 행사 노출 여부를 통제할 수 있어야 한다는 요구사항 반영).

### 5.2 Event Detail

- 프로토타입에서 검증된 섹션 구성 유지: 소개/일정/프로그램/연사/장소/참가대상/참가비/신청기간/정원/취소환불정책/문의.
- 신청 가능 여부 판단 로직: 신청 기간 내 + 정원 미달 + 행사 상태가 UPCOMING일 때만 "참가 신청하기" 버튼 활성화. 그 외에는 구체적 사유(정원마감/기간종료/기간전) 표시.
- 종료된 행사(COMPLETED)는 참석자에게 한해 Resources(발표자료/사진 등) 노출 (access_level: PUBLIC/ATTENDED/PRIVATE).

### 5.3 Registration Form

- 필수: 이름, 이메일, 휴대전화. 선택: 소속, 참가 목적.
- 개인정보 수집·이용 동의 체크(필수), 향후 안내 수신 동의(선택) — 이 동의 여부가 §7.3의 광고성 정보 발송 규제와 직결되므로 반드시 별도 필드로 저장.
- 제출 시 서버에서 정원 재검증(동시 신청으로 인한 초과 방지 — 프로토타입은 클라이언트 계산만 했으나 실서비스는 DB 트랜잭션/락 필요).
- 유료 행사: `registration_status = PAYMENT_PENDING`, `payment_status = PENDING`으로 생성.
- 무료 행사: `registration_status = CONFIRMED`, `payment_status = PAID`로 즉시 생성.

### 5.4 Registration Complete

- 유료 행사: 계좌이체 정보(은행/계좌번호/예금주), 입금자명(기본값=신청자명), 입금 기한(신청 종료일) 안내.
- 무료 행사: 참가 확정 안내로 대체.
- **등록 완료 직후 확인 이메일 발송** (Phase 1 필수 — 원본 가이드 2.6절 "신청 직후: 신청 접수 안내"). 이 이메일에 §5.6의 조회 링크를 포함한다.

### 5.5 My Registration — 실제 구현 방식 결정 필요

프로토타입은 "이 브라우저에서 신청한 내역"을 `localStorage`로 추적하는 방식이었다. **실서비스에서는 로그인 계정이 없으므로 이 방식이 통하지 않는다.** 다음 중 하나를 선택해야 한다 (권장: A안).

- **A안 (권장)**: 등록 완료 시 서버에서 서명된 고유 토큰을 생성해 `/my-registration/[token]` 형태의 링크를 발급하고, 이를 확인 이메일 본문에 포함한다. 참가자는 이 링크로만 자신의 신청 상태를 조회한다. 로그인 불필요, 구현 단순.
- **B안**: 이메일 주소 + 휴대전화 뒷자리 등 간단한 본인 확인 후 조회.
- **C안**: 참가자용 경량 계정(매직링크 로그인) 도입 — Phase 1에는 과함.

조회 화면에서 표시할 내용은 프로토타입과 동일: 신청상태/결제상태 배지, 상태별 안내 문구, 참석 완료 시 자료(Resources) 노출.

### 5.6 Admin Dashboard

- 행사 선택 드롭다운 + 통계 타일(신청/결제완료/결제대기/참가확정/체크인완료/노쇼/취소/잔여석).
- **통계 타일 클릭 시 Participants로 이동하며 해당 조건으로 자동 필터링**되는 상호작용을 그대로 구현 (프로토타입에서 검증된 "Dashboard 중심 허브" 구조).
- 빠른 작업: 새 행사 만들기 / 전체 참가자 보기 / 참가 확정자에게 문자 발송 / 최종 명단 네임택 인쇄 / 참석자에게 설문 발송 — 각각 Participants로 이동하며 대상이 사전 선택된 채 해당 패널이 열리는 동작까지 동일하게 구현.

### 5.7 Admin Events

- 새 행사 생성 폼: 행사명/부제/날짜/시간/장소/참가대상/모집인원/참가비/신청기간/계좌정보/프로그램(동적 행 추가삭제)/연사(동적)/준비사항(동적)/취소환불정책/문의처/공개 여부 체크박스.
- 필수 검증: 행사명, 날짜, 장소, 모집인원(≥1).
- 저장 즉시 참가자 화면에 반영 (published=true인 경우).
- 행사 목록에서 **"참가자에게 공개" 토글**로 언제든 노출/숨김 전환 가능.

### 5.8 Admin Participants (통합 관리)

- 검색(이름/이메일/소속/전화번호) + 신청상태 필터 + 결제상태 필터 + "빠른 필터"(참가확정자이상/체크인완료/참석자/노쇼/취소).
- 신청상태 컬럼은 **결제 상태를 결합한 표시**로 통합한다: 신청완료(결제대기) / 신청완료(결제완료) / 취소(환불대기) / 취소(환불완료) / 취소.
- 두 번째 컬럼은 **"최근 발송"**으로, 해당 참가자에게 가장 최근 발송된 문자 메시지 종류(입금안내/입금확인/취소완료/행사전리마인더/직접작성)를 표시한다.
- 체크박스 기반 다중 선택 + 전체선택/전체선택취소, 선택 시 상단에 고정 액션 바(문자 발송/네임택 인쇄/설문 이메일 발송/선택 해제) 노출.
- 행별 액션 버튼은 상태에 따라 동적으로 노출: 입금확인(결제대기 시) / 체크인(참가확정 시) / 체크인취소·참석완료(체크인 시) / 노쇼처리(행사 종료 후 미체크인 참가확정자) / 취소 / 환불완료.

### 5.9 문자 발송 패널

- 템플릿: 입금 안내 / 입금 확인 / 취소 완료 / 행사 전 리마인더 / 직접 작성 (드롭다운 선택 시 본문 자동 채움, 자유 수정 가능).
- 병합 필드: `{이름} {행사명} {일시} {장소} {계좌정보} {참가비} {문의처}` — 발송 시 수신자별 자동 치환.
- 글자수/바이트 카운터로 SMS(단문)/LMS(장문) 자동 판단 안내(90byte 기준).
- 발송 이력을 참가자별로 저장하고, Participants 테이블의 "최근 발송" 컬럼과 패널 내 발송 로그에 반영.
- **실제 발송 연동은 §8.4 참고** — Phase 1에서 실제 SMS로 나갈지, 운영자 수동 확인 단계를 유지할지는 결정 필요.

### 5.10 설문 이메일 발송 패널

- 행사별 Google Form 링크 입력창(1회 입력 시 해당 행사에 저장되어 재사용).
- 이메일 제목/본문 자동 초안 생성 + 자유 수정.
- 병합 필드: `{이름} {행사명} {설문링크} {문의처}`.
- 선택 인원 중 "참석완료" 상태가 아닌 사람이 있으면 경고 표시(발송 자체는 차단하지 않음, 운영자 재량).
- 발송 이력 저장 및 패널 내 로그 표시.
- **실제 이메일 발송은 반드시 실제 서비스(예: Resend, 원본 가이드 7장에서 이미 채택)를 통해 이뤄져야 한다.** SMS와 달리 이메일은 프로토타입 단계에서도 시뮬레이션이었으나 실사이트에서는 발신자 도메인 인증(SPF/DKIM) 등 이메일 발송 인프라 설정이 선행되어야 한다.

### 5.11 네임택 인쇄

- "최종 명단"(참가확정자 이상) 기준으로 선택된 인원의 네임택을 A4 가로 라벨 시트(92.5×88mm, 3×2 배열, 상하좌우 여백 4.7mm/7mm)에 배치.
- 이름 길이에 따른 폰트 크기 자동 조정(6자 이하 27pt ~ 24자 초과 16pt), 소속도 동일 원리로 조정.
- 브라우저 인쇄 시 **네임택 시트만 인쇄되고 나머지 화면 요소는 절대 포함되지 않아야 한다** (`@media print` 스코프 정확히 적용 — 프로토타입에서 실제로 발생했던 버그이므로 QA 시 반드시 실제 인쇄/PDF 출력으로 검증).
- 인쇄 대화상자에서 "PDF로 저장"으로 파일 내보내기도 지원(브라우저 기본 기능 활용, 별도 구현 불필요).

### 5.12 다크모드

- 상단 아이콘 토글로 라이트/다크 수동 전환, 선택값은 로컬에 저장되어 재방문 시 유지.
- 시스템 설정(`prefers-color-scheme`)을 기본값으로 따르되 수동 전환이 이를 오버라이드.

### 5.13 모바일 반응형

- 좁은 화면에서 상단 탭 대신 하단 아이콘 탭바로 전환.
- Participants 등 표 형태 데이터는 카드형 리스트로 전환.
- 체크인처럼 행사 당일 현장에서 자주 쓰는 액션은 터치 타겟 44px 이상 확보.

---

## 6. 결정이 필요한 항목 (Open Questions)

### 6.1 행사 상태(UPCOMING/COMPLETED) 계산 방식

프로토타입은 이 값을 시드 데이터에 수동으로 넣었다. 실서비스에서는 다음 중 결정 필요:
- (a) `event_date` 기준 자동 계산(오늘 < 행사일 → UPCOMING)
- (b) 운영자가 수동으로 전환
- (c) (a)를 기본으로 하되 운영자가 예외적으로 오버라이드 가능

권장: (c). 자동 계산을 기본으로 하되, 프로그램 진행 중 실수로 조기 전환되는 것을 방지하기 위해 수동 오버라이드 옵션을 열어둔다.

### 6.2 My Registration 조회 방식

§5.5의 A/B/C안 중 확정 필요. **권장: A안(토큰 기반 링크)**.

### 6.3 문자/이메일 실제 발송 시점

- 문자: Phase 1부터 실제 발송(알리고/솔라피 등)으로 갈지, 운영자가 확인 후 수동으로 별도 채널(카카오톡 등)로 안내하는 과도기를 둘지 결정 필요. (발신번호 사전등록 등 행정 절차 소요 시간 고려)
- 이메일: 등록 확인 메일과 설문 발송 메일은 **Phase 1부터 실제 발송이 필요**하다고 판단됨 (등록 확인 메일 없이는 §5.5의 My Registration 링크 전달이 불가능하므로). Resend 등 트랜잭션 이메일 서비스 도입을 Phase 1 필수 항목으로 승격 권장.

### 6.4 동시 신청으로 인한 정원 초과 방지

프로토타입은 클라이언트 사이드에서만 정원을 체크했다. 실서비스는 DB 레벨에서 동시성 제어(트랜잭션 또는 유니크 제약 + 재시도)가 필요하다.

### 6.5 리소스(자료) 저장소

원본 가이드 12장 기준 Supabase Storage 사용을 전제로 하되, 파일 용량 제한/허용 확장자 정책은 별도 확정 필요.

---

## 7. 인증 및 보안 요구사항

### 7.1 운영자 인증 (Google SSO)

- Supabase Auth의 Google OAuth Provider를 사용하는 것을 권장한다 (원본 가이드 7장에서 이미 Supabase를 Auth/DB로 채택했으므로 별도 인증 서버 구축 없이 바로 활용 가능).
- 로그인 콜백 이후, 인증된 이메일이 `admin_users` 테이블(§4.5)에 존재하고 `is_active = true`인지 검증하는 미들웨어를 `/admin/*` 경로 전체에 적용한다.
- 화이트리스트에 없는 계정: 세션은 생성되었더라도 관리자 권한 없음으로 처리하고 공개 페이지로 리다이렉트, 접근 시도 로그를 남긴다.

### 7.2 참가자 개인정보

- 수집 항목(이름/이메일/휴대전화/소속)과 이용 목적(행사 운영 및 안내)을 신청 화면에 명시하고 동의를 받는다 (이미 프로토타입 폼에 반영됨).
- 개인정보처리방침에 **문자 발송 대행사·이메일 발송 대행사로의 처리위탁 사실**을 명시해야 한다 (실제 발송 연동 시 필수).

### 7.3 광고성 정보 규제 (정보통신망법 제50조)

- 신청 확인/결제 안내/행사 리마인더 등 **참가자가 이미 시작한 거래에 직접 관련된 안내**는 정보성 메시지로 분류되어 별도 동의 없이 발송 가능한 경우가 많다.
- "다음 행사 안내"처럼 신규 참여를 권유하는 메시지는 광고성으로 분류될 가능성이 높아, 별도 동의(§4.2 `marketing_opt_in`) + 광고 표시 + 무료 수신거부 방법 명시 + 오후 9시~오전 8시 발송 금지 등이 필요하다.
- 이 구분은 실제 발송 전 법무 검토를 권장한다.
- (본 항목은 이전 대화에서 다룬 실제 SMS 연동 시 제약사항 논의를 요구사항 문서에 정식으로 편입한 것이다.)

---

## 8. 기술 아키텍처 (원본 가이드 7장 기준, 프로토타입 검증 반영)

```
참가자 / 운영자(4인, Google SSO)
        ↓
Biomates Website (Next.js, Vercel 호스팅)
        ↓
Application / API (Next.js API Routes 또는 Server Actions)
        ↓
Supabase
 ├─ PostgreSQL (Event/Registration/SMS Log/Email Log/Admin Users)
 ├─ Authentication (Google OAuth Provider — 운영자 전용)
 └─ Storage (행사 자료/Resources)

External Services
 ├─ 계좌이체 (수동 확인) 또는 외부 Payment Link
 ├─ SMS 발송 대행사 (§6.3 결정 후 연동 — 알리고/솔라피 등)
 └─ 이메일 발송 (Resend — 등록 확인 메일, 설문 발송 메일)
```

### 8.1 프론트엔드
Next.js — 공개 사이트, Admin 사이트 동일 코드베이스 내 라우트 분리(`/admin` 그룹).

### 8.2 백엔드/DB
Supabase(Postgres, Auth, Storage). §4의 테이블 구조를 기준으로 마이그레이션 작성.

### 8.3 인증
Supabase Auth Google Provider + `admin_users` 화이트리스트 미들웨어(§7.1).

### 8.4 커뮤니케이션 채널

| 채널 | Phase 1 방식 | 향후 |
|---|---|---|
| 등록 확인/설문 이메일 | Resend 등 트랜잭션 이메일 서비스로 **실제 발송** (Phase 1 필수) | 발송 결과 웹훅 반영 |
| 문자(SMS) | §6.3에서 결정 — 실제 연동 시 발신번호 사전등록 선행 필요 | 카카오 알림톡 병행, 실패 시 SMS 대체 발송 |

### 8.5 호스팅
Vercel.

---

## 9. 비기능 요구사항

- **접근성**: 본 프로젝트의 `.claude/rules/ui-design-guide-wcag.md`에 정의된 WCAG 2.1 AA 기준을 모든 화면에 적용한다 (색상 대비, 키보드 내비게이션, 포커스 표시, 폼 라벨/에러 메시지, 44×44px 터치 타겟 등).
- **반응형**: 320px 폭부터 데스크톱까지 대응, 200% 확대 시에도 기능 정상 동작.
- **다크모드**: 시스템 설정 감지 + 수동 오버라이드.
- **인쇄**: 네임택 인쇄 시 화면 UI가 절대 포함되지 않도록 인쇄 스타일을 별도로 검증(§5.11).
- **성능**: 참가자 신청 폼 제출은 정원 동시성 문제를 포함해 트랜잭션 처리.
- **브라우저 지원**: 최신 Chrome/Safari/Edge 기준. 인쇄 기능은 실제 브라우저 인쇄 대화상자를 사용하므로 브라우저별 여백 처리 차이가 있을 수 있음을 화면에 안내 문구로 명시.

---

## 10. 제안 마일스톤

원본 가이드 9장(Development Phases)·10장(Project Execution Plan)을 프로토타입 검증 결과와 SSO 요구사항을 반영해 갱신한다.

1. **기반 구축**: Next.js + Supabase 프로젝트 생성, DB 스키마(§4) 마이그레이션
2. **인증**: Google SSO + 운영자 화이트리스트 미들웨어 (§7.1) — 참가자 화면보다 먼저 확정해야 관리자 테스트가 가능하므로 우선순위 상향
3. **공개 사이트**: Home/Events/Event Detail/Registration/Complete
4. **My Registration**: §6.2 결정 사항 반영해 토큰 기반 조회 구현
5. **Admin 기본**: Dashboard/Events(생성·공개토글)/Participants(필터·검색·행별 액션)
6. **커뮤니케이션**: 이메일(등록 확인, 설문) 실연동 → 문자는 §6.3 결정에 따라 실연동 또는 과도기 프로세스
7. **네임택 인쇄**: 인쇄 스타일 QA 포함
8. **Pilot 행사 운영**: 실제 행사 하나로 end-to-end 테스트
9. **Retrospective & 자동화 우선순위 재산정** (원본 가이드 8단계와 동일)

---

## 부록 A. 프로토타입 참고

실제 개발 중 화면 동작/문구/인터랙션에 대한 의문이 있을 때는 아래 프로토타입을 1차 기준으로 참고한다.

- `Biomates_Event_Console_Prototype.html` — Claude 아티팩트로도 게시되어 있음 (링크는 대화 스레드 참고)
- `Biomates_Event_Console_Standalone.html` — 오프라인/폰에서 단독 실행 가능한 완전한 문서 버전

두 파일 모두 브라우저 `localStorage`에만 상태를 저장하는 순수 프런트엔드 시뮬레이션이며, 실제 DB/인증/발송 연동은 포함하지 않는다.

## 부록 B. 원본 가이드와의 관계

`Biomates_Event_Operations_MVP_Guide(1).md`는 이 프로젝트의 최초 제품 비전 문서로 계속 유효하다. 본 문서는 그 비전을 프로토타입으로 검증한 뒤, 실제 구현 착수를 위해 인증/데이터모델/비기능 요구사항을 추가해 구체화한 **실행용 후속 문서**다. 두 문서가 상충하는 부분이 있다면(예: My Registration 구현 방식) 본 문서의 §6(결정 필요 항목)을 기준으로 논의 후 확정한다.
