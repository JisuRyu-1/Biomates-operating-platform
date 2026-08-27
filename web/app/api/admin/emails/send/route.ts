import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isResendConfigured, sendResendEmail } from "@/lib/messaging/resend";
import type { EmailSendRequestItem, EmailSendResult } from "@/lib/types";

interface SendRequestBody {
  recipients: EmailSendRequestItem[];
}

function isValidRequestBody(value: unknown): value is SendRequestBody {
  if (!value || typeof value !== "object") return false;
  const recipients = (value as { recipients?: unknown }).recipients;
  if (!Array.isArray(recipients)) return false;
  return recipients.every(
    (r) =>
      r &&
      typeof r === "object" &&
      typeof (r as EmailSendRequestItem).registrationId === "string" &&
      typeof (r as EmailSendRequestItem).email === "string" &&
      typeof (r as EmailSendRequestItem).name === "string" &&
      typeof (r as EmailSendRequestItem).subject === "string" &&
      typeof (r as EmailSendRequestItem).body === "string"
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: admin } = await supabase.from("admin_whitelist").select("id, name").eq("email", user.email).maybeSingle();
  if (!admin) {
    return NextResponse.json({ error: "운영진 권한이 없습니다." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!isValidRequestBody(body) || body.recipients.length === 0) {
    return NextResponse.json({ error: "발송 대상이 없습니다." }, { status: 400 });
  }

  if (!isResendConfigured()) {
    return NextResponse.json({ configured: false, results: [] });
  }

  const results: EmailSendResult[] = [];
  for (const recipient of body.recipients) {
    const sendResult = await sendResendEmail({
      to: recipient.email,
      subject: recipient.subject,
      text: recipient.body,
      fromName: `${admin.name} (Biomates)`,
      replyTo: user.email,
    });
    results.push({
      registrationId: recipient.registrationId,
      email: recipient.email,
      success: sendResult.success,
      providerMessageId: sendResult.providerMessageId,
      errorMessage: sendResult.errorMessage,
    });
  }

  return NextResponse.json({ configured: true, results });
}
