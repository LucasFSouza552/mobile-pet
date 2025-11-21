import { IPost } from "../../../models/IPost";
import buildQuery from "../../../utils/BuilderQuery";
import { apiClient } from "../api/apiClient";


interface PostQuery {
    account?: string;
    limit?: number;
    page?: number;
    orderBy?: string;
    order?: "asc" | "desc";
}

export const postRepository = {
    async adminRemovePostById(id: string) {
        try {
            const response = await apiClient.delete(`/post/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchAllPosts() {
        try {
            const response = await apiClient.get("/post");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchPostById(id: string) {
        try {
            const response = await apiClient.get(`/post/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async createPost(data: IPost | FormData) {
        try {
            let formData: FormData;

            if (data instanceof FormData) {
                formData = data;
            } else {
                formData = new FormData();
                formData.append("content", data.content);
                if (data.image) {
                    data.image.forEach(image => {
                        formData.append("images", image);
                    });
                }
            }

            const response = await apiClient.post("/post", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async searchPosts(query: string, page: number = 1, limit: number = 10) {
        try {
            const response = await apiClient.get(`/post/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async softDeletePostById(id: string) {
        try {
            const response = await apiClient.post(`/post/${id}/delete`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async updatePost(id: string, data: Partial<IPost>) {
        try {
            const response = await apiClient.patch(`/post/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchPostWithAuthor(postId: string): Promise<IPost> {
        try {
            const response = await apiClient.get(`/post/${postId}/with-author`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchPostsWithAuthor(query: PostQuery) {
        try {
            const queryString = buildQuery(query);
            const response = await apiClient.get(`/post/with-author${queryString}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async toggleLikePostById(id: string) {
        try {
            const response = await apiClient.post(`/post/${id}/like`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchTopPosts() {
        try {
            const response = await apiClient.get("/post/top-posts");
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

