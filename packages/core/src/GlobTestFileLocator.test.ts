import { GlobTestFileLocator } from './GlobTestFileLocator';

jest.mock('glob');

const glob = require('glob');

describe('GlobTestFileLocator', () => {
  const expectedPattern = 'expectedPattern';
  const expectedFilePaths = ['one', 'two'];

  let locator: GlobTestFileLocator;

  beforeEach(() => {
    (glob as jest.Mock).mockImplementation((_, callback) => {
      callback(null, expectedFilePaths);
    });

    locator = new GlobTestFileLocator(expectedPattern);
  });

  it('should pass pattern to glob', async () => {
    await locator.locateTestFilePaths();

    expect(glob).toBeCalledWith(expectedPattern, expect.any(Function));
  });

  it('should pass default pattern to glob when no pattern given', async () => {
    const locator = new GlobTestFileLocator();

    await locator.locateTestFilePaths();

    expect(glob).toBeCalledWith('**/*.test.js', expect.any(Function));
  });

  it('should return values from glob', async () => {
    const filePaths = await locator.locateTestFilePaths();

    expect(filePaths).toStrictEqual(expectedFilePaths);
  });
});
