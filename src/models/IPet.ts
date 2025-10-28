export interface IPet {
    id: string;
    name: string;
    type: "Cachorro" | "Gato" | "Pássaro" | "Outro";
    age?: number;
    gender: "M" | "F";
    weight: number;
    images: string[];
    description?: string;
    adopted: boolean;
    account: string;
    adoptedAt?: string;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}

