import { act, renderHook } from '@testing-library/react';

import { MOBILE_MEDIA_QUERY, useIsMobile } from './useIsMobile';

type ChangeListener = () => void;

const mockMatchMedia = (initialMatches: boolean) => {
  const listeners = new Set<ChangeListener>();
  const state = { matches: initialMatches };

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return state.matches;
    },
    media: query,
    addEventListener: (_event: string, listener: ChangeListener) =>
      listeners.add(listener),
    removeEventListener: (_event: string, listener: ChangeListener) =>
      listeners.delete(listener),
  }));

  return {
    setMatches(matches: boolean) {
      state.matches = matches;
      listeners.forEach((listener) => listener());
    },
  };
};

describe('useIsMobile', () => {
  it('is false on wide screens', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
    expect(window.matchMedia).toHaveBeenCalledWith(MOBILE_MEDIA_QUERY);
  });

  it('is true on phone-sized screens', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('updates when the screen crosses the breakpoint', () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());

    act(() => media.setMatches(true));

    expect(result.current).toBe(true);
  });
});
