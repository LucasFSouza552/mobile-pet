import { useState, useCallback, useRef, useEffect } from 'react';
import { accountPetInteractionSync } from '../../../../../data/sync/accountPetInteractionSync';
import { useFocusEffect } from '@react-navigation/native';

interface UseWishPetsListState {
    items: any[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
}

interface UseWishPetsListReturn extends UseWishPetsListState {
    load: (isRefresh?: boolean) => Promise<void>;
    onRefresh: () => void;
}

export const useWishPetsList = (accountId: string): UseWishPetsListReturn => {
    const [state, setState] = useState<UseWishPetsListState>({
        items: [],
        loading: false,
        refreshing: false,
        error: null,
    });

    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const isProcessingSyncRef = useRef(false); // ✅ Flag para evitar múltiplos syncs simultâneos

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // ✅ Função auxiliar para processar interações e atualizar estado
    const processInteractions = useCallback((interactions: any[]) => {
        const petsMap = new Map<string, any>();

        (interactions || []).forEach((interaction: any) => {
            const status = String(interaction?.status ?? "").toLowerCase().trim();
            if (status !== "liked") return;

            const petData = interaction?.pet;
            if (!petData || typeof petData !== "object" || !petData?.id) return;

            if (petData.adopted === true || petData.adopted === 1) return;

            if (!petsMap.has(petData.id)) {
                petsMap.set(petData.id, petData);
            }
        });

        return Array.from(petsMap.values());
    }, []);

    const load = useCallback(async (isRefresh = false) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setState(prev => ({
            ...prev,
            error: null,
            loading: isRefresh ? prev.loading : true,
            refreshing: isRefresh,
        }));

        try {
            if (abortController.signal.aborted || !isMountedRef.current) return;

            const interactions = await accountPetInteractionSync.getByAccount(accountId, async () => {
                if (isProcessingSyncRef.current || !isMountedRef.current) return;
                
                isProcessingSyncRef.current = true;
                
                try {
                    const updatedInteractions = await accountPetInteractionSync.getByAccount(accountId);
                    const uniquePets = processInteractions(updatedInteractions);

                    if (!abortController.signal.aborted && isMountedRef.current) {
                        setState(prev => ({
                            ...prev,
                            items: uniquePets,
                            loading: false,
                            refreshing: false,
                        }));
                    }
                } catch (error) {
                    console.error('Erro ao atualizar após sync:', error);
                } finally {
                    isProcessingSyncRef.current = false;
                }
            });

            if (abortController.signal.aborted || !isMountedRef.current) return;

            const uniquePets = processInteractions(interactions);

            if (!abortController.signal.aborted && isMountedRef.current) {
                setState({
                    items: uniquePets,
                    loading: false,
                    refreshing: false,
                    error: null,
                });
            }

        } catch (error: any) {
            if (abortController.signal.aborted || !isMountedRef.current) return;

            setState(prev => ({
                ...prev,
                items: prev.items.length > 0 ? prev.items : [],
                loading: false,
                refreshing: false,
                error: error?.message || "Erro ao carregar lista de desejos",
            }));
        }
    }, [accountId, processInteractions]);

    const onRefresh = useCallback(() => {
        load(true);
    }, [load]);

    return {
        ...state,
        load,
        onRefresh,
    };
};
