import { withGlobals } from "./withGlobals";

declare var global: Record<string, any>;

describe("withGlobals", () => {
  const expectedGlobal = "expectedGlobalValue";

  it("should call fn", async () => {
    const mock = jest.fn();

    await withGlobals({}, mock);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith();
  });

  it("should set global value inside fn", async () => {
    await withGlobals({ globalA: expectedGlobal }, async () => {
      expect(global.globalA).toBe(expectedGlobal);
    });
  });

  it("should delete new global value after fn", async () => {
    await withGlobals({ globalA: expectedGlobal }, jest.fn());

    expect(global.globalA).toBeUndefined();
  });

  it("should reset existing globals after fn", async () => {
    global.globalB = expectedGlobal;

    await withGlobals({ globalB: "newValue" }, jest.fn());

    expect(global.globalB).toBe(expectedGlobal);
  });
});
