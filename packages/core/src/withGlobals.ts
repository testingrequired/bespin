declare var global: Record<string, any>;

export async function withGlobals<T>(
  globals: Record<string, any>,
  fn: () => T
): Promise<T> {
  const originals: Record<string, any> = {};

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
