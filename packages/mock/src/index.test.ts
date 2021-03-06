import { Mock } from './index';

describe('Mock', () => {
  async function test(_: string): Promise<number> {
    return 10;
  }

  it('has original function name', () => {
    function test(_: string): number {
      return 10;
    }

    const mock = Mock.of(test);

    expect(mock.fn.name).toBe('test');
  });

  it('works with a method', () => {
    class TestClass {
      getValue() {
        return 'wrongValue';
      }
    }

    const mock = Mock.of(new TestClass().getValue);

    mock.whenCalledWithThenReturn([], 'rightValue');

    expect(mock.fn()).toBe('rightValue');
  });

  describe('when call does not match when setup', () => {
    it('should throw', () => {
      function test(_: string): number {
        return 10;
      }

      const mock = Mock.of(test);

      expect(() => {
        mock.fn('');
      }).toThrowError(
        'mocked function: "test" has no matching setup for: [""]'
      );
    });
  });

  describe('when call matches when setup', () => {
    it('should return value', async () => {
      function test(_: string): number {
        return 10;
      }

      const mock = Mock.of(test);

      mock.whenCalledWithThenReturn([''], 100);

      expect(mock.fn('')).toEqual(100);
    });

    it('should return promise value', async () => {
      const mock = Mock.of(test);

      mock.whenCalledWithThenReturn([''], Promise.resolve(100));

      expect(await mock.fn('')).toEqual(100);
    });
  });
});
