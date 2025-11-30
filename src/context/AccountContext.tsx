import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { IAccount } from "../models/IAccount";
import { accountLocalRepository } from "../data/local/repositories/accountLocalRepository";
import { accountSync } from "../data/sync/accountSync";
import { useToast } from "../hooks/useToast";
interface AccountContextProps {
    account: IAccount | null;
    setAccount: (account: IAccount | null) => void;
    refreshAccount: () => Promise<void>;
    loading: boolean;
    logout: () => Promise<void>;
}

const AccountContext = createContext<AccountContextProps | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [account, setAccount] = useState<IAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const loadAccount = async () => {
        try {
            setLoading(true);
            const localAccount = await accountSync.getProfile();
            if (localAccount) {
                setAccount(localAccount);
            }
        } catch (error: any) {
            toast.handleApiError(error, error?.data?.message || 'Erro ao carregar conta');
        } finally {
            setLoading(false);
        }
    };

    const refreshAccount = async () => {
        await loadAccount();
    };

    useEffect(() => {
       refreshAccount()
    }, []);

    const logout = async () => {
        await accountLocalRepository.logout();
        setAccount(null);
    }

    return (
        <AccountContext.Provider value={{
            account,
            setAccount,
            refreshAccount,
            loading,
            logout
        }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) throw new Error("useAccount deve ser usado dentro de AccountProvider");
    return context;
};