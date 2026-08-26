# Biomates Event Operations Platform

## MVP 프로젝트 가이드

**문서 목적**\
Biomates의 행사 기획, 안내, 참가 신청, 참가비 관리, 행사 당일 운영, 행사
종료 후 Follow-up까지 하나의 흐름으로 관리할 수 있는 웹사이트를
구축한다.

초기 버전은 복잡한 자체 결제 시스템을 구축하기보다 다음 흐름을 기준으로
한다.

> **① Biomates 사이트에서 참가 신청 → ② 계좌이체 또는 외부 결제 링크 → ③
> 결제 완료 상태를 Biomates DB에 반영**

장기적으로는 단순한 이벤트 안내 사이트를 넘어, 참가자와 Biomates의 관계
및 참여 이력이 축적되는 **Community Operations Platform**으로 확장하는
것을 목표로 한다.

------------------------------------------------------------------------

# 1. Product Vision

현재 이벤트 운영에서 흔히 발생하는 여러 도구와 수작업을 하나의 서비스
흐름으로 통합한다.

### 기존 운영 예시

`행사 공지 → Google Form → Excel → 계좌 확인 → 개별 안내 → 현장 출석 체크 → 설문 → 후속 연락`

### 목표 운영 방식

`Event 생성 → Event Page → 참가 신청 → 결제 → 참가 확정 → 사전 안내 → Check-in → 행사 진행 → 설문 → Follow-up → 다음 행사 연결`

핵심 목표는 다음과 같다.

-   참가자가 행사 정보를 쉽게 확인하고 신청할 수 있도록 한다.
-   운영진이 신청자, 결제, 참석 상태를 한 곳에서 관리할 수 있도록 한다.
-   반복되는 안내와 Follow-up 업무를 자동화할 수 있는 기반을 만든다.
-   행사 참여 데이터를 누적하여 장기적으로 Biomates Community를 관리할
    수 있도록 한다.

------------------------------------------------------------------------

# 2. Event Lifecycle

서비스는 페이지 중심이 아니라 **Event Lifecycle 중심**으로 설계한다.

## 2.1 Event Planning

운영자가 행사 정보를 등록한다.

-   행사명
-   행사 설명
-   날짜 및 시간
-   장소
-   지도 링크
-   모집 인원
-   참가비
-   신청 시작/종료일
-   프로그램
-   연사
-   준비사항
-   취소/환불 정책
-   문의 방법

행사를 생성하면 자동으로 공개 Event Page가 만들어지는 구조를 목표로
한다.

## 2.2 Event Promotion

생성된 Event Page URL을 다음 채널에서 활용한다.

-   Biomates 홈페이지
-   KakaoTalk
-   Email
-   LinkedIn
-   Instagram 등 SNS
-   QR Code

모든 홍보 채널은 동일한 Event Page로 연결한다.

## 2.3 Registration

참가자는 Biomates 사이트에서 신청한다.

### 입력 필드 (필수 / 선택)

| 필드 | 필수 여부 | 검증 규칙 |
|---|---|---|
| 이름 | 필수 | 공백 불가 |
| 휴대전화 | 필수 | 공백 불가 |
| 이메일 | 필수 | `@` 포함 형식 검증 |
| 소속 | 선택 | - |
| 참가 목적 | 선택 | 자유 텍스트 |
| 향후 Biomates 행사 안내 수신 동의 | 선택 | 체크박스 — 개인정보 이용 동의와 별도 항목 |
| 개인정보 수집 및 이용 동의 | 필수 | 체크박스, 수집 항목/이용 목적 명시 |

향후 Biomates Community 확장을 고려하여 다음 선택 항목도 추가로 검토한다.

-   직무/관심 분야
-   이번 행사에서 만나고 싶은 사람/분야

필수 항목 미입력 또는 미동의 시 필드 단위로 에러 메시지를 표시하고 제출을 막는다 (예: "이름을 입력해 주세요.", "개인정보 수집 및 이용에 동의해야 신청할 수 있습니다.").

### 중복 신청 방지

동일 사용자가 동일 행사에 이미 유효한(취소되지 않은) Registration을 보유한 상태로 재신청을 시도하면, 새 레코드를 생성하지 않고 기존 신청 내역(Registration Complete 화면)으로 안내한다.

신청 완료 후 Registration record를 생성한다.

초기 상태:

-   유료 행사: `PAYMENT_PENDING` / `PENDING`
-   무료 행사: 결제 절차 없이 즉시 `CONFIRMED` / `PAID`로 시작

## 2.4 Payment

### MVP 원칙

초기에는 사이트 내부에 PG 결제를 직접 구현하지 않는다.

기본 구조:

