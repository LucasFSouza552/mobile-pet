import { IAccount } from "./IAccount";

export interface IPost {
    id: string;
    content: string;
    image?: string[];
    account: IAccount;
    likes: string[];
    comments: string[];
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}