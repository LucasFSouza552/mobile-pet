import { IAccount } from "./IAccount";

export interface IPet {
    id: string;
    name: string;
    type: "Cachorro" | "Gato" | "Pássaro" | "Outro";
    age?: number;
    gender: "Male" | "Female";
    weight: number;
    images: string[];
    description?: string;
    adopted: boolean;
    account: IAccount;
    adoptedAt?: string;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}

