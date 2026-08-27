import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { isResendConfigured, sendResendEmail } from "@/lib/messaging/resend";
import type { BiomatesEvent, Registration } from "@/lib/types";

const SITE_URL = "https://biomates-operating-platform.vercel.app";

/** Emails every admin_whitelist address when a new (non-duplicate) registration comes in. Best-effort -- never throws, since a notification failure shouldn't fail the registration itself. */
export async function notifyAdminsOfNewRegistration(event: BiomatesEvent, registration: Registration): Promise<void> {
  if (!isResendConfigured()) return;

  try {
    const supabase = createServiceClient();
    const { data: admins } = await supabase.from("admin_whitelist").select("email");
    const to = (admins ?? []).map((a: { email: string }) => a.email).filter(Boolean);
    if (!to.length) return;

    const subject = `[Biomates] 새 참가 신청 - ${event.title}`;
    const text = [
      `${event.title} 행사에 새 참가 신청이 접수되었습니다.`,
      "",
      `이름: ${registration.name}`,
      `이메일: ${registration.email}`,
      `휴대전화: ${registration.phone}`,
      `소속: ${registration.organization || "-"}`,
      `참가 목적: ${registration.purpose || "-"}`,
      "",
      `참가자 관리: ${SITE_URL}/admin/participants?event=${event.id}`,
    ].join("\n");

    await sendResendEmail({ to, subject, text });
  } catch (err) {
    console.error("Failed to notify admins of new registration", err);
  }
}
