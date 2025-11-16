import { apiClient } from "../api/apiClient";
import {
    INotification,
    NotificationType,
    NotificationSender,
} from "../../../models/INotification";

export interface NotificationPayload {
    content: string;
    type?: NotificationType;
    latitude: number;
    longitude: number;
    image: {
        uri: string;
        name: string;
        type: string;
    };
}

const normalizeSender = (sender: any): NotificationSender => {
    if (!sender) {
        return { _id: "", name: "Usuário" };
    }
    if (typeof sender === "string") {
        return { _id: sender, name: "Usuário" };
    }
    return {
        _id: sender._id ?? sender.id ?? "",
        name: sender.name ?? "Usuário",
        email: sender.email,
        avatar: sender.avatar,
        phone_number: sender.phone_number,
        role: sender.role,
    };
};

const toNotification = (item: any): INotification => ({
    _id: item._id ?? item.id ?? "",
    sender: normalizeSender(item.sender ?? item.senderId ?? item.sender_id),
    type: item.type as NotificationType,
    content: item.content,
    image: item.image,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    createdAt: item.createdAt,
    viewedAt: item.viewedAt,
});

export const notificationRemoteRepository = {
    async createNotification(payload: NotificationPayload) {
        try {
            const formData = new FormData();
            formData.append("content", payload.content);
            if (payload.type) {
                formData.append("type", payload.type);
            }
            formData.append("latitude", String(payload.latitude));
            formData.append("longitude", String(payload.longitude));
            formData.append("image", {
                uri: payload.image.uri,
                name: payload.image.name,
                type: payload.image.type,
            } as any);

            const response = await apiClient.post("/notification", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async fetchAll() {
        try {
            const response = await apiClient.get("/notification");
            const list = response.data || [];
            return (list as Array<any>).map(toNotification);
        } catch (error) {
            throw error;
        }
    },
};

