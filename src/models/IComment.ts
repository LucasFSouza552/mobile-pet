export interface IComment {
    id: string;          
    post: string;
    parent?: string | null;
    content: string;
    account: string;
    isDeleted: boolean;
    createdAt: string; 
    updatedAt: string;
    lastSyncedAt?: string;
}