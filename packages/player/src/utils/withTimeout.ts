export const withTimeout = <T>(
  work: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;

  const expiry = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([work, expiry]).finally(() =>
    clearTimeout(timer),
  ) as Promise<T>;
};
