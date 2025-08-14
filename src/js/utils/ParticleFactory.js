export default class ParticleFactory {
    constructor(scene) {
        this.scene = scene;
        this.emberEmitter = null;
        this.explosionEmitter = null;
        this.boundsEmitter = null;
    }

    // EMBERS //////////////////////////////////////////////////////////////
    // Create ember particle emitter
    createEmberEmitter(texture) {
        //const yOffset = this.isPortrait ? 350 * this.scaleFactor : 200 * this.scaleFactor;
        // Create the emitter
        this.emberEmitter = this.scene.add.particles(0, 0, texture, {
            x: { min: 0, max: this.scene.gameWidth },
            y: this.scene.gameHeight,
            speed: { min: 25, max: 75 },
            angle: { min: 180, max: 360 },
            scale: { start: 1.25 * this.scene.scaleFactor, end: 0.25 * this.scene.scaleFactor },
            alpha: { start: 1, end: 0},
            lifespan: { min: 8000, max: 12000 },
            gravityY: -10,
            frequency: 80,
            blendMode: 'ADD',
            quantity: 1,
            advance: 4000,
            emitCallback: (particle) => {
                // Optional: Apply deltaMultiplier to individual particles if needed
                particle.velocityX *= this.scene.deltaMultiplier;
                particle.velocityY *= this.scene.deltaMultiplier;
            },
            deathZone: {
                type: 'onLeave',
                source: new Phaser.Geom.Rectangle(0, 0, this.scene.gameWidth, this.scene.gameHeight)
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

    // Reposition ember emitter (optional)
    repositionEmberEmitter() {
        if (this.emberEmitter) {
            this.emberEmitter.setPosition(this.scene.centerX, this.scene.gameHeight);
        }
    }

    // EXPLOSIONS //////////////////////////////////////////////////////////////
    // Create explosion particle emitter
    createExplosionEmitter(x, y, texture, lifespan, speedMin, speedMax, scaleStart, scaleEnd, gravityY, blendMode, quantity) {
        // Create the emitter
        this.explosionEmitter = this.scene.add.particles(x, y, texture, {
            lifespan: lifespan,
            speed: { min: speedMin, max: speedMax },
            scale: { start: scaleStart, end: scaleEnd },
            gravityY: gravityY,
            blendMode: blendMode,
            emitting: false
        });

        this.explosionEmitter.explode(quantity);
    }

    // Stop and destroy explosion emitter
    stopExplosionEmitter() {
        if (this.explosionEmitter) {
            this.explosionEmitter.destroy();
            this.explosionEmitter = null;
        }
    }

    // Reposition explosion emitter (optional)
    repositionExplosionEmitter() {
        if (this.explosionEmitter) {
            this.explosionEmitter.setPosition(this.scene.centerX, this.scene.centerY);
        }
    }

    // EMITTER OBJECT BOUNDS //////////////////////////////////////////////////////////////
    // Create emitter object bounds
    createBoundsEmitter(texture, object, blendMode, zoneQuantity, quantity, startQuantity, lifespan, speed, scaleStart, scaleEnd, duration, emitting) {
        // Create the emit zone
        const emitZone = { type: 'edge', source: object.getBounds(), quantity: zoneQuantity };
        // Create the emitter
        this.boundsEmitter = this.scene.add.particles(0, 0, texture, {
            speed: speed,
            lifespan: lifespan,
            quantity: quantity,
            scale: { start: scaleStart, end: scaleEnd },
            emitZone: emitZone,
            duration: duration,
            emitting: emitting,
            blendMode: blendMode
        });

        if(!this.scene.gameOver) {
            this.boundsEmitter.start(startQuantity);
        } else {
            this.boundsEmitter.stop();
            this.boundsEmitter.destroy();
            this.boundsEmitter = null;
        }
    }

    // Stop and destroy bounds emitter
    stopBoundsEmitter() {
        if (this.boundsEmitter) {
            this.boundsEmitter.destroy();
            this.boundsEmitter = null;
        }
    }

    // Create emitter object area
    createAreaEmitter(texture, object, blendMode, particleDuration) {
        const randomX = Phaser.Math.Between(object.x - object.displayWidth/2, object.x + object.displayWidth/2);
        const randomY = Phaser.Math.Between((object.y - object.displayHeight/2), (object.y + object.displayHeight/2));
        
        this.areaEmitter = this.scene.add.image(randomX, randomY, texture)
            .setDepth(30)
            .setAlpha(1)
            .setBlendMode(blendMode)
            .setScale(1 * this.scene.scaleFactor);

        this.areaEmitterTween = this.scene.tweens.add({
            targets: this.areaEmitter,
            alpha: 0,
            scale: 0.15 * this.scene.scaleFactor,
            x: randomX,
            y: randomY,
            rotation: 1,
            duration: particleDuration,
            ease: 'quad.inout',
            yoyo: false,
            onComplete: () => {
                this.stopAreaEmitter();
                this.createAreaEmitter(texture, object, blendMode, particleDuration);
            }
        });
    }

    // Stop and destroy area emitter
    stopAreaEmitter() {
        if (this.areaEmitter) {
            this.areaEmitter.destroy();
            this.areaEmitter = null;
        }
    }

    // create confetti
    createConfettiEmitter(x, y, amount, lifespan, speedMin, speedMax) {
        this.confettiFrames = [ 
            'c1.png', 
            'c2.png', 
            'c3.png', 
            'c4.png', 
            'c5.png', 
            'c6.png', 
            'c7.png', 
            'c8.png', 
            'c9.png', 
        ];
        
        // Create the particle emitter
        this.confettiEmitter = this.scene.add.particles(0, 0, 'confetti', {
            frame: this.confettiFrames,
            x: x,
            y: y,
            lifespan: lifespan,
            speed: { min: speedMin * this.scene.scaleFactor, max: speedMax * this.scene.scaleFactor },
            scale: 1 * this.scene.scaleFactor,
            gravityY: 150 * this.scene.scaleFactor,
            gravityYDelay: 750 * this.scene.scaleFactor,
            gravityYSpeed: 50 * this.scene.scaleFactor,
            alpha: { start: 1, end: 0 },
            // angle: { min: -100, max: -80 },
            rotate: { min: 0, max: 360 },
            emitting: false,
        });
        
        // Set depth so confetti appears above game elements
        this.confettiEmitter.setDepth(22);
        // Explode confetti
        this.confettiEmitter.explode(amount);
    }

    // ADD NEW PARTICLE EMITTERS HERE //
}