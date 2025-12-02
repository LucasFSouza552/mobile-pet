import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { CameraProvider, useCamera } from '@/context/CameraContext';

const TestComponent = () => {
  const { isCameraOpen } = useCamera();
  return <Text>{isCameraOpen ? 'open' : 'closed'}</Text>;
};

describe('CameraContext', () => {
  it('deve renderizar provider sem erros', () => {
    const { getByText } = render(
      <CameraProvider>
        <TestComponent />
      </CameraProvider>
    );
    expect(getByText('closed')).toBeTruthy();
  });

  it('deve fornecer isCameraOpen como false inicialmente', () => {
    const { getByText } = render(
      <CameraProvider>
        <TestComponent />
      </CameraProvider>
    );
    expect(getByText('closed')).toBeTruthy();
  });

  it('deve lançar erro quando useCamera é usado fora do provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCamera must be used within CameraProvider');
    
    consoleError.mockRestore();
  });
});

