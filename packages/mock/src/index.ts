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

  constructor(private functionToMock: Fn) {
    if (typeof functionToMock !== 'function') {
      const errorType = Array.isArray(functionToMock)
        ? 'array'
        : typeof functionToMock;
      throw Error(`Must pass a function to mock. Received '${errorType}'`);
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
    this._calls.find(x => x == args);
  }

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

  get fn(): Fn {
    const fn: any = (...args: Parameters<Fn>) => {
      this._calls.push(args);

      const when = this.whens.find(when =>
        when.args.every((arg: string, i: number) => {
          return arg === args[i];
        })
      );

      if (!when) {
        const typesString = args
          .map((arg: any) => {
            const type = arg.constructor.name || typeof arg;
            const value = JSON.stringify(arg);

            return `${type}(${value})`;
          })
          .join(', ');

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

    return fn;
  }
}
