import os from "os";
import { join } from "path";
import {
  Runner,
  RuntimeEventEmitter,
  TestInTestFile,
  TestResult,
  Events,
} from "@testingrequired/bespin-core";
import { WorkerPool } from "./WorkerPool";
import { workerPath } from "./workerPath";

type WorkerTestInTestFile = Pick<TestInTestFile, "testFilePath" | "testName">;

export type WorkerData = {
  testInTestFile: WorkerTestInTestFile;
  configFilePath: string;
};

export type WorkerResult = [TestInTestFile, TestResult];

export class ParallelRunner extends Runner {
  constructor(private configFilePath: string, private numberOfWorkers: number) {
    super();

    if (numberOfWorkers <= 0) {
      throw Error("Number of workers must be 1 or more");
    }
  }

  async run(
    testsInTestFiles: Array<TestInTestFile>,
    _: number,
    events: RuntimeEventEmitter
  ): Promise<Array<WorkerResult>> {
    const pool = new WorkerPool<WorkerData, WorkerResult>(
      workerPath,
      Math.min(testsInTestFiles.length, os.cpus().length, this.numberOfWorkers)
    );

    events.emit(Events.runStart, testsInTestFiles);

    const workers = testsInTestFiles.map((testInTestFile) =>
      this.runTestInTestFile(pool, testInTestFile, events)
    );

    const results = await Promise.all(workers);

    events.emit(Events.runEnd, results);

    return results;
  }

  private runTestInTestFile(
    pool: WorkerPool<WorkerData, WorkerResult>,
    testInTestFile: TestInTestFile,
    events: RuntimeEventEmitter
  ): Promise<WorkerResult> {
    return pool
      .run(() => {
        events.emit(Events.testStart, testInTestFile);

        const testFilePath = join(process.cwd(), testInTestFile.testFilePath);

        const testInTestFileForWorker = {
          testName: testInTestFile.testName,
          testFilePath,
        };

        const workerData = {
          testInTestFile: testInTestFileForWorker,
          configFilePath: this.configFilePath,
        };

        return workerData;
      })
      .then((testInTestFileResult) => {
        const [testInTestFile, result] = testInTestFileResult;

        /**
         * Provide a cleaner test name in results
         */
        const fixedTestFilePath = testInTestFile.testFilePath
          .replace(process.cwd(), "")
          .slice(1);

        const fixedTestInTestFile = {
          testFilePath: fixedTestFilePath,
          testName: testInTestFile.testName,
          testFn: testInTestFile.testFn,
        };

        events.emit(Events.testEnd, fixedTestInTestFile, result);

        return [fixedTestInTestFile, result];
      });
  }
}
