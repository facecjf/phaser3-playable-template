import Phaser from "phaser";
import * as AdNetworkManager from './utils/AdNetworkManager';
import * as ResponsiveSettings from './utils/ResponsiveSettings';
import * as CTA from './utils/CTA';
import * as UIHand from './utils/UIHand';
import * as ParticleFactory from './utils/ParticleFactory';
import * as Carousel from './utils/Carousel';

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
        this.logoScale = 1; // starting logo scale
        this.ctaScale = 1; // starting cta scale

        // carousel settings 
        this.useCarousel = false; // use carousel

        // Delta time handling
        this.targetFPS = 60;
        this.deltaMultiplier = 1;
        this.lastFrameTime = 0;

        // font size
        if(this.currentLanguage === 'ja-jp') {
            this.fontSize = '36px';
        } else if(this.currentLanguage === 'ko-kr') {
            this.fontSize = '48px';
        }else if(this.currentLanguage === 'ru-ru') {
            this.fontSize = '32px';
        }else if(this.currentLanguage === 'es-es') {
            this.fontSize = '48px';
        }else if(this.currentLanguage === 'es-mx') {
            this.fontSize = '48px';
        }else if(this.currentLanguage === 'fr-fr') {
            this.fontSize = '48px';
        }else if(this.currentLanguage === 'it-it') {
            this.fontSize = '48px';
        }else if(this.currentLanguage === 'pt-br') {
            this.fontSize = '48px';
        }else if(this.currentLanguage === 'tr-tr') {
            this.fontSize = '48px';
        } else {
            this.fontSize = '48px';
        }

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
        //this.languageData = this.cache.json.get('languages');
        
        // Fallback language data if not loaded
        if (!this.languageData) {
            console.warn('Language data not loaded. Using fallback.');
            this.languageData = {
                "en-us": {
                    "play_now": "Play Now",
                    "game_tut": 'Tutorial Message!'
                    // ... other fallback texts ...
                }
            };
        }

        // Initialize delta time handling
        this.initializeDeltaTimeHandling();
        // Initialize game camera
        this.gameCamera = this.cameras.main;
        // Initialize game components (optional)
        this.initializeGameVariables();
        // Initialize UI hand
        this.uiHand = new UIHand.default(this);
        // Initialize particle factory
        this.particleFactory = new ParticleFactory.default(this);
        // Initialize carousel (optional)
        if(this.useCarousel) {
            this.carousel = new Carousel.default(this);
        }
        // Create game objects - Main Game Objects
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

        // resize background
        this.resizeBackground();

        // Overlay for End Card
        this.overlay = this.add.graphics();

        // Start Embers
        this.particleFactory.createEmberEmitter('ember');

        // Pause all sounds
        this.pauseSoundObjects();

        // create UI elements
        this.setupUI();

        // create tutorial message
        this.createTutorialMessage();
 
        // Start Tut Tween
        this.startTutTextTween();

        // Create carousel
        if(this.useCarousel) {
            this.carousel.createCarousel(this.centerX, this.centerY, 600 * this.scaleFactor);
        
            // Start auto-scrolling (optional)
            //this.carousel.startScrolling();

            // Show debug bounds (optional)
            this.carousel.showDebugBounds();

            // Center item by index (optional)
            this.carousel.centerItemByIndex(2);
        }

        // Create area emitter (optional)
        // use: this.particleFactory.createAreaEmitter(texture, object, blendMode, particleDuration)
        this.particleFactory.createAreaEmitter('sparkle', this.logo, 'ADD', 1000);
        
        this.testText = this.add.text(this.centerX, this.centerY, 'Hello', { fontFamily: 'speechFont', fontSize: '32px', color: '#ffffff' });
        this.testText.setDepth(50);

        // ADD CALLS TO NEW GAME METHODS HERE //
    }

    //// ADD NEW GAME METHODS HERE ////






    //// ADD NEW GAME METHODS HERE ////

    // create UI elements
    setupUI() {
        // Logo
        const logoScale = this.isPortrait ? this.logoScale * this.scaleFactor : 0.7 * this.scaleFactor;
        const logoY = this.isPortrait ? 150 * this.scaleFactor : 100 * this.scaleFactor;
        const logoX = this.isPortrait ? this.centerX : 200 * this.scaleFactor;
        this.logo = this.add.image(logoX, logoY, "logo")
            .setScale(logoScale)
            .setOrigin(0.5, 0.5);

        // CTA
        const ctaScale = this.isPortrait ? this.ctaScale * this.scaleFactor : 0.9 * this.scaleFactor;
        const ctaY = this.isPortrait ? 300 * this.scaleFactor : 200 * this.scaleFactor; 
        const ctaX = this.isPortrait ? this.centerX : this.centerX;
        this.cta = new CTA.default(this);
        this.cta.createCTA(ctaX, (this.centerY + ctaY));
        this.cta.ctaButton.setScale(ctaScale);
        this.cta.ctaButton.setOrigin(0.5, 0.5);
        this.cta.createCTAText();
        

        // Create UI hand (uiHand initilized in create method)
        this.uiHand.createUIHand('SC');

        // Legal
        this.legal = this.add.image(this.centerX, this.gameHeight - 35 * this.scaleFactor, "legal")
            .setScale(this.scaleFactor);
        // Disclaimer
        this.disclaimer = this.add.image(this.centerX, this.gameHeight - 20 * this.scaleFactor, "disclaimer")
            .setScale(this.scaleFactor);

    }

    // Create CTA tween for SC
    createCTATweenSC() {
        this.cta.createCTATween('SC');

        // Create confetti emitter (optional)
        // use: this.particleFactory.createConfettiEmitter(x, y, amount, lifespan, speedMin, speedMax)
        // this.particleFactory.createConfettiEmitter(this.cta.ctaButton.x, this.cta.ctaButton.y, 12, 2500, 50, 350);
    }

    // Create tutorial message
    createTutorialMessage() {
        const tutY = this.isPortrait ? this.centerY - 100 * this.scaleFactor : this.centerY - 100 * this.scaleFactor;
        
        // Add bitmap text to tutBG
        // this.tutText = this.add.bitmapText(this.centerX, tutY, 'gameFont', this.getLocalizedText('game_tut'), this.tutTextSize, 1)
        //     .setDepth(11)
        //     .setOrigin(0.5)
        //     .setTint(0xFFFFFF);

        //Add web font text to tutBG
        this.tutText = this.add.text(this.centerX, tutY, this.getLocalizedText('game_tut'), { fontFamily: 'speechFont', fontSize: this.fontSize, color: '#096a55' })
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
            this.adNetworkManager.endGameAd();
            this.gameClickCTA();
        }
    }

    // Handle CTA click
    gameClickCTA() {
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
                this.gameClickCTA();
            }
        } else if (!this.firstClick && !this.gameOver) {
            this.firstClick = true;
            console.log('%c>First Click', 'color: #FFF; background: #ab24f8;');
            this.ctaClicked = true;
            this.gameClickCTA();
            
            this.adNetworkManager.handleBigabidEngagement();
        } 

        //// TESTING PARTICLE FACTORY ////

        // Create explosion particle emitter 
        // (use: this.createExplosionEmitter(x, y, lifespan, speedMin, speedMax, scaleStart, scaleEnd, gravityY, blendMode, quantity) )
        //this.particleFactory.createExplosionEmitter(this.input.activePointer.x, this.input.activePointer.y, 'ember', 4000, 20, 150, 0.8, 0, 300, 'ADD', 48);
        
        // Create bounds particle emitter
        // (use: this.createBoundsEmitter(texture, object, blendMode, zoneQuantity, quantity, startQuantity, lifespan, speed, scaleStart, scaleEnd, duration, emitting) )
        //this.particleFactory.createBoundsEmitter('ember', this.tutText, 'ADD', 100, 48, 48, 1500, 24, 0.5, 0, 3000, false);
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
        this.particleFactory.stopEmberEmitter();

        // Reposition handler
        this.repositionHandler();

        // create ember emitter
        this.particleFactory.createEmberEmitter('ember');

        // update carousel position
        if(this.useCarousel) {
            this.carousel.updateCarouselPosition(this.centerX, this.centerY);
        }

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
        
        this.repositionGameAssets();

        // Reposition common elements
        this.repositionCommonElements();
    }

    // Resize background images based on orientation
    resizeBackground() {
        if (this.isPortrait) {
            this.bg.setDisplaySize(this.gameHeight, this.gameHeight);
            this.bg.setPosition(this.centerX, this.centerY);
        } else {
            this.bg.setDisplaySize(this.gameWidth, this.gameWidth);
            this.bg.setPosition(this.centerX, this.centerY);
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
        const logoScale = this.isPortrait ? this.logoScale * this.scaleFactor : 0.7 * this.scaleFactor;
        const logoY = this.isPortrait ? 150 * this.scaleFactor : 100 * this.scaleFactor;
        const logoX = this.isPortrait ? this.centerX : 200 * this.scaleFactor;
        this.logo.setPosition(logoX, logoY);
        this.logo.setScale(logoScale);

        // CTA
        const ctaScale = this.isPortrait ? this.ctaScale * this.scaleFactor : 0.9 * this.scaleFactor;
        const ctaY = this.isPortrait ? 300 * this.scaleFactor : 200 * this.scaleFactor; 
        const ctaX = this.isPortrait ? this.centerX : this.centerX; 
        this.cta.ctaButton.setPosition(ctaX, (this.centerY + ctaY));
        this.cta.ctaButton.setScale(ctaScale);
        this.cta.updateCTATextPosition();

        // Tutorial text
        const tutY = this.isPortrait ? this.centerY - 100 * this.scaleFactor : this.centerY - 100 * this.scaleFactor;

        this.tutTextBaseScale = this.scaleFactor;
        this.tutText.setPosition(this.centerX, tutY);
        
        if (this.tutTextTween && this.tutTextTween.isPlaying()) {
            this.stopTutTextTween();
            this.startTutTextTween();
        } else {
            this.tutText.setScale(this.tutTextBaseScale);
        }

        this.uiHand.uiHandStartX = this.cta.ctaButton.x - 50 * this.scaleFactor;
        this.uiHand.uiHandStartY = this.cta.ctaButton.y + 60 * this.scaleFactor;
        this.uiHand.uiHandEndX = this.cta.ctaButton.x;
        this.uiHand.uiHandEndY = this.cta.ctaButton.y + 80 * this.scaleFactor;

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

    // Handle game over state
    gameOverMan() {
        // End module
        this.adNetworkManager.endGameAd();
        // Check if first click
        if (this.firstClick) {
            this.gamePhase++;
            this.firstClick = true;
        }

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
            this.adNetworkManager.startGameAd();
            console.log('%c>Phase 1 Tutorial', 'color: #FFF; background: #ab24f8;');
            this.gamePhase++;
            console.log('Game Phase: ', this.gamePhase);
        } else if (this.gamePhase == 1 && !this.gameOver) {
            if (this.firstClick) {
                console.log('%c>Phase 2 Start', 'color: #FFF; background: #ab24f8;');
                this.startGame = true;
                this.gamePhase++;
                console.log('Game Phase: ', this.gamePhase);
            }
        } else if (this.gamePhase == 2 && this.gameOver) {
            // Notify ad network that game ad is ending
            this.adNetworkManager.endGameAd();
            console.log('%c>Phase 3 Game Over EM', 'color: #FFF; background: #ab24f8;');
            this.gamePhase++;
            console.log('Game Phase: ', this.gamePhase);
        } else if (this.gamePhase == 3 && this.gameOver) {
            if (this.ctaClicked) {
                console.log('%c>Phase 4 Return Modual', 'color: #FFF; background: #ab24f8;');
                this.gamePhase++;
                console.log('Game Phase: ', this.gamePhase);
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
