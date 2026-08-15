process.env.ESLINT_USE_FLAT_CONFIG = "false";
process.argv.push(".");
await import("../node_modules/eslint/bin/eslint.js");
