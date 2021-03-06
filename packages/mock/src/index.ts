export enum WhenAction {
  RETURN,
  ERROR,
}

export class When<ArgsT, ValueT> {
  constructor(
    public args: ArgsT,
    public action: WhenAction,
    public value: ValueT
  ) {}

  static calledWithThenReturn<ArgsT, ValueT>(args: ArgsT, value: ValueT) {
    return new When<ArgsT, ValueT>(args, WhenAction.RETURN, value);
  }

  static calledWithToThrow<ArgsT, ValueT>(args: ArgsT, value: ValueT) {
    return new When<ArgsT, ValueT>(args, WhenAction.ERROR, value);
  }

  getValue(): ValueT | Promise<ValueT> {
    switch (this.action) {
      case WhenAction.RETURN:
        return this.value;

      case WhenAction.ERROR:
        throw this.value;

      default:
        throw new Error(`Invalid action: ${this.action}`);
    }
  }
}

export class Mock<Fn extends (...args: any) => any> {
  private calls: Array<Parameters<Fn>> = [];
  private returns: Array<When<Parameters<Fn>, ReturnType<Fn>>> = [];

  constructor(private functionToMock: Fn) {}

  static of<Fn extends (...args: any) => any>(functionToMock: Fn) {
    return new Mock(functionToMock);
  }

  when(when: When<Parameters<Fn>, ReturnType<Fn>>) {
    this.returns.push(when);
  }

  whenCalledWithThenReturn(args: Parameters<Fn>, value: ReturnType<Fn>) {
    this.returns.push(When.calledWithThenReturn(args, value));
  }

  verify(args: Parameters<Fn>) {
    this.calls.find(x => x == args);
  }

  toString() {
    return `mocked function: "${this.functionToMock.name}"`;
  }

  get fn(): Fn {
    const fn: any = (...args: Parameters<Fn>) => {
      this.calls.push(args);

      const when = this.returns.find(
        when => JSON.stringify(when.args) === JSON.stringify(args)
      );

      if (!when) {
        throw new Error(
          `${this} has no matching setup for: ${JSON.stringify(args)}`
        );
      }

      return when.getValue();
    };

    Object.defineProperty(fn, 'name', {
      value: this.functionToMock.name,
      writable: false,
    });

    return fn;
  }
}
