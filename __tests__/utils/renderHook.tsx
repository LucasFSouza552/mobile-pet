import React from 'react';
import { render, waitFor as rnWaitFor } from '@testing-library/react-native';
import { act as rnAct } from '@testing-library/react-native';
import { View } from 'react-native';

export { rnWaitFor as waitFor };

export function renderHook<T>(
  hook: () => T,
  options?: { wrapper?: React.ComponentType<any> }
) {
  const result: { current: T } = { current: null as any };
  let hookFn = hook;

  const TestComponent = () => {
    result.current = hookFn();
    return <View testID="hook-test-component" />;
  };

  const DefaultWrapper = ({ children }: { children: React.ReactNode }) => (
    <View testID="hook-wrapper">{children}</View>
  );
  const Wrapper = options?.wrapper || DefaultWrapper;

  const { rerender, unmount } = render(
    <Wrapper>
      <TestComponent />
    </Wrapper>
  );

  return {
    result,
    rerender: (newHook?: () => T) => {
      if (newHook) {
        hookFn = newHook;
      }
      rerender(
        <Wrapper>
          <TestComponent />
        </Wrapper>
      );
    },
    unmount,
    act: rnAct,
    waitFor: rnWaitFor,
  };
}

