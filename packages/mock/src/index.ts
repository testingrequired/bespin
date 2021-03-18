export enum WhenAction {
  RETURN,
  ERROR,
}

export class When<ArgsT, ValueT> {
  constructor(
    public args: ArgsT,
    public action: WhenAction,
    public value: ValueT | Error
  ) {}

  static calledWithThenReturn<ArgsT, ValueT>(args: ArgsT, value: ValueT) {
    return new When<ArgsT, ValueT>(args, WhenAction.RETURN, value);
  }

  static calledWithJustRuns<ArgsT, ValueT>(args: ArgsT) {
    return new When<ArgsT, ValueT>(args, WhenAction.RETURN, undefined as any);
  }

  static calledWithThenThrow<ArgsT, ValueT>(args: ArgsT, value: Error) {
    return new When<ArgsT, ValueT>(args, WhenAction.ERROR, value);
  }

  getValue(): ValueT {
    switch (this.action) {
      case WhenAction.RETURN:
        return this.value as ValueT;

      case WhenAction.ERROR:
        throw this.value;

      default:
        throw new Error(`Invalid action: ${this.action}`);
    }
  }
}

export class Mock<Fn extends (...args: any) => any> {
  private _calls: Array<Parameters<Fn>> = [];
  private _returns: Array<ReturnType<Fn>> = [];
  private whens: Array<When<Parameters<Fn>, ReturnType<Fn>>> = [];

  get calls() {
    return this._calls;
  }

  get returns() {
    return this._returns;
  }

  get name() {
    return this.functionToMock.name;
  }

  toString() {
    return `mocked function: "${this.name}"`;
  }

  constructor(private functionToMock: Fn) {
    if (typeof functionToMock !== 'function') {
      const errorType = Array.isArray(functionToMock)
        ? 'array'
        : typeof functionToMock;
      throw Error(`Must pass a function to mock. Received '${errorType}'`);
    }

    if (functionToMock.hasOwnProperty('mock')) {
      throw Error(
        `Tried to mock '${functionToMock.name}' but it appears to already be a mock`
      );
    }
  }

  static of<Fn extends (...args: any) => any>(functionToMock: Fn) {
    return new Mock(functionToMock);
  }

  when(when: When<Parameters<Fn>, ReturnType<Fn>>) {
    this.whens.push(when);
  }

  whenCalledWithThenReturn(args: Parameters<Fn>, value: ReturnType<Fn>) {
    this.whens.push(When.calledWithThenReturn(args, value));
  }

  whenCalledWithThenThrow(args: Parameters<Fn>, value: Error) {
    this.whens.push(When.calledWithThenThrow(args, value));
  }

  whenCalledWithJustRuns(args: Parameters<Fn>) {
    this.whens.push(When.calledWithJustRuns(args));
  }

  verify(args: Parameters<Fn>) {
    if (this._calls.find(x => this.matchArgs(x, args))) {
      return;
    }

    const typesString = this.getArgsString(args);

    throw new Error(`${this} has no calls for: [${typesString}]`);
  }

  verifyAll() {
    const uncalledWhens = this.whens.filter(
      when => !this._calls.some(call => this.matchArgs(call, when.args))
    );

    if (uncalledWhens.length === 0) {
      return;
    }

    const setupsString = uncalledWhens
      .map(when => `[${this.getArgsString(when.args)}] => ${when.value}`)
      .join(', ');

    throw new Error(
      `${this} has no calls for the following setups: ${setupsString}`
    );
  }

  private matchArgs(argsA: Parameters<Fn>, argsB: Parameters<Fn>): boolean {
    return argsA.every((arg: string, i: number) => {
      return arg === argsB[i];
    });
  }

  private getArgsString(args: Parameters<Fn>): string {
    return args
      .map((arg: any) => {
        const type = arg.constructor.name || typeof arg;
        const value = JSON.stringify(arg);

        return `${type}(${value})`;
      })
      .join(', ');
  }

  get fn(): Fn & { mock: Mock<Fn> } {
    const fn: any = (...args: Parameters<Fn>): ReturnType<Fn> => {
      this._calls.push(args);

      const when = this.whens.find(when => this.matchArgs(args, when.args));

      if (!when) {
        const typesString = this.getArgsString(args);

        throw new Error(`${this} has no matching setup for: [${typesString}]`);
      }

      const value = when.getValue();

      this._returns.push(value);

      return value;
    };

    Object.defineProperty(fn, 'name', {
      value: this.name === '' ? 'anonymous lambda' : this.name,
      writable: false,
    });

    fn.mock = this;

    return fn;
  }
}

export function mockFunction<T extends (...args: any) => any>(
  fn: T
): T & { mock: Mock<T> } {
  return Mock.of(fn).fn;
}

type MockedMethod<T> = Method<T, keyof T> & {
  mock: Mock<Method<T, keyof T>>;
};

type MockedObject<T> = T & Record<keyof T, MockedMethod<T>>;

export function mockObject<T>(targetClass: Constructor<T>): MockedObject<T> {
  const properies = Object.getOwnPropertyNames(targetClass.prototype);

  const mockedInstance: MockedObject<T> = properies.reduce((acc, property) => {
    const d = Object.getOwnPropertyDescriptor(targetClass.prototype, property);

    if (typeof d === 'undefined') {
      return acc;
    }

    switch (true) {
      case typeof d.get !== 'undefined':
        const obj = {
          get [property]() {
            return d?.get!;
          },
        };

        Object.defineProperty(acc, property, {
          enumerable: true,
          configurable: false,
          get: Mock.of(obj[property]).fn,
        });

        return acc;

      case typeof d.value !== 'undefined':
        return Object.assign({}, acc, {
          [property]: Mock.of(d?.value!).fn,
        });

      default:
        return acc;
    }
  }, {} as MockedObject<T>);

  Object.setPrototypeOf(mockedInstance, targetClass.prototype);

  return mockedInstance;
}

type Method<T, M extends keyof T> = T[M] extends (...args: any) => any
  ? T[M]
  : never;

type Constructor<T> = new (...args: any[]) => T;
