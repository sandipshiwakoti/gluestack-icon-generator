# 🔥 Gluestack Icon Generator

[![npm version](https://img.shields.io/npm/v/gluestack-icon-generator.svg)](https://www.npmjs.com/package/gluestack-icon-generator)
[![Node Version](https://img.shields.io/node/v/gluestack-icon-generator.svg)](https://www.npmjs.com/package/gluestack-icon-generator)
[![CLI Tool](https://img.shields.io/badge/CLI-Tool-orange.svg)](https://www.npmjs.com/package/gluestack-icon-generator)


Generate your favorite icons into Gluestack-v2 components with a single command! This CLI tool makes it effortless to generate icon components from any Iconify collection.

## ✨ Features

- 🚀 Interactive CLI interface
- 💎 Generates React Native SVG components
- 🛠️ Compatible with Gluestack-UI v2
- 📦 Optimized component output

## 🚀 Installation
Install globally using your preferred package manager:

npm
```
npm install -g gluestack-icon-generator
```
yarn
```
yarn global add gluestack-icon-generator
```

pnpm
```
pnpm add -g gluestack-icon-generator
``` 

bun
```
bun add -g gluestack-icon-generator
```


## 📖 Usage
Use `gluestack-icon-generator` or shortcut `gicongen` with command `generate` or shortcut `g`.

### 1. Interactive Mode
   
```
gicongen generate
```
or
```
gicongen g
```

Follow the interactive prompts to select your icon collection and icons.

### 2. Command Line Mode

```
gicongen generate --collection mdi --icons "home, bell, map" --output src/components/ui/icon
```
or
```
gicongen g -c mdi -i "home, bell, map" -o src/components/ui/icon
```

This command will generate the icons `home`, `bell`, and `map` from the `mdi` collection and save them in the `src/components/ui/icon` directory.

### Options
- `-c, --collection`: Icon collection name (e.g., mdi)
- `-i, --icons`: Comma-separated icon names
- `-o, --output`: Custom output directory (default: src/components/ui/icon)

## 🎯 Example

```
// Generated icon component
import React from 'react';
import {Path, Svg} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/icon';

const HomeIcon = createIcon({
  Root: Svg,
  viewBox: '0 0 24 24',
  path: (
    <>
      <Path
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
        fill="currentColor"
        />
    </>
  ),
});

HomeIcon.displayName = 'HomeIcon';

export default HomeIcon;
```


## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

<p align="center">
  <sub>Built with ❤️ for the Gluestack community • Free and Open Source</sub>
</p>