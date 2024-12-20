#!/usr/bin/env node

import { program } from 'commander';
import generateIcons from '../src/commands/generate.js';

program
  .name('gluestack-icon-generator')
  .description('Generate React Native icon components from Iconify collections');

program
  .command('generate')
  .alias('g')
  .description('Generate React Native icon components')
  .option('-c, --collection <name>', 'Collection name (e.g., lucide)')
  .option('-i, --icons <names>', 'Comma-separated icon names')
  .option('-o, --output <path>', 'Output directory path (default: src/components/ui/icon)')
  .option('--desc', 'Include icon description (e.g., "Icon from Lucide: \'pizza\'")')
  .action(async (options) => {
    try { 
      await generateIcons(options);
    } catch (error) {
      process.exit(1);
    }
  });

program.parse();