#!/usr/bin/env node

const { Command } = require('commander');
const DirToJson = require('../lib');
const path = require('path');

const program = new Command();

program
    .name('dir-to-json')
    .description('Convert directory structure to JSON')
    .argument('[directory]', 'directory to convert', '.')
    .option('-c, --content', 'include file contents')
    .option('-s, --max-size <size>', 'maximum file size to include content (in bytes)', parseInt, 1024 * 1024)
    .option('-e, --exclude <items>', 'comma-separated list of items to exclude')
    .option('-o, --output <file>', 'output to file instead of stdout')
    .action(async (directory, options) => {
        try {
            const excludes = options.exclude ? options.exclude.split(',') : undefined;
            const converter = new DirToJson({
                includeContent: options.content,
                maxContentSize: options.maxSize,
                excludes: excludes
            });

            const result = await converter.convert(directory);
            const output = JSON.stringify(result, null, 2);

            if (options.output) {
                const fs = require('fs');
                fs.writeFileSync(options.output, output);
                console.log(`Output written to ${options.output}`);
            } else {
                console.log(output);
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse();
