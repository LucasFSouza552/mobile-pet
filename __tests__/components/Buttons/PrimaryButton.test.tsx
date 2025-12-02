import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { ThemeProvider } from '@/context/ThemeContext';

describe('PrimaryButton', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('deve renderizar texto corretamente', async () => {
    const { getByText } = renderWithTheme(
      <PrimaryButton text="Clique aqui" onPress={() => {}} />
    );
    
    await waitFor(() => {
      expect(getByText('Clique aqui')).toBeTruthy();
    });
  });

  it('deve chamar onPress quando pressionado', async () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <PrimaryButton text="Clique aqui" onPress={onPress} />
    );

    await waitFor(() => {
      expect(getByText('Clique aqui')).toBeTruthy();
    });

    fireEvent.press(getByText('Clique aqui'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar com diferentes textos', async () => {
    const { getByText, rerender } = renderWithTheme(
      <PrimaryButton text="Texto 1" onPress={() => {}} />
    );
    
    await waitFor(() => {
      expect(getByText('Texto 1')).toBeTruthy();
    });

    rerender(
      <ThemeProvider>
        <PrimaryButton text="Texto 2" onPress={() => {}} />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Texto 2')).toBeTruthy();
    });
  });
});
