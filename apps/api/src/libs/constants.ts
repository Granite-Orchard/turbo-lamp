export enum EnvironmentVariables {
  ALLOWED_ORIGINS = 'ALLOWED_ORIGINS',
  DATABASE_URL = 'DATABASE_URL',
  TYPEORM_SYNCHRONIZE = 'TYPEORM_SYNCHRONIZE',
  REDIS_CACHE_URL = 'REDIS_CACHE_URL',
  REDIS_QUEUE_URL = 'REDIS_QUEUE_URL',
  REDIS_THROTTLE_URL = 'REDIS_THROTTLE_URL',
  JWT_PRIVATE = 'JWT_PRIVATE',
  JWT_PUBLIC = 'JWT_PUBLIC',
  FRONTEND_URL = 'FRONTEND_URL',
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',
  GOOGLE_CALLBACK_URL = 'GOOGLE_CALLBACK_URL',
  GITHUB_CLIENT_ID = 'GITHUB_CLIENT_ID',
  GITHUB_CLIENT_SECRET = 'GITHUB_CLIENT_SECRET',
  GITHUB_CALLBACK_URL = 'GITHUB_CALLBACK_URL',
  TOKEN_TTL = 'TOKEN_TTL',
  RESEND_API_KEY = 'RESEND_API_KEY',
  RESEND_FROM_EMAIL = 'RESEND_FROM_EMAIL',
  SMTP_URL = 'SMTP_URL',
  SMTP_FROM_EMAIL = 'SMTP_FROM_EMAIL',
  NODE_ENV = 'NODE_ENV',
  BACKEND_URL = 'BACKEND_URL',
}

export const TOKEN_ISSUER = 'venn';
export const TOKEN_AUDIENCE = 'venn';
export const TOKEN_ALGORITHM = 'RS256';

export type PROVIDERS = 'google';
export const STRATEGIES: PROVIDERS[] = ['google'];

export enum CalendarProvider {
  GOOGLE = 'google',
}

export enum AccountProvider {
  CREDENTIALS = 'credentials',
  GOOGLE = 'google',
}

export enum MeetingGroupStatus {
  OPEN = 'open',
  FINALIZED = 'finalized',
  CANCELLED = 'cancelled',
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

export enum FrontendRoutes {
  ONBOARDING_AUTH = '/onboarding/auth',
  DASHBOARD = '/dashboard',
  ONBOARDING = '/onboarding',
  MEETING_PARTICIPANTS = '/meeting-participants',
  MEETING_GROUPS = '/dashboard/meeting-groups',
}

export enum SanitizedRoutes {
  DASHBOARD = FrontendRoutes.DASHBOARD,
  ONBOARDING = FrontendRoutes.ONBOARDING,
  ONBOARDING_AUTH = FrontendRoutes.ONBOARDING_AUTH,
  MEETING_INVITATION_ACCEPTED = FrontendRoutes.MEETING_PARTICIPANTS,
  MEETING_GROUPS = FrontendRoutes.MEETING_GROUPS,
}

export enum VerificationType {
  OAUTH_STATE = 'oauthState',
  EMAIL_INVITATION = 'emailInvitation',
  MAGIC_LINK_INVITATION = 'magicLinkInvitation',
}

export interface VerificationValue {
  type: VerificationType;
  id: string;
  to: string;
  after: SanitizedRoutes;
}

export enum ParticipantAuthState {
  UNAUTHORIZED = 'unauthorized',
  AUTHORIZED = 'authorized',
  NOT_REQUIRED = 'not_required',
}

export enum ParticipantInvitationState {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum CookieKey {
  SESSION = 'session',
}
