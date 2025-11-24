import { ITypeAccounts } from "../types/ITypeAccounts";

export type NotificationType = "warning" | "info" | "like";

export interface NotificationSender {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  phone_number?: string;
  role?: ITypeAccounts;
}

export interface INotification {
  id: string;
  sender: string | NotificationSender;
  type: NotificationType;
  content: string;
  image: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  viewedAt?: string;
  lastSyncedAt?: string;
}


