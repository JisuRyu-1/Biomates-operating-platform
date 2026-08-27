import { NextResponse } from "next/server";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service";
import { rowToRegistration } from "@/lib/supabase/mappers";

/**
 * Public, unauthenticated lookup by exact id -- the registration id (a UUID)
 * is effectively a bearer token here, matching the existing no-participant-
 * login design (the confirmation page and My Registration both work this
 * way). Never lists or searches; only returns the single row that was asked
 * for by its exact id.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isServiceConfigured()) {
    return NextResponse.json({ error: "서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }
  const { id } = await params;

  const supabase = createServiceClient();
  const { data, error } = await supabase.from("registrations").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "신청 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ registration: rowToRegistration(data) });
}
