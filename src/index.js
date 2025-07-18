import Phaser from 'phaser';
import PreloaderScene from './js/PreloaderScene.js';
import MainScene from './js/MainScene.js';

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'ad-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        windowEvents: true  // Disable window-level events to avoid window.top usage
    },
    // NOTE: Physics is not needed for this project
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         gravity: { y: 300 },
    //         debug: false
    //     }
    // },
    scene: null
};

window.bootGame = function() {
    const game = new Phaser.Game(gameConfig);
    game.scene.add("Preload", PreloaderScene);
    game.scene.add("Main", MainScene);
    game.scene.start("Preload");
};

// turn off for Ironsource Builds
// may cause issues if left on on other ad networks.
window.bootGame();