`Registration → 계좌이체 또는 Payment Link → 결제 확인 → DB 상태 변경`

### Option A --- 계좌이체

신청 완료 화면에서 다음 정보를 제공한다.

-   입금 계좌
-   참가비
-   입금자명 입력 방법
-   입금 기한

운영자가 입금을 확인한 후 Admin 화면에서:

`PAYMENT_PENDING → PAID`

로 변경한다.

### Option B --- 외부 Payment Link

외부 결제 서비스에서 생성한 결제 링크로 이동시킨다.

초기에는 결제 완료 여부를 운영자가 확인하여 Biomates DB에 반영할 수
있다.

향후 필요성이 커지면 Payment API/Webhook 연동을 통해 자동으로 상태를
변경한다.

예:

`Payment completed → Webhook → Biomates API → Registration = PAID`

> MVP에서는 자동 결제 연동보다 **안정적인 행사 운영과 간단한 관리
> workflow 검증**을 우선한다.

## 2.5 Confirmation

결제 완료 시 참가 상태를 확정한다.

`REGISTERED → PAYMENT_PENDING → CONFIRMED`

참가 확정 시 다음 정보를 안내한다.

-   참가 확정
-   행사 일시
-   장소
-   준비사항
-   행사 문의처
-   취소/환불 안내

## 2.6 Pre-event Communication

행사 전에 필요한 안내를 단계적으로 전달한다.

예시:

**신청 직후** - 신청 접수 안내 - 결제 방법 안내

**결제 완료** - 참가 확정 안내

**D-7** - 행사 일정 Reminder - 프로그램 안내

**D-1** - 행사 장소 - 시작 시간 - 교통/주차 정보 - 준비사항

**행사 당일** - 행사장 위치 - Check-in 방법 - 프로그램 - 현장 공지

MVP에서는 이메일 중심으로 시작하고, 필요할 경우 향후 Kakao 알림톡/SMS
등을 추가한다.

## 2.7 Event-day Operation

행사 당일 참가자를 확인한다.

MVP:

`Admin participant list → 참석 버튼 → CHECKED_IN`

향후:

`Participant QR → QR Scan → CHECKED_IN`

Admin Dashboard에서는 다음과 같은 정보를 확인한다.

-   총 신청자
-   결제 완료
-   결제 대기
-   참가 확정
-   Check-in 완료
-   미도착
-   취소
-   No-show

## 2.8 Follow-up

행사 종료 후 참가자에게 다음 내용을 전달한다.

-   감사 메시지
-   만족도 설문
-   행사 사진
-   발표 자료
-   관련 콘텐츠
-   다음 Biomates 행사
-   Biomates Community 참여 안내

참가 상태를 최종적으로 기록한다.

`CONFIRMED → CHECKED_IN → ATTENDED`

또는

`CONFIRMED → NO_SHOW`

------------------------------------------------------------------------

# 3. Website Information Architecture

## Public

### Home

-   Biomates 소개
-   Upcoming Events
-   Recent Events
-   Biomates 활동 소개

### Events

-   예정 행사
-   지난 행사

### Event Detail

-   행사 소개
-   일정
-   프로그램
-   연사 (선택 항목: 클릭 시 사진/소개를 보여주는 상세 정보 모달)
-   장소
-   참가 대상
-   참가비
-   신청 기간
-   정원
-   신청 버튼
-   (종료된 행사) 행사 자료(Resources) — 공개 범위에 따라 노출/잠금 표시

### Registration

-   참가 신청 Form
-   개인정보 동의

### Registration Complete

-   신청 완료
-   참가비
-   계좌이체 정보 또는 결제 링크
-   결제 기한
-   문의 방법

### My Registration

이 브라우저(계정)에서 신청한 행사 목록과 각 행사의 상태를 확인한다.

-   신청 상태 및 결제 상태 (통합 표시)
-   행사 정보 (일시/장소)
-   상태별 안내 메시지 (예: 입금 대기 시 계좌 정보 재안내, 참가 확정 시 준비사항 안내, 참석완료 시 자료 링크 노출)
-   참석완료(ATTENDED) 상태인 경우 행사 자료(Resources) 열람

향후 구현 고려:

-   취소 신청 (참가자가 직접 취소 요청)
-   QR Code (Check-in용)

------------------------------------------------------------------------

# 4. Admin Dashboard

운영진 전용 Admin 영역을 제공한다. 프로토타입 검증 결과, Admin은 4개의 최상위 탭으로 구성한다: **Dashboard / Events / Participants / Team**. Payments·Check-in·Communication은 별도 탭으로 분리하지 않고, Participants 화면 안에서 필터링과 일괄 액션(Bulk Action)으로 처리하는 방식이 실제 운영 흐름에 더 적합한 것으로 확인되었다.

