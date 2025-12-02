/**
 * Utilitários para testes de integração
 * Helpers para renderizar providers, simular estados de rede, criar dados de teste
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AccountProvider } from '@/context/AccountContext';
import { PostProvider } from '@/context/PostContext';
import { CameraProvider } from '@/context/CameraContext';
import NetInfo from '@react-native-community/netinfo';
import { IAccount } from '@/models/IAccount';
import { IPost } from '@/models/IPost';
import { IPet } from '@/models/IPet';
import { IAccountPetInteraction } from '@/models/IAccountPetInteraction';
import { IHistory } from '@/models/IHistory';
import { IAchievement } from '@/models/IAchievement';

/**
 * Renderiza componente com todos os providers necessários
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { 
    initialAccount?: IAccount | null;
    mockNetInfo?: { isConnected: boolean };
  }
) {
  const { initialAccount, mockNetInfo, ...renderOptions } = options || {};

  if (mockNetInfo !== undefined) {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: mockNetInfo.isConnected,
    });
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <AccountProvider>
        <PostProvider>
          <CameraProvider>
            {children}
          </CameraProvider>
        </PostProvider>
      </AccountProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Simula estado de rede
 */
export function mockNetworkState(isConnected: boolean): void {
  (NetInfo.fetch as jest.Mock).mockResolvedValue({
    isConnected,
  });
}

/**
 * Cria dados de teste para IAccount
 */
export function createMockAccount(overrides?: Partial<IAccount>): IAccount {
  return {
    id: 'account-1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    phone_number: '11999999999',
    role: 'user',
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cria dados de teste para IPost
 */
export function createMockPost(overrides?: Partial<IPost>): IPost {
  return {
    id: 'post-1',
    content: 'Test post content',
    image: ['https://example.com/image.jpg'],
    account: createMockAccount(),
    likes: [],
    comments: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cria dados de teste para IPet
 */
export function createMockPet(overrides?: Partial<IPet>): IPet {
  return {
    id: 'pet-1',
    name: 'Test Pet',
    type: 'Cachorro',
    age: 2,
    gender: 'male',
    weight: 10,
    images: ['https://example.com/pet.jpg'],
    description: 'A test pet',
    adopted: false,
    account: 'account-1',
    adoptedAt: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cria dados de teste para IAccountPetInteraction
 */
export function createMockInteraction(
  overrides?: Partial<IAccountPetInteraction>
): IAccountPetInteraction {
  return {
    id: 'interaction-1',
    account: 'account-1',
    pet: 'pet-1',
    status: 'liked',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cria dados de teste para IHistory
 */
export function createMockHistory(overrides?: Partial<IHistory>): IHistory {
  return {
    id: 'history-1',
    type: 'donation',
    status: 'pending',
    pet: 'pet-1',
    account: 'account-1',
    amount: '100',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Cria dados de teste para IAchievement
 */
export function createMockAchievement(
  overrides?: Partial<IAchievement>
): IAchievement {
  return {
    id: 'achievement-1',
    name: 'Test Achievement',
    description: 'A test achievement',
    type: 'donation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Helper para aguardar operações assíncronas
 */
export async function waitForAsync(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper para criar array de dados mockados
 */
export function createMockArray<T>(
  factory: (index: number) => T,
  count: number
): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

/**
 * Dados mockados globais para uso nos testes
 * Permite que mocks de API retornem dados consistentes
 */
let globalMockData: {
  account: IAccount;
  pet: IPet;
  interactions: IAccountPetInteraction[];
  posts: IPost[];
  history: IHistory;
  achievement: IAchievement;
} | null = null;

/**
 * Popula o mockDb com dados mínimos para testes
 * Garante que todas as tabelas tenham pelo menos dados básicos
 * Também armazena os dados globalmente para uso nos mocks de API
 */
export function seedMockData(mockDb: any): void {
  const account = createMockAccount({ id: 'account-1', name: 'Test User' });
  const pets = [createMockPet({ id: 'pet-1', account: account.id })];
  
  // Interactions com dados explícitos conforme solicitado
  const interactions: IAccountPetInteraction[] = [
    {
      id: 'interaction-1',
      account: account.id,
      pet: pets[0].id,
      status: 'liked' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'interaction-2',
      account: account.id,
      pet: pets[0].id,
      status: 'viewed' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  
  // Posts com dados explícitos conforme solicitado
  const posts: IPost[] = [
    {
      id: 'post-1',
      account: account,
      content: 'Primeiro post mock!',
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'post-2',
      account: account,
      content: 'Segundo post mock!',
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'post-3',
      account: account,
      content: 'Terceiro post mock!',
      likes: ['user-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  
  const history = createMockHistory({ 
    id: 'history-1',
    account: account.id,
    pet: pets[0].id 
  });
  const achievement = createMockAchievement({ id: 'achievement-1' });

  // Armazena globalmente para uso nos mocks
  globalMockData = {
    account,
    pet: pets[0],
    interactions,
    posts,
    history,
    achievement
  };

  // Popula as tabelas do mockDb
  mockDb.setTableData('accounts', [account]);
  mockDb.setTableData('pets', pets);
  
  // Interactions no formato correto para o mockDb (pet como string)
  // IMPORTANTE: Garante que interactions sejam inseridas localmente no mockDb
  const interactionsForDb = interactions.map(i => ({
    id: i.id,
    account: i.account,
    pet: typeof i.pet === 'string' ? i.pet : (i.pet as any)?.id || pets[0].id,
    status: i.status,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt || i.createdAt,
  }));
  // Garante que as interactions sejam realmente inseridas no mockDb
  mockDb.setTableData('account_pet_interactions', interactionsForDb);
  
  // Posts também são salvos no mockDb para uso nos testes
  mockDb.setTableData('posts', posts);
  
  mockDb.setTableData('history', [history]);
  mockDb.setTableData('achievements', [achievement]);
}

/**
 * Retorna os dados mockados globais
 * Útil para mocks de API retornarem dados consistentes
 */
export function getMockData() {
  if (!globalMockData) {
    // Se não foi inicializado, cria dados básicos
    const mockDb = require('./mockLocalDb').getMockLocalDb();
    seedMockData(mockDb);
  }
  return globalMockData!;
}

/**
 * Reseta os dados mockados globais
 */
export function resetMockData(): void {
  globalMockData = null;
}

