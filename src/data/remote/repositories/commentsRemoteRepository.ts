import { apiClient } from "../api/apiClient";
import buildQuery from "../../../utils/BuilderQuery";
import { IComment } from "../../../models/IComment";

export const commentRepository = {
    async adminFetchComments() {
        try {
            const response = await apiClient.get("/comment");
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar comentários:", error);
            throw error;
        }
    },
    async adminDeleteComment(commentId: string) {
        try {
            const response = await apiClient.delete(`/comment/${commentId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar comentário ${commentId}:`, error);
            throw error;
        }
    },
    async fetchCommentsByPost(postId: string, page = 1, limit = 10) {
        try {
            const query = buildQuery({ page, limit });
            const response = await apiClient.get(`/comment/post/${postId}${query}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar comentários do post ${postId}:`, error);
            throw error;
        }
    },
    async fetchCommentById(commentId: string) {
        try {
            const response = await apiClient.get(`/comment/${commentId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar comentário ${commentId}:`, error);
            throw error;
        }
    },
    async createComment(postId: string, content: string): Promise<IComment> {
        try {
            const response = await apiClient.post(`/comment/${postId}`, { content });
            return response.data;
        } catch (error) {
            console.error(`Erro ao criar comentário no post ${postId}:`, error);
            throw error;
        }
    },

    async replyToComment(commentId: string, content: string) {
        try {
            const response = await apiClient.post(`/comment/${commentId}/reply`, { content });
            return response.data;
        } catch (error) {
            console.error(`Erro ao responder comentário ${commentId}:`, error);
            throw error;
        }
    },

    async updateComment(commentId: string, content: string) {
        try {
            const response = await apiClient.patch(`/comment/${commentId}`, { content });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar comentário ${commentId}:`, error);
            throw error;
        }
    },

    async deleteOwnComment(commentId: string) {
        try {
            const response = await apiClient.patch(`/comment/own/${commentId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao ocultar comentário ${commentId}:`, error);
            throw error;
        }
    },

    async fetchReplies(commentId: string) {
        try {
            const response = await apiClient.get(`/comment/${commentId}/replies`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar respostas do comentário ${commentId}:`, error);
            throw error;
        }
    },
};

