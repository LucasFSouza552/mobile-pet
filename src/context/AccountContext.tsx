import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { IAccount } from "../models/IAccount";
import { accountLocalRepository } from "../data/local/repositories/accountLocalRepository";
import { accountSync } from "../data/sync/accountSync";

interface AccountContextProps {
    account: IAccount | null;
    setAccount: (account: IAccount | null) => void;
    refreshAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextProps | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [account, setAccount] = useState<IAccount | null>(null);

    useEffect(() => {
        loadAccount();
    }, []);

    const loadAccount = async () => {
        const localAccount = await accountLocalRepository.findLocalAccount();
        
        if (localAccount) {
            setAccount(localAccount);
        }
        
        await accountSync.syncFromServer();
        
        const syncedAccount = await accountLocalRepository.findLocalAccount();
        if (syncedAccount) {
            setAccount(syncedAccount);
        }
    };

    const refreshAccount = async () => {
        await loadAccount();
    };

    return (
        <AccountContext.Provider value={{
            account,
            setAccount,
            refreshAccount,
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