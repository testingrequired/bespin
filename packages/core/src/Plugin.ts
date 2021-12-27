import { ValidConfig } from "./Config";

export abstract class Plugin {
  constructor(protected readonly config: ValidConfig) {}
}
