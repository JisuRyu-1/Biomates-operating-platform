# 진단·의료기기 주간 카드뉴스 제작 가이드 (범용)

> **문서 범위**\
> 이 문서는 **"어떻게 만드는가"에 대한 범용 제작 가이드**다. 특정 주차에
> 다룰 실제 뉴스·헤드라인·팩트는 이 문서에 포함하지 않는다.
>
> **다루는 산업 범위**: 이 카드뉴스는 (치료·진단용) 의료기기와
> **체외진단(IVD) 의료기기**를 모두 포함하는 "진단 및 의료기기" 산업
> 종사자 그룹을 대상으로 한다. 영상 기반 SaMD/의료 AI에만 한정하지
> 않고, IVD/POC(point-of-care) 진단, 분자진단, 병리 등 체외진단 영역의
> 규제·시장 뉴스도 대등하게 후보에 포함한다 (아래 1절 Target Audience,
> 6절 Evidence Tier, 8절 Regulatory 특별 규칙 참조).
>
> 매주 실제 콘텐츠는 별도 파일로 작성한다.
> - 초안/팩트체크: `YYYY-MM-DD_medtech_weekly_draft.md`
> - 완성 카드(HTML/PNG): `cardnews_YYYY-MM-DD/`
>
> (과거 버전인 `medical_device_weekly_cardnews_guide.md`는 특정 주차의
> 실제 이슈 예시가 섞여 있던 문서로, 참고용 아카이브로 남겨둔다.)

------------------------------------------------------------------------

# 1. 카드뉴스의 기본 방향

## 핵심 원칙

카드뉴스는 다음 세 단계가 한눈에 보여야 한다.

**WHAT → SO WHAT → NOW WHAT**

- **WHAT** — 실제로 무슨 일이 있었는가?
- **SO WHAT** — 왜 중요한가?
- **NOW WHAT** — 한국의 기업·제품·규제·시장에는 어떤 의미가 있는가?

단순 기사 요약은 피한다.\
각 이슈마다 **사실(Fact)**과 **해석(Interpretation)**을 명확히 구분한다.

## 다루는 산업 범위

이 카드뉴스는 **의료기기(치료·진단용 기기, SaMD/의료 AI 포함)와
체외진단(IVD) 의료기기를 모두 포함**하는 산업을 다룬다. 둘 중 하나로
치우치지 않도록, 매주 토픽 후보를 뽑을 때(14절 Topic Selection Score)
다음을 함께 고려한다.

- **의료기기 계열**: 영상진단기기, SaMD/의료 AI, 치료기기, 웨어러블 등
- **체외진단(IVD) 계열**: 분자진단, 면역진단, POC(point-of-care)
  진단, 병리(디지털 병리 포함), companion diagnostics 등

두 계열의 규제 체계가 다른 경우가 많다는 점에 유의한다 (예: EU의
MDR과 IVDR은 별도 규정, 미국 FDA도 IVD를 별도 카테고리로 심사). 8절
"Regulatory News 특별 규칙"과 6절 "Evidence & Fact-checking Rule"의
기관 목록도 이 두 계열을 모두 포괄하도록 확인한다.

## Target Audience

**Primary**
- 의료기기 및 체외진단(IVD) / SaMD / 의료 AI 업계 종사자
- Product / RA / QA / Sales / Marketing / Clinical / R&D / Business
- 병원 및 디지털헬스 관계자

**Secondary**
- 헬스케어 투자자
- 의료진
- 의료기기·AI 산업에 관심 있는 일반 독자

## 콘텐츠 톤

- 전문적이지만 어렵지 않게
- 자극적이지 않지만 헤드라인은 강하게
- 규제/기술 용어는 필요한 만큼만 사용
- "대단하다"보다 **무엇이 달라지는지** 설명
- 회사 홍보자료의 표현을 그대로 반복하지 않음
- 미래 영향은 확정적으로 단정하지 않고 근거에 따라 표현

------------------------------------------------------------------------

# 2. 문체 원칙 (Voice & Tone)

## 높임말 원칙

**카드에 실제로 노출되는 모든 문장은 높임말(-습니다/-합니다체)로 작성한다.**

적용 대상: Headline, Hook/One-line Takeaway, Fact, Korea Impact,
Try This Monday, Watch Out, 커버·테이크어웨이 카피 등 독자가 카드에서
직접 읽는 모든 텍스트.

적용하지 않는 대상: `WHAT HAPPENED`, `WHY IT MATTERS`, `INTERPRETATION`
같은 **내부 팩트체크·에디토리얼 메모 필드**. 이 필드들은 카드에 직접
노출되지 않는 작업용 기록이므로 평서형으로 간결하게 유지해도 된다.

예:
- 카드 노출용: "FDA가 Discussion Paper를 공개했습니다."
- 내부 메모용: "FDA CDRH가 Discussion Paper를 공개 (2026-08-18)"

## 헤드라인과 높임말이 충돌할 때

헤드라인은 강한 인상을 남기는 것이 우선이지만, 높임말 원칙은 헤드라인에도
동일하게 적용한다. 다만 헤드라인이 3줄 이상으로 길어지거나 어절이
어색하게 잘리면(예: 마지막 글자 하나만 다음 줄로 밀림), 문장 순서를
조정해 줄바꿈이 자연스러운 지점을 찾는다. 글자를 줄이려고 높임말
어미를 생략하지 않는다.

