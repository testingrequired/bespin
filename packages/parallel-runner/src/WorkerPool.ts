import { Worker } from 'worker_threads';

interface WorkerTask<TTaskData, TWorkerResult> {
  getTaskData: () => TTaskData;
  resultCallback: (err: any, result?: TWorkerResult) => void;
}

export class WorkerPool<TTaskData, TWorkerResult> {
  private queue: Array<WorkerTask<TTaskData, TWorkerResult>> = [];
  private workers: Set<Worker> = new Set();
  private activeWorkers: Set<Worker> = new Set();

  public constructor(
    public workerPath: string,
    public numberOfWorkers: number = 1
  ) {
    for (let i = 0; i < this.numberOfWorkers; i += 1) {
      const worker = new Worker(this.workerPath);
      this.workers.add(worker);
    }
  }

  getInactiveWorkers() {
    const inactiveWorkers = new Set(
      Array.from(this.workers).filter(x => !this.activeWorkers.has(x))
    );

    return inactiveWorkers;
  }

  public run(getTaskData: () => TTaskData): Promise<TWorkerResult> {
    return new Promise(async (resolve, reject) => {
      const task: WorkerTask<TTaskData, TWorkerResult> = {
        getTaskData,
        resultCallback: (error, result) =>
          error ? reject(error) : resolve(result),
      };

      this.runTask(task);
    });
  }

  private async runTask(
    task: WorkerTask<TTaskData, TWorkerResult>
  ): Promise<void> {
    const inactiveWorkers = this.getInactiveWorkers();

    if (inactiveWorkers.size === 0) {
      this.queue.push(task);
      return;
    }

    const nextWorker: Worker = inactiveWorkers.values().next().value;

    this.activeWorkers.add(nextWorker);

    function onMessage(result: TWorkerResult) {
      task.resultCallback(null, result);
      cleanUp();
      runNextTask();
    }

    function onError(error: any) {
      task.resultCallback(error);
      cleanUp();
      runNextTask();
    }

    const cleanUp = () => {
      nextWorker.removeAllListeners('message');
      nextWorker.removeAllListeners('error');
      this.activeWorkers.delete(nextWorker);
    };

    const runNextTask = () => {
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift() as WorkerTask<
          TTaskData,
          TWorkerResult
        >;

        this.runTask(nextTask);
      }
    };

    nextWorker.once('message', onMessage);
    nextWorker.once('error', onError);
    nextWorker.postMessage(await task.getTaskData());
  }
}
