# 문자 발송(SOLAPI) 설정

Admin Participants의 "문자 발송"은 SOLAPI SMS API를 통해 실제로 발송된다. 코드는 준비되어 있고, 아래 외부 설정만 완료하면 바로 동작한다. 발신번호/API Key는 운영진 개인 계정이 아니라 **팀 공용**으로 관리되며, 로그인한 운영진이면 누구든 같은 발신번호로 발송할 수 있다.

## 1. SOLAPI 개인 계정 생성 및 본인인증

1. [solapi.com](https://solapi.com) 접속 후 계정 생성
2. 개인 계정은 사업자등록증 없이 사용 가능하지만, 본인인증 절차를 거쳐야 발송이 활성화된다
3. 개인 계정 기준 제한: 1인 사용, 일일 발송량 제한 적용, 발신번호 최대 5개까지 등록 가능 — Biomates의 이벤트당 50명 미만 규모에는 충분하다

## 2. 발신번호 등록

1. SOLAPI Console → 발신번호 관리 → 번호 등록
2. 본인 명의 휴대전화 번호를 등록(본인인증 또는 필요한 증빙 절차 진행)
3. 상태가 **ACTIVE**로 표시되어야 실제 발송에 사용할 수 있다
4. 발신번호는 숫자만 사용한다: `010-1234-5678`이 아니라 `01012345678` 형식으로 등록/사용

## 3. API Key / API Secret 발급

1. SOLAPI Console → API Key 관리 → 발급
2. `API Key`와 `API Secret` 두 값이 생성된다 — 이 값은 서버에서만 사용하고 절대 브라우저에 노출하지 않는다
3. 생성된 값을 바로 복사해 둔다

## 4. 앱에 자격증명 연결

`web/.env.local.example`을 복사해 `web/.env.local`로 만들고(또는 기존 파일에 이어서) 값을 채운다.

```
SOLAPI_API_KEY=xxxxxxxxxxxxxxxx
SOLAPI_API_SECRET=xxxxxxxxxxxxxxxx
SOLAPI_SENDER_NUMBER=01012345678
```

dev 서버 재시작 후 반영된다.

## 5. 배포 환경변수

Vercel 프로젝트 → **Settings → Environment Variables**에 위 세 값을 **Production**(및 필요하면 Preview) 환경에 추가한다. `NEXT_PUBLIC_` 접두사는 붙이지 않는다 — 붙이면 브라우저에 노출된다.

값 추가/변경 후에는 반드시 **Redeploy**해야 반영된다.

## 6. 발송 테스트

1. `/admin/participants`에서 참가자 1~2명 선택 → **문자 발송**
2. 템플릿을 고르거나 직접 작성 후 발송 (테스트니까 본인 휴대전화 번호를 수신자에 하나 포함시키는 게 좋음)
3. 메시지 길이가 90바이트를 넘으면 화면에 SMS 대신 LMS로 표시되는지 확인
4. 잘못된 전화번호를 섞어서 발송 → 실패 목록에 뜨는지, "실패 대상 다시 발송" 버튼이 동작하는지 확인
5. SOLAPI Console의 발송 내역에서도 실제로 접수되었는지 대조
