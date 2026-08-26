import "server-only";
import { byteLength } from "@/lib/message-templates";
import type { SmsMessageType } from "@/lib/types";

const ALIGO_SEND_URL = "https://apis.aligo.in/send/";
const LMS_BYTE_THRESHOLD = 90;

export function isAligoConfigured(): boolean {
  return Boolean(process.env.ALIGO_USER_ID && process.env.ALIGO_API_KEY && process.env.ALIGO_SENDER_PHONE);
}

export function detectMsgType(message: string): SmsMessageType {
  return byteLength(message) > LMS_BYTE_THRESHOLD ? "LMS" : "SMS";
}

interface AligoApiResponse {
  result_code?: string | number;
  message?: string;
  msg_id?: string | number;
  msg_type?: string;
}

export interface SendAligoSmsResult {
  success: boolean;
  msgType: SmsMessageType;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/** Sends one SMS/LMS via the ALIGO REST API. Caller must check `isAligoConfigured()` first. */
export async function sendAligoSms(phone: string, message: string): Promise<SendAligoSmsResult> {
  const userId = process.env.ALIGO_USER_ID;
  const apiKey = process.env.ALIGO_API_KEY;
  const sender = process.env.ALIGO_SENDER_PHONE;
  const msgType = detectMsgType(message);

  if (!userId || !apiKey || !sender) {
    return { success: false, msgType, errorCode: "NOT_CONFIGURED", errorMessage: "ALIGO 환경변수가 설정되지 않았습니다." };
  }

  const body = new URLSearchParams({
    key: apiKey,
    user_id: userId,
    sender: sender.replace(/-/g, ""),
    receiver: phone.replace(/-/g, ""),
    msg: message,
    msg_type: msgType,
  });

  try {
    const res = await fetch(ALIGO_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as AligoApiResponse;
    const resultCode = String(data.result_code ?? "");

    if (resultCode === "1") {
      return { success: true, msgType, providerMessageId: data.msg_id != null ? String(data.msg_id) : undefined };
    }
    return {
      success: false,
      msgType,
      errorCode: resultCode || "UNKNOWN",
      errorMessage: data.message || "발송에 실패했습니다.",
    };
  } catch (err) {
    return {
      success: false,
      msgType,
      errorCode: "NETWORK_ERROR",
      errorMessage: err instanceof Error ? err.message : "발송 요청 중 오류가 발생했습니다.",
    };
  }
}
