export interface IPost {
    id: string;
    title: string;
    content: string;
    image?: string[];
    date: string;
    likes: number;
    comments?: number;
    accountId: string;
    createdAt: string;
    updatedAt: string;
}