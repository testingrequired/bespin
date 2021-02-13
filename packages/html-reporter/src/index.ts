import fs from 'fs';
import path from 'path';
import {
  Reporter,
  TestInTestFile,
  TestResult,
} from '@testingrequired/bespin-core';
import pug from 'pug';

export class HtmlReporter extends Reporter {
  constructor(private fileName: string = 'report.html') {
    super();
  }

  onRunEnd(results: Array<[TestInTestFile, TestResult]>) {
    const html = pug.renderFile(path.join(__dirname, './report.pug'), {
      results,
    });

    fs.writeFileSync(path.join(process.cwd(), this.fileName), html);
  }
}
