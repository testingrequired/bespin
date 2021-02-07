import { ValidConfig } from './Config';

export abstract class Plugin {
  // @ts-ignore
  constructor(protected readonly config: ValidConfig) {}
}
