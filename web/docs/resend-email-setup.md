# 설문 이메일 발송(Resend) 설정

Admin Participants의 "설문 이메일 발송"은 Resend API를 통해 실제로 발송된다. 코드는 준비되어 있고, 아래 외부 설정만 완료하면 바로 동작한다. 발신 주소/API Key는 운영진 개인 계정이 아니라 **팀 공용**으로 관리되며, 로그인한 운영진이면 누구든 같은 발신 주소로 발송할 수 있다.

## 1. Resend 가입

1. [resend.com](https://resend.com) 접속 후 계정 생성
2. 무료 플랜으로 시작 가능 (월 발송량 제한 있음, 이벤트당 50명 미만 규모에는 충분)

## 2. 발신 주소

**완료됨 (도메인 인증 방식 사용 중).** `biomates.org` 도메인을 Resend에 등록하고 Cloudflare DNS에 DKIM/SPF/DMARC 레코드를 추가해 인증을 완료했다. 발신 주소는 `RESEND_FROM_EMAIL=events@biomates.org`.

새 프로젝트에서 처음부터 다시 설정해야 한다면:

1. Resend 대시보드 → **Domains → Add Domain** → 도메인 입력(예: `biomates.org`)
2. 안내되는 DNS 레코드(DKIM TXT, SPF용 MX+TXT, DMARC TXT)를 도메인 관리 콘솔(Cloudflare 등)에 추가 — "Manual setup"으로 각 레코드의 **Content 값 전체를 복사**해서 붙여넣어야 한다(화면에 잘려 보이는 값을 그대로 타이핑하면 안 됨). TXT/MX 레코드는 Cloudflare의 프록시(주황 구름) 대상이 아니라 DNS only로 자동 처리된다.
3. Resend에서 **Verify DNS Records** 실행, 검증 완료까지 대기
4. 인증 완료 후 그 도메인의 아무 주소(`events@biomates.org` 등)를 발신 주소로 사용

도메인 인증 전에는 Resend의 `onboarding@resend.dev` 발신 주소로 임시 테스트가 가능하지만, **계정 소유자 본인 이메일로만 발송 가능**하다는 제약이 있다(그 외 수신자가 하나라도 섞이면 요청 전체가 403으로 거부됨). `lib/messaging/registration-notify.ts`의 `RESEND_NOTIFY_OVERRIDE` 환경변수가 그 제약 우회용 임시 조치였는데, 도메인 인증이 끝난 지금은 더 이상 설정하지 않는다(설정 안 하면 코드가 자동으로 admin_whitelist 전체에 발송).

## 3. API Key 발급

1. Resend 대시보드 → **API Keys → Create API Key**
2. 이름은 아무거나(예: `biomates-production`), 권한은 기본(Sending access)으로 충분
3. 생성된 키는 그 순간에만 전체가 보이니 바로 복사해 둔다

## 4. 앱에 자격증명 연결

`web/.env.local.example`을 복사해 `web/.env.local`로 만들고(또는 기존 파일에 이어서) 값을 채운다.

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=events@biomates.org
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
