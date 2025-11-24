import { IAccount } from "./IAccount";

export interface IPet {
    id: string;
    name: string;
    type: "Cachorro" | "Gato" | "Pássaro" | "Outro";
    age?: number;
    gender: "male" | "female";
    weight: number;
    images?: string[];
    description?: string;
    adopted: boolean;
    account: string | IAccount;
    adoptedAt?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    lastSyncedAt?: string;
}

