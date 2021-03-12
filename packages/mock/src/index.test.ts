import { Mock } from './index';

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
});
