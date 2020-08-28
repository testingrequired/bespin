import { TestResultState } from "@testingrequired/bespin-core";

export const name = "bespin";

export const run = async ({ print }) => {
  print.info("bespin!");
  print.info(TestResultState.PASS);
};
