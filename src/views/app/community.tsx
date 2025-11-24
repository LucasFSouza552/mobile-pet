import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PostList from '../../components/Cards/PostList';
import TopPostCard from '../../components/Cards/TopPostCard';
import { useAccount } from '../../context/AccountContext';
import { useCommunityController } from './community/useCommunityController';

interface CommunityPageProps {
  navigation: any;
}

export default function Community({ navigation }: CommunityPageProps) {
  const { account, loading } = useAccount();
  const {
    state,
    isInstitution,
    postsLoading,
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
  } = useCommunityController();

  useEffect(() => {
    if (!loading && !account) {
      navigation.navigate('Welcome');
    }
  }, [loading, account, navigation]);

  if (!account) {
    return null;
  }

  const renderHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar posts..."
            placeholderTextColor="#999"
            value={state.searchQuery}
            onChangeText={handleSearchQueryChange}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />
          {state.searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <FontAwesome name="times-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, state.searchQuery.trim().length === 0 && styles.searchButtonDisabled]}
          onPress={handleSearchSubmit}
          disabled={state.searchQuery.trim().length === 0}
        >
          <FontAwesome name="search" size={16} color="#fff" />
          <Text style={styles.searchButtonText}>Pesquisar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterButton, state.roleFilter === 'all' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, state.roleFilter === 'all' && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, state.roleFilter === 'user' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('user')}
          >
            <Text style={[styles.filterText, state.roleFilter === 'user' && styles.filterTextActive]}>
              Usuários
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, state.roleFilter === 'institution' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('institution')}
          >
            <Text style={[styles.filterText, state.roleFilter === 'institution' && styles.filterTextActive]}>
              Instituições
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, state.roleFilter === 'admin' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('admin')}
          >
            <Text style={[styles.filterText, state.roleFilter === 'admin' && styles.filterTextActive]}>
              Administradores
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {state.topPosts.length > 0 && (
        <View style={styles.topPostsSection}>
          <View style={styles.topPostsHeader}>
            <FontAwesome name="fire" size={20} color="#B648A0" />
            <Text style={styles.topPostsTitle}>Posts em Destaque</Text>
          </View>
          {state.loadingTopPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#B648A0" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topPostsScroll}
            >
              {state.topPosts.map((post, index) => (
                <TopPostCard
                  key={post.id}
                  post={post}
                  index={index}
                  onPress={() => {
                    handleAbout(post.id);
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FontAwesome name="paw" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Comunidade myPets</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        {!state.isSearching && (
          <PostList
            title="Comunidade"
            posts={filteredPosts}
            account={account}
            onEndReached={handleFetchMore}
            onRefresh={refresh}
            refreshing={postsLoading}
            onScroll={handleScroll}
            headerComponent={renderHeader()}
          />
        )}
        {state.isSearching && (
          <>
            {filteredSearchResults.length > 0 && (
              <>
                <PostList
                  title={`Resultados da busca${state.searchQuery ? `: "${state.searchQuery}"` : ''}`}
                  posts={filteredSearchResults}
                  account={account}
                  onEndReached={handleFetchMore}
                  onRefresh={undefined}
                  refreshing={false}
                  onScroll={handleScroll}
                  headerComponent={renderHeader()}
                />
                {loadingSearchResults && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#B648A0" />
                    <Text style={styles.loadingMoreText}>Carregando mais resultados...</Text>
                  </View>
                )}
              </>
            )}
            {filteredSearchResults.length === 0 && (
              <PostList
                title={`Resultados da busca${state.searchQuery ? `: "${state.searchQuery}"` : ''}`}
                posts={[]}
                account={account}
                onScroll={handleScroll}
                headerComponent={renderHeader()}
                emptyMessage={loadingSearchResults ? undefined : 'Nenhum resultado encontrado.'}
              />
            )}
          </>
        )}
      </View>
      {!isInstitution && state.showAlertButton && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.getParent()?.navigate("CreateNotification")}
          accessibilityLabel="Criar notificação"
        >
          <FontAwesome name="bell" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#2c2a2e',
    flex: 1,
  },
  header: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B648A0',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  topPostsSection: {
    width: '100%',
    paddingVertical: 12,
  },
  topPostsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
    gap: 8,
  },
  topPostsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  topPostsScroll: {
    paddingHorizontal: 12,
    gap: 12,
  },
  topPostCard: {
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 6,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    backgroundColor: '#363135',
    borderRadius: 10,
    padding: 12,
    zIndex: 10,
    elevation: 4,
  },
  menuTitle: {
    color: '#B648A0',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#B648A0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  menuItemText: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#363135',
    borderRadius: 10,
    padding: 15,
  },
  postCard: {
    backgroundColor: '#2c2a2e',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postUser: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  postText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: 5,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  communityText: {
    color: '#fff',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#B648A0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#2c2a2e',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363135',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#4A3A46',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B648A0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    minWidth: 100,
  },
  searchButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#2c2a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#363135',
  },
  filterScroll: {
    paddingHorizontal: 15,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#363135',
    borderWidth: 1,
    borderColor: '#4A3A46',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#B648A0',
    borderColor: '#B648A0',
  },
  filterText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  noResultsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingMoreText: {
    color: '#B648A0',
    fontSize: 14,
    fontWeight: '500',
  },
});

