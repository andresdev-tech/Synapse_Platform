export interface AssignLearnerData {
    inscriptionId: string;
    groupId: string;
}

export interface ChangeGroupData {
    userId: string;
    programId: string;
    newGroupId: string;
}

export interface ExpelLearnerData {
    groupId: string;
    userId: string;
    reason: string;
}

export interface SuspendLearnerData {
    groupId: string;
    userId: string;
    reason: string;
}

export interface GroupStats {
    total: string;
    assigned: string;
    pending: string;
    suspended: string;
    expelled: string;
}