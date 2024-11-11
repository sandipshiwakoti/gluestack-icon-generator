# 🔥 Gluestack Icon Generator

Generate your favorite icons into Gluestack-v2 components with a single command! This CLI tool makes it effortless to generate icon components from any Iconify collection.


## ✨ Features

- 🚀 Interactive CLI interface
- 💎 Generates React Native SVG components
- 🛠️ Compatible with Gluestack-UI v2
- 📦 Optimized component output

## 🚀 Installation

`npm install gluestack-icon-generator`
# or
`yarn add gluestack-icon-generator`

## 📖 Usage

### 1. Interactive Mode
   
Just run:

```
npx icons generate
```

Follow the interactive prompts to select your icon collection and icons.

### 2. Command Line Mode

```
npx icons generate --collection mdi --icons home,bell,map --output src/components/ui/icon
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

<p align="center">Built for the Gluestack community</p>