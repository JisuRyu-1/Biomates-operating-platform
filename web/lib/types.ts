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
