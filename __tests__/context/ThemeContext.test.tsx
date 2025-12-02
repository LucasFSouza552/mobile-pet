import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { getStorage, saveStorage } from '@/utils/storange';

jest.mock('@/utils/storange');

const TestComponent = () => {
  const theme = useTheme();
  return <Text>{theme.theme}</Text>;
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getStorage as jest.Mock).mockResolvedValue(null);
  });

  it('deve renderizar provider sem erros', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('light')).toBeTruthy();
    });
  });

  it('deve carregar tema salvo do storage', async () => {
    (getStorage as jest.Mock).mockResolvedValue('dark');
    
    const { getByText } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('dark')).toBeTruthy();
    });
  });

  it('deve usar tema do sistema quando não há preferência salva', async () => {
    (getStorage as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('light')).toBeTruthy();
    });
  });

  it('deve fornecer todas as propriedades do tema', async () => {
    const TestProps = () => {
      const theme = useTheme();
      expect(typeof theme.toggleTheme).toBe('function');
      expect(typeof theme.setThemeMode).toBe('function');
      expect(theme.SPACING).toBeDefined();
      expect(theme.FONT_SIZE).toBeDefined();
      expect(theme.COLORS).toBeDefined();
      return <Text>{theme.theme}</Text>;
    };

    const { getByText } = render(
      <ThemeProvider>
        <TestProps />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('light')).toBeTruthy();
    });
  });

  it('deve lançar erro quando useTheme é usado fora do provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme deve ser usado dentro de ThemeProvider');
    
    consoleError.mockRestore();
  });

  it('deve fornecer função toggleTheme', async () => {
    const TestToggle = () => {
      const theme = useTheme();
      expect(typeof theme.toggleTheme).toBe('function');
      expect(typeof theme.setThemeMode).toBe('function');
      return <Text>{theme.theme}</Text>;
    };

    const { getByText } = render(
      <ThemeProvider>
        <TestToggle />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('light')).toBeTruthy();
    });
  });
});

