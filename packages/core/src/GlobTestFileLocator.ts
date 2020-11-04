import { promisify } from 'util';
const glob = require('glob');
import { TestFileLocator } from './TestFileLocator';

const globPromise = promisify(glob);

export class GlobTestFileLocator extends TestFileLocator {
  private pattern: string;

  constructor(pattern = '**/*.test.js') {
    super();

    this.pattern = pattern;
  }

  locateTestFilePaths() {
    return globPromise(this.pattern);
  }
}
