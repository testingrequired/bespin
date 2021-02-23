import { EventEmitter } from "events";
import { ValidConfig } from "./Config";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult } from "./TestResult";

export class RuntimeEventEmitter extends EventEmitter {}

export declare interface RuntimeEventEmitter {
  emit(event: "runtimeStart", config: ValidConfig): boolean;
  on(event: "runtimeStart", listener: (config: ValidConfig) => void): this;

  emit(event: "runStart", testsInTestFiles: Array<TestInTestFile>): boolean;
  on(
    event: "runStart",
    listener: (testsInTestFiles: Array<TestInTestFile>) => void
  ): this;

  emit(event: "testStart", testsInTestFile: TestInTestFile): boolean;
  on(
    event: "testStart",
    listener: (testsInTestFile: TestInTestFile) => void
  ): this;

  emit(
    event: "testEnd",
    testInTestFile: TestInTestFile,
    result: TestResult
  ): boolean;
  on(
    event: "testEnd",
    listener: (testInTestFile: TestInTestFile, result: TestResult) => void
  ): this;

  emit(event: "runEnd", results: Array<[TestInTestFile, TestResult]>): boolean;
  on(
    event: "runEnd",
    listener: (results: Array<[TestInTestFile, TestResult]>) => void
  ): this;
}
