import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { IAccount } from "../models/IAccount";
import { accountLocalRepository } from "../data/local/repositories/accountLocalRepository";
import { accountSync } from "../data/sync/accountSync";
import { getStorage, saveStorage } from "../utils/storange";
import { accountService } from "../services/accountService";
import { authService } from "../services/authService";

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

    useEffect(() => {
        loadAccount();
    }, []);

    const loadAccount = async () => {
        try {
            setLoading(true);
            const localAccount = await accountService.getLoggedAccount();

            if (localAccount) {
                setAccount(localAccount);
            } else {
                setAccount(null);
            }

        } catch (error) {
            console.error("Erro ao buscar do servidor:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshAccount = async () => {
        await loadAccount();
    };

    const logout = async () => {
        setAccount(null)
        await accountService.getLogout();
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