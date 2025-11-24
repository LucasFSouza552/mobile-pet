export interface IComment {
    id: string;          
    post: string;
    parent?: string | null;
    content: string;
    account: string | { id?: string; _id?: string; name?: string; avatar?: string; role?: string; verified?: boolean };
    deletedAt?: string;
    createdAt: string; 
    updatedAt: string;
    lastSyncedAt?: string;
}