## 4.0 Admin Authentication

-   운영자 페이지 진입 시 Google 계정 로그인(SSO)을 요구한다.
-   사전에 등록된 운영진 이메일 화이트리스트에 포함된 계정만 접근을 허용한다. 화이트리스트에 없는 계정으로 로그인을 시도하면 접근이 거부된다.
-   로그인한 운영자 이름을 상단에 표시하고, 로그아웃 기능을 제공한다.
-   화이트리스트는 아래 **Team** 화면에서 운영진이 직접 관리한다 (추가/제거).

> 프로토타입에서는 실제 Google OAuth 대신 화이트리스트 계정 목록에서 선택하는 방식으로 로그인을 시뮬레이션한다. 실제 구현 시 Google OAuth(예: NextAuth, Supabase Auth의 Google Provider)로 대체한다.

## 4.1 Dashboard

특정 행사를 선택하면 해당 행사의 현황을 요약해서 보여준다.

예:

`정원 80 / 신청 72 / 결제 완료 64 / 미결제 8 / 참가 확정 66 / 체크인 61 / 노쇼 3 / 취소 3`

-   행사 선택 드롭다운 (여러 행사 중 조회 대상 전환)
-   신청 / 결제 완료 / 결제 대기 / 참가 확정 / 체크인 완료 / 노쇼 / 취소 / 잔여석 통계 타일
-   각 통계 타일은 클릭 시 해당 조건으로 필터링된 Participants 화면으로 바로 이동한다 (Deep-link)
-   정원 대비 신청률 진행 바
-   빠른 작업 바로가기: 새 행사 만들기, 전체 참가자 보기, 참가 확정자에게 문자 발송, 최종 명단 네임택 인쇄, 참석자에게 설문 발송
-   종료된 행사인 경우 등록된 행사 자료(Resources) 요약 표시

## 4.2 Events

-   행사 생성 / 수정
-   **공개(Published) / 비공개(Draft) 토글**: 참가자 화면 노출 여부를 즉시 전환. 저장 시점에 바로 참가자 목록에 반영되며, 비공개로 전환하면 참가자 화면에서 즉시 숨겨진다.
-   행사 목록에서 상태(예정/종료) 및 신청 현황 요약 확인
-   신청 마감 (신청 기간/정원 관리)
-   행사 등록 항목: 행사명, 부제, 날짜/시간, 장소, 참가 대상, 모집 인원, 참가비, 신청 시작/종료일, 입금 계좌 정보(유료 행사), 프로그램(시간+내용, 행 추가/삭제), 연사(이름+소속, 행 추가/삭제), 준비사항(행 추가/삭제), 취소/환불 정책, 문의 방법
-   필수 항목: 행사명, 날짜, 장소, 모집 인원 (미입력 시 필드 단위 에러 표시)

## 4.3 Participants (통합 운영 워크스페이스)

Payments, Check-in, Communication 기능을 하나의 화면에서 처리한다.

### 검색 / 필터

-   이름, 이메일, 소속, 전화번호 통합 검색
-   신청상태 필터, 결제상태 필터
-   Dashboard에서 넘어온 빠른 필터(예: "참가 확정자 이상", "체크인 완료", "참석자", "노쇼", "취소") 적용 및 해제

### 참가자별 상태 관리 (Row Action)

참가자 목록의 각 행에서 상태에 따라 아래 액션 버튼이 노출된다.

| 현재 상태 | 노출되는 액션 |
|---|---|
| 결제대기(PENDING) | 입금 확인 → `PAID` + `CONFIRMED` |
| 환불대기(REFUND_PENDING) | 환불 완료 → `REFUNDED` |
| 참가확정(CONFIRMED) | 체크인 → `CHECKED_IN` (종료된 행사는 노쇼 처리 → `NO_SHOW`도 노출) |
| 체크인 완료(CHECKED_IN) | 체크인 취소(되돌리기) → `CONFIRMED`, 참석완료 → `ATTENDED` |
| 그 외 상태(취소/참석완료/노쇼 제외) | 취소 → `CANCELLED` (결제완료 상태였다면 결제상태는 자동으로 `REFUND_PENDING`으로 전환) |

-   노쇼 처리는 종료된(COMPLETED) 행사에서만 노출한다.
-   목록에는 신청상태+결제상태를 하나로 합쳐 표시한다 (예: "신청완료(결제완료)", "신청완료(결제대기)", "취소(환불대기)", "취소(환불완료)").
-   각 참가자 행에 가장 최근 발송된 메시지 종류를 표시한다.

### 일괄 액션 (Bulk Action)

