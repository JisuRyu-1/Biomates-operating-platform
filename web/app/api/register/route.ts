import { NextResponse } from "next/server";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service";
import { rowToEvent, rowToRegistration } from "@/lib/supabase/mappers";
import { initialStatusFor } from "@/lib/status";
import { notifyAdminsOfNewRegistration } from "@/lib/messaging/registration-notify";
import type { RegistrationFormValues } from "@/lib/types";

interface RegisterRequestBody extends RegistrationFormValues {
  eventId: string;
}

function isValidBody(value: unknown): value is RegisterRequestBody {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.eventId === "string" &&
    typeof v.name === "string" &&
    typeof v.phone === "string" &&
    typeof v.email === "string" &&
    typeof v.organization === "string" &&
    typeof v.purpose === "string" &&
    typeof v.marketingOptIn === "boolean"
  );
}

export async function POST(request: Request) {
  if (!isServiceConfigured()) {
    return NextResponse.json({ error: "서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!isValidBody(body) || !body.name.trim() || !body.phone.trim() || !body.email.trim()) {
    return NextResponse.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const email = body.email.trim().toLowerCase();

  const { data: eventRow, error: eventError } = await supabase.from("events").select("*").eq("id", body.eventId).maybeSingle();
  if (eventError || !eventRow) {
    return NextResponse.json({ error: "행사를 찾을 수 없습니다." }, { status: 404 });
  }
  const event = rowToEvent(eventRow);

  const { data: existingRow } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", body.eventId)
    .eq("email", email)
    .neq("registration_status", "CANCELLED")
    .maybeSingle();

  if (existingRow) {
    return NextResponse.json({ duplicate: true, registration: rowToRegistration(existingRow) });
  }

  const { registrationStatus, paymentStatus } = initialStatusFor(event);

  const { data: insertedRow, error: insertError } = await supabase
    .from("registrations")
    .insert({
      event_id: body.eventId,
      name: body.name.trim(),
      email,
      phone: body.phone.trim(),
      organization: body.organization.trim(),
      purpose: body.purpose.trim(),
      marketing_opt_in: body.marketingOptIn,
      registration_status: registrationStatus,
      payment_status: paymentStatus,
      depositor_name: body.name.trim(),
    })
    .select("*")
    .single();

  if (insertError || !insertedRow) {
    // Most likely the unique-index race (two concurrent submits, same email) -- re-check as a duplicate.
    const { data: raceRow } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", body.eventId)
      .eq("email", email)
      .neq("registration_status", "CANCELLED")
      .maybeSingle();
    if (raceRow) {
      return NextResponse.json({ duplicate: true, registration: rowToRegistration(raceRow) });
    }
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  const registration = rowToRegistration(insertedRow);
  await notifyAdminsOfNewRegistration(event, registration);

  return NextResponse.json({ duplicate: false, registration });
}
