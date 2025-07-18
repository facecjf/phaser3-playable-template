import Phaser from "phaser";
import * as AdNetworkManager from './utils/AdNetworkManager';
import * as ResponsiveSettings from './utils/ResponsiveSettings';
import * as CTA from './utils/CTA';
import * as UIHand from './utils/UIHand';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Main' }); // Set the scene key
        this.adNetworkManager = new AdNetworkManager.default(); // Initialize ad network manager
        this.currentLanguage = 'en-us'; // Default language
        //this.timeRemaining = 30; // Initial time for the countdown timer
        this.timerStarted = false; // Flag to check if timer has started
        this.tutTextTween = null; // Tween for tutorial text animation
        this.tutTextBaseScale = 1; // Base scale for tutorial text
        this.gameStep = 0; // game step to track updates
        this.gamePhase = 0; // game phases
        this.startGame = false;
        this.firstClick = false;
        this.gameOver = false;
        this.ctaClicked = false;
        this.inactiveTime = 4000; // inactive time
        this.isInactivity = false;
        this.inactivityEvent = null;
        this.logoScale = 0.45; // starting logo scale
        this.ctaScale = 0.45; // starting cta scale

        // Delta time handling
        this.targetFPS = 60;
        this.deltaMultiplier = 1;
        this.lastFrameTime = 0;
    }

    // Create the scene
    create() {
        console.log('%cSCENE::Main', 'color: #fff; background: #ab24f8;')

        // Initialize ResponsiveSettings with scene reference
        this.responsiveSettings = new ResponsiveSettings.default(this);
        
        // Access responsive properties directly
        this.gameWidth = this.responsiveSettings.gameWidth;
        this.gameHeight = this.responsiveSettings.gameHeight;
        this.centerX = this.responsiveSettings.centerX;
        this.centerY = this.responsiveSettings.centerY;
        this.scaleFactor = this.responsiveSettings.scaleFactor;
        this.isPortrait = this.responsiveSettings.isPortrait;
        this.isLandscape = this.responsiveSettings.isLandscape;
        
        // Load language data from cache
        this.languageData = this.cache.json.get('languages');
        
        // Fallback language data if not loaded
        if (!this.languageData) {
            console.warn('Language data not loaded. Using fallback.');
            this.languageData = {
                en: {
                    play_now: '!!PLAY NOW!!',
                    game_tut: '!!TUTORIAL MSG!!'
                    // ... other fallback texts ...
                }
            };
        }

        // Initialize delta time handling
        this.initializeDeltaTimeHandling();
        // Initialize game camera
        this.gameCamera = this.cameras.main;
        // Initialize game components
        this.initializeGameVariables();
        // Initialize UI hand
        this.uiHand = new UIHand.default(this);
        // Create game objects
        this.createGameObjects();
        // Setup event listeners
        this.setupEventListeners();
        // Notify ad network that game ad is loaded
        this.adNetworkManager.loadedGameAd();
        // Initialize Audio
        // e.g. this.audioFile = this.sound.add('audioFile', { loop: false, volume: 1.5 });
         // Make scene globally accessible for MRAID audio control
        window.gameScene = this;
        
        // Apply initial audio state if it was set before game initialized
        if (window.initialAudioMuted !== undefined) {
            if (window.initialAudioMuted) {
                window.muteGameSound(this);
            } else {
                window.unmuteGameSound(this);
            }
        }
    }

    // Initialize delta time handling
    initializeDeltaTimeHandling() {
        // Get the device's refresh rate if possible (fallback to 60)
        const refreshRate = window.screen?.refreshRate || 60;
        this.targetFPS = refreshRate;
        
        // Set initial frame time
        this.lastFrameTime = this.time.now;
    }

    // Method to initialize game after MRAID is ready (optional)
    startGameInitialization() {
        // Game can now safely start
        this.adNetworkManager.startGameAd();
        // Here you could trigger any animations or start game logic
        console.log('Game initialization started');
        // If there's any delayed initialization that should only happen after MRAID is ready, do it here
    }

    // Initialize various game state variables
    initializeGameVariables() {
        // define specific game variable after start outside of the constructor ex: this.variable = true;  
    }

    //// MAIN GAME METHODS ////

    // Create and position game objects (background, logo, CTA, etc.)
    createGameObjects() {
        // Background
        this.bg = this.add.image(this.centerX, this.centerY, "bg");
        this.ecbg = this.add.image(this.centerX, this.centerY, "ecbg");
        this.ecbg.visible = false;

        // resize background
        this.resizeBackground();

        // Overlay for End Card
        this.overlay = this.add.graphics();

        // Start Embers
        this.createEmberEmitter();

        // Pause all sounds
        this.pauseSoundObjects();

        // create UI elements
        this.setupUI();

        // Create UI hand (uiHand initilized in create method)
        this.uiHand.createUIHand();

        // create tutorial message
        this.createTutorialMessage();
 
        // Start Tut Tween
        this.startTutTextTween();

        // ADD CALLS TO NEW GAME METHODS HERE //
    }

    //// ADD NEW GAME METHODS HERE ////






    //// ADD NEW GAME METHODS HERE ////


    // create UI elements
    setupUI() {
        // create UI container
        //this.createUIContainer(); 
        const topElementsY = 120 * this.scaleFactor;
        // Logo
        this.logo = this.add.image(30, topElementsY, "logo")
            .setScale(this.logoScale * this.scaleFactor)
            .setOrigin(0, 0.5);

        // CTA
        this.cta = new CTA.default(this);
        this.cta.createCTA(this.gameWidth - 30, topElementsY);
        this.cta.createCTAText();
        //this.cta.createCTATween();

        // Legal
        this.legal = this.add.image(this.centerX, this.gameHeight - 35 * this.scaleFactor, "legal")
            .setScale(this.scaleFactor);
        // Disclaimer
        this.disclaimer = this.add.image(this.centerX, this.gameHeight - 20 * this.scaleFactor, "disclaimer")
            .setScale(this.scaleFactor);
    }

    // Create tutorial message
    createTutorialMessage() {
        const topElementsY = 120 * this.scaleFactor;
        const tutY = this.isPortrait ? topElementsY + 150 * this.scaleFactor : topElementsY;

        // Tutorial BG
        // this.tutBG = this.add.image(this.centerX, tutBGY, "tutbg")
        //     .setDepth(10)
        //     .setScale(this.scaleFactor);
        
        // Add bitmap text to tutBG
        this.tutText = this.add.bitmapText(this.centerX, tutY, 'gameFont', this.getLocalizedText('game_tut'), this.tutTextSize, 1)
            .setDepth(11)
            .setOrigin(0.5)
            .setTint(0xFFFFFF);

        this.tutTextBaseScale = this.scaleFactor; // Set the base scale
        this.tutText.setScale(this.tutTextBaseScale);
    }

    // Start the tutorial text tween animation
    startTutTextTween() {
        this.tutTextTween = this.tweens.add({
            targets: this.tutText,
            scaleX: this.tutTextBaseScale * 1.1,
            scaleY: this.tutTextBaseScale * 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Stop the tutorial text tween animation
    stopTutTextTween() {
        if (this.tutTextTween) {
            this.tutTextTween.stop();
            this.tutTextTween = null;
            this.tutText.setScale(this.tutTextBaseScale);
        }
    }

    // Handle CTA click
    handleCTAClick() {
        // Handle CTA button click
        if (!this.ctaClicked && !this.gameOver) {
            this.ctaClicked = true;
            this.endGameAd();
            this.clickCTA();
        }
    }

    // Handle CTA click
    clickCTA() {
        // Actions to perform when CTA is clicked
        this.adNetworkManager.clickCTA();
        // Add any additional CTA click logic here
        if (this.gamePhase < 3) {
            this.gameOver = true;
            this.gameOverMan();
            this.gamePhase = 3;
        }
        // Pause all sounds
        this.sound.pauseAll();
    }

    // Handle inactivity
    inactivityTimer() {
        // Handle inactivity
       if (this.gameOver && this.gamePhase > 2) {
            this.time.removeEvent(this.inactivityEvent);
            this.inactivityEvent = null;
            this.isInactivity = false;
            console.log('%c>Inactivity Timer: stopped', 'color: #000; background: #f87c00;');
        } else {
            this.uiHand.updateUIHandPosition();
            // this.startTutTextTween();
            console.log('%c>Inactivity Timer: reset', 'color: #000; background: #f87c00;');
            this.isInactivity = false;
            this.time.removeEvent(this.inactivityEvent);
            this.inactivityEvent = null;
            this.inactiveTime = 4000;     
        }
    }

    // Reset the inactivity timer
    resetInactivityTimer() {
        this.time.removeEvent(this.inactivityEvent);
        this.inactivityEvent = this.time.addEvent({ delay: this.inactiveTime, callback: this.inactivityTimer, callbackScope: this });
        console.log('%c>Inactivity Timer: started', 'color: #000; background: #f87c00;');
        this.isInactivity = true;
    }
    
    // Handle global click events
    handleGlobalClick() {
        // Handle global click events
        if (this.gameOver && this.gamePhase > 2) {
            if (!this.ctaClicked) {
                this.ctaClicked = true;
                this.clickCTA();
            }
        } else if (!this.firstClick && !this.gameOver) {
            this.firstClick = true;
            console.log('%c>First Click', 'color: #FFF; background: #ab24f8;');
            this.uiHand.removeUIHandTweens();
            this.stopTutTextTween();
            this.resetInactivityTimer();
            this.adNetworkManager.handleBigabidEngagement();
        } else {
            //console.log('click / ui hand reset works!');
            this.uiHand.removeUIHandTweens();
            this.stopTutTextTween();
            this.resetInactivityTimer();
        }
    }

    // Create ember particle emitter
    createEmberEmitter() {
        //const yOffset = this.isPortrait ? 350 * this.scaleFactor : 200 * this.scaleFactor;
        // Create the emitter
        this.emberEmitter = this.add.particles(0, 0, 'ember', {
            x: { min: 0, max: this.gameWidth },
            y: this.gameHeight,
            speed: { min: 25, max: 75 },
            angle: { min: 180, max: 360 },
            scale: { start: 1.25 * this.scaleFactor, end: 0.25 * this.scaleFactor },
            alpha: { start: 1, end: 0},
            lifespan: { min: 8000, max: 12000 },
            gravityY: -10,
            frequency: 80,
            blendMode: 'ADD',
            quantity: 1,
            advance: 4000,
            emitCallback: (particle) => {
                // Optional: Apply deltaMultiplier to individual particles if needed
                particle.velocityX *= this.deltaMultiplier;
                particle.velocityY *= this.deltaMultiplier;
            },
            deathZone: {
                type: 'onLeave',
                source: new Phaser.Geom.Rectangle(0, 0, this.gameWidth, this.gameHeight)
            }
        }).setDepth(10);
    }

    // Stop and destroy ember emitter
    stopEmberEmitter() {
        if (this.emberEmitter) {
            this.emberEmitter.destroy();
            this.emberEmitter = null;
        }
    }

    // Reposition ember emitter
    repositionEmberEmitter() {
        if (this.emberEmitter) {
            this.emberEmitter.setPosition(this.centerX, this.gameHeight);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Set up event listeners for orientation change
        this.scale.on('orientationchange', (e) => {
            switch(e) {
                case 'portrait-primary':
                    this.scale.displaySize.aspectRatio = this.gameHeight/this.gameWidth;
                    this.scale.setGameSize(this.gameHeight,this.gameWidth);
                    break;
                case 'landscape-primary':
                    this.scale.displaySize.aspectRatio = this.gameWidth/this.gameHeight;
                    this.scale.setGameSize(this.gameWidth,this.gameHeight);
                    break;
                default:  
            }
        });
        // Set up event listeners for user interactions
        const debouncedResize = this.debounce(() => this.resize(), 50);
        this.scale.on('resize', debouncedResize);
        // Set up event listeners for pointer down
        this.input.on('pointerdown', this.handleGlobalClick, this);
        // Set up event listeners for CTA click
        this.cta.ctaButton.on('pointerdown', this.handleCTAClick, this);
        // Add event listener for ad viewable change (for Unity ads)
        window.addEventListener('adViewableChange', this.handleAdViewableChange.bind(this));
        // Listen for MRAID audio volume changes
        //window.addEventListener('mraidAudioVolumeChange', this.handleMraidAudioChange.bind(this));
       
    }

    // Debounce function
    debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

    // Handle ad viewable change events (for Unity ads)
    handleAdViewableChange(event) {
        const isViewable = event.detail.viewable;
        if (isViewable) {
            // Resume game when ad becomes viewable
            if (this.scene.isPaused()) {
                this.scene.resume();
                // Resume any tweens or animations
                if (this.tutTextTween && !this.tutTextTween.isPlaying()) {
                    this.tutTextTween.resume();
                }
                // Resume any particle emitters
                if (this.emberEmitter && this.emberEmitter.paused) {
                    this.emberEmitter.resume();
                }
                // Resume sound
                this.sound.resumeAll();
                console.log('Game resumed due to ad becoming viewable');
            }
        } else {
            // Pause game when ad is not viewable
            if (!this.scene.isPaused()) {
                this.scene.pause();
                // Pause any tweens or animations
                if (this.tutTextTween && this.tutTextTween.isPlaying()) {
                    this.tutTextTween.pause();
                }
                // Pause any particle emitters
                if (this.emberEmitter && !this.emberEmitter.paused) {
                    this.emberEmitter.pause();
                }
                this.sound.pauseAll();           
                console.log('Game paused due to ad not being viewable');
            }
        }
    }

    // Helper method to pause all sound objects
    pauseSoundObjects() {
        // Store the playing state of each sound before pausing
        this.soundStates = {
            bgmusic: this.bgmusic && this.bgmusic.isPlaying,   
        };
        // Pause all sounds
        this.sound.pauseAll();
        // Additional handling for any sounds that might need special treatment
        if (this.bgmusic) {
            this.bgmusic.pause();
        }
    }

    // Helper method to resume sound objects that were playing
    resumeSoundObjects() {
        // Only resume sounds that were playing when paused
        if (this.soundStates) {
            if (this.soundStates.bgmusic && this.bgmusic) this.bgmusic.resume();
        }
    }

    // Handle game resize events
    resize() {
        // Pause scene
        this.scene.pause();

        // reset inactivity timer
        if (!this.gameOver && this.isInactivity) {
            this.inactivityTimer();
            this.isInactivity = false;
        }

        // stop ember emitter
        this.stopEmberEmitter();

        // Reposition handler
        this.repositionHandler();

        // create ember emitter
        this.createEmberEmitter();
        
        // Resume the scene after resizing
        this.scene.resume();

        // Resume sound
        if (!this.gameOver) {
            this.resumeSoundObjects();
        }
    }

    // Reposition handler
    repositionHandler() {
        // Update responsive settings
        this.responsiveSettings = new ResponsiveSettings.default(this);
        // Update local references
        this.gameWidth = this.responsiveSettings.gameWidth;
        this.gameHeight = this.responsiveSettings.gameHeight;
        this.centerX = this.responsiveSettings.centerX;
        this.centerY = this.responsiveSettings.centerY;
        this.scaleFactor = this.responsiveSettings.scaleFactor;
        this.isPortrait = this.responsiveSettings.isPortrait;
        this.isLandscape = this.responsiveSettings.isLandscape;

        // Resize background
        this.resizeBackground();
        
        // Reposition assets based on game phase
        if (this.gameOver && this.gamePhase >= 3) {
            // End module layout
            this.repositionEndModuleAssets();
        } else {
            // Regular game layout
            this.repositionGameAssets();
        }

        // Reposition common elements
        this.repositionCommonElements();

        // Update UI hand position
        if (!this.gameOver || this.gamePhase < 3) {
            this.uiHand.updateUIHandPosition();
        }
    }

    // Resize background images based on orientation
    resizeBackground() {
        if (this.isPortrait) {
            this.bg.setDisplaySize(this.gameHeight, this.gameHeight);
            this.ecbg.setDisplaySize(this.gameHeight, this.gameHeight);
            this.bg.setPosition(this.centerX, this.centerY);
            this.ecbg.setPosition(this.centerX, this.centerY);
        } else {
            this.bg.setDisplaySize(this.gameWidth, this.gameWidth);
            this.ecbg.setDisplaySize(this.gameWidth, this.gameWidth);
            this.bg.setPosition(this.centerX, this.centerY);
            this.ecbg.setPosition(this.centerX, this.centerY);
        }
    }

    // Reposition common elements
    repositionCommonElements() {
        this.legal.setPosition(this.centerX, this.gameHeight - 35 * this.scaleFactor)
            .setScale(this.scaleFactor);
        this.disclaimer.setPosition(this.centerX, this.gameHeight - 20 * this.scaleFactor)
            .setScale(this.scaleFactor);
    }

    // Reposition regular game assets
    repositionGameAssets() {
        // Regular game layout positioning
        const topElementsY = 120 * this.scaleFactor;

        // Logo
        this.logo.setPosition(30, topElementsY);
        this.logo.setScale(this.logoScale * this.scaleFactor);
        
        // CTA
        this.cta.ctaButton.setPosition(this.gameWidth - 30, topElementsY);
        this.cta.ctaButton.setScale(this.cta.ctaButtonScale * this.scaleFactor);
        this.cta.updateCTATextPosition();

        // Tutorial text
        const tutY = this.isPortrait ? topElementsY + 150 * this.scaleFactor : topElementsY;
        // this.tutBG.setPosition(this.centerX, tutBGY).setScale(this.scaleFactor);

        this.tutTextBaseScale = this.scaleFactor;
        this.tutText.setPosition(this.centerX, tutY);
        
        if (this.tutTextTween && this.tutTextTween.isPlaying()) {
            this.stopTutTextTween();
            this.startTutTextTween();
        } else {
            this.tutText.setScale(this.tutTextBaseScale);
        }
        // Update UI hand positions relative to new dimensions
        const handOffsetX = 120 * this.scaleFactor;
        const handOffsetY = 120 * this.scaleFactor;
        
        this.uiHand.uiHandStartX = this.centerX - handOffsetX;
        this.uiHand.uiHandStartY = this.centerY + handOffsetY;
        this.uiHand.uiHandEndX = this.centerX + handOffsetX;
        this.uiHand.uiHandEndY = this.centerY + handOffsetY;

        // If the UI hand controller exists, update its position
        if (this.uiHand.uiHandController) {
            this.uiHand.uiHandController.setPosition(
                this.uiHand.uiHandStartX,
                this.uiHand.uiHandStartY,
                this.uiHand.uiHandEndX,
                this.uiHand.uiHandEndY
            );
            this.uiHand.uiHandController.resize(this.scaleFactor);
        }
    }

    // Reposition assets for end module
    repositionEndModuleAssets() {
        // Logo
        const logoY = this.isPortrait ? 200 * this.scaleFactor : 150 * this.scaleFactor;
        this.logo.setPosition(this.centerX, logoY);
        this.logo.setScale(1 * this.scaleFactor);

        // CTA
        const ctaY = this.isPortrait ? 200 * this.scaleFactor : 150 * this.scaleFactor;   
        this.cta.ctaButton.setPosition(this.centerX, (this.gameHeight - ctaY));
        this.cta.ctaButton.setScale(0.85 * this.scaleFactor);

        this.cta.updateCTATextPosition();

        // Resize overlay
        this.overlay.clear();
        this.overlay.fillStyle(0x000000, 0.5).setDepth(15).fillRect(0, 0, this.gameWidth, this.gameHeight);

        // Ensure these elements remain hidden
        //this.tutBG.setVisible(false);
        this.tutText.setVisible(false);
    }

    // Handle end of game transition (optional)
    transitionEnd() {
        // Stop any ongoing game logic
        this.gameOver = true;
        this.uiHand.removeUIHandTweens();

        // Hide tutorial and timer elements
        //this.tutBG.setVisible(false);
        this.tutText.setVisible(false);

        // Display "Time's Up!" text
        const timesUpText = this.add.bitmapText(this.centerX, this.centerY, 'gameFont', this.getLocalizedText('TIME\'S UP!'), 64)
            .setOrigin(0.5)
            .setTint(0xFFFFFF)
            .setAlpha(0);

        // Fade in the "Time's Up!" text
        this.tweens.add({
            targets: timesUpText,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Wait for 2 seconds, then transition to endModual
                this.time.delayedCall(2000, () => {
                    timesUpText.destroy();
                    this.gameOverMan();
                });
            }
        });
    }

    // Handle game over state
    gameOverMan() {
        // Handle game over state
        if (this.uiHandController) {
            this.uiHandController.hide();
            this.uiHandController.stopTween();
        }
        // End module
        this.endModual();
        // Remove UI hand tweens
        this.uiHand.removeUIHandTweens();
        // Check if first click
        if (!this.firstClick) {
            this.gamePhase++;
            this.firstClick = true;
        }
        console.log(this.gamePhase);

        // Start the CTA tween when the game ends
        this.cta.createCTATween();

        // Remove interactivity from CTA
        this.cta.ctaButton.removeInteractive();
    }

    // Set up end module display
    endModual() {
        // Overlay
        this.overlay.fillStyle(0x000000, 0.5).setDepth(15).fillRect(0, 0, this.gameWidth, this.gameHeight);
        // Background
        this.bg.visible = false;
        // Ecbg
        this.ecbg.visible = true;
        // Logo
        this.logo.setOrigin(0.5);
        this.logo.setDepth(20);
        
        this.cta.ctaButton.setDepth(20);
        this.cta.ctaButton.setOrigin(0.5);
        // Reposition end module assets
        this.repositionEndModuleAssets();
        // Hide tutorial and timer elements
        //this.tutBG.setVisible(false);
        this.tutText.setVisible(false);
    }

    // End game ad
    endGameAd() {
        // Notify ad network that game ad is ending
        this.adNetworkManager.endGameAd();
    }

    // Start game ad
    startGameAd() {
        // Notify ad network that game ad is starting
        this.adNetworkManager.startGameAd();
    }

    // Get localized text based on current language
    getLocalizedText(key) {
        if (this.languageData && this.languageData[this.currentLanguage] && this.languageData[this.currentLanguage][key]) {
            return this.languageData[this.currentLanguage][key];
        }
        return key; // Fallback to key if translation not found
    }

    // Set the current language
    setLanguage(languageCode) {
        if (this.languageData[languageCode]) {
            this.currentLanguage = languageCode;
            this.updateAllText();
        } else {
            console.warn(`Language ${languageCode} not found in language data.`);
        }
    }

    // Update all text elements with new language
    updateAllText() {
        if (this.ctaText) {
            this.ctaText.setText(this.getLocalizedText('play_now'));
            this.cta.updateCTATextPosition();
        }
        // Update other text elements as needed
    }

    // Update loop
    update(time, delta) {
        // Calculate delta time multiplier (normalize to 60 FPS)
        const targetDelta = 1000 / this.targetFPS;
        this.deltaMultiplier = delta / targetDelta;
        
        // Cap the multiplier to prevent extreme values on very slow/fast devices
        this.deltaMultiplier = Phaser.Math.Clamp(this.deltaMultiplier, 0.75, 1.5);
        
        // Update particle emitter flow rate if needed
        if (this.emberEmitter && !this.emberEmitter.paused) {
            // Optional: Adjust frequency based on delta time if needed
            //this.emberEmitter.setFrequency(80 / this.deltaMultiplier);
        }

        // Main Game Update Loop - Used for setting game phases
        if (this.gamePhase == 0 && !this.gameOver) {
            // Notify ad network that game ad is starting
            this.startGameAd();
            console.log('%c>Phase 1 Tutorial', 'color: #FFF; background: #ab24f8;');
            this.gamePhase++;
        } else if (this.gamePhase == 1 && !this.gameOver) {
            if (this.firstClick) {
                console.log('%c>Phase 2 Start', 'color: #FFF; background: #ab24f8;');
                this.startGame = true;
                this.gamePhase++;
            }
        } else if (this.gamePhase == 2 && this.gameOver) {
            // Notify ad network that game ad is ending
            this.endGameAd();
            console.log('%c>Phase 3 Game Over EM', 'color: #FFF; background: #ab24f8;');
            this.gamePhase++;
        } else if (this.gamePhase == 3 && this.gameOver) {
            if (this.ctaClicked) {
                console.log('%c>Phase 4 Return Modual', 'color: #FFF; background: #ab24f8;');
                this.gamePhase++;
            }
        }
        // Store the current frame time for next frame's delta calculation
        this.lastFrameTime = time;
    }
}

// Global functions
window.gameStart = function() {
    parent.postMessage("start", "*");
    console.log("game started");
};

window.gameClose = function() {
    parent.postMessage("complete", "*");
    console.log("game completed");
};

window.muteGameSound = function(scene) {
    if (scene && scene.sound) {
        scene.sound.setMute(true);
        console.log("Game audio muted via MRAID");
    }
};

window.unmuteGameSound = function(scene) {
    if (scene && scene.sound) {
        scene.sound.setMute(false);
        console.log("Game audio unmuted via MRAID");
    }
};