체크박스로 참가자를 다중 선택하면 상단에 액션 바가 나타난다.

-   **문자 발송 (SMS/LMS)**
    -   템플릿: 입금 안내, 입금 확인, 취소 완료, 행사 전 리마인더, 직접 작성
    -   병합 필드: `{이름} {행사명} {일시} {장소} {계좌정보} {참가비} {문의처}` — 발송 시 수신자별로 자동 치환
    -   글자수/byte 카운터 제공, 90byte 초과 시 LMS(장문)로 자동 전환됨을 안내
    -   발송 내역(수신자 수, 이름, 발송 시각)을 행사별 로그로 기록
    -   MVP에서는 실제 SMS/카카오 알림톡 연동 없이 발송을 시뮬레이션하고 로그만 남기는 것도 허용한다. 실연동은 Phase 계획에 따라 결정한다.
-   **네임택 인쇄**
    -   선택된 참가자를 대상으로 이름표를 생성한다.
    -   A4 가로 방향, 92.5×88mm 크기, 3×2 배열(장당 6명) 라벨 용지 규격에 맞춰 배치한다.
    -   이름/소속 글자 수에 따라 폰트 크기를 자동으로 축소해 잘림을 방지한다.
    -   브라우저 인쇄 기능을 통해 인쇄하거나 PDF로 저장할 수 있다.
-   **설문 이메일 발송**
    -   행사별 Google Form 설문 링크를 입력/저장한다.
    -   이메일 제목/본문 템플릿과 병합 필드(`{이름} {행사명} {설문링크} {문의처}`) 지원
    -   참석완료(ATTENDED)가 아닌 인원이 선택된 경우 경고 메시지를 표시한다 (발송 자체를 막지는 않음)
    -   발송 내역을 행사별 로그로 기록한다.
    -   MVP에서는 실제 메일 발송 없이 시뮬레이션 + 로그 기록도 허용한다. 실연동(Resend 등)은 Phase 계획에 따라 결정한다.

## 4.4 Team (운영진 계정 관리)

-   운영자 페이지 접근이 가능한 Google 계정 화이트리스트를 조회/추가/제거한다.
-   이름 + Google 이메일로 운영진을 추가한다 (중복 이메일 등록 방지).
-   본인 계정 및 마지막 남은 1명의 운영진 계정은 제거할 수 없다 (운영자 페이지 접근 불가 상태를 방지).

## 4.5 Survey / Analytics (향후 확장)

행사별 만족도 설문 응답이 누적되면 다음과 같은 집계 지표를 제공하는 것을 향후 목표로 한다.

-   신청자 수
-   참석률
-   No-show rate
-   행사 만족도
-   재참가율

> MVP 프로토타입에는 설문 "발송"까지만 구현되어 있으며, 응답 수집·집계 대시보드는 Phase 2 이후 범위다.

------------------------------------------------------------------------

# 5. Participant Status Model

참가자의 상태를 명확히 관리하는 것이 중요하다.

``` text
REGISTERED
    ↓
PAYMENT_PENDING
    ↓
CONFIRMED
    ↓
CHECKED_IN
    ↓
ATTENDED
```

예외 상태:

``` text
CANCELLED
REFUNDED
NO_SHOW
```

Payment 상태는 Registration 상태와 별도로 관리한다.

``` text
PENDING
PAID
REFUND_PENDING
REFUNDED
```

이렇게 분리하면 향후 결제 시스템이 변경되어도 Event workflow에 미치는
영향을 줄일 수 있다.

## 5.1 검증된 전이 규칙 (Transition Rules)

프로토타입 동작 검증을 통해 아래 규칙을 확정한다.

-   무료 행사는 `REGISTERED`/`PAYMENT_PENDING` 단계를 건너뛰고 신청 즉시 `CONFIRMED`/`PAID`로 시작한다.
-   입금 확인 처리는 한 번의 액션으로 `PENDING → PAID`와 `PAYMENT_PENDING → CONFIRMED`를 함께 전이시킨다.
-   `CHECKED_IN → CONFIRMED`로 되돌리는 역방향 전이(체크인 취소)를 허용한다 (현장 오조작 대응).
-   결제완료(`PAID`) 상태에서 취소(`CANCELLED`) 처리 시 결제 상태는 자동으로 `REFUND_PENDING`으로 전환된다. 아직 결제 전(`PENDING`)이었던 신청을 취소하는 경우에는 `REFUND_PENDING`을 거치지 않는다.
-   `NO_SHOW` 처리는 행사가 종료(`COMPLETED`)된 이후에만 가능하다.
-   Admin 목록 화면에는 `registration_status`와 `payment_status`를 하나로 합친 표시 상태를 사용한다 (예: "신청완료(결제완료)", "취소(환불대기)").

