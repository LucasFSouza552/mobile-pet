export interface IAccountPetInteraction {
    id: string;
    account: string;
    pet: string;
    status: "liked" | "disliked" | "viewed";
    createdAt: string;
    updatedAt: string;
}

