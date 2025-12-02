import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SecondaryButton from '@/components/Buttons/SecondaryButton';
import { ThemeProvider } from '@/context/ThemeContext';

describe('SecondaryButton', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('deve renderizar texto corretamente', async () => {
    const { getByText } = renderWithTheme(
      <SecondaryButton text="Cancelar" onPress={() => {}} />
    );
    
    await waitFor(() => {
      expect(getByText('Cancelar')).toBeTruthy();
    });
  });

  it('deve chamar onPress quando pressionado', async () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <SecondaryButton text="Cancelar" onPress={onPress} />
    );

    await waitFor(() => {
      expect(getByText('Cancelar')).toBeTruthy();
    });

    fireEvent.press(getByText('Cancelar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar com diferentes textos', async () => {
    const { getByText, rerender } = renderWithTheme(
      <SecondaryButton text="Texto 1" onPress={() => {}} />
    );
    
    await waitFor(() => {
      expect(getByText('Texto 1')).toBeTruthy();
    });

    rerender(
      <ThemeProvider>
        <SecondaryButton text="Texto 2" onPress={() => {}} />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Texto 2')).toBeTruthy();
    });
  });
});

