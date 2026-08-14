export interface AssignLearnerData {
    inscriptionId: number;
    groupId: number;
}

export interface ChangeGroupData {
    userId: number;
    programId: number;
    newGroupId: number;
}

export interface ExpelLearnerData {
    groupId: number;
    userId: number;
    reason: string;
}

export interface SuspendLearnerData {
    groupId: number;
    userId: number;
    reason: string;
}

export interface GroupStats {
    total: number;
    assigned: number;
    pending: number;
    suspended: number;
    expelled: number;
}