export interface IComment {
    id: string;          
    postId: string;
    parentId?: string | null;
    content: string;
    accountId: string;
    createdAt: string; 
    updatedAt: string;
}