## 기타 문체 규칙

- 존재하지 않는 사실을 "~것 같다"는 식으로 얼버무리지 않는다. 확정되지
  않은 사안은 표현 강도 규칙(8절)을 따른다.
- 인용된 수사적 질문("누가 ~인가" 같은 hypothetical)은 예외적으로
  평서형을 유지해도 된다 — 이는 화자의 직접 진술이 아니라 인용구
  스타일이기 때문이다.

------------------------------------------------------------------------

# 3. 카드 구성 표준

## 기본형: 7장

```
01 COVER
02–05 MEDTECH ISSUE #1–#4
06 AI FOR WORK
07 WEEKLY TAKEAWAY
```

MedTech/진단 이슈 카드는 **4개로 고정**한다 (과거 5개 구성에서 축소).
**AI FOR WORK는 매주 필수 포함**한다 — 생략 가능한 선택 섹션이 아니라
발행물의 정체성(17절 "SIGNALS + TOOLS")을 구성하는 고정 슬롯이다.

이슈가 4개보다 적게 확보될 경우에도(14절 "날짜 창이 비어있을 때" 참조)
COVER · AI FOR WORK · WEEKLY TAKEAWAY 3개는 항상 유지하고, 이슈 카드
수만 줄인다.

------------------------------------------------------------------------

### CARD 01 — COVER

**목적:** 2초 안에 관심을 끈다.

