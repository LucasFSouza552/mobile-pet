import { ReactNode, createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { IPost } from "../models/IPost";
import { postRepository } from "../data/remote/repositories/postRemoteRepository";
import { useNetInfo } from "@react-native-community/netinfo";

type Order = "asc" | "desc";

interface PostContextProps {
    posts: IPost[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    fetchMore: () => Promise<void>;
    likePost: (postId: string) => Promise<void>;
    // Extras inspirados no PostContext web
    userPosts: IPost[];
    refreshUserPosts: (accountId?: string) => Promise<void>;
    loadMoreUserPosts: (accountId?: string) => Promise<void>;
    searchPosts: (query: string) => Promise<IPost[]>;
    loadMoreSearchPosts: () => Promise<IPost[] | void>;
    searchResults: IPost[];
    loadingSearchResults: boolean;
}

const PostContext = createContext<PostContextProps | undefined>(undefined);

function addPostsWithoutDuplicates(currentPosts: IPost[], newPosts: IPost[]): IPost[] {
    const existingIds = new Set(currentPosts.map(post => post.id));
    const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
    return [...currentPosts, ...uniqueNewPosts];
}

export function PostProvider({ children }: { children: ReactNode }) {

    const { isConnected } = useNetInfo();


    // feed geral
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(10);
    const [orderBy] = useState<string>("createdAt");
    const [order] = useState<Order>("desc");
    const [hasMore, setHasMore] = useState<boolean>(true);

    // feed por usuário
    const [userPosts, setUserPosts] = useState<IPost[]>([]);
    const [userPage, setUserPage] = useState<number>(1);
    const [hasMoreUser, setHasMoreUser] = useState<boolean>(true);
    const [currentUserFilter, setCurrentUserFilter] = useState<string | undefined>(undefined);

    // busca
    const [searchResults, setSearchResults] = useState<IPost[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loadingSearchResults, setLoadingSearchResults] = useState(false);
    const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true);
    const [searchPage, setSearchPage] = useState(1);

    async function load(pageToLoad: number, replace: boolean) {
        try {
            // verifica se tem internet
            if (!isConnected) {
                throw new Error("Sem conexão com a internet");
            }
            setLoading(true);
            setError(null);
            const response: IPost[] = await postRepository.fetchPostsWithAuthor({
                page: pageToLoad,
                limit,
                orderBy,
                order,
            } as any);
            const fetched = Array.isArray(response) ? response : [];
            setHasMore(fetched.length >= limit);
            setPosts(prev => replace ? fetched : addPostsWithoutDuplicates(prev, fetched));
        } catch (err: any) {
            setError(typeof err === "string" ? err : "Falha ao carregar posts");
        } finally {
            setLoading(false);
        }
    }

    const refresh = async () => {
        setPage(1);
        await load(1, true);
    };

    const fetchMore = async () => {
        if (loading || !hasMore) return;
        const next = page + 1;
        await load(next, false);
        setPage(next);
    };

    const loadUser = async (replace: boolean, accountId?: string, pageToLoad?: number) => {
        
        if (!isConnected) {
            setError("Sem conexão com a internet");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response: IPost[] = await postRepository.fetchPostsWithAuthor({
                account: accountId,
                page: pageToLoad || userPage,
                limit,
                orderBy,
                order,
            } as any);
            

            const fetched = Array.isArray(response) ? response : [];
            setHasMoreUser(fetched.length >= limit);
            setUserPosts(prev => replace ? fetched : addPostsWithoutDuplicates(prev, fetched));
        } catch (err: any) {
            setError(typeof err === "string" ? err : "Falha ao carregar posts");
        } finally {
            setLoading(false);
        }
    };

    const refreshUserPosts = async (accountId?: string) => {
        setCurrentUserFilter(accountId);
        setUserPage(1);
        await loadUser(true, accountId, 1);
    };

    const loadMoreUserPosts = async (accountId?: string) => {
        if (loading || !hasMoreUser) return;
        const filter = accountId ?? currentUserFilter;
        if (!filter) return;
        const nextPage = userPage + 1;
        setUserPage(nextPage);
        await loadUser(false, filter, nextPage);
    };

    const likePost = async (postId: string) => {
        try {
            const updated: IPost = await postRepository.toggleLikePostById(postId);
            setPosts(prev => prev.map(p => (p.id === postId ? updated : p)));
            setUserPosts(prev => prev.map(p => (p.id === postId ? updated : p)));
            setSearchResults(prev => prev.map(p => (p.id === postId ? updated : p)));
        } catch (err) {
        }
    };

    // busca
    const searchPosts = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearchQuery("");
            setSearchPage(1);
            setHasMoreSearchResults(true);
            return [];
        }
        if (!isConnected) {
            setSearchResults([]);
            setHasMoreSearchResults(true);
            return [];
        }
        setLoadingSearchResults(true);
        setSearchQuery(query);
        setSearchPage(1);
        try {
            const apiPosts = await postRepository.searchPosts(query, 1, limit);
            const allPosts = addPostsWithoutDuplicates([], apiPosts);
            setSearchResults(allPosts);
            setHasMoreSearchResults(apiPosts.length === limit);
            return allPosts;
        } finally {
            setLoadingSearchResults(false);
        }
    }, [limit, isConnected]);

    const loadMoreSearchPosts = useCallback(async () => {
        if (!isConnected || loadingSearchResults || !hasMoreSearchResults || !searchQuery.trim()) return;
        setLoadingSearchResults(true);
        try {
            const next = searchPage + 1;
            const newPosts = await postRepository.searchPosts(searchQuery, next, limit);
            setSearchResults(prev => addPostsWithoutDuplicates(prev, newPosts));
            setSearchPage(next);
            setHasMoreSearchResults(newPosts.length === limit);
            return newPosts;
        } finally {
            setLoadingSearchResults(false);
        }
    }, [limit, searchPage, hasMoreSearchResults, loadingSearchResults, searchQuery, isConnected]);

    useEffect(() => {
        if (isConnected) {
            refresh();
        }
    }, [isConnected]);

    const value = useMemo<PostContextProps>(() => ({
        posts,
        loading,
        error,
        refresh,
        fetchMore,
        likePost,
        userPosts,
        refreshUserPosts,
        loadMoreUserPosts,
        searchPosts,
        loadMoreSearchPosts,
        searchResults,
        loadingSearchResults,
    }), [
        posts, loading, error,
        userPosts,
        searchResults, loadingSearchResults
    ]);

    return (
        <PostContext.Provider value={value}>
            {children}
        </PostContext.Provider>
    );
}

export function usePost() {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error("usePost deve ser usado dentro de PostProvider");
    }
    return context;
}