------------------------------------------------------------------------

# 6. Core Data Model

## User

``` text
id
name
email
phone
organization
job_title
interests
created_at
```

## Event

``` text
id
title
subtitle
description
start_datetime
end_datetime
venue
capacity
fee
registration_start
registration_end
status
published          # 참가자 화면 노출 여부 (공개/비공개 토글)
survey_form_url     # 행사 종료 후 발송할 Google Form 설문 링크
bank_info           # { bank, account, holder } — 유료 행사 계좌이체 정보
refund_policy
contact
```

## AdminAccount

``` text
id
name
email        # Google 계정 이메일, 운영자 페이지 접근 화이트리스트
created_at
```

## Registration

``` text
id
user_id
event_id
registration_status
payment_status
registered_at
checkin_at
depositor_name      # 계좌이체 입금자명 (신청자명과 다를 수 있음)
note                 # 운영자 메모
```

## Payment

``` text
id
registration_id
amount
payment_method
payment_reference
payment_status
paid_at
```

## Attendance

``` text
id
registration_id
checkin_time
attendance_status
```

## Communication

``` text
id
event_id
user_id
channel          # SMS | EMAIL
template_key     # 사용된 템플릿 (payment / paidConfirm / cancelRefund / reminder / survey / custom)
message_type
body
sent_at
delivery_status
```

## Survey

``` text
id
event_id
user_id
response
submitted_at
```

------------------------------------------------------------------------

# 7. Recommended Technical Architecture

초기에는 관리 부담이 적고 빠르게 개발할 수 있는 구조를 사용한다.

``` text
User
  ↓
Biomates Website
Next.js
  ↓
Application / API
  ↓
Supabase
 ├─ PostgreSQL
 ├─ Authentication
 └─ Storage

External Services
 ├─ Payment Link / Bank Transfer
 └─ Email Service

Admin
  ↓
Biomates Admin Dashboard
```

### Frontend

**Next.js**

-   Public website
-   Event pages
-   Registration
-   Admin Dashboard

### Backend / Database

**Supabase**

-   PostgreSQL database
-   Authentication
-   File storage
-   향후 server-side function 활용

### Hosting

**Vercel**

Next.js 기반 서비스의 배포 및 운영에 활용한다.

### Email

초기에는 Resend 등의 transactional email 서비스를 고려한다.

### Payment

MVP:

-   계좌이체
-   외부 Payment Link
-   Admin manual confirmation

향후:

-   Payment API
-   Webhook
-   자동 결제 상태 반영

------------------------------------------------------------------------

# 8. MVP Scope

첫 번째 목표는 다음 질문에 **Yes**라고 답할 수 있는 수준이다.

> "Biomates 행사 하나를 이 시스템만으로 처음부터 끝까지 운영할 수
> 있는가?"

## Must Have

-   Biomates Home
-   Event List
-   Event Detail (프로그램/연사/준비사항/자료 포함)
-   연사 상세 정보 모달 (선택 항목)
-   Registration Form (필수/선택 필드 구분, 중복 신청 방지)
-   Registration Complete
-   계좌이체/Payment Link 안내
-   My Registration (상태별 안내 메시지, 참석 후 자료 열람)
-   Participant DB
-   Admin 인증 (Google SSO + 운영진 화이트리스트)
-   Team (운영진 계정 관리)
-   Admin Dashboard (통계 타일 + Participants Deep-link)
-   Events 관리 (생성/수정/공개-비공개 토글)
-   참가자 목록 및 통합 필터/검색
-   결제 상태 관리 (입금 확인, 환불 처리)
-   참가 확정 관리
-   Check-in (체크인 취소 포함) / 노쇼 처리
-   문자(SMS/LMS) 일괄 발송 (시뮬레이션 또는 실연동)
-   네임택 인쇄 (라벨 규격 대응, 자동 폰트 축소)
-   설문 이메일 발송 (Google Form 링크 연결, 시뮬레이션 또는 실연동)
-   행사 자료(Resources) 공유 — PUBLIC / ATTENDED 최소 2단계 권한
-   Email 안내
-   모바일 대응 (반응형 레이아웃, 모바일 하단 탭 내비게이션)

## Not Required for MVP

-   자체 PG 결제
-   자동 환불
-   Kakao 알림톡 연동 (SMS/LMS 대체 발송은 MVP 포함, 알림톡 연동은 향후)
-   QR Check-in
-   Community Member Directory
-   Networking Matching
-   설문 응답 집계/Analytics 대시보드
-   Mobile App
-   Registered/Private 세분화된 자료 접근 권한 (PUBLIC/ATTENDED 2단계로 시작)

