import { useState, useCallback, useRef, useEffect } from 'react';
import { historySync } from '../../../../../data/sync/historySync';
import { IHistory } from '../../../../../models/IHistory';

interface UseHistoryListState {
  items: IHistory[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

interface UseHistoryListReturn extends UseHistoryListState {
  load: (isRefresh?: boolean) => Promise<void>;
  onRefresh: () => void;
}

export const useHistoryList = (accountId: string): UseHistoryListReturn => {
  const [state, setState] = useState<UseHistoryListState>({
    items: [],
    loading: false,
    refreshing: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const load = useCallback(
    async (isRefresh = false) => {
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
        await historySync.syncFromServer(accountId);

        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }

        const historyList = await historySync.getHistory(accountId);

        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }

        const uniqueMap = new Map<string, IHistory>();
        (historyList || []).forEach(item => {
          if (item?.id) {
            uniqueMap.set(item.id, item);
          }
        });

        const ordered = Array.from(uniqueMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (!abortController.signal.aborted && isMountedRef.current) {
          setState({
            items: ordered,
            loading: false,
            refreshing: false,
            error: null,
          });
        }
      } catch (error: any) {
        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }

        const errorMessage = error?.message || 'Erro ao carregar histórico';

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            items: prev.items.length > 0 ? prev.items : [],
            loading: false,
            refreshing: false,
            error: errorMessage,
          }));
        }
      }
    },
    [accountId]
  );

  const onRefresh = useCallback(() => {
    load(true);
  }, [load]);

  return {
    ...state,
    load,
    onRefresh,
  };
};

