import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { isResendConfigured, sendResendEmail } from "@/lib/messaging/resend";
import type { BiomatesEvent, Registration } from "@/lib/types";

const SITE_URL = "https://biomates.org";

/**
 * Emails admin_whitelist when a new (non-duplicate) registration comes in.
 * Best-effort -- never throws, since a notification failure shouldn't fail
 * the registration itself.
 *
 * RESEND_NOTIFY_OVERRIDE (optional): while RESEND_FROM_EMAIL is still the
 * unverified onboarding@resend.dev sender, Resend only allows sending to the
 * account owner's own address -- a `to` list with any other recipient gets
 * the whole call rejected (403), so nobody gets notified. Set this to that
 * one address as a stopgap; once a real domain is verified in Resend, remove
 * it and this goes back to notifying every admin_whitelist address.
 */
export async function notifyAdminsOfNewRegistration(event: BiomatesEvent, registration: Registration): Promise<void> {
  if (!isResendConfigured()) return;

  try {
    const override = process.env.RESEND_NOTIFY_OVERRIDE;
    let to: string[];
    if (override) {
      to = [override];
    } else {
      const supabase = createServiceClient();
      const { data: admins } = await supabase.from("admin_whitelist").select("email");
      to = (admins ?? []).map((a: { email: string }) => a.email).filter(Boolean);
    }
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
