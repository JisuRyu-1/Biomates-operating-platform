import "server-only";
import { SolapiMessageService, MessageNotReceivedError } from "solapi";
import { byteLength } from "@/lib/message-templates";
import type { SmsMessageType } from "@/lib/types";

const LMS_BYTE_THRESHOLD = 90;

export function isSolapiConfigured(): boolean {
  return Boolean(process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET && process.env.SOLAPI_SENDER_NUMBER);
}

export function detectMsgType(message: string): SmsMessageType {
  return byteLength(message) > LMS_BYTE_THRESHOLD ? "LMS" : "SMS";
}

let cachedService: SolapiMessageService | null = null;

function getMessageService(): SolapiMessageService {
  if (!cachedService) {
    cachedService = new SolapiMessageService(process.env.SOLAPI_API_KEY!, process.env.SOLAPI_API_SECRET!);
  }
  return cachedService;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "발송 요청 중 오류가 발생했습니다.";
}

export interface SendSolapiSmsResult {
  success: boolean;
  msgType: SmsMessageType;
  providerMessageId?: string;
  errorMessage?: string;
}

/** Sends one SMS/LMS via the SOLAPI SDK. Caller must check `isSolapiConfigured()` first. */
export async function sendSolapiSms(phone: string, message: string): Promise<SendSolapiSmsResult> {
  const sender = process.env.SOLAPI_SENDER_NUMBER;
  const msgType = detectMsgType(message);

  if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET || !sender) {
    return { success: false, msgType, errorMessage: "SOLAPI 환경변수가 설정되지 않았습니다." };
  }

  const to = phone.replace(/\D/g, "");

  try {
    const response = await getMessageService().send(
      { to, from: sender.replace(/\D/g, ""), text: message, autoTypeDetect: true },
      { showMessageList: true }
    );
    const failed = response.failedMessageList.find((f) => f.to === to);
    if (failed) {
      return { success: false, msgType, errorMessage: failed.statusMessage || "발송에 실패했습니다." };
    }
    return { success: true, msgType, providerMessageId: response.messageList?.[0]?.messageId };
  } catch (err) {
    if (err instanceof MessageNotReceivedError) {
      const reason = err.failedMessageList[0]?.statusMessage;
      return { success: false, msgType, errorMessage: reason || err.message };
    }
    return { success: false, msgType, errorMessage: extractErrorMessage(err) };
  }
}
