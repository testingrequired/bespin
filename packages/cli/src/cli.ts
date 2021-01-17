const { build } = require("gluegun");

/**
 * Create the cli and kick it off
 */
function run(argv) {
  return build()
    .brand("bespin")
    .src(__dirname)
    .plugins("./node_modules", { matching: "bespin-*", hidden: true })
    .help()
    .help({
      name: "workers",
      description: "The number of workers to run test in parallel (default: 1)",
    })
    .version()
    .create()
    .run(argv);
}

module.exports = { run };
