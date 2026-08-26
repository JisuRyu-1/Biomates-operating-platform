# 설문 이메일 발송(Resend) 설정

Admin Participants의 "설문 이메일 발송"은 Resend API를 통해 실제로 발송된다. 코드는 준비되어 있고, 아래 외부 설정만 완료하면 바로 동작한다. 발신 주소/API Key는 운영진 개인 계정이 아니라 **팀 공용**으로 관리되며, 로그인한 운영진이면 누구든 같은 발신 주소로 발송할 수 있다.

## 1. Resend 가입

1. [resend.com](https://resend.com) 접속 후 계정 생성
2. 무료 플랜으로 시작 가능 (월 발송량 제한 있음, 이벤트당 50명 미만 규모에는 충분)

## 2. 발신 주소 준비

두 가지 중 하나를 선택한다.

### 옵션 A — 바로 테스트 (권장, 도메인 없어도 됨)

Resend가 제공하는 `onboarding@resend.dev` 발신 주소를 그대로 사용하면 도메인 인증 없이 즉시 발송 테스트가 가능하다. `RESEND_FROM_EMAIL=onboarding@resend.dev`로 설정하면 된다. 다만 발신자 표시가 Biomates 도메인이 아니므로, 실제 운영 전에는 옵션 B로 전환하는 것을 권장한다.

### 옵션 B — 실제 도메인 인증 (운영 단계에서 권장)

1. Resend 대시보드 → **Domains → Add Domain**
2. 발송에 사용할 도메인(예: `biomates.example`) 입력
3. 안내되는 DNS 레코드(SPF/DKIM 등)를 도메인 관리 콘솔(가비아, Cloudflare 등)에 추가
4. 인증 완료 후 `events@biomates.example` 같은 주소를 발신 주소로 사용

## 3. API Key 발급

1. Resend 대시보드 → **API Keys → Create API Key**
2. 이름은 아무거나(예: `biomates-production`), 권한은 기본(Sending access)으로 충분
3. 생성된 키는 그 순간에만 전체가 보이니 바로 복사해 둔다

## 4. 앱에 자격증명 연결

`web/.env.local.example`을 복사해 `web/.env.local`로 만들고(또는 기존 파일에 이어서) 값을 채운다.

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev   # 또는 인증한 도메인의 주소
```

dev 서버 재시작 후 반영된다.

## 5. 배포 환경변수

Vercel 프로젝트 → **Settings → Environment Variables**에 위 두 값을 **Production**(및 필요하면 Preview) 환경에 추가한다. `NEXT_PUBLIC_` 접두사를 붙이지 않는다 — 붙이면 브라우저에 노출된다.

값 추가/변경 후에는 반드시 **Redeploy**해야 반영된다(빌드 시점에 서버 함수에 주입되는 값이 아니라 런타임에 읽지만, 새 배포가 있어야 해당 환경변수를 가진 함수가 실제로 뜬다).

## 6. 발송 테스트

1. `/admin/participants`에서 참가자 1~2명 선택 → **설문 이메일 발송**
2. Google Form 링크/제목/본문 입력 후 발송
3. 본인 이메일 주소로 테스트 수신자를 하나 포함시켜 실제 수신 여부 확인
4. 잘못된 이메일 주소를 섞어서 발송 → 실패 목록에 뜨는지, "실패 대상 다시 발송" 버튼이 동작하는지 확인