------------------------------------------------------------------------

# 9. Development Phases

## Phase 1 --- Event MVP

**목표: 실제 행사 하나를 운영한다.**

구현:

-   Website
-   Event management (생성/수정/공개-비공개 토글)
-   Admin 인증 (Google SSO + 화이트리스트) 및 Team 관리
-   Registration (필수/선택 필드, 중복 신청 방지)
-   Participant DB
-   계좌이체/Payment Link
-   Manual payment confirmation / 환불 처리
-   Email 안내
-   문자(SMS/LMS) 일괄 발송
-   네임택 인쇄
-   Check-in (체크인 취소 포함) / 노쇼 처리
-   설문 이메일 발송 (Google Form 링크)

> SMS 실연동(Solapi, NHN Cloud 등 문자 API)은 비용·사업자 인증 이슈가 있어, Pilot 행사 시점에는 운영자 수동 발송으로 대체할 수 있다. UI/워크플로우는 Phase 1에서 구축하고, 실연동 여부는 Pilot 결과에 따라 판단한다.

## Phase 2 --- Event Operations Automation

첫 행사 운영 결과를 기반으로 수작업을 자동화한다.

구현 후보:

-   Payment API/Webhook
-   QR Check-in
-   Automatic Reminder
-   Waiting List
-   Cancellation
-   Refund workflow
-   Survey
-   Analytics

## Phase 3 --- Biomates Community

Event 중심 서비스를 Participant 중심 서비스로 확장한다.

구현 후보:

-   Member Profile
-   Participation History
-   Interests
-   Networking
-   Member Directory
-   Event Recommendation
-   Volunteer Management
-   Speaker Management
-   Sponsor Management

------------------------------------------------------------------------

# 10. Project Execution Plan

## Step 1 --- Current Workflow 분석

현재 Biomates 행사가 실제로 어떻게 운영되고 있는지 정리한다.

예:

`공지 → 신청 → 명단 관리 → 입금 → 안내 → 행사 → 출석 → 설문`

각 단계에서 다음을 확인한다.

-   누가 담당하는가?
-   어떤 도구를 사용하는가?
-   어떤 수작업이 발생하는가?
-   가장 많은 시간이 걸리는 업무는 무엇인가?
-   참가자에게 불편한 부분은 무엇인가?

## Step 2 --- Target Workflow 정의

목표 workflow를 확정한다.

`Event → Registration → Payment → Confirmation → Communication → Check-in → Follow-up`

## Step 3 --- MVP Scope 확정

첫 Pilot 행사에서 반드시 필요한 기능만 선정한다.

## Step 4 --- Wireframe

우선 다음 핵심 화면을 설계한다.

1.  Home
2.  Event List
3.  Event Detail
4.  Registration
5.  Registration Complete / Payment
6.  Admin Dashboard
7.  Participant Management
8.  Check-in

## Step 5 --- Database Design

먼저 다음 Entity를 설계한다.

`User / Event / Registration / Payment / Attendance`

이후 Communication과 Survey를 추가한다.

## Step 6 --- Development

권장 개발 순서:

`Event → Registration → Database → Admin → Payment Status → Email → Check-in`

## Step 7 --- Pilot Event

실제 Biomates 행사 하나를 선정하여 전체 workflow를 테스트한다.

## Step 8 --- Retrospective

행사 종료 후 운영진과 다음을 검토한다.

> "어떤 수작업이 아직 남아 있는가?"

## Step 9 --- Automation

가장 반복적이고 시간이 많이 소요되는 업무부터 자동화한다.

## Step 10 --- Community Expansion

행사 데이터가 충분히 축적되면 Participant 중심의 Community 기능으로
확장한다.

------------------------------------------------------------------------

# 11. Long-term Direction --- Biomates Community OS

장기적으로 가장 중요한 Entity는 **Event가 아니라 Participant**가 될 수
있다.

예:

``` text
Participant Profile

홍길동
────────────────────
2026 Spring Meetup        Attended
2026 AI Seminar           Attended
2026 Summer Networking    Attended

Interests
- Medical AI
- Digital Health
- Robotics

Contribution
- Speaker: 1
- Volunteer: 2
- Participant: 3
```

이 데이터를 통해 다음을 파악할 수 있다.

-   지속적으로 참여하는 Member
-   신규 참가자
-   관심 분야
-   행사 재참가율
-   Speaker/Volunteer 기여도
-   Community engagement
-   향후 행사 추천 대상

따라서 MVP는 **Event Operations Platform**으로 시작하되, 데이터 구조는
장기적으로 **Biomates Community OS**로 확장할 수 있도록 설계한다.

