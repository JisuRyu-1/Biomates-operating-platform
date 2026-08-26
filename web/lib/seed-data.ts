import type { AdminAccount, BiomatesEvent } from "./types";

/**
 * Placeholder seed content for local/demo use. Replace with real event and
 * speaker details before using this for an actual Biomates event.
 */
export function seedEvents(): BiomatesEvent[] {
  return [
    {
      id: "evt-ai-health-2026",
      title: "2026 Biomates AI & Healthcare Seminar",
      subtitle: "의료 AI 최신 동향과 임상 적용 사례를 함께 나누는 자리",
      status: "UPCOMING",
      date: "2026-09-12",
      time: "14:00 - 18:00",
      venue: "서울 강남구 테헤란로 501, Lunit 사옥 3F 컨퍼런스룸",
      mapUrl: "#",
      capacity: 80,
      fee: 30000,
      registrationStart: "2026-08-01",
      registrationEnd: "2026-09-05",
      audience: "의료 AI/디지털 헬스 분야 실무자, 연구자, 대학원생",
      program: [
        { time: "14:00", item: "등록 및 네트워킹", speaker: "Biomates 운영진" },
        { time: "14:20", item: "Keynote — Medical AI Trends 2026", speaker: "김도윤" },
        { time: "15:10", item: "Session 1 — 유방영상 AI 임상 적용 사례", speaker: "이서연" },
        { time: "16:00", item: "Break" },
        { time: "16:20", item: "Session 2 — Digital Health Regulation 동향", speaker: "박현우" },
        { time: "17:10", item: "패널 토론 및 Q&A" },
        { time: "17:50", item: "네트워킹 & 마무리" },
      ],
      speakers: [
        { name: "김도윤", org: "Lunit, Product Lead" },
        {
          name: "이서연",
          org: "분당서울대병원, 영상의학과",
          bio: {
            summary:
              "[플레이스홀더] 실제 연사 소개 문구로 교체해 주세요. 이 카드는 클릭 시 열리는 연사 상세 모달 기능을 보여주기 위한 예시입니다.",
          },
        },
        { name: "박현우", org: "Digital Health Policy Lab" },
      ],
      prep: ["신분증 지참 (등록 확인용)", "명함 (네트워킹 세션)", "노트북 지참 권장"],
      refundPolicy: "행사 D-3일 전까지 전액 환불, 이후 환불 불가(불참 시 자료만 공유). 행사 취소 시 전액 환불.",
      contact: "events@biomates.example (또는 카카오톡 채널 @biomates)",
      bankInfo: { bank: "국민은행", account: "123456-04-789012", holder: "(주)바이오메이트" },
      resources: [],
      published: true,
      surveyFormUrl: "",
    },
    {
      id: "evt-summer-networking-2026",
      title: "2026 Biomates Summer Networking Night",
      subtitle: "지난 행사 — 의료 AI/헬스케어 커뮤니티 네트워킹",
      status: "COMPLETED",
      date: "2026-06-20",
      time: "19:00 - 21:00",
      venue: "서울 성동구 성수동 커뮤니티 라운지",
      mapUrl: "#",
      capacity: 50,
      fee: 0,
      registrationStart: "2026-05-20",
      registrationEnd: "2026-06-15",
      audience: "Biomates 커뮤니티 회원 및 관심 있는 누구나",
      program: [
        { time: "19:00", item: "웰컴 네트워킹" },
        { time: "19:30", item: "라이트닝 토크 (3인)" },
        { time: "20:15", item: "자유 네트워킹" },
      ],
      speakers: [{ name: "최민서", org: "Biomates 운영진" }],
      prep: ["편한 복장", "명함 지참"],
      refundPolicy: "무료 행사 (환불 대상 없음)",
      contact: "events@biomates.example",
      bankInfo: null,
      resources: [
        { id: "res-1", title: "행사 사진 모음", type: "Photos", accessLevel: "ATTENDED" },
        { id: "res-2", title: "라이트닝 토크 발표자료.pdf", type: "Slides", accessLevel: "ATTENDED" },
        { id: "res-3", title: "커뮤니티 소개 자료.pdf", type: "Reference", accessLevel: "PUBLIC" },
      ],
      published: true,
      surveyFormUrl: "https://forms.gle/sample-biomates-survey",
    },
  ];
}

/**
 * Single placeholder admin account. Add real teammates from the Team screen
 * once this is deployed — real names/emails should never be hardcoded here.
 */
export function seedAdminAccounts(): AdminAccount[] {
  return [{ id: "admin-1", name: "운영진 계정 (본인)", email: "admin@biomates.example" }];
}
