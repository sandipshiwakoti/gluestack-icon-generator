import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

const COLLECTIONS_URL = 'https://api.iconify.design/collections';
const POPULAR_COLLECTIONS = [
  'mdi',
  'material-symbols',
  'ion',
  'octicon',
  'lucide',
  'ph',
  'solar',
  'ri',
  'bi'
];

function convertToPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';
}

function createIconComponent(iconName, pathData) {
  const componentName = convertToPascalCase(iconName);
  
  // Format the path data:
  // 1. Replace path with Path for React Native
  // 2. Replace escaped quotes with regular quotes
  const cleanPathData = pathData
    .replace(/<path/g, '<Path')
    .replace(/path>/g, 'Path>')
    .replace(/\\"/g, '"');

  return `import React from 'react';
import {Path, Svg} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/icon';

const ${componentName} = createIcon({
  Root: Svg,
  viewBox: '0 0 24 24',
  path: (
    <>
      ${cleanPathData}
    </>
  ),
});

${componentName}.displayName = '${componentName}';

export default ${componentName};
`;
}

async function fetchCollections() {
  try {
    const response = await axios.get(COLLECTIONS_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch collections from Iconify');
  }
}

async function promptForCollection(collections) {
  const collectionNames = Object.keys(collections).sort();
  
  // Separate popular and other collections
  const popularChoices = POPULAR_COLLECTIONS
    .filter(name => collections[name])
    .map(name => ({
      name: `${collections[name].name} (${name})`,
      value: name
    }));

  const otherChoices = collectionNames
    .filter(name => !POPULAR_COLLECTIONS.includes(name))
    .map(name => ({
      name: `${collections[name].name} (${name})`,
      value: name
    }));

  const { collection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'collection',
      message: 'Select an icon collection:',
      choices: [
        new inquirer.Separator(chalk.bold('Popular Collections')),
        ...popularChoices,
        new inquirer.Separator(chalk.bold('Other Collections')),
        ...otherChoices
      ],
      pageSize: 15
    }
  ]);

  return collection;
}

async function promptForIcons(collection, collections) {
  console.log(chalk.blue(`\nCollection Info:`));
  console.log(`Name: ${collections[collection].name}`);
  console.log(`Author: ${collections[collection].author?.name || 'Unknown'}`);
  console.log(`Total Icons: ${collections[collection].total}`);
  if (collections[collection].samples?.length > 0) {
    console.log(`Sample Icons: ${collections[collection].samples.join(', ')}`);
  }
  console.log(''); // Empty line for spacing

  const { icons } = await inquirer.prompt([
    {
      type: 'input',
      name: 'icons',
      message: 'Enter icon names (comma-separated):',
      validate: input => input.length > 0 || 'Please enter at least one icon name'
    }
  ]);

  return icons.split(',').map(icon => icon.trim());
}

async function promptForOutputPath(defaultPath = 'src/components/ui/icon') {
  const { shouldCustomize } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldCustomize',
      message: `Enter output directory path? (default: ${chalk.blue(defaultPath)})`,
      default: false
    }
  ]);

  if (shouldCustomize) {
    const { outputPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: 'Enter the output directory path:',
        default: defaultPath
      }
    ]);
    return outputPath;
  }

  return defaultPath;
}


async function generateIcons(options = {}) {
  const spinner = ora();
  try {
    // Fetch available collections
    spinner.start('Fetching available collections');
    const collections = await fetchCollections();
    spinner.succeed('Collections fetched successfully');

    // Get collection from options or prompt
    let selectedCollection = options.collection;
    if (!selectedCollection) {
      selectedCollection = await promptForCollection(collections);
    } else if (!collections[selectedCollection]) {
      throw new Error(`Collection "${selectedCollection}" not found`);
    }

    // Get icon names from options or prompt
    const iconNames = options.icons 
      ? options.icons.split(',') 
      : await promptForIcons(selectedCollection, collections);
    
    // Get output directory from options or prompt
    const outputDir = options.output || await promptForOutputPath();

    spinner.start(`Fetching icons from ${selectedCollection}`);

    // Create output directory if it doesn't exist
    await fs.ensureDir(outputDir);

    // Fetch icons from API
    const response = await axios.get(
      `https://api.iconify.design/${selectedCollection}.json?icons=${iconNames.join(',')}`
    );

    // Generate components for each icon
    const found = [];
    const notFound = [];

    for (const iconName of iconNames) {
      if (response.data.icons && response.data.icons[iconName]) {
        const iconData = response.data.icons[iconName];
        // Just use the body directly, we'll format it in createIconComponent
        const componentContent = createIconComponent(iconName, iconData.body);
        
        // Write component file
        const fileName = `${convertToPascalCase(iconName)}.tsx`;
        const filePath = path.join(outputDir, fileName);
        await fs.writeFile(filePath, componentContent);
        
        found.push(iconName);
        spinner.text = `Generated: ${fileName}`;
      } else {
        notFound.push(iconName);
      }
    }

    spinner.succeed(chalk.green(`Generated ${found.length} icon components in ${chalk.blue(outputDir)}`));
    
    // Display results
    if (found.length > 0) {
      console.log(chalk.green('\nIcons generated:'));
      console.log(found.join(', '));
    }
    
    if (notFound.length > 0) {
      console.log(chalk.yellow('\nIcons not found:'));
      console.log(notFound.join(', '));
    }

  } catch (error) {
    spinner.fail(chalk.red('Error generating icons'));
    console.error(chalk.red(error.message));
    throw error;
  }
}

export default generateIcons;