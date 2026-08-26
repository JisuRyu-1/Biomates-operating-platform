# Admin Google SSO 설정

Admin(`/admin/**`)은 Supabase Auth를 통해 실제 Google 계정으로 로그인한다. 코드는 준비되어 있고, 아래 외부 설정만 완료하면 바로 동작한다. 전부 본인 계정으로 직접 만들어야 하는 단계들이다.

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성 (무료 플랜으로 충분)
2. 프로젝트 생성이 끝나면 **Settings → API**에서 다음 두 값을 복사해 둔다.
   - Project URL
   - `anon` `public` API key

## 2. Google OAuth 클라이언트 생성

Google Cloud Console의 OAuth 설정 UI가 "Google 인증 플랫폼(Google Auth Platform)"으로 개편되어, 왼쪽 메뉴 이름이 예전 "OAuth consent screen" 한 페이지 대신 여러 메뉴로 나뉘어 있다.

1. [Google Cloud Console](https://console.cloud.google.com/) → 새 프로젝트(또는 기존 프로젝트 선택)
2. 왼쪽 메뉴 **대상(Audience)**
   - User Type: 외부(External) (조직 외부 Gmail 계정도 로그인하게 하려면)
   - **Test users**에 로그인을 허용할 이메일들을 전부 추가해둔다 (본인 + 운영진으로 추가할 팀원 전원). 검증(verification) 없이 여기 등록된 계정만 바로 로그인 가능 — Test users에 없는 계정은 앱의 화이트리스트(`admin_whitelist`)에 넣어도 Google 로그인 화면 자체에서 막힌다
   - **브랜딩(Branding)** 메뉴에서 앱 이름/지원 이메일 등도 채워둔다
3. 왼쪽 메뉴 **클라이언트(Clients) → + CREATE CLIENT**
   - Application type: Web application
   - **승인된 JavaScript 원본(Authorized JavaScript origins)** — 필수 입력. 로컬 개발 중이면:
     ```
     http://localhost:3000
     ```
     배포 후에는 실제 배포 도메인도 추가
   - **승인된 리디렉션 URI(Authorized redirect URIs)**에 아래 주소 추가 (Supabase 프로젝트 참조값으로 교체):
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     ```
4. 생성된 **Client ID**와 **Client secret**을 복사해 둔다.

## 3. Supabase에 Google Provider 연결

1. Supabase 대시보드 → **Authentication → Providers → Google**
2. Enable 토글 켜기
3. 2단계에서 받은 Client ID / Client secret 입력 후 저장

## 4. 앱에 Supabase 자격증명 연결

`web/.env.local.example`을 복사해 `web/.env.local`로 만들고 1단계에서 복사한 값을 채운다 (`.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않는다).

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

이후 dev 서버를 재시작한다 (`npm run dev`).

## 5. 화이트리스트 테이블 생성 + 첫 운영진 등록

1. Supabase 대시보드 → **SQL Editor**
2. `supabase/migrations/0001_admin_whitelist.sql` 내용을 붙여넣고 실행 (테이블 + RLS 정책 생성)
3. 같은 SQL Editor에서 파일 맨 아래 주석 처리된 INSERT문의 이메일/이름을 본인 것으로 채워 별도로 실행:
   ```sql
   insert into admin_whitelist (email, name) values ('본인이메일@gmail.com', '본인 이름');
   ```
   (SQL Editor는 RLS를 우회하는 권한으로 실행되므로 이 첫 계정만은 앱의 Team 화면이 아니라 여기서 직접 넣어야 한다 — 이후부터는 Team 화면에서 추가/제거 가능)

## 6. 로그인 확인

`/admin`에 접속하면 "Google 계정으로 로그인" 버튼이 보인다. 5단계에서 등록한 계정으로 로그인하면 바로 Admin에 들어가지고, 등록하지 않은 다른 Google 계정으로 로그인하면 "화이트리스트에 등록되어 있지 않습니다" 안내가 뜬다.

## 트러블슈팅

- **`{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`**
  Supabase의 Authentication → Providers → Google에서 Client ID/Secret은 입력했지만 **Enable 토글이 꺼진 채로 저장**된 경우 발생. 다시 들어가서 토글이 켜져 있는지 확인하고 Save를 명시적으로 다시 눌러야 한다.
- **Settings → API에서 URL을 잘못 복사하는 경우**
  화면에 "REST"용 예시 URL(`https://<project-ref>.supabase.co/rest/v1/`)이 같이 보이는데, `.env.local`에는 그게 아니라 순서 없는 순수 **Project URL**(`https://<project-ref>.supabase.co`, 끝에 `/rest/v1/` 없음)을 넣어야 한다.
- **API Key 형식**: 최근 발급되는 키는 `sb_publishable_...` 형태(신규 형식)로, 예전의 긴 JWT(`eyJ...`) 형태 anon key와 다르게 생겼지만 둘 다 `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 그대로 사용하면 된다.
- **"확인되지 않은 앱" 경고**: OAuth consent screen이 Test 상태일 때, Test users에 없는 계정으로 로그인하면 뜬다. 로그인하려는 사람의 이메일을 Google Cloud Console → 대상(Audience) → Test users에 먼저 추가해야 한다(앱의 `admin_whitelist`에만 추가하는 걸로는 부족함).

## 배포 시 참고

Vercel 등에 배포하면:

- 배포 환경변수에도 `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`를 추가
- Google Cloud Console의 Authorized redirect URI는 그대로(Supabase 콜백 URL 하나만 있으면 됨) — Supabase가 다시 우리 앱의 `/auth/callback`으로 넘겨주는 구조라 배포 도메인이 바뀌어도 Google 쪽 설정은 그대로 둬도 된다
- 프로덕션에 일반 사용자도 Google 로그인을 허용하려면 OAuth consent screen을 "In production"으로 전환(Google의 앱 검증 절차 필요할 수 있음) — 화이트리스트 운영진만 쓰는 내부 도구 성격이라면 Test 상태로 두고 Test users만 계속 추가해도 무방
