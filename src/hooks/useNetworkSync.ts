import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount } from "../context/AccountContext";
import { accountSync } from "../data/sync/accountSync";
import { accountPetInteractionSync } from "../data/sync/accountPetInteractionSync";
import { historySync } from "../data/sync/historySync";
import { achievementsSync } from "../data/sync/achievementsSync";

export function useNetworkSync() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const isSyncing = useRef(false);
    const { account } = useAccount();
    const previousConnectedRef = useRef<boolean | null>(null);

    const performSync = useCallback(async () => {
        if (isSyncing.current) return;

        isSyncing.current = true;
        try {
            if (account?.id) {
                await Promise.allSettled([
                    accountSync.syncFromServer(),
                    accountPetInteractionSync.syncFromServer(account.id),
                    historySync.syncFromServer(account.id),
                    achievementsSync.syncFromServer(account.id),
                ]);
            } else {
                await accountSync.syncFromServer();
            }
        } catch (error) {
            console.error("Erro durante sincronização:", error);
        } finally {
            isSyncing.current = false;
        }
    }, [account?.id]);

    const syncNow = useCallback(async () => {
        if (isConnected) {
            await performSync();
        }
    }, [isConnected, performSync]);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const state = await NetInfo.fetch();
                const connected = state.isConnected ?? false;
                setIsConnected(connected);
                previousConnectedRef.current = connected;
            } catch (error) {
                console.error("Erro ao buscar estado da rede:", error);
            }
        };

        fetchInitialState();

        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected = state.isConnected ?? false;
            setIsConnected(connected);

            const wasDisconnected = previousConnectedRef.current === false;
            if (wasDisconnected && connected) {
                setTimeout(() => performSync(), 1000);
            }

            previousConnectedRef.current = connected;
        });

        return () => unsubscribe();
    }, [performSync]);

    return {
        isConnected,
        isSyncing,
        syncNow,
    };
}
