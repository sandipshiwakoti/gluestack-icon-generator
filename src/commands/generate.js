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
  'ic',
  'lucide',
  'ion',
  'octicon',
  'fe',
  'ant-design',
  'ph',
  'solar',
  'ri',
  'bi',
  'tabler',          
  'heroicons',
  'carbon',            
  'fa6-solid',           
  'fa6-regular',
  'clarity',              
  'fluent',             
  'mingcute',
  'line-md'      
];

function convertToPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';
}

function createIconComponent(iconName, pathData, size, collectionName, includeDesc = true) {
  const componentName = convertToPascalCase(iconName);

  // Get all unique SVG elements used in the pathData
  const svgElements = new Set();
  const elementRegex = /<(\w+)[^>]*>/g;
  let match;
  while ((match = elementRegex.exec(pathData)) !== null) {
    svgElements.add(match[1].toLowerCase());
  }

  // Map SVG elements to React Native SVG components
  const elementMapping = {
    path: 'Path',
    circle: 'Circle',
    rect: 'Rect',
    line: 'Line',
    polyline: 'Polyline',
    polygon: 'Polygon',
    g: 'G',
    defs: 'Defs',
    clippath: 'ClipPath',
    lineargradient: 'LinearGradient',
    radialgradient: 'RadialGradient',
    stop: 'Stop'
  };

  // Create imports array based on used elements
  const imports = ['Svg'];
  for (const element of svgElements) {
    const mappedElement = elementMapping[element];
    if (mappedElement) {
      imports.push(mappedElement);
    }
  }

  const kebabToCamelCase = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  // Clean and transform SVG data
  const cleanPathData = pathData.replace(
    /<(\w+)([^>]*)>/g,
    (match, tag, attrs) => {
      const transformedTag = elementMapping[tag.toLowerCase()] || tag;
      
      const transformedAttrs = attrs.replace(
        /([a-zA-Z-]+)="([^"]*)"/g,
        (match, attr, value) => `${kebabToCamelCase(attr)}="${value}"`
      );
      
      return `<${transformedTag}${transformedAttrs}>`;
    }
  ).replace(/(\w+)>/g, (match, tag) => 
    `${elementMapping[tag.toLowerCase()] || tag}>`
  ).replace(/\\"/g, '"');

  return `${includeDesc ? `/* Icon from ${collectionName}: '${iconName}' */\n` : ''}import React from 'react';
import {${imports.join(', ')}} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/icon';

const ${componentName} = createIcon({
  Root: Svg,
  viewBox: '0 0 ${size} ${size}',
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
  const collectionNames = Object.keys(collections);
  
  // Separate popular and other collections
  const popularChoices = POPULAR_COLLECTIONS
    .filter(name => collections[name])
    .map(name => ({
      name: `${collections[name].name} (${name})`,
      value: name
    }));

  const otherChoices = collectionNames
    .filter(name => !POPULAR_COLLECTIONS.includes(name))
    .sort() // Sort alphabetically
    .map(name => ({
      name: `${collections[name].name} (${name})`,
      value: name
    }));

  const { collection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'collection',
      message: 'Select an icon collection:',
      prefix: '🎨',
      choices: [
        new inquirer.Separator(chalk.bold('Popular Collections')),
        ...popularChoices,
        new inquirer.Separator(chalk.bold('Other Collections')),
        ...otherChoices
      ],
      pageSize: 15,
      loop: false // Prevent looping back to start
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
      prefix: '🧩',
      message: 'Enter icon names (comma-separated):',
      validate: input => input.length > 0 || 'Please enter at least one icon name'
    }
  ]);

  return icons.split(',').map(icon => icon.trim());
}

async function promptForOutputPath(defaultPath = 'src/components/ui/icon') {
  const { outputPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputPath',
      message: `Enter the output directory path ${chalk.gray('(press Enter to use default)')}:`,
      default: defaultPath,
      prefix: '📁',
    }
  ]);
  return outputPath;
}

async function promptForDescription(defaultValue = false) {
  const { includeDesc } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeDesc',
      message: 'Include icon description (default: No) (e.g., "Icon from Lucide: \'pizza\'")',
      default: defaultValue,
      prefix: '📝'
    }
  ]);
  return includeDesc;
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
      ? options.icons.split(',').map(icon => icon.trim())
      : await promptForIcons(selectedCollection, collections);
    
    // Get output directory from options or prompt
    const outputDir = options.output || await promptForOutputPath();

    // Get description from options or prompt
    const includeDesc = options.desc || await promptForDescription();

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

    const data = response.data;
    const size = data.width || data.height || 24;

    for (const iconName of iconNames) {
      if (data.icons && data.icons[iconName]) {
        const iconData = data.icons[iconName];
        const componentName = convertToPascalCase(iconName);
        const collectionName = collections[selectedCollection].name
        const componentContent = createIconComponent(iconName, iconData.body, size, collectionName, includeDesc);
        
        // Write component file
        const fileName = `${convertToPascalCase(iconName)}.tsx`;
        const filePath = path.join(outputDir, fileName);
        await fs.writeFile(filePath, componentContent);
        
        found.push(componentName);
        spinner.text = `Generated: ${fileName}`;
      } else {
        notFound.push(iconName);
      }
    }

    spinner.succeed(
      found.length === 0
        ? chalk.yellow('No icons were generated')
        : chalk.green(`Generated ${chalk.bold(found.length)} ${found.length === 1 ? 'icon' : 'icons'} at ${chalk.blue(outputDir)} with size of ${chalk.blue(size)}`));
    
    // Display results
    if (found.length > 0) {
      console.log(chalk.green('\nIcons generated:'));
      console.log(
        found.map(icon => chalk.cyan(`  • ${icon}\n`)).join('')
      );
    }
    
    if (notFound.length > 0) {
      console.log(chalk.yellow('\nIcons not found:'));
      console.log(chalk.red(notFound.join(', ')));
    }

  } catch (error) {
    spinner.fail(chalk.red('Error generating icons'));
    console.error(chalk.red(error.message));
    throw error;
  }
}

export default generateIcons;