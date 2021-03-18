import { Mock, mockFunction, mockObject } from './index';

describe('Mock', () => {
  describe('Construct', () => {
    it('should not error if named function', () => {
      expect(() => Mock.of(function test() {})).not.toThrowError();
    });

    it('should not error if named lambda', () => {
      const test = () => {};
      expect(() => Mock.of(test)).not.toThrowError();
    });

    it('should not error if method', () => {
      const obj = { test() {} };
      expect(() => Mock.of(obj.test)).not.toThrowError();
    });

    it('should not error if anonymous lambda', () => {
      expect(() => Mock.of(() => {})).not.toThrowError();
    });

    it('should error if mock', () => {
      expect(() => Mock.of(Mock.of(() => {}).fn)).toThrowError(
        "Tried to mock 'anonymous lambda' but it appears to already be a mock"
      );
    });

    it('should error if a number', () => {
      expect(() => Mock.of(123 as any)).toThrowError(
        "Must pass a function to mock. Received 'number'"
      );
    });

    it('should error if a string', () => {
      expect(() => Mock.of('' as any)).toThrowError(
        "Must pass a function to mock. Received 'string'"
      );
    });

    it('should error if a object', () => {
      expect(() => Mock.of({} as any)).toThrowError(
        "Must pass a function to mock. Received 'object'"
      );
    });

    it('should error if a array', () => {
      expect(() => Mock.of([] as any)).toThrowError(
        "Must pass a function to mock. Received 'array'"
      );
    });
  });

  describe('fn', () => {
    describe('name', () => {
      it('should work with named functions', () => {
        function test() {}

        const mock = Mock.of(test);

        expect(mock.fn.name).toBe('test');
      });

      it('should work with named lambdas', () => {
        const testLambda = () => {};

        const mock = Mock.of(testLambda);

        expect(mock.fn.name).toBe('testLambda');
      });

      it('should work with methods', () => {
        const obj = {
          testMethod() {},
        };

        const mock = Mock.of(obj.testMethod);

        expect(mock.fn.name).toBe('testMethod');
      });

      it('should work with anonymous lambda', () => {
        const mock = Mock.of(() => {});

        expect(mock.fn.name).toBe('anonymous lambda');
      });
    });

    describe('call', () => {
      describe('when does not match when setup', () => {
        it('should throw if value doesnt match', () => {
          function test(_: string): number {
            return 10;
          }

          const mock = Mock.of(test);

          expect(() => {
            mock.fn('');
          }).toThrowError(
            'mocked function: "test" has no matching setup for: [String("")]'
          );
        });

        it('should throw if reference doesnt match', () => {
          class CustomThing {
            // @ts-ignore
            constructor(private value: string) {}
          }

          function test(_: number, __: CustomThing, ___: string) {}

          const mock = Mock.of(test);

          const custom = new CustomThing('foo');

          mock.whenCalledWithThenReturn([100, custom, 'stringValue']);

          const custom2 = new CustomThing('bar');

          expect(() => {
            mock.fn(100, custom2, '');
          }).toThrowError(
            'mocked function: "test" has no matching setup for: [Number(100), CustomThing({"value":"bar"}), String("")]'
          );
        });
      });

      describe('when matches when setup', () => {
        describe('whenCalledWithThenReturn', () => {
          it('should not throw', async () => {
            function test(_: string): number {
              return 10;
            }

            const mock = Mock.of(test);

            mock.whenCalledWithThenReturn([''], 100);

            expect(() => {
              mock.fn('');
            }).not.toThrowError();
          });

          it('should return value', async () => {
            function test(_: string): number {
              return 10;
            }

            const mock = Mock.of(test);

            mock.whenCalledWithThenReturn([''], 100);

            expect(mock.fn('')).toEqual(100);
          });

          it('should return value from first when if there are multiple', async () => {
            function test(_: string): number {
              return 10;
            }

            const mock = Mock.of(test);

            mock.whenCalledWithThenReturn([''], 100);
            mock.whenCalledWithThenReturn([''], 1000);

            expect(mock.fn('')).toEqual(100);
          });

          describe('calls', () => {
            it('should have record of all calls made', () => {
              function test(_: number) {}

              const mock = Mock.of(test);

              mock.whenCalledWithThenReturn([1]);
              mock.whenCalledWithThenReturn([2]);
              mock.whenCalledWithThenReturn([3]);

              mock.fn(1);
              mock.fn(2);
              mock.fn(3);

              expect(mock.calls).toStrictEqual([[1], [2], [3]]);
            });
          });

          describe('returns', () => {
            it('should have record of all calls made', () => {
              function test(_: string): number {
                return NaN;
              }

              const mock = Mock.of(test);

              mock.whenCalledWithThenReturn(['a'], 1);
              mock.whenCalledWithThenReturn(['b'], 2);
              mock.whenCalledWithThenReturn(['c'], 3);

              mock.fn('a');
              mock.fn('b');
              mock.fn('b');
              mock.fn('c');

              expect(mock.returns).toStrictEqual([1, 2, 2, 3]);
            });
          });
        });

        describe('whenCalledWithJustRuns', () => {
          it('should not throw', async () => {
            function test(_: string): number {
              return 10;
            }

            const mock = Mock.of(test);

            mock.whenCalledWithJustRuns(['']);

            expect(() => {
              mock.fn('');
            }).not.toThrowError();
          });

          it('should return undefined', () => {
            function test(_: string): number {
              return 10;
            }

            const mock = Mock.of(test);

            mock.whenCalledWithJustRuns(['']);

            expect(mock.fn('')).toBeUndefined();
          });
        });

        describe('whenCalledWithThenThrow', () => {
          it('should throw', async () => {
            function test(_: string): number {
              return 10;
            }

            const mock = Mock.of(test);

            const expectedError = new Error('Expected Error');

            mock.whenCalledWithThenThrow([''], expectedError);

            expect(() => {
              mock.fn('');
            }).toThrowError(expectedError);
          });
        });
      });
    });
  });

  describe('verify', () => {
    it('should throw if function wasnt called', () => {
      function test(_: string): number {
        return 10;
      }

      const mock = Mock.of(test);

      expect(() => {
        mock.verify(['']);
      }).toThrowError('mocked function: "test" has no calls for: [String("")]');
    });

    it('should not throw if function was called', () => {
      function test(_: string): number {
        return 10;
      }

      const mock = Mock.of(test);

      mock.whenCalledWithThenReturn([''], 1);

      mock.fn('');

      expect(() => {
        mock.verify(['']);
      }).not.toThrowError();
    });
  });

  describe('verifyAll', () => {
    it('should not throw if when condition is met by mock calls', () => {
      function test(_: string): number {
        return 10;
      }

      const mock = Mock.of(test);

      mock.whenCalledWithThenReturn([''], 1);

      mock.fn('');

      expect(() => {
        mock.verifyAll();
      }).not.toThrowError();
    });

    it('should throw if when condition not met by mock calls', () => {
      function test(_: string): number {
        return 10;
      }

      const mock = Mock.of(test);

      mock.whenCalledWithThenReturn([''], 1);
      mock.whenCalledWithThenReturn(['foo'], 2);
      mock.whenCalledWithThenReturn(['bar'], 3);
      mock.whenCalledWithThenThrow(['err'], new Error('Error message'));

      mock.fn('');

      expect(() => {
        mock.verifyAll();
      }).toThrowError(
        'mocked function: "test" has no calls for the following setups: [String("foo")] => 2, [String("bar")] => 3, [String("err")] => Error: Error message'
      );
    });
  });
});

describe('mockObject', () => {
  it('should be instanceof', () => {
    class Target {}

    const mock = mockObject(Target);

    expect(mock instanceof Target).toBeTruthy();
  });

  it('should be instanceof a parent', () => {
    class Parent {}
    class Target extends Parent {}

    const mock = mockObject(Target);

    expect(mock instanceof Parent).toBeTruthy();
  });

  it('should work on class method', () => {
    class Target {
      foo(): string {
        return 'bar';
      }
    }

    const mock = mockObject(Target);

    mock.foo.mock.whenCalledWithThenReturn([], 'baz');

    expect(mock.foo()).toBe('baz');
  });
});

describe('mockFunction', () => {
  it('should has mock property', () => {
    function test(a: number, b: number): number {
      return a + b;
    }

    const mock = mockFunction(test);

    expect(mock.mock).toBeInstanceOf(Mock);
  });
});
