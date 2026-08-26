import "server-only";
import { Resend } from "resend";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export interface SendResendEmailResult {
  success: boolean;
  providerMessageId?: string;
  errorMessage?: string;
}

interface SendResendEmailParams {
  to: string;
  subject: string;
  text: string;
}

/** Sends one plain-text email via Resend. Caller must check `isResendConfigured()` first. */
export async function sendResendEmail({ to, subject, text }: SendResendEmailParams): Promise<SendResendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { success: false, errorMessage: "Resend 환경변수가 설정되지 않았습니다." };
  }

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({ from, to, subject, text });
    if (error) {
      return { success: false, errorMessage: error.message || "발송에 실패했습니다." };
    }
    return { success: true, providerMessageId: data?.id };
  } catch (err) {
    return { success: false, errorMessage: err instanceof Error ? err.message : "발송 요청 중 오류가 발생했습니다." };
  }
}
