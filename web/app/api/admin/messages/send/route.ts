import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAligoConfigured, sendAligoSms } from "@/lib/messaging/aligo";
import type { SmsSendRequestItem, SmsSendResult } from "@/lib/types";

interface SendRequestBody {
  recipients: SmsSendRequestItem[];
}

function isValidRequestBody(value: unknown): value is SendRequestBody {
  if (!value || typeof value !== "object") return false;
  const recipients = (value as { recipients?: unknown }).recipients;
  if (!Array.isArray(recipients)) return false;
  return recipients.every(
    (r) =>
      r &&
      typeof r === "object" &&
      typeof (r as SmsSendRequestItem).registrationId === "string" &&
      typeof (r as SmsSendRequestItem).phone === "string" &&
      typeof (r as SmsSendRequestItem).name === "string" &&
      typeof (r as SmsSendRequestItem).message === "string"
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

  const { data: admin } = await supabase.from("admin_whitelist").select("id").eq("email", user.email).maybeSingle();
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

  if (!isAligoConfigured()) {
    return NextResponse.json({ configured: false, results: [] });
  }

  const results: SmsSendResult[] = [];
  for (const recipient of body.recipients) {
    const sendResult = await sendAligoSms(recipient.phone, recipient.message);
    results.push({
      registrationId: recipient.registrationId,
      phone: recipient.phone,
      success: sendResult.success,
      msgType: sendResult.msgType,
      providerMessageId: sendResult.providerMessageId,
      errorCode: sendResult.errorCode,
      errorMessage: sendResult.errorMessage,
    });
  }

  return NextResponse.json({ configured: true, results });
}
