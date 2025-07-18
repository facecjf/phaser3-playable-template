![playable-logo](/src/img/logo.png)
# Playable Ads in one file
## Phaser 3 + Webpack 5 with auto base64 assets decode
> A Phaser 3 project template for JavaScript (ES6 support via Babel) and Webpack 5 that includes local server with  hot-reloading for development and production builds in one file with assets on base64.

### Features
- The project is assembled into one file and is ready for any ad networks.
- All assets will automatically be base64 encoded and embedded in the project.
- Updated preloader methods for handling bitmap base64 encoded correctly
- Custom build.js Build script with `node build.js` that targets designated Ad Networks
- Localization support via `languages.json`

## Updates  

### CTA button and text
- CTA button and text are created in the `js/utils/CTA.js` file. Positioning is set in the `js/MainScene.js` file.

### UI Hand
- UI Hand is created in the `js/utils/UIHand.js` file. Positioning is set in the `js/MainScene.js` file.

### Store links
- Store links are stored in the `src/store-links.js` file.
- Store links are injected into the `index.html` file at build time.

### Responsive design
- Responsive design is created in the `js/utils/ResponsiveSettings.js` file.

### Ad network selectable at build time
- Ad network is selected at build time.

### In The Works
:pushpin: Incorporate Languages in build script

:heavy_check_mark: Update build for correct output based on 'INDEX' template html files

:heavy_check_mark: Update build for selectable ad networks

### Requirements
[Node.js](https://nodejs.org/) (with npm)

### Getting Started
You need to either download this project or clone it:
```bash
git clone https://github.com/facecjf/p3-webpack-playable-template.git
```
Make sure you are in the project, if not then go there:
```bash
cd p3-webpack-playable-template
```
Now you need to install all the necessary dependencies for the project to work:
```bash
npm install
```

Everything is ready to start the project.
For local testing use (localhost:8000 will open auto in browser) and without stat warnings
```bash
npm start
```

To build the final file, use the following command:
```bash
node build.js
```

The finished `index.html` file is waiting for you in the `dist` folder

#### Assets Loading
Resource loading is declared in `js/PreloaderScene.js`
```bash
const audioFiles = {
    custom_name1: require('../audio/filename1.mp3')
};

const textureFiles = {
    custom_name2: require('../img/filename2.png'),
};

const atlasFiles = {
    gameAtlas: {
        png: require('../img/filename3.png'),
        json: require('../json/filename3.json')
    }
};

const spritesheetFiles = {
    filename5Sprites: {
        png: require('../img/filename5.png'),
        frameConfig: { frameWidth: 256, frameHeight: 250 }
    }
    // Add more spritesheets as needed
};

this.addBitmapText('custom_name3', require('../font/filename4.png'), require('../font/filename4.xml'));
```
