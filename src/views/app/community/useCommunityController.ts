import { useCallback, useReducer, useRef, useMemo } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { usePost } from '../../../context/PostContext';
import { useAccount } from '../../../context/AccountContext';
import { useFocusEffect } from '@react-navigation/native';
import { postRepository } from '../../../data/remote/repositories/postRemoteRepository';
import { IPost } from '../../../models/IPost';
import { useToast } from '../../../hooks/useToast';
import { ITypeAccounts } from '../../../models/ITypeAccounts';

export type RoleFilter = 'all' | ITypeAccounts;

interface CommunityState {
  showAlertButton: boolean;
  topPosts: IPost[];
  loadingTopPosts: boolean;
  postOptions: string;
  postAbout: string;
  searchQuery: string;
  roleFilter: RoleFilter;
  isSearching: boolean;
}

type CommunityAction =
  | { type: 'SET_SHOW_ALERT_BUTTON'; payload: boolean }
  | { type: 'SET_TOP_POSTS'; payload: IPost[] }
  | { type: 'SET_LOADING_TOP_POSTS'; payload: boolean }
  | { type: 'SET_POST_OPTIONS'; payload: string }
  | { type: 'SET_POST_ABOUT'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ROLE_FILTER'; payload: RoleFilter }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'RESET_SEARCH' }
  | { type: 'RESET_ALL' };

const initialState: CommunityState = {
  showAlertButton: true,
  topPosts: [],
  loadingTopPosts: false,
  postOptions: '',
  postAbout: '',
  searchQuery: '',
  roleFilter: 'all',
  isSearching: false,
};

function communityReducer(state: CommunityState, action: CommunityAction): CommunityState {
  switch (action.type) {
    case 'SET_SHOW_ALERT_BUTTON':
      return { ...state, showAlertButton: action.payload };
    case 'SET_TOP_POSTS':
      return { ...state, topPosts: action.payload };
    case 'SET_LOADING_TOP_POSTS':
      return { ...state, loadingTopPosts: action.payload };
    case 'SET_POST_OPTIONS':
      return { ...state, postOptions: action.payload };
    case 'SET_POST_ABOUT':
      return { ...state, postAbout: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_ROLE_FILTER':
      return { ...state, roleFilter: action.payload };
    case 'SET_IS_SEARCHING':
      return { ...state, isSearching: action.payload };
    case 'RESET_SEARCH':
      return { ...state, searchQuery: '', isSearching: false };
    case 'RESET_ALL':
      return { ...initialState, topPosts: state.topPosts };
    default:
      return state;
  }
}

export function useCommunityController() {
  const { posts, fetchMore, refresh, loading: postsLoading, searchPosts, searchResults, loadingSearchResults, loadMoreSearchPosts } = usePost();
  const { account } = useAccount();
  const toast = useToast();
  const [state, dispatch] = useReducer(communityReducer, initialState);
  const scrollOffset = useRef(0);
  const isInstitution = account?.role === 'institution';

  const loadTopPosts = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_TOP_POSTS', payload: true });
      const data = await postRepository.fetchTopPosts();
      dispatch({ type: 'SET_TOP_POSTS', payload: Array.isArray(data) ? data : [] });
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao carregar posts populares');
    } finally {
      dispatch({ type: 'SET_LOADING_TOP_POSTS', payload: false });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadTopPosts();
      dispatch({ type: 'RESET_ALL' });
    }, [loadTopPosts])
  );

  const filterPostsByAccountType = useCallback((postsToFilter: IPost[]): IPost[] => {
    if (state.roleFilter === 'all') {
      return postsToFilter;
    }
    return postsToFilter.filter(post => {
      const account = typeof post.account === 'string' ? null : post.account;
      return account?.role === state.roleFilter;
    });
  }, [state.roleFilter]);

  const filteredPosts = useMemo(() => filterPostsByAccountType(posts), [posts, filterPostsByAccountType]);
  const filteredSearchResults = useMemo(() => filterPostsByAccountType(searchResults), [searchResults, filterPostsByAccountType]);

  const handleSearch = useCallback(async (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    
    if (!query.trim()) {
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
      return;
    }

    dispatch({ type: 'SET_IS_SEARCHING', payload: true });
    try {
      await searchPosts(query);
    } catch (error) {
      toast.error('Erro', 'Não foi possível buscar posts');
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
    }
  }, [searchPosts, toast]);

  const handleFilterChange = useCallback((filter: RoleFilter) => {
    dispatch({ type: 'SET_ROLE_FILTER', payload: filter });
  }, []);

  const handleClearSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
  }, []);

  const handleSearchSubmit = useCallback(() => {
    handleSearch(state.searchQuery);
  }, [handleSearch, state.searchQuery]);

  const handleFetchMore = useCallback(() => {
    if (state.isSearching) {
      loadMoreSearchPosts();
    } else {
      fetchMore();
    }
  }, [state.isSearching, loadMoreSearchPosts, fetchMore]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const threshold = 10;
    if (isInstitution) {
      return;
    }
    if (offsetY > scrollOffset.current + threshold) {
      dispatch({ type: 'SET_SHOW_ALERT_BUTTON', payload: false });
    } else if (offsetY < scrollOffset.current - threshold) {
      dispatch({ type: 'SET_SHOW_ALERT_BUTTON', payload: true });
    }
    scrollOffset.current = offsetY;
  }, [isInstitution]);

  const handleAbout = useCallback((postId?: string) => {
    const isSamePost = state.postAbout === postId ? '' : postId || '';
    dispatch({ type: 'SET_POST_ABOUT', payload: isSamePost });
    dispatch({ type: 'SET_POST_OPTIONS', payload: '' });
  }, [state.postAbout]);

  const handleSearchQueryChange = useCallback((text: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: text });
    if (!text.trim()) {
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
    }
  }, []);

  return {
    state,
    isInstitution,
    
    postsLoading,
    topPosts: state.topPosts,
    loadingTopPosts: state.loadingTopPosts,
    searchResults,
    loadingSearchResults,
    
    filteredPosts,
    filteredSearchResults,
    
    handleSearchSubmit,
    handleClearSearch,
    handleFilterChange,
    handleFetchMore,
    handleScroll,
    handleAbout,
    handleSearchQueryChange,
    
    refresh,
    loadTopPosts,
  };
}

