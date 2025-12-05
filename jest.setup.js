import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()),
  },
  useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

jest.mock('expo-sqlite', () => ({
  __esModule: true,
  default: {
    openDatabase: jest.fn(() => ({
      transaction: jest.fn((callback) => {
        callback({
          executeSql: jest.fn(),
        });
      }),
    })),
  },
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
    hide: jest.fn(),
  },
}));

jest.mock('expo', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {},
    manifest: {},
  },
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Appearance = {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
    removeChangeListener: jest.fn(),
  };
  return RN;
});

jest.mock('expo-camera', () => ({
  __esModule: true,
  Camera: {
    Constants: {
      Type: { back: 'back', front: 'front' },
    },
  },
}));

jest.mock('expo-image-picker', () => ({
  __esModule: true,
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('expo-location', () => ({
  __esModule: true,
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 0, longitude: 0 },
  })),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    })),
  },
}));

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

