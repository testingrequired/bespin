import { Plugin } from "@testingrequired/bespin-core";

export class GlobalTestValuePlugin extends Plugin {
  constructor(config) {
    super(config);

    this.config.globals.globalTestValue = "globalTestValueValue";
  }
}
