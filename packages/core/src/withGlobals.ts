declare const global: Record<string, unknown>;

export async function withGlobals<T>(
  globals: Record<string, unknown>,
  fn: () => T
): Promise<T> {
  const originals: Record<string, unknown> = {};

  Object.entries(globals).forEach(([key, value]) => {
    if (global[key]) {
      originals[key] = global[key];
    }

    global[key] = value;
  });

  const result = await fn();

  Object.entries(globals).forEach(([key]) => {
    if (originals[key]) {
      global[key] = originals[key];
    } else {
      delete global[key];
    }
  });

  return result;
}
