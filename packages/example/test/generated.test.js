describe("Generated tests", () => {
  const numberOfTests = 10;

  for (let index = 0; index < numberOfTests; index++) {
    it(`should be test number ${index}`, async () => {
      await sleep(1000);
    });
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
