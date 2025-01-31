#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const FileServer = require("../lib/server");
const path = require("path");

program
  .option("-p, --port <number>", "port to run server on", "9989")
  .option("-d, --dir <path>", "directory to serve", process.cwd())
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    const server = new FileServer({
      port: parseInt(options.port),
      rootDir: path.resolve(options.dir),
    });

    const port = await server.start();

    console.log(chalk.green("File structure server is running!"));
    console.log(chalk.blue(`Server URL: http://localhost:${port}`));
    console.log(chalk.blue(`Serving directory: ${options.dir}`));

    process.on("SIGINT", () => {
      console.log(chalk.red("\nShutting down server..."));
      server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error(chalk.red("Error starting server:"), error);
    process.exit(1);
  }
}

main();
