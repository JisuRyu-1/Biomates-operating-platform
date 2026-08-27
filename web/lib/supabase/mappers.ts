import type { BiomatesEvent, EventFormValues, Registration } from "@/lib/types";

interface EventRow {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  date: string;
  time: string;
  venue: string;
  map_url: string | null;
  capacity: number;
  fee: number;
  registration_start: string;
  registration_end: string;
  audience: string;
  program: unknown;
  speakers: unknown;
  prep: unknown;
  refund_policy: string;
  contact: string;
  bank_info: unknown;
  resources: unknown;
  published: boolean;
  survey_form_url: string;
}

export function rowToEvent(row: EventRow): BiomatesEvent {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    status: row.status as BiomatesEvent["status"],
    date: row.date,
    time: row.time,
    venue: row.venue,
    mapUrl: row.map_url ?? undefined,
    capacity: row.capacity,
    fee: row.fee,
    registrationStart: row.registration_start,
    registrationEnd: row.registration_end,
    audience: row.audience,
    program: (row.program ?? []) as BiomatesEvent["program"],
    speakers: (row.speakers ?? []) as BiomatesEvent["speakers"],
    prep: (row.prep ?? []) as BiomatesEvent["prep"],
    refundPolicy: row.refund_policy,
    contact: row.contact,
    bankInfo: (row.bank_info ?? null) as BiomatesEvent["bankInfo"],
    resources: (row.resources ?? []) as BiomatesEvent["resources"],
    published: row.published,
    surveyFormUrl: row.survey_form_url ?? "",
  };
}

/** Column payload for inserting/updating an event from admin form values. Doesn't touch resources/survey_form_url -- those aren't edited via this form. */
export function eventFormValuesToRow(id: string, values: EventFormValues) {
  return {
    id,
    title: values.title,
    subtitle: values.subtitle,
    status: values.status,
    date: values.date,
    time: values.time,
    venue: values.venue,
    map_url: values.mapUrl || null,
    capacity: values.capacity,
    fee: values.fee,
    registration_start: values.registrationStart,
    registration_end: values.registrationEnd,
    audience: values.audience,
    program: values.program,
    speakers: values.speakers,
    prep: values.prep,
    refund_policy: values.refundPolicy,
    contact: values.contact,
    bank_info: values.bankInfo,
    published: values.published,
  };
}

interface RegistrationRow {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  purpose: string;
  marketing_opt_in: boolean;
  registration_status: string;
  payment_status: string;
  registered_at: string;
  checkin_at: string | null;
  depositor_name: string;
  note: string;
  sms_log: unknown;
  email_log: unknown;
}

export function rowToRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    organization: row.organization,
    purpose: row.purpose,
    marketingOptIn: row.marketing_opt_in,
    registrationStatus: row.registration_status as Registration["registrationStatus"],
    paymentStatus: row.payment_status as Registration["paymentStatus"],
    registeredAt: row.registered_at,
    checkinAt: row.checkin_at,
    depositorName: row.depositor_name,
    note: row.note,
    smsLog: (row.sms_log ?? []) as Registration["smsLog"],
    emailLog: (row.email_log ?? []) as Registration["emailLog"],
  };
}
