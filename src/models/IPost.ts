export interface IPost {
    id: string;
    title: string;
    content: string;
    image?: string;
    account: string;
    likes_count: number;
    comments_count: number;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}