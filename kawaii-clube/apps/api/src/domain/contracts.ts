export type Modality = 'SUPPORT' | 'EXCHANGE' | 'COLLAB';
export interface MatchInput { matchRef: string; expectedPolicyVersion: string }
export interface ProposalFields { objective: string; scope: string; consideration?: string; notes?: string }
export interface ProposalDraft { id: number; matchRef: string; opportunityId: number; version: number; status: 'DRAFT' | 'READY_FOR_REVIEW'; fields: ProposalFields; createdAt: string; updatedAt: string }
export interface Recommendation { matchRef: string; opportunityId: number; candidate: { id: number; displayName: string; type: 'ENTREPRENEUR' | 'COMPANY' }; modality: Modality; relation: 'PEER' | 'COMPANY'; evidence: { criterion: string; sourceType: 'PROFILE' | 'OPPORTUNITY'; sourceRef: string; confirmed: boolean }[]; explanation: string; policyVersion: string; evaluatedAt: string }
