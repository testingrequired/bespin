import fs from 'fs';
import path from 'path';
import {
  Reporter,
  TestInTestFile,
  TestResult,
  ValidConfig,
} from '@testingrequired/bespin-core';
import pug from 'pug';

export class HtmlReporter extends Reporter {
  private config?: ValidConfig;

  constructor(private fileName: string = 'report.html') {
    super();
  }

  onRunStart(config: ValidConfig) {
    this.config = config;
  }

  onRunEnd(results: Array<[TestInTestFile, TestResult]>) {
    const html = pug.renderFile(path.join(__dirname, './report.pug'), {
      results,
      config: this.config,
    });

    fs.writeFileSync(path.join(process.cwd(), this.fileName), html);
  }
}
