#!/usr/bin/env node

import { program } from 'commander';
import generateIcons from '../src/commands/generate.js';

program
  .name('gluestack-icon-generator')
  .description('Generate React Native icon components from Iconify collections');

program
  .command('generate')
  .description('Generate React Native icon components')
  .option('-c, --collection <name>', 'Collection name (e.g., material-symbols)')
  .option('-i, --icons <names>', 'Comma-separated icon names')
  .option('-o, --output <path>', 'Output directory path (default: src/components/ui/icon)')
  .option('-s, --size <number>', 'Icon viewBox size (default: 24)')
  .action(async (options) => {
    try {
      await generateIcons(options);
    } catch (error) {
      process.exit(1);
    }
  });

program.parse();