import { IHistoryStatus } from "../types/IHistoryStatus";

export interface IHistory {
    id: string;
    type: "adoption" | "sponsorship" | "donation";
    status?: IHistoryStatus;
    pet?: string | null;
    institution?: string;
    account: string;
    amount?: string;
    externalReference?: string | null;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}

