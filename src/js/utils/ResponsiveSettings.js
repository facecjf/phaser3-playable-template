export default class ResponsiveSettings {
    constructor(scene) {
        // Store reference to the scene
        this.scene = scene;
        this.initializeResponsiveDesign();
    }

    // check orientation
    checkOriention (orientation)
    {
        if (orientation === Phaser.Scale.PORTRAIT)
        {
            console.log('%cResponsiveSettings::Portrait', 'color: #00e1f8; background:rgb(29, 29, 29);');
        }
        else if (orientation === Phaser.Scale.LANDSCAPE)
        {
            console.log('%cResponsiveSettings::Landscape', 'color: #00e1f8; background:rgb(29, 29, 29);');
        }
    }

    // Initialize responsive design variables
    initializeResponsiveDesign() {
        this.checkOriention(this.scene.scale.orientation);
        // Get dimensions from the scene
        this.gameWidth = this.scene.scale.width;
        this.gameHeight = this.scene.scale.height;
        this.centerX = this.gameWidth * 0.5;
        this.centerY = this.gameHeight * 0.5;
        
        // Determine device type
        this.deviceType = this.getDeviceType();

        // Determine if the game is in portrait mode (including square viewports)
        this.isPortrait = this.gameHeight >= this.gameWidth;
        this.isLandscape = this.gameWidth > this.gameHeight;
        // this.isSquare = this.gameWidth === this.gameHeight || this.gameWidth === this.gameHeight;
        // this.isLandscape = this.gameWidth > this.gameHeight;
        
        // Calculate scaling factors
        const baseScaleX = this.gameWidth / 712;
        const baseScaleY = this.gameHeight / 712;
        
        // Calculate scaling factor based on device type and orientation
        if (this.deviceType === 'phone') {
            // phone
            this.scaleFactor = this.isPortrait ? baseScaleX : baseScaleY;
        } else if (this.deviceType === 'tablet') {
            // tablet
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.85;
        } else if (this.deviceType === 'smallPhone') {
            // small phone
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.85;
        } else {
            // square
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.5;
        }
        
        // Limit the scale factor
        this.scaleFactor = Math.min(this.scaleFactor, 1);

        // Set up positional references
        this.gameTop = 0;
        this.gameBottom = this.gameHeight;
        this.gameRight = this.gameWidth;
        this.gameLeft = 0;

        return this;
    }

    // get device type
    getDeviceType() {
        // get aspect ratio
        const aspectRatio = this.isPortrait ? this.gameWidth / this.gameHeight : this.gameHeight / this.gameWidth;
        // check if square
        if (Math.abs(aspectRatio - 1) < 0.1) {
            console.log('%cResponsiveSettings::Device: square', 'color: #00e1f8; background:rgb(29, 29, 29);');
            return 'square';
        // check if tablet
        } else if ((this.gameWidth >= 712 && this.gameHeight >= 1024) || (this.gameWidth >= 1024 && this.gameHeight >= 712)) {
            console.log('%cResponsiveSettings::Device: tablet', 'color: #00e1f8; background:rgb(29, 29, 29);');
            return 'tablet';
        // check if small phone
        } else if (this.gameWidth <= 320 && this.gameHeight <= 480) {
            console.log('%cResponsiveSettings::Device: smallPhone', 'color: #00e1f8; background:rgb(29, 29, 29);');
            return 'smallPhone';
        // check if phone
        } else {
            console.log('%cResponsiveSettings::Device: phone', 'color: #00e1f8; background:rgb(29, 29, 29);');
            return 'phone';
        }
    }
}
