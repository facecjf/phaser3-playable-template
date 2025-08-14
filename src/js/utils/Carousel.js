export default class Carousel {
    constructor(scene) {
        this.scene = scene;
        this.scaleFactor = this.scene.scaleFactor;
        this.carousel = null;
        this.carouselItems = [];
        this.carouselContainer = null;
        this.carouselContainerX = this.scene.centerX;
        this.carouselContainerY = this.scene.centerY;
        this.carouselContainerWidth = this.scene.gameWidth;
        this.carouselContainerHeight = this.scene.gameHeight;
        
        // Carousel settings
        this.itemCount = 3;
        this.itemSpacing = 150 * this.scaleFactor; // Space between items
        this.scrollSpeed = 1; // Pixels per frame
        
        // Scale settings for different positions
        this.centerScale = 1; // Scale for centered item
        this.middleScale = 0.8; // Scale for middle items (between center and side)
        this.sideScale = 0.5; // Scale for side items
        
        // Alpha settings for different positions
        this.centerAlpha = 1; // Alpha for centered item
        this.middleAlpha = 0.65; // Alpha for middle items
        this.sideAlpha = 0.25; // Alpha for side items
        
        // Carousel bounds
        this.carouselWidth = 600 * this.scaleFactor; // Custom carousel width for wrapping
        
        this.isScrolling = false;
        this.scrollTween = null;
        
        // Item texture keys
        this.itemKeys = ['item_01', 'item_02', 'item_03', 'item_04', 'item_05'];
        
        // Track total cycle width
        this.cycleWidth = 0;
        
        // Mask for hiding items outside carousel bounds
        this.maskShape = null;
    }
    
    // Create the carousel
    createCarousel(x, y, width) {
        // Set carousel position
        this.carouselContainerX = x || this.scene.centerX;
        this.carouselContainerY = y || this.scene.centerY;
        
        // Set custom carousel width if provided
        if (width) {
            this.carouselWidth = width * this.scaleFactor;
        }
        
        // Calculate cycle width based on item count
        this.cycleWidth = this.itemCount * this.itemSpacing;
        
        // Create container for all carousel items
        this.carouselContainer = this.scene.add.container(this.carouselContainerX, this.carouselContainerY);
        
        // Create mask to hide items outside carousel bounds
        this.createCarouselMask();
        
        // Create carousel items
        this.createCarouselItems();
        
        // Start with center item highlighted
        this.updateItemStates();
    }
    
    // Create a mask to hide items outside carousel bounds
    createCarouselMask() {
        const halfWidth = this.carouselWidth / 2;
        const halfHeight = 200; // Adjust based on your item height
        
        // Create a graphics object for the mask shape
        this.maskShape = this.scene.make.graphics();
        this.maskShape.fillStyle(0xffffff);
        this.maskShape.fillRect(
            this.carouselContainerX - halfWidth,
            this.carouselContainerY - halfHeight,
            this.carouselWidth,
            halfHeight * 2
        );
        
        // Create the mask from the shape
        const mask = this.maskShape.createGeometryMask();
        
        // Apply mask to container
        this.carouselContainer.setMask(mask);
    }
    
    // Create individual carousel items
    createCarouselItems() {
        // Clear existing items
        this.carouselItems = [];
        
        // Calculate how many items we need for smooth infinite scrolling
        // We need enough to cover the visible area plus buffer on each side
        const visibleItems = Math.ceil(this.carouselWidth / this.itemSpacing) + 2;
        const totalCycles = Math.ceil(visibleItems / this.itemCount) + 2; // Extra cycles for smooth wrapping
        const totalItems = totalCycles * this.itemCount;
        
        // Calculate starting position to ensure one item is centered
        // We want the middle item of the middle cycle to be at x=0
        const middleCycle = Math.floor(totalCycles / 2);
        const middleItem = Math.floor(this.itemCount / 2);
        const centerOffset = (middleCycle * this.itemCount + middleItem) * this.itemSpacing;
        let currentX = -centerOffset;
        
        // Create items
        for (let cycle = 0; cycle < totalCycles; cycle++) {
            for (let i = 0; i < this.itemCount; i++) {
                // Get texture - use only the first 'itemCount' textures
                const textureIndex = i % Math.min(this.itemCount, this.itemKeys.length);
                const item = this.scene.add.image(currentX, 0, this.itemKeys[textureIndex]);
                
                // Set initial scale and alpha (will be updated by updateItemStates)
                item.setScale(this.sideScale * this.scaleFactor);
                item.setAlpha(this.sideAlpha);
                
                // Store item data
                item.setData('textureIndex', textureIndex);
                item.setData('cycleIndex', cycle);
                item.setData('positionInCycle', i);
                
                // Add to container and array
                this.carouselContainer.add(item);
                this.carouselItems.push(item);
                
                // Move to next position
                currentX += this.itemSpacing;
            }
        }
        
        // Update initial states - this will set the centered item to full scale/alpha
        this.updateItemStates();
    }

    // Center a specific item by texture index
    centerItemByIndex(index) {
        // Find the item with the matching texture index that's closest to center
        let targetItem = null;
        let minDistance = Infinity;
        
        this.carouselItems.forEach(item => {
            if (item.getData('textureIndex') === index) {
                const distance = Math.abs(item.x);
                if (distance < minDistance) {
                    minDistance = distance;
                    targetItem = item;
                }
            }
        });
        
        if (targetItem) {
            // Calculate offset needed to center this item
            const offset = -targetItem.x;
            
            // Move all items by this offset
            this.carouselItems.forEach(item => {
                item.x += offset;
            });
            
            // Update states to reflect new positions
            this.updateItemStates();
        }
    }
    
    // Start the carousel scrolling animation
    startScrolling() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        
        // Create scrolling animation using scene update
        this.scene.events.on('update', this.updateScroll, this);
    }
    
    // Update scrolling
    updateScroll = (time, delta) => {
        if (!this.isScrolling) return;
        
        // Calculate scroll amount based on delta time
        const scrollAmount = (this.scrollSpeed * delta) / 16.666; // Normalize to 60fps
        
        // Move all items
        this.carouselItems.forEach(item => {
            item.x -= scrollAmount;
        });
        
        // Update states and wrap items
        this.updateItemStates();
        this.wrapItems();
    }
    
    // Stop the carousel scrolling
    stopScrolling() {
        this.isScrolling = false;
        this.scene.events.off('update', this.updateScroll, this);
        
        if (this.scrollTween) {
            this.scrollTween.stop();
            this.scrollTween = null;
        }
    }
    
    // Update item states based on their position
    updateItemStates() {
        const centerX = 0; // Center of the container
        
        // Adjust thresholds to ensure all three states are visible
        // These should be based on actual item positions, not just percentages of itemSpacing
        const centerThreshold = this.itemSpacing * 0.5; // Half the distance to next item
        const middleThreshold = this.itemSpacing * 1.5; // 1.5x the distance to next item
        
        this.carouselItems.forEach(item => {
            const distance = Math.abs(item.x - centerX);
            
            if (distance < centerThreshold) {
                // Item is in center zone - interpolate between center and middle
                const normalizedDistance = distance / centerThreshold;
                const scale = Phaser.Math.Linear(this.centerScale, this.middleScale, normalizedDistance);
                const alpha = Phaser.Math.Linear(this.centerAlpha, this.middleAlpha, normalizedDistance);
                
                item.setScale(scale * this.scaleFactor);
                item.setAlpha(alpha);
                item.setDepth(3); // Highest depth for center
            } else if (distance < middleThreshold) {
                // Item is in middle zone - interpolate between middle and side
                const normalizedDistance = (distance - centerThreshold) / (middleThreshold - centerThreshold);
                const scale = Phaser.Math.Linear(this.middleScale, this.sideScale, normalizedDistance);
                const alpha = Phaser.Math.Linear(this.middleAlpha, this.sideAlpha, normalizedDistance);
                
                item.setScale(scale * this.scaleFactor);
                item.setAlpha(alpha);
                item.setDepth(2); // Middle depth
            } else {
                // Item is on the side/far edges
                item.setScale(this.sideScale * this.scaleFactor);
                item.setAlpha(this.sideAlpha);
                item.setDepth(1); // Lowest depth
            }
        });
    }
    
    // Wrap items based on carousel cycle width
    wrapItems() {
        // Find the leftmost and rightmost items
        let leftmostItem = null;
        let rightmostItem = null;
        let minX = Infinity;
        let maxX = -Infinity;
        
        this.carouselItems.forEach(item => {
            if (item.x < minX) {
                minX = item.x;
                leftmostItem = item;
            }
            if (item.x > maxX) {
                maxX = item.x;
                rightmostItem = item;
            }
        });
        
        // Check if we need to wrap items
        const halfWidth = this.carouselWidth / 2;
        const buffer = this.itemSpacing;
        
        // If the rightmost item is getting close to the left edge, wrap the leftmost item to the right
        if (maxX < halfWidth + buffer) {
            leftmostItem.x = maxX + this.itemSpacing;
        }
        
        // If the leftmost item is getting close to the right edge, wrap the rightmost item to the left
        if (minX > -halfWidth - buffer) {
            rightmostItem.x = minX - this.itemSpacing;
        }
    }
    
    // Manual scroll to next item
    scrollToNext() {
        if (this.scrollTween && this.scrollTween.isPlaying()) return;
        
        this.scrollTween = this.scene.tweens.add({
            targets: this.carouselItems,
            x: `-=${this.itemSpacing}`,
            duration: 300,
            ease: 'Quad.easeInOut',
            onUpdate: () => {
                this.updateItemStates();
            },
            onComplete: () => {
                this.wrapItems();
                this.scrollTween = null;
            }
        });
    }
    
    // Manual scroll to previous item
    scrollToPrevious() {
        if (this.scrollTween && this.scrollTween.isPlaying()) return;
        
        this.scrollTween = this.scene.tweens.add({
            targets: this.carouselItems,
            x: `+=${this.itemSpacing}`,
            duration: 300,
            ease: 'Quad.easeInOut',
            onUpdate: () => {
                this.updateItemStates();
            },
            onComplete: () => {
                this.wrapItems();
                this.scrollTween = null;
            }
        });
    }
    
    // Get the currently centered item
    getCenteredItem() {
        let centeredItem = null;
        let minDistance = Infinity;
        
        this.carouselItems.forEach(item => {
            const distance = Math.abs(item.x);
            if (distance < minDistance) {
                minDistance = distance;
                centeredItem = item;
            }
        });
        
        return centeredItem;
    }
    
    // Set carousel width
    setCarouselWidth(width) {
        this.carouselWidth = width * this.scaleFactor;
        // Recreate items and mask with new width
        if (this.carouselContainer) {
            this.carouselContainer.removeAll(true);
            if (this.maskShape) {
                this.maskShape.destroy();
            }
            this.createCarouselMask();
            this.createCarouselItems();
        }
    }
    
    // Update carousel position
    setPosition(x, y) {
        this.carouselContainer.setPosition(x, y);
        // Update mask position
        if (this.maskShape) {
            this.maskShape.destroy();
            this.createCarouselMask();
        }
    }
    
    // Show/hide carousel
    setVisible(visible) {
        this.carouselContainer.setVisible(visible);
    }
    
    // Configure item states (scales and alphas)
    configureItemStates(config) {
        if (config.centerScale !== undefined) this.centerScale = config.centerScale;
        if (config.middleScale !== undefined) this.middleScale = config.middleScale;
        if (config.sideScale !== undefined) this.sideScale = config.sideScale;
        if (config.centerAlpha !== undefined) this.centerAlpha = config.centerAlpha;
        if (config.middleAlpha !== undefined) this.middleAlpha = config.middleAlpha;
        if (config.sideAlpha !== undefined) this.sideAlpha = config.sideAlpha;
        
        // Update current item states
        this.updateItemStates();
    }
    
    // Configure carousel parameters
    configureCarousel(config) {
        let needsRebuild = false;
        
        if (config.itemCount !== undefined && config.itemCount !== this.itemCount) {
            this.itemCount = config.itemCount;
            needsRebuild = true;
        }
        
        if (config.itemSpacing !== undefined) {
            this.itemSpacing = config.itemSpacing * this.scaleFactor;
            needsRebuild = true;
        }
        
        if (config.scrollSpeed !== undefined) {
            this.scrollSpeed = config.scrollSpeed;
        }
        
        if (config.carouselWidth !== undefined) {
            this.carouselWidth = config.carouselWidth * this.scaleFactor;
            needsRebuild = true;
        }
        
        // Rebuild carousel if structure changed
        if (needsRebuild && this.carouselContainer) {
            const wasScrolling = this.isScrolling;
            this.stopScrolling();
            
            // Recalculate cycle width
            this.cycleWidth = this.itemCount * this.itemSpacing;
            
            // Rebuild items and mask
            this.carouselContainer.removeAll(true);
            if (this.maskShape) {
                this.maskShape.destroy();
            }
            this.createCarouselMask();
            this.createCarouselItems();
            
            // Restart scrolling if it was active
            if (wasScrolling) {
                this.startScrolling();
            }
        }
    }
    
    // Create a debug visualization of carousel bounds (optional)
    showDebugBounds() {
        const halfWidth = this.carouselWidth / 2;
        
        // Create debug graphics if not exists
        if (!this.debugGraphics) {
            this.debugGraphics = this.scene.add.graphics();
            this.carouselContainer.add(this.debugGraphics);
            this.debugGraphics.setDepth(10); // Make sure it's on top
        }
        
        // Clear and redraw
        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
        this.debugGraphics.strokeRect(-halfWidth, -100, this.carouselWidth, 200);
    }
    
    // Hide debug bounds
    hideDebugBounds() {
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
            this.debugGraphics = null;
        }
    }
    
    // Destroy carousel
    destroy() {
        this.stopScrolling();
        this.hideDebugBounds();
        if (this.maskShape) {
            this.maskShape.destroy();
        }
        if (this.carouselContainer) {
            this.carouselContainer.destroy();
        }
        this.carouselItems = [];
    }

    // update carousel position
    updateCarouselPosition(x, y) {
        this.carouselContainerX = x;
        this.carouselContainerY = y;
        this.carouselContainer.setPosition(this.carouselContainerX, this.carouselContainerY);

        // update mask position
        if (this.maskShape) {
            this.maskShape.destroy();
            this.createCarouselMask();
        }
    }
}