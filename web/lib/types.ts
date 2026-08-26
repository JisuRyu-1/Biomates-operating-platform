export type EventStatus = "UPCOMING" | "COMPLETED";

export type RegistrationStatus =
  | "REGISTERED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "ATTENDED"
  | "CANCELLED"
  | "NO_SHOW";

export type PaymentStatus = "PENDING" | "PAID" | "REFUND_PENDING" | "REFUNDED";

export type ResourceAccessLevel = "PUBLIC" | "REGISTERED" | "ATTENDED" | "PRIVATE";

export interface ProgramItem {
  time: string;
  item: string;
  speaker?: string;
}

export interface SpeakerBio {
  photoUrl?: string;
  summary: string;
}

export interface Speaker {
  name: string;
  org: string;
  bio?: SpeakerBio;
}

export interface BankInfo {
  bank: string;
  account: string;
  holder: string;
}

export interface EventResource {
  id: string;
  title: string;
  type: "Slides" | "Photos" | "Reference" | "Video" | "Other";
  accessLevel: ResourceAccessLevel;
}

export interface BiomatesEvent {
  id: string;
  title: string;
  subtitle: string;
  status: EventStatus;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "14:00 - 18:00"
  venue: string;
  mapUrl?: string;
  capacity: number;
  fee: number; // 0 = free
  registrationStart: string; // YYYY-MM-DD
  registrationEnd: string; // YYYY-MM-DD
  audience: string;
  program: ProgramItem[];
  speakers: Speaker[];
  prep: string[];
  refundPolicy: string;
  contact: string;
  bankInfo: BankInfo | null;
  resources: EventResource[];
  published: boolean;
  surveyFormUrl?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  purpose: string;
  marketingOptIn: boolean;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  registeredAt: string; // ISO datetime
  checkinAt: string | null;
  depositorName: string;
  note: string;
  smsLog?: MessageLogEntry[];
  emailLog?: EmailLogEntry[];
}

export interface RegistrationFormValues {
  name: string;
  phone: string;
  email: string;
  organization: string;
  purpose: string;
  marketingOptIn: boolean;
  consent: boolean;
}

export interface RegistrationFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  consent?: string;
}

export interface EventFormValues {
  title: string;
  subtitle: string;
  status: EventStatus;
  date: string;
  time: string;
  venue: string;
  mapUrl: string;
  capacity: number;
  fee: number;
  registrationStart: string;
  registrationEnd: string;
  audience: string;
  program: ProgramItem[];
  speakers: Speaker[];
  prep: string[];
  refundPolicy: string;
  contact: string;
  bankInfo: BankInfo | null;
  published: boolean;
}

export interface EventFormErrors {
  title?: string;
  date?: string;
  venue?: string;
  capacity?: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
}

export type MessageSendStatus = "SENT" | "FAILED";
export type SmsMessageType = "SMS" | "LMS";
export type MessageTemplateKey = "payment" | "paidConfirm" | "cancelRefund" | "reminder" | "custom";

export interface MessageLogEntry {
  templateKey: MessageTemplateKey;
  body: string;
  sentAt: string;
  status: MessageSendStatus;
  msgType: SmsMessageType;
  providerMessageId?: string;
  errorMessage?: string;
}

export interface MessageBatchLog {
  id: string;
  eventId: string;
  templateKey: MessageTemplateKey;
  recipientCount: number;
  recipientNames: string[];
  sentAt: string;
  successCount: number;
  failedCount: number;
}

/** One recipient's already-merged message, sent from the client to /api/admin/messages/send. */
export interface SmsSendRequestItem {
  registrationId: string;
  phone: string;
  name: string;
  message: string;
}

/** Per-recipient outcome returned by /api/admin/messages/send. */
export interface SmsSendResult {
  registrationId: string;
  phone: string;
  success: boolean;
  msgType: SmsMessageType;
  providerMessageId?: string;
  errorMessage?: string;
}

export interface EmailLogEntry {
  subject: string;
  body: string;
  sentAt: string;
  status: MessageSendStatus;
  providerMessageId?: string;
  errorMessage?: string;
}

export interface EmailBatchLog {
  id: string;
  eventId: string;
  subject: string;
  recipientCount: number;
  recipientNames: string[];
  sentAt: string;
  successCount: number;
  failedCount: number;
}

/** One recipient's already-merged email, sent from the client to /api/admin/emails/send. */
export interface EmailSendRequestItem {
  registrationId: string;
  email: string;
  name: string;
  subject: string;
  body: string;
}

/** Per-recipient outcome returned by /api/admin/emails/send. */
export interface EmailSendResult {
  registrationId: string;
  email: string;
  success: boolean;
  providerMessageId?: string;
  errorMessage?: string;
}
