export default class CTA {
    constructor(scene) {
        this.scene = scene;
        this.ctaButton = null;
        this.ctaText = null;
        this.ctaTween = null;
        this.ctaButtonScale = this.scene.ctaScale;

        if (this.scene.currentLanguage === 'es') {
            this.CTATextSize = 56;
        } else if(this.scene.currentLanguage === 'fr') {
            this.CTATextSize = 56; 
        } else if(this.scene.currentLanguage === 'jp') {
            this.CTATextSize = 56;
        } else {
            this.CTATextSize = 72;
        }
        // Load language data from cache
        this.languageData = this.scene.cache.json.get('languages');
    }

    // create CTA button
    createCTA(x, y) {
        this.ctaButton = this.scene.add.image(0, 0, 'cta');
        this.ctaButton.setInteractive();
        //this.ctaButton.setOrigin(0.5, 0.5);
        this.ctaButton.setOrigin(1, 0.5);
        this.ctaButton.setScale(this.ctaButtonScale * this.scene.scaleFactor);
        this.ctaButton.setPosition(x, y);
    }

    // create CTA text (bitmap)
    createCTAText() {
        this.ctaText = this.scene.add.bitmapText(this.ctaButton.x, this.ctaButton.y, 'gameFont', this.scene.getLocalizedText('play_now'), this.CTATextSize, 1)
            .setOrigin(0.5)
            .setTint(0xFFFFFF)
            .setDepth(21);
        this.updateCTATextPosition();
    }
    
    // create CTA text (web font)
    // createCTAText() {
    //     this.ctaText = this.scene.add.text(this.ctaButton.x, this.ctaButton.y, this.scene.getLocalizedText('play_now'), { fontFamily: 'CTAFont', fontSize: '40px', color: '#096a55' })
    //         .setOrigin(0.5)
    //         .setTint(0xFFFFFF)
    //         .setDepth(21);
    //     this.updateCTATextPosition();
    // }

    // create CTA tween
    createCTATween(tweenType) {
        if (this.ctaTween) {
            this.ctaTween.stop();
        }

        if (tweenType === 'SC') {
            // Create a new tween
            this.ctaTween = this.scene.tweens.add({
                targets: this.ctaButton,
                scaleX: '-=0.1',
                scaleY: '-=0.1',
                duration: 200,
                yoyo: true,
                repeat: 0,
                ease: 'quad.inout',
                onUpdate: () => {
                    this.updateCTATextPosition();
                },
                onComplete: () => {
                    if(this.scene.useCarousel) {
                        this.scene.carousel.scrollToNext();
                    }
                }
            });
        } else {
            // Create a new tween
            this.ctaTween = this.scene.tweens.add({
                targets: this.ctaButton,
                scaleX: '-=0.1',
                scaleY: '-=0.1',
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'quad.inout',
                onUpdate: () => {
                    this.updateCTATextPosition();
                }
            });

        }
    }

    // update CTA text position
    updateCTATextPosition() {
        if (this.ctaText && this.ctaButton) {
            const ctaCenterX = this.ctaButton.x - (this.ctaButton.displayWidth * (-0.5 + this.ctaButton.originX));
            this.ctaText.setPosition(ctaCenterX, this.ctaButton.y);
            this.ctaText.setScale(this.ctaButton.scale * 0.8);
        }
    }

}
