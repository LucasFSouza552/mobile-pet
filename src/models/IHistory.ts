import { IHistoryStatus } from "../types/IHistoryStatus";
import { IAccount } from "./IAccount";
import { IPet } from "./IPet";

export interface IHistory {
    id: string;
    type: "adoption" | "sponsorship" | "donation";
    status?: IHistoryStatus;
    pet?: string | IPet | null;
    institution?: string | IAccount;
    account: string | IAccount;
    amount?: string;
    externalReference?: string | null;
    urlPayment?: string | null;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}

