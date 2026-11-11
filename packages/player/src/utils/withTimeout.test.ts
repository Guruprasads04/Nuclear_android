import { withTimeout } from './withTimeout';

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with the value when the work finishes in time', async () => {
    const result = withTimeout(Promise.resolve('done'), 1000, 'too slow');

    await expect(result).resolves.toBe('done');
  });

  it('rejects with the message once the timeout passes', async () => {
    const result = withTimeout(new Promise(() => {}), 1000, 'too slow');
    const assertion = expect(result).rejects.toThrow('too slow');

    await vi.advanceTimersByTimeAsync(1000);

    await assertion;
  });

  it('passes through the original failure', async () => {
    const result = withTimeout(
      Promise.reject(new Error('network down')),
      1000,
      'too slow',
    );

    await expect(result).rejects.toThrow('network down');
  });
});
