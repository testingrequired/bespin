import { EventEmitter } from "events";
import { ValidConfig } from "./Config";
import { TestInTestFile } from "./TestInTestFile";
import { TestResult } from "./TestResult";

export enum Events {
  runtimeStart = "runtimeStart",
  runStart = "runStart",
  testStart = "testStart",
  testEnd = "testEnd",
  runEnd = "runEnd",
}

export class RuntimeEventEmitter extends EventEmitter {}

export declare interface RuntimeEventEmitter {
  emit(event: Events.runtimeStart, config: ValidConfig): boolean;
  on(event: Events.runtimeStart, listener: (config: ValidConfig) => void): this;

  emit(
    event: Events.runStart,
    testsInTestFiles: Array<TestInTestFile>
  ): boolean;
  on(
    event: Events.runStart,
    listener: (testsInTestFiles: Array<TestInTestFile>) => void
  ): this;

  emit(event: Events.testStart, testsInTestFile: TestInTestFile): boolean;
  on(
    event: Events.testStart,
    listener: (testsInTestFile: TestInTestFile) => void
  ): this;

  emit(
    event: Events.testEnd,
    testInTestFile: TestInTestFile,
    result: TestResult
  ): boolean;
  on(
    event: Events.testEnd,
    listener: (testInTestFile: TestInTestFile, result: TestResult) => void
  ): this;

  emit(
    event: Events.runEnd,
    results: Array<[TestInTestFile, TestResult]>
  ): boolean;
  on(
    event: Events.runEnd,
    listener: (results: Array<[TestInTestFile, TestResult]>) => void
  ): this;
}
