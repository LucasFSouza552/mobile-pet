import IAddress from "./IAddress";
import { ITypeAccounts } from "./ITypeAccounts";

export interface IAccount {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone_number: string;
    role: ITypeAccounts;
    cpf?: string;
    cnpj?: string;
    verified: boolean;
    address?: IAddress;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt?: string;
    postCount?: number;
}