export type Role =
  | 'beneficiary'
  | 'branch_officer'
  | 'branch_manager'
  | 'land_agency'
  | 'industry_ministry';

export type RequestStatus =
  | 'draft'
  | 'pending_branch_officer'
  | 'pending_branch_manager'
  | 'referred_to_agencies'
  | 'pending_final_decision'
  | 'returned_to_beneficiary'
  | 'returned_to_officer'
  | 'accepted'
  | 'rejected';

export type ApplicantType = 'owner' | 'tenant' | 'agent';
export type AreaUnit = 'hectare' | 'sqm';
export type Recommendation = 'approve' | 'reject' | 'conditional';

export interface User {
  id: string;
  nationalId: string;
  password: string;
  name: string;
  role: Role;
  roleLabel: string;
  mobile?: string;
  email?: string;
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  description?: string;
}

export interface AgriculturalRecord {
  id: string;
  recordNumber: string;
  farmName: string;
  ownerName: string;
  region: string;
  governorate: string;
  siteName: string;
  deedNumber: string;
  area: number;
  areaUnit: AreaUnit;
  latitude: string;
  longitude: string;
  currentUse: string;
  waterSource: string;
  cropType: string;
  suggestedSurveyNumber: string;
  surveyIssuer: string;
  surveyDate: string;
}

export interface AgencyOpinion {
  recommendation: Recommendation;
  text: string;
  submittedAt: string;
  submittedBy: string;
  submittedByRole: string;
}

export interface HistoryEntry {
  id: string;
  stage: string;
  actorName: string;
  actorRole: string;
  date: string;
  action: string;
  notes?: string;
}

export interface ReclamationRequest {
  id: string;
  requestNumber: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  beneficiaryId: string;
  fullName: string;
  nationalId: string;
  mobile: string;
  email: string;
  applicantType: ApplicantType;
  region: string;
  governorate: string;
  siteName: string;
  deedNumber: string;
  area: number;
  areaUnit: AreaUnit;
  latitude: string;
  longitude: string;
  currentUse: string;
  waterSource: string;
  reclamationPlan: string;
  surveyReport: Attachment | null;
  agriculturalRecordId?: string;
  agriculturalRecordNumber?: string;
  surveyNumber?: string;
  surveyVerified?: boolean;
  attachmentDescription?: string;
  obstacles?: string;
  notes?: string;
  returnReason?: string;
  rejectReason?: string;
  landAgencyOpinion?: AgencyOpinion;
  industryOpinion?: AgencyOpinion;
  referredToLand?: boolean;
  referredToIndustry?: boolean;
  history: HistoryEntry[];
}

export interface RequestFormData {
  fullName: string;
  nationalId: string;
  mobile: string;
  email: string;
  applicantType: ApplicantType;
  agriculturalRecordId: string;
  region: string;
  governorate: string;
  siteName: string;
  deedNumber: string;
  area: string;
  areaUnit: AreaUnit;
  latitude: string;
  longitude: string;
  currentUse: string;
  waterSource: string;
  reclamationPlan: string;
  surveyNumber: string;
  surveyVerified: boolean;
  attachmentDescription: string;
  obstacles: string;
  notes: string;
  surveyReport: Attachment | null;
}

export interface AppState {
  users: User[];
  requests: ReclamationRequest[];
  currentUserId: string | null;
  nextRequestSeq: number;
}