------------------------------------------------------------------------


---

# 12. Event Materials / Resources

행사에서 사용한 강의자료, 발표 슬라이드, 사진, 참고 링크 등을 행사 종료 후 참가자와 공유할 수 있도록 **Event Resources** 기능을 제공한다.

이 기능은 단순한 파일 첨부가 아니라 Event Follow-up과 장기적인 Biomates Knowledge Hub의 기반으로 설계한다.

## 12.1 Resource Types

각 Event에는 다음과 같은 자료를 연결할 수 있다.

```text
Event
 ├─ Event Info
 ├─ Program
 ├─ Participants
 ├─ Payment
 ├─ Attendance
 └─ Resources
      ├─ Presentation Slides
      ├─ Lecture Materials
      ├─ Photos
      ├─ Reference Links
      ├─ Videos
      └─ Other Documents
```

지원 대상 예시:

- PDF 발표자료
- PPT/PPTX 강의 슬라이드
- 행사 사진
- 참고 문서
- 외부 웹사이트 링크
- 영상 링크
- 기타 참가자 배포 자료

## 12.2 Access Control

자료마다 공개 범위를 설정할 수 있도록 한다.

| Access Level | 접근 대상 |
|---|---|
| Public | 누구나 접근 가능 |
| Registered | 해당 행사 신청자 |
| Attended | 실제 참석자로 확인된 참가자 |
| Private | Organizer/Admin만 접근 가능 |

강사가 참가자에게만 공유하기를 원하는 강의자료는 `Attended`로 설정하는 것을 기본적인 활용 방식으로 고려한다.

또한 자료별로 다음 옵션을 관리할 수 있도록 한다.

- 다운로드 허용 여부
- 공개 시작일
- 공개 종료일
- 발표자/자료 소유자
- 자료 설명
- 외부 링크 여부
- Sharing permission 확인 여부

## 12.3 Resource Data Model

`EventResource` Entity를 추가한다.

```text
EventResource

id
event_id
title
description
resource_type
file_url
external_url
access_level
download_allowed
sharing_permission
speaker_name
published_at
expires_at
created_at
```

파일 자체는 Supabase Storage 등의 Object Storage에 저장하고 DB에는 파일 정보와 접근 권한을 저장한다.

## 12.4 Organizer Workflow

행사 자료 공유 workflow:

```text
Speaker/Organizer 자료 전달
        ↓
Admin 자료 업로드
        ↓
Sharing Permission 확인
        ↓
Access Level 설정
        ↓
Resource Publish
        ↓
참가자 Follow-up
```

운영자는 Event Admin 화면에서 다음을 수행할 수 있어야 한다.

- 자료 업로드
- 외부 링크 등록
- 자료 제목/설명 입력
- 자료 공개/비공개
- 공개 대상 설정
- 다운로드 허용/차단
- 자료 삭제
- 공개 기간 설정

## 12.5 Participant Experience

행사 종료 후 참가자는 Event Detail 또는 My Events에서 행사 자료를 확인한다.

예:

```text
AI & Healthcare Seminar 2026
✓ Attended

Event Resources

Presentation Slides
├─ AI Healthcare Trends.pdf
├─ Medical AI Regulation.pdf
└─ Healthcare Startup Strategy.pdf

Photos
└─ Event Photos

References
├─ Recommended Papers
└─ Useful Links
```

권한이 `Attended`인 경우 실제 Check-in/Attendance 정보가 있는 사용자에게만 자료를 보여준다.

## 12.6 Follow-up Integration

행사 종료 후 Follow-up communication과 Resources를 연결한다.

예시 workflow:

```text
Event Completed
      ↓
Attendance Confirmed
      ↓
Resources Published
      ↓
Follow-up Email
      ↓
Event Resources Page
      ↓
Survey / Next Event
```

Follow-up 메시지에는 다음 정보를 포함할 수 있다.

- 행사 참여 감사
- 발표자료/강의자료
- 행사 사진
- 만족도 설문
- 관련 콘텐츠
- 다음 Biomates 행사

## 12.7 My Biomates / Resource Archive

Community 기능이 추가되면 사용자가 과거 참석 행사와 자료를 다시 확인할 수 있도록 한다.

```text
My Biomates

Events
────────────────────────
AI & Healthcare Seminar 2026
✓ Attended

Resources
  ├─ AI Healthcare Trends.pdf
  ├─ Medical AI Regulation.pdf
  └─ Event Photos

────────────────────────
Biomates Networking Night
✓ Attended

Resources
  └─ Event Photos
```

이를 통해 행사 종료 후에도 콘텐츠가 지속적으로 활용될 수 있도록 한다.

## 12.8 Knowledge Hub 확장

자료가 축적되면 장기적으로 다음 방향으로 확장할 수 있다.

`Event Operations → Event Archive → Biomates Knowledge Hub`

향후 기능 후보:

- 자료 통합 검색
- Topic/Tag 분류
- Speaker별 콘텐츠
- 행사별 콘텐츠
- 인기 자료
- 추천 콘텐츠
- 회원 관심 분야 기반 추천
- 강의 영상
- 관련 외부 자료
- Biomates 자체 콘텐츠

이렇게 하면 Biomates 사이트의 가치가 행사 개최 시점에만 발생하지 않고, 과거 행사에서 생성된 지식과 콘텐츠가 Community 자산으로 계속 축적된다.

## 12.9 MVP Scope for Resources

첫 번째 MVP에서도 기본적인 자료 공유 기능은 포함하는 것을 권장한다.

**MVP 포함**

- Event별 자료 업로드
- PDF/PPT 등 파일 저장
- 외부 링크 등록
- Public / Registered / Attended / Private 권한
- 다운로드 허용 여부
- Admin 자료 관리
- Event Resource 페이지
- Follow-up 이메일에서 Resource 페이지 연결

**향후 구현**

- 영상 Hosting
- 자료 Full-text 검색
- Tag/Topic 추천
- 개인화 추천
- Speaker Portal
- 자료 조회 Analytics
- Knowledge Hub

---

# 13. Non-functional Requirements --- Accessibility & UX

Biomates 웹사이트 및 Admin 화면은 Lunit 사내 WCAG 2.1 AA 가이드를 따른다. 프로토타입에서 이미 검증된 항목과, 실제 구현 시 반드시 지켜야 할 항목은 다음과 같다.

-   **다크 모드 지원**: 시스템 설정(prefers-color-scheme)을 자동 감지하고, 사용자가 수동으로 전환할 수 있으며 선택값을 브라우저에 유지한다.
-   **키보드 접근성**: 로그인/연사 소개 모달은 포커스 트랩을 구현하고 Tab/Shift+Tab 순환, Esc로 닫기, 닫을 때 트리거 요소로 포커스를 복귀한다.
-   **포커스 표시**: 모든 인터랙티브 요소에 `:focus-visible` 아웃라인을 제공한다.
-   **동적 상태 알림**: 토스트(작업 완료 알림)는 `aria-live="polite"`로 스크린리더에 전달한다.
-   **모션 최소화**: `prefers-reduced-motion` 설정 시 트랜지션을 비활성화한다.
-   **반응형 레이아웃**: 320px 폭까지 대응하며, 모바일에서는 하단 탭 내비게이션과 화면 하단 고정 CTA(참가 신청 버튼)를 제공한다.
-   **폼 접근성**: 모든 입력 필드에 라벨을 연결하고, 필수 항목은 시각적 표시(`*`)와 함께 안내하며, 에러는 필드 옆에 구체적인 문구로 표시한다 (예: "올바른 이메일 주소를 입력해 주세요.").
-   **색상 외 표시**: 신청상태/결제상태 등은 색상만이 아니라 텍스트 라벨을 함께 사용해 색맹/저시력 사용자도 구분할 수 있도록 한다.

------------------------------------------------------------------------

# 14. MVP Success Criteria

첫 Pilot 행사 종료 후 다음 기준으로 성공 여부를 평가한다.

-   행사 생성부터 종료까지 시스템을 실제 사용했는가?
-   참가자 신청 정보가 하나의 DB에서 관리되었는가?
-   결제 여부를 쉽게 확인할 수 있었는가?
-   참가자 안내 업무가 기존보다 단순해졌는가?
-   행사 당일 참석자 관리가 쉬워졌는가?
-   Follow-up 대상자를 쉽게 식별할 수 있었는가?
-   Excel/Google Form/수작업 사용이 감소했는가?
-   다음 행사에서도 다시 사용하고 싶은가?

------------------------------------------------------------------------

# 15. Immediate Next Steps

프로젝트 시작 시 다음 순서로 진행한다.

1.  현재 Biomates Event 운영 workflow 작성
2.  첫 Pilot 행사 선정
3.  MVP requirement 확정
4.  화면 Wireframe 작성
5.  Database schema 작성
6.  Next.js + Supabase 프로젝트 생성
7.  Event/Registration 기능 개발
8.  Admin/Payment 관리 기능 개발
9.  Email 및 Check-in 구현
10. Pilot 운영 및 Retrospective

**첫 번째 milestone은 "웹사이트 완성"이 아니라, 실제 Biomates 행사
하나를 end-to-end로 성공적으로 운영하는 것**으로 정의한다.
