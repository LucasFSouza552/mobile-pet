export interface IAchievement {
    id: string;
    name: string;
    description?: string;
    type: "donation" | "sponsorship" | "adoption";
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
}

