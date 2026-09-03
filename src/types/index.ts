// ============================================================
// EQONOMY — Core TypeScript Types
// ============================================================

export type UserRole = "seeker" | "provider" | "both";

export type ProviderEntityType =
  | "local_business"
  | "startup"
  | "ngo"
  | "professional"
  | "established_company"
  | "entrepreneur"
  | "other";

export type OpportunityType =
  | "paid_project"
  | "internship"
  | "challenge"
  | "guidance"
  | "portfolio_review"
  | "research"
  | "collaboration"
  | "volunteering"
  | "recruitment";

export type OpportunityStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "completed";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  bio?: string;
  delhiDistrict?: string;
  skills: string[];
  isMinor: boolean;
  auraTrackUrl?: string;
  entityType?: ProviderEntityType;
  verificationStatus: VerificationStatus;
  organizationName?: string;
  createdAt: number;
  updatedAt: number;
  completedOpportunitiesCount: number;
  reputationScore: number;
}

export interface Opportunity {
  id: string;
  providerId: string;
  providerName: string;
  type: OpportunityType;
  title: string;
  description: string;
  skillsRequired: string[];
  location: string;
  isRemote: boolean;
  compensation?: string;
  duration?: string;
  eligibilityNotes?: string;
  status: OpportunityStatus;
  createdAt: number;
  updatedAt: number;
  applicationCount: number;
  milestones?: string[];
}

export interface Application {
  id: string;
  opportunityId: string;
  seekerId: string;
  seekerName: string;
  status: ApplicationStatus;
  coverMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkShowcasePost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  description: string;
  skillsDemonstrated: string[];
  mediaUrls?: string[];
  linkedOpportunityId?: string;
  likeCount: number;
  likedBy: string[];
  createdAt: number;
  expiresAt: number; // auto-delete after 5 days
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: "morning_digest" | "instant_match" | "milestone" | "application" | "feedback" | "system";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: number;
}