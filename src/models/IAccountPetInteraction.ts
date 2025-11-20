import { IPet } from "./IPet";

export interface IAccountPetInteraction {
    id: string;
    account: string;
    pet: string | IPet;
    status: "liked" | "disliked" | "viewed";
    createdAt: string;
    updatedAt: string;
}