구성 요소:
- 마스트헤드: `BioMates` (Orbitron) + 시리즈명 `MEDTECH WEEKLY`
- Headline: 그 주 이슈 개수를 담은 한 문장 (예: "이번 주 [산업]에서 놓치면
  안 될 [N]가지")
- Sub: 카테고리 태그 (예: `진단 · Medical AI · Regulation`)
- Weekly Brief 날짜 범위 (`YYYY.MM.DD–MM.DD`, 실제 다룬 뉴스들의 날짜
  범위와 반드시 일치시킨다 — TREND 카드처럼 의도적으로 범위 밖 콘텐츠를
  포함할 경우, 그 카드 안에 별도로 명시)
- 하단 caption: 톤을 요약하는 한 줄 (높임말)

------------------------------------------------------------------------

### CARD 02–05 — ISSUE CARDS

한 장에 한 가지 이슈만 다룬다. 각 카드는 동일한 정보 구조를 유지한다.

#### ① Category Label

`[영역] · [세부 태그]` 형식. 예: `REGULATION · [기관]`, `MEDICAL AI · KOREA`,
`MARKET ACCESS · [지역]`, `DIAGNOSTICS · [분야]`, `TREND · [영역]`.

그 주에 실제로 다룰 뉴스가 규제 발표 자체가 아니라 지속되는 흐름을
정리하는 카드라면 `TREND` 라벨을 붙인다 (아래 "TREND 카드 처리 원칙" 참조).

#### ② Headline

가장 크게 표현한다. 5절 "Headline 공식" 참조.

#### ③ Fact

2–3문장 이내. 반드시 확인된 1차 소스에 기반한다 (7절 Evidence 참조).

#### ④ Why it matters

한 문장 또는 2–3개의 짧은 키워드/칩(chip) 형태로 표현 가능.

#### ⑤ Korea Impact

별도의 강조 박스(🇰🇷)로 표시. 표현 강도는 8절 규칙을 따른다 (확정 ·
가능성 · 해석 · 초기 신호를 구분).

#### ⑥ Source

카드 하단에 작게. URL 전체를 본문에 노출하지 않는다. 게시물 설명 또는
별도 reference page에 링크를 제공한다.

------------------------------------------------------------------------

### TREND 카드 처리 원칙

다루려는 내용이 "이번 주 발표"가 아니라 여러 주에 걸쳐 지속되는 규제·시장
흐름이라면:

1. Category Label에 `TREND`를 포함한다.
2. 카드 안에 "이번 주 발표 아닙니다 — [지속되는 흐름 설명]" 같은 안내를
   눈에 띄게(단, 절제된 스타일로) 배치한다.
3. 커버의 "Weekly Brief" 날짜 범위와 충돌하지 않도록, 이 카드의 원 발표일이
   범위 밖임을 항상 밝힌다.

------------------------------------------------------------------------

### CARD 06 — AI FOR WORK (필수 포함)

의료기기·진단 업계 뉴스와 별도로, 매주 **실제 업무에 바로 적용할 수 있는
AI Tool / 기능 업데이트 / 활용법** 중 1개를 선정한다. 이 카드는 소재가
마땅치 않아도 생략하지 않는다 — 이번 주 다룰 만한 업데이트가 약할 때는
14절의 선정 기준을 완화해서라도(예: 이미 알려진 기능이지만 medtech
관점에서 새로운 use case를 제시) 포함시키는 쪽을 우선한다.

이 섹션의 목적은 단순한 "새로운 AI 서비스 소개"가 아니다.

> "이번 주에 새로 알게 된 이 기능을 월요일 업무에서 어떻게 써먹을 수
> 있는가?"

를 보여주는 practical AI card로 운영한다.

#### Topic Scope

다음 중 실제 knowledge work에 활용 가치가 높은 주제를 우선한다.

- ChatGPT / Claude / Gemini 계열 어시스턴트, Google Workspace AI
- NotebookLM 계열 리서치/문서 도구
- Microsoft Copilot, Cursor / GitHub Copilot 등 코딩 보조
- Perplexity 등 research tools
- AI agents / workflow automation, MCP / connectors / integrations
- 문서·회의·리서치·데이터 분석·코딩 자동화
- 새롭게 출시되거나 크게 개선된 productivity feature

단, **"새 모델이 출시됐다" 자체만으로는 선정하지 않는다.** 실제 업무
방식이 달라질 정도의 기능인지 평가한다.

#### 리서치 우선순위

후보를 찾을 때는 "이번 주에 나온 AI 뉴스가 뭐가 있지?"가 아니라
**"업무 방식을 바꿀 만한 변화가 있었는가?"**를 먼저 검색 기준으로
삼는다. 구체적으로:

- 모델 벤치마크·가격·구독 정책 변화보다 **에이전틱 기능, workflow
  자동화, 문서/리서치/커뮤니케이션 도구 업데이트**를 우선 검색한다.
- "어떤 모델이 더 좋아졌다"보다 **"어떤 작업이 더 적은 단계로
  끝나게 됐다"**를 찾는다.
- 후보가 여러 개일 때는 아래 Selection Questions의 1·2번(시간 절감,
  workflow 단축)에 "예"로 답할 수 있는 것을 검색 결과에서 먼저
  추린다.

#### Selection Questions

1. 실제로 시간을 줄여주는가?
2. 기존에 여러 단계를 거치던 일을 하나의 workflow로 만들 수 있는가?
3. Product / RA / QA / Sales / Marketing / Clinical / R&D / Business
   업무에 적용 가능한가?
4. 단순 prompt 작성 이상의 새로운 사용 방식인가?
5. 의료기기 회사에서 사용할 때 보안·confidentiality·validation 측면에서
   주의할 점이 있는가?

#### 후보가 많을 때의 점수표 (1–5점)

| Criteria | 질문 |
|---|---|
| Practicality | 다음 주 업무에서 바로 사용할 수 있는가? |
| Time Saving | 반복 작업을 의미 있게 줄이는가? |
| Workflow Change | 기존 업무 흐름 자체를 바꿀 수 있는가? |
| Accessibility | 일반 knowledge worker가 사용할 수 있는가? |
| MedTech Relevance | 의료기기 업무에 적용점이 있는가? |
| Novelty | 기존 기능의 단순 재포장보다 실질적인 변화인가? |

**Practicality × MedTech Relevance를 가장 중요하게 본다.**

#### Recommended Card Structure

```
NEW FEATURE
      ↓
SO WHAT?
      ↓
ACTUAL WORKFLOW (BEFORE → AFTER)
      ↓
TRY THIS MONDAY
      ↓
MEDTECH USE CASE
      ↓
WATCH OUT
```

**Tool 이름보다 해결하는 업무 문제를 먼저 보여준다.**

나쁜 예: "이번 주 [Tool] 업데이트 N가지"\
좋은 예: "[구체적 업무 상황]에 [N분/시간]을 쓰고 있다면 이 기능을 써볼 만합니다"

이 섹션은 **AI 제품 홍보가 되어서는 안 된다.** 항상 SO WHAT → 실제
workflow 변화 → try it → medtech use case → watch out 구조를 유지한다.

#### MEDTECH USE CASE 예시 축

일반적인 productivity example에서 끝내지 않고 의료기기 업무에 연결한다.
모든 직군을 매주 넣을 필요는 없다 — 해당 tool과 가장 잘 맞는 1–2개
use case만 선택한다.

- **Product** — 여러 프로젝트 문서에서 dependency와 open decision 정리
- **RA** — 새로운 규제 guidance와 기존 내부 requirement 비교
- **Clinical** — 논문 여러 편에서 endpoint / cohort / performance 비교
- **QA** — SOP와 실제 project document 간 누락 항목 확인
- **Sales/Marketing** — 고객 미팅·메일·proposal을 기반으로 account brief 생성
- **Business** — 시장 리서치 자료를 정리해 의사결정 문서로 변환

#### WATCH OUT 체크 항목

의료기기 산업에서는 이 영역이 특히 중요하다. 필요에 따라 확인한다.

- Company AI policy / Data retention / Training use
- PHI / PII, Confidential information, Access control
- Source traceability, Hallucination, Human review

#### AI Tool Research Sources

가능하면 **공식 product source를 우선 확인**한다.

1. Official product announcement / release note
2. Official documentation
3. Official help center
4. GitHub / official repository
5. 신뢰할 수 있는 technology publication
6. Community discussion — 실제 사용 경험 확인용

카드에 "새롭게 지원한다"고 표현하기 전에는 **공식 release note 또는
documentation에서 availability를 확인한다.** 특히 다음을 확인한다:
Release date, Plan limitation, Enterprise/Individual 차이, Region
availability, Admin enablement 필요 여부, Beta/Preview/GA 여부.

------------------------------------------------------------------------

### CARD 07 — WEEKLY TAKEAWAY

그 주의 이슈들을 다시 반복하지 않는다. 대신 이슈들을 관통하는 **하나의
변화**를 제시한다.

구성:
- 상단: 그 주 이슈들을 요약하는 짧은 흐름 칩 (예: `[키워드1] → [키워드2] →
  [키워드3] → ...`)
- 중앙: "이번 주의 한 줄" — 굵은 메시지 (높임말)
- 마지막: 독자에게 던지는 질문 (예: "여러분이 가장 중요하다고 보는
  변화는 무엇인가요?")
- 하단: `BioMates` 워드마크로 커버와 수미상관 마무리

------------------------------------------------------------------------

# 4. Headline 공식

## 변화형

> "[영역] 경쟁, [기존 기준] 다음은 [새 기준]입니다"

## 질문형

> "[친숙한 비유]가 [의료기기/AI]가 된다면?"

## 오해 깨기

> "[일반적 통념]만 하면 끝일까요?"

## 단계 변화

> "허가받은 [제품군] → 실제로 쓰이는 [제품군]"

## 산업 이동

> "[선행 산업]에서 일어난 일이 [후행 산업]에서도 시작되고 있습니다"

피해야 할 제목:
> "의료 AI 시장의 혁신적인 변화!" / "놀라운 [기관] 발표!" / "의료 산업을
> 뒤흔들 AI!"

Clickbait보다 **지적인 긴장감**을 만든다.

------------------------------------------------------------------------

# 5. 정보량 제한

한 카드의 권장 텍스트:

- **Headline:** 8–20자 수준
- **Hook:** 1–2문장
- **Fact:** 2–3문장
- **Impact:** 1–2문장

가능하면 전체를 **120–180 Korean characters 수준**으로 압축한다. 세부
내용은 게시물 caption으로 이동한다.

> 1:1 포맷(11절)은 4:5 대비 세로 공간이 약 20% 줄어든다. 위 기준을
> 상한이 아니라 목표치로 보고 Fact 2문장, Hook 1문장 수준으로 더
> 타이트하게 압축하는 것을 권장한다.

------------------------------------------------------------------------

# 6. Evidence & Fact-checking Rule

의료기기 콘텐츠에서는 디자인보다 이 단계가 중요하다.

## Source Priority

### Tier 1 — Primary (가장 우선)

- MFDS / 식약처, 보건복지부, NECA, HIRA
- FDA, European Commission, EMA, MHRA, TGA, PMDA
- 공식 법령, 회사 공식 발표, Peer-reviewed publication

### Tier 2

- 학회, 병원, 신뢰할 수 있는 전문 언론, Regulatory intelligence publication

### Tier 3 — 발견(discovery) 용도로만 사용

- 일반 뉴스, Blog, LinkedIn, SNS

가능하면 Tier 3 → Tier 1 원문으로 역추적한다. **카드 카피 확정(Copy
Lock) 전에 Tier 1 원문을 직접 대조**하는 것을 원칙으로 한다.

------------------------------------------------------------------------

# 7. Fact와 Interpretation 구분

카드 작성 전에 내부적으로 문장을 태깅한다.

- **FACT** — 예: "[기관]이 [문서]를 공개했다."
- **INTERPRETATION** — 예: "이는 [기관]이 [영역] 규제를 본격적으로
  고민하기 시작했다는 신호로 볼 수 있다."
- **SPECULATION** — 예: "향후 모든 [제품군]에 동일한 요구사항이 적용될
  것이다." → 근거가 부족한 이런 prediction은 사용하지 않는다.

## 표현 강도

| 단계 | 표현 |
|---|---|
| 확정 | ~합니다 / ~가 적용됩니다 |
| 높은 가능성 | ~할 가능성이 높습니다 |
| 해석 | ~를 시사합니다 / ~로 볼 수 있습니다 |
| 초기 신호 | 아직 확정된 규제는 아니지만 주목할 만한 신호입니다 |

------------------------------------------------------------------------

# 8. Regulatory News 특별 규칙

다음 표현을 반드시 구별한다: `Law` / `Regulation` / `Final Rule` /
`Final Guidance` / `Draft Guidance` / `Discussion Paper` / `Request for
Comment` / `Proposal` / `Pilot`.

**잘못된 표현**
> [기관]이 [영역] 규제를 발표했다.

**권장**
> [기관]이 [영역] 규제 방향을 논의하기 위한 **Discussion Paper**를
> 공개했습니다.

이 차이는 카드뉴스의 신뢰도를 결정한다.

------------------------------------------------------------------------

# 9. Diagram Language

복잡한 내용을 문장보다 diagram으로 표현한다. 자주 쓰는 패턴:

- **Pipeline**: `A → B → C → D → E`
- **Regulatory Stack**: 상하로 쌓인 레이어 (예: `AI Act` 위/아래 `MDR·IVDR`)
- **Transition**: `Algorithm → Product → Workflow → Platform`
- **Market Access**: `Clearance → Evidence → Reimbursement → Adoption`
- **Lifecycle**: `Develop → Validate → Deploy → Monitor → Update`
- **Before/After**: 좌우 또는 상하 2단 비교
- **Not-equal chain**: `A ≠ B ≠ C ≠ D` (서로 다른 개념을 혼동하지 말 것을
  강조할 때)
- **Venn**: 두 규제/개념이 겹치는 영역을 보일 때. 실제 텍스트 겹침이
  생기지 않도록 각 원의 라벨은 원의 바깥쪽으로, 교집합 라벨은 별도
  캡션으로 분리한다 (11절 제작 파이프라인 참고).

------------------------------------------------------------------------

# 10. 카드별 제작 Template

각 이슈에 대해 디자인 전에 아래 template을 먼저 채운다. **이 template이
완성되기 전에는 비주얼 제작을 시작하지 않는다.**

```text
ISSUE:
DATE:
CATEGORY:

SOURCE 1:
SOURCE 2:

WHAT HAPPENED:      (내부 메모, 평서형 가능)
-

WHY IT MATTERS:     (내부 메모, 평서형 가능)
-

KOREA IMPACT:       (카드 노출용 → 높임말)
-

HEADLINE:           (카드 노출용 → 높임말)
-

ONE-LINE TAKEAWAY:  (카드 노출용 → 높임말)
-

FACT:               (카드 노출용 → 높임말)
-

INTERPRETATION:     (내부 메모, 평서형 가능)
-

VISUAL METAPHOR:
-

DIAGRAM:
-

SOURCE LABEL:
-
```

------------------------------------------------------------------------

# 11. BioMates 디자인 시스템

> Source: `01_Brand_Assets/BIOMATES_DesignGuide.pdf`\
> 이 섹션은 BioMates 공식 디자인 가이드의 컬러·타이포·로고 규정을
> 카드뉴스에 이식한 버전이다. BioMates 원본 가이드가 갱신되면 이
> 섹션도 함께 재확인한다.

## Format

### 1:1 정방형 — LinkedIn 우선 배포 기준

**1080 × 1080 px (1:1)**

주 배포 채널이 **LinkedIn**이라는 점을 기준으로 1:1을 확정한다.

- LinkedIn 피드(모바일/데스크톱)는 정사각 이미지를 크롭 없이 그대로
  노출한다. 4:5 세로형은 데스크톱 피드나 document(PDF carousel)
  포스팅에서 상하가 잘려 헤드라인·source caption이 미리보기에서
  가려지는 경우가 있다.
- LinkedIn 데스크톱 웹은 Instagram 대비 피드 카드 폭이 좁다. 세로가
  긴 4:5보다 1:1이 데스크톱/모바일 양쪽에서 안정적으로 보인다.
- carousel 스와이프 시 프레임 크기가 항상 동일해 시각적 일관성이 높다.
- BioMates 로고·아이콘이 정사각 lockup으로 설계되어 마스트헤드와의
  정합성이 좋다.
- Instagram은 보조 배포 채널로 유지하되, 1:1은 그대로 호환된다.

**Trade-off:** 세로 높이가 4:5 대비 약 20% 줄어든다. 5절의 텍스트
분량 기준을 상한이 아니라 목표치로 보고 더 타이트하게 압축한다.
LinkedIn 데스크톱에서 카드가 작게 렌더링되는 경우가 많으므로, H1은
화면의 25–30% 하한을 유지한다.

**Safe margin:** 72–90px. 중요한 텍스트는 가장자리에서 충분히 떨어뜨린다.

## Visual Identity

목표: **Medical journal × modern tech editorial × BioMates**

피해야 할 것:
- 병원 홍보 브로슈어 느낌 / 과도한 미래형 neon AI / stock doctor 사진 남용
- AI brain + circuit 이미지 반복 / 너무 많은 gradient
- 기업 IR slide 같은 복잡한 chart / BioMates 팔레트 밖의 임의 색상

권장:
- 넓은 whitespace / 강한 typography / 하나의 핵심 diagram
- 작은 editorial annotation / BioMates 고정 팔레트만 사용
- issue별 일관된 layout
- 커버만 BioMates 브랜드 배경, 나머지 이슈 카드는 라이트 에디토리얼 배경

### Card Type별 배경 톤

| Card | 배경 | 근거 |
|---|---|---|
| 01 COVER | Deep Navy + turquoise glow 네트워크 패턴 + Orbitron 마스트헤드 | 발행물을 BioMates 브랜드로 즉시 앵커링 |
| 02–05 ISSUE / TREND | Off-white 배경, Deep Navy 타이포 | 에디토리얼 가독성 우선, 매주 반복 노출되므로 눈의 피로도 낮은 배경 유지 |
| AI FOR WORK | Off-white + Turquoise 10–15% tint 블록 | 같은 시스템 안에서 섹션만 구분 |
| WEEKLY TAKEAWAY | Deep Navy (커버와 수미상관) | carousel 시작/끝을 브랜드 컬러로 감싸 완결감을 준다 |

## Color System (BioMates Palette 고정)

BioMates 공식 팔레트만 사용하고, 이 5개 밖의 색상은 추가하지 않는다.

**Base**
- White `#FFFFFF` — 이슈 카드 기본 배경
- Deep Navy `#1E2A38` — 커버/테이크어웨이 배경, 본문 텍스트 컬러
- Black `#111111` — 보조 텍스트 (caption, source)

**Accent (최대 2개, 항상 동일한 역할로 고정)**
- **Turquoise `#40E0D0`** — 기본/default accent. 카테고리 라벨, diagram
  강조선, AI FOR WORK 섹션 전체.
- **Coral Red `#FF6B6B`** — **REGULATION 경고 · WATCH OUT ⚠️ 전용.**
  일반 카테고리 구분색으로 남발하지 않는다.

카테고리별로 색을 다르게 매핑하지 않는다 — 색이 유일한 구분 수단이
되면 접근성 원칙(색만으로 정보를 전달하지 않는다)에 위배된다. 카테고리
구분은 색이 아니라 **텍스트 라벨 + 카드 위치**로 한다.

**한 카드에서 accent color를 두 개 이상 경쟁시키지 않는다.**

## Typography Hierarchy

한 카드에 font size hierarchy는 최대 4단계.

**폰트 매핑**
- **Orbitron** — 마스트헤드/로고 전용. `BioMates` 워드마크, 영문
  카테고리 라벨(`REGULATION`, `AI FOR WORK`, `TREND` 등), 커버의 영문
  타이틀에만 사용. 한글 글리프를 지원하지 않으므로 국문 헤드라인/본문에는
  사용하지 않는다.
- **Pretendard** (또는 동급의 한글 대응 geometric sans) — 국문
  헤드라인·본문용. Orbitron과 톤을 맞춘다.

- **H1 (Headline):** 화면의 약 20–30%. 국문 sans, Deep Navy 또는
  White(다크 배경 카드).
- **H2 (Key statement):** 핵심 문장.
- **Body:** 최대 3–5줄.
- **Caption:** Source / Date / Category.

> **카드뉴스는 읽는 문서가 아니라 보는 문서다.** 본문이 길어지면 삭제한다.

## Diagram / Line 스타일

파이프라인 화살표, lifecycle 아이콘 등 diagram은 BioMates 로고의
single-stroke, rounded-terminal 라인 스타일과 동일한 stroke weight로
그린다. 색은 Turquoise 단색을 기본으로 하고, 강조가 필요한 노드에만
Coral Red를 제한적으로 사용한다.

------------------------------------------------------------------------

# 12. 제작 파이프라인 (기술 구현)

## 기본 방식: HTML/CSS + 헤드리스 브라우저 렌더링

AI 이미지 생성 모델에 텍스트와 디자인을 동시에 맡기면 한글 렌더링
오류(글자 왜곡, 자간 붕괴)나 존재하지 않는 숫자·로고 생성 위험이 있다.
**따라서 기본 제작 방식은 HTML/CSS로 카드를 직접 코딩하고, 헤드리스
브라우저로 스크린샷을 떠서 PNG로 변환하는 방식으로 한다.**

### 폴더 구조

```
cardnews_YYYY-MM-DD/
  assets/
    styles.css        (공통 토큰: 컬러, 타이포, 컴포넌트 클래스)
    fonts/             (Pretendard, Orbitron — 로컬에 받아 상대경로로 참조)
  html/
    card01_cover.html
    card02_[slug].html
    ...
    card08_takeaway.html
  png/
    card01_cover.png
    ...
```

### 폰트

- Pretendard: `cdn.jsdelivr.net/npm/pretendard@latest/dist/web/static/woff2/`
  에서 Regular/Medium/SemiBold/Bold/Black 다운로드
- Orbitron: Google Fonts CSS(`fonts.googleapis.com/css2?family=Orbitron`)에서
  `fonts.gstatic.com` variable woff2 링크를 추출해 다운로드

두 폰트 모두 **로컬 파일로 받아 `assets/fonts/`에 저장하고, `@font-face`에서
상대경로로 참조**한다. 네트워크 요청에 의존하면 렌더링 시점의 폰트
로딩 타이밍 문제(FOUT)로 스크린샷에 폰트가 반영되지 않을 위험이 있다.

### 렌더링 커맨드

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1080,1080 \
  --screenshot="png/card01_cover.png" "file://.../html/card01_cover.html"
```

- 로컬 file:// 리소스는 네트워크 지연이 없어 폰트 로딩과 무관하게
  안정적으로 렌더링된다.
- 카드마다 개별 렌더링 후 반드시 **PNG를 직접 열어 시각 검수**한다
  (텍스트 겹침, 줄바꿈 오류, 요소 overflow 등은 코드만 봐서는 안 보인다).

### 공통 스타일시트(assets/styles.css) 설계 원칙

- 11절 Color System의 CSS 변수화 (`--navy`, `--turquoise`, `--coral` 등)
- `.card.dark` / `.card.light` 두 베이스 클래스
- `.kicker`, `.headline`, `.hook`, `.body-text`, `.impact-box`,
  `.warn-box`, `.diagram-row`, `.source-caption`, `.page-index` 등
  재사용 컴포넌트 클래스를 정의해, 카드마다 CSS를 새로 작성하지 않고
  구조만 채우도록 한다.
- 커버/테이크어웨이의 네트워크 glow 배경은 inline SVG로 처리한다
  (blur filter + 반투명 원 + 얇은 연결선 + 작은 dot 노드). 카드마다
  노드 좌표를 살짝 바꿔 두 다크 카드가 똑같이 보이지 않게 한다.

### 자주 발생하는 레이아웃 버그와 대응

- **벤 다이어그램 텍스트 겹침**: 두 원을 flex 중앙정렬로 겹치면 교집합
  영역에서 두 라벨이 겹쳐 보인다. 각 원의 라벨은 바깥쪽으로 정렬하고,
  교집합 캡션은 별도 absolute 요소로 분리한다.
- **헤드라인 줄바꿈 orphan**: 높임말 어미(-습니다) 때문에 문장이 길어져
  마지막 글자 하나만 다음 줄로 밀리는 경우, `white-space: pre-line`
  텍스트에 수동으로 줄바꿈 위치를 지정해 해결한다.
- **impact-box 안 콜론(·) 주변 공백**: 여러 줄 텍스트에 들여쓰기를
  넣으면 브라우저가 공백을 하나로 합치면서 어색한 간격이 생길 수
  있다. 육안 검수 시 확인한다.

## 대안: AI 이미지 생성 방식 (fallback)

코드 기반 제작이 여의치 않을 때만 사용한다. 이미지 생성 AI에는
**콘텐츠 작성과 디자인을 동시에 맡기지 않는다** — 먼저 Copy Lock된
텍스트를 확정한 뒤 visual prompt를 작성한다.

```text
Create a premium Korean healthcare industry editorial card news slide.

FORMAT: 1080x1080, 1:1 square.
AUDIENCE: Medical device, digital health, healthcare AI professionals.
STYLE: Modern medical journal editorial design. Minimal, intelligent,
evidence-driven. Large Korean typography. Generous whitespace. Simple
conceptual diagram. No stock-photo aesthetic. No futuristic neon AI
imagery. No unnecessary 3D objects.

CATEGORY: [카테고리]
HEADLINE: "[확정된 headline]"
KEY MESSAGE: "[확정된 문장]"
DIAGRAM: "[확정된 diagram]"
KOREA IMPACT: "[확정된 문장]"
SOURCE: "[기관, 날짜]"

IMPORTANT:
All Korean text must be accurately rendered.
Do not invent statistics. Do not add additional claims.
Do not alter regulatory terminology.
```

이 방식을 쓰는 경우, 21절 QA 체크리스트의 "AI 생성 이미지 QA" 항목을
**반드시** 통과시킨다 (한글 정확성, 숫자 왜곡, 존재하지 않는 로고/문서
여부).

------------------------------------------------------------------------

# 13. 제작 Workflow

```text
Weekly News Scan
       ↓
Candidate 10–15
       ↓
Impact × Relevance × Novelty 평가 (14절 Topic Selection Score)
       ↓
Top 5(±) 선정
       ↓
Primary Source 확인 (6절 Evidence Tier)
       ↓
Fact / Interpretation 분리 (7절)
       ↓
Headline 작성 (4절) — 높임말 (2절)
       ↓
Korea Impact 작성 — 높임말
       ↓
Editorial Review
       ↓
Card Copy Lock
       ↓
Visual Generation (12절 제작 파이프라인)
       ↓
Text Accuracy Check
       ↓
Final QA (21절)
       ↓
Publish
```

**중요: Visual generation 전에 Copy Lock.** 이미지를 먼저 만든 뒤
문장을 맞추려고 하지 않는다.

------------------------------------------------------------------------

# 14. Topic Selection Score

매주 후보 뉴스가 많을 경우 각 항목을 1–5점으로 평가한다.

| Criteria | 질문 |
|---|---|
| Recency | 이번 주에 실제 변화가 있었는가? |
| Korea Relevance | 한국 시장/기업에 의미가 있는가? |
| Industry Impact | 제품·규제·시장에 영향을 줄 수 있는가? |
| Novelty | 이미 많이 알려진 이야기를 반복하는 것은 아닌가? |
| Explainability | 한 장으로 명확하게 설명 가능한가? |
| Shareability | 업계 사람이 동료에게 공유하고 싶은가? |

단순 합계보다 **Korea Relevance와 Industry Impact**를 우선한다.

## 국내 · 해외 비중 원칙

의료기기(및 IVD) 이슈 카드는 **국내 소식과 해외 소식의 비중을 5:5로
맞추는 것을 목표**로 한다. 이슈 카드가 4개(3절)라면 국내 2 · 해외 2를
기본 배분으로 하고, 최종적으로 후보를 10개 정도 뽑을 때도 국내 5 ·
해외 5 수준을 유지한다.

- **국내로 분류하는 기준**: 한국 기업/기관이 주체인 소식(예: 국내
  의료 AI 기업의 실적, 파트너십, 해외 인증 획득 등)이거나, 한국
  정부·규제기관(MFDS/HIRA/NECA 등)의 조치. 한국 기업이 해외
  규제기관으로부터 승인을 받은 경우도 **국내**로 분류한다 (주체가
  한국 기업이므로).
- **해외로 분류하는 기준**: 해외 기업이 주체이거나 해외
  정부·규제기관(FDA/EMA/PMDA 등)의 조치가 핵심 뉴스인 경우.
- 5:5를 정확히 맞추기 어려운 주가 있을 수 있다. 그럴 때는 비중이
  깨진 이유를 draft 문서 상단에 짧게 남긴다 (예: "이번 주 국내
  Tier 1 소식 부족으로 국내 3 · 해외 7").

## 날짜 창(Date Window)이 비어있을 때

특정 주에 정확한 날짜 범위 내 Tier 1 뉴스가 부족할 수 있다. 이때는:

1. 날짜 범위를 최근 7~10일 수준으로 유연하게 확장할지, 엄격하게
   해당 주만 유지할지 먼저 정한다 (정직성과 소재 확보의 트레이드오프).
2. 확장하기로 했다면 커버의 날짜 범위 표기를 실제 범위와 반드시
   일치시킨다.
3. 발표일 자체가 오래됐지만 지속적 영향이 있는 사안은 TREND 카드로
   명시한다 (3절 "TREND 카드 처리 원칙").
4. 그래도 소재가 부족하면, 이슈 카드 수를 4개에서 2–3개로 줄이는 것이
   허위로 날짜를 늘리는 것보다 낫다. 단, AI FOR WORK는 이슈 카드 수와
   무관하게 그대로 유지한다 (3절 참조).

------------------------------------------------------------------------

# 15. Final QA Checklist

## Content

- [ ] 실제 해당 기간에 발생한 뉴스인가?
- [ ] 날짜가 정확한가?
- [ ] Primary source를 확인했는가?
- [ ] Headline이 원문의 의미를 과장하지 않는가?
- [ ] Fact와 interpretation이 섞이지 않았는가?
- [ ] Draft / Final / Proposal 등의 상태가 정확한가?
- [ ] 한국에 미칠 영향에 논리적 연결고리가 있는가?
- [ ] 숫자와 통계의 출처가 있는가?
- [ ] 카드 노출 문구가 전부 높임말로 일관되는가? (2절)

## Visual

- [ ] 2초 안에 headline을 읽을 수 있는가?
- [ ] 한 카드에 메시지가 하나뿐인가?
- [ ] 모바일에서 본문을 읽을 수 있는가?
- [ ] diagram이 글보다 쉽게 이해되는가?
- [ ] 카드 전체의 디자인 언어가 일관적인가? (BioMates 팔레트/타이포 준수)
- [ ] 장식이 정보보다 강하지 않은가?
- [ ] 텍스트 겹침·overflow·어색한 줄바꿈이 없는가? (PNG 직접 확인)

## AI 생성 이미지 QA (12절 fallback 방식 사용 시 필수)

- [ ] 한글이 정확한가?
- [ ] 숫자가 변형되지 않았는가?
- [ ] 기관/법령 명칭이 정확한가?
- [ ] 존재하지 않는 logo/document를 만들지 않았는가?
- [ ] AI가 임의로 새로운 claim을 추가하지 않았는가?
- [ ] source가 실제 source와 일치하는가?

------------------------------------------------------------------------

# 16. 파일 · 버전 관리 컨벤션

| 파일/폴더 | 역할 |
|---|---|
| `cardnews_production_guide.md` (이 문서) | 범용 제작 가이드. 주차 콘텐츠 없음. |
| `YYYY-MM-DD_medtech_weekly_draft.md` | 그 주 실제 이슈 리서치·팩트체크·카피 락 문서 (10절 template 채운 결과) |
| `cardnews_YYYY-MM-DD/` | 완성 카드 산출물 폴더 (`html/`, `assets/`, `png/`) |

- `YYYY-MM-DD`는 발행 기준일(보통 커버의 Weekly Brief 종료일)로 통일한다.
- 주차 draft 문서 상단에 상태 배지를 남긴다: 리서치 중 / 1차 소스 검증
  중 / Copy Lock 가능 / Visual Generation 완료 / Published.
- `assets/`(styles.css, fonts)는 주차마다 새로 만들지 않고, 이전 주
  폴더에서 복사해 재사용한다 — 디자인 시스템(11절)이 매주 바뀌지
  않기 때문이다. 디자인 시스템 자체가 바뀌면 이 문서(11절)를 먼저
  갱신한다.

------------------------------------------------------------------------

# 17. Publication Identity & 장기 운영 원칙

AI FOR WORK가 매주 필수 카드로 고정되면서, 전체 카드뉴스의 정체성은
단순한 "의료기기 뉴스"보다 다음에 가까워진다.

> **MEDTECH SIGNALS + TOOLS**

매주 독자가 얻어가는 것은 두 가지다.

- **SIGNALS** — "이번 주 우리 산업에서 무엇이 바뀌었는가?"
- **TOOLS** — "그래서 나는 다음 주 일을 어떻게 더 잘할 수 있는가?"

이 카드뉴스가 매주 발행된다면 **뉴스 큐레이션 자체보다 관점의
일관성**이 브랜드가 된다. 매주 다음 질문을 유지한다.

> "이 뉴스가 한국의 의료기기·진단·의료 AI 산업에서 실제로 무엇을 바꿀
> 것인가?"

이를 중심으로 Regulatory / Technology / Evidence / Workflow / Market
Access를 연결한다. 궁극적으로 카드뉴스의 역할은 뉴스를 빠르게
전달하는 것이 아니라, **복잡한 글로벌 변화를 한국 의료기기 업계의
언어로 번역해 주는 것**이어야 한다.
