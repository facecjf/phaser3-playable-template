export default class AdNetworkManager {
    constructor() {
        this.adNetwork = process.env.NODE_ENV === 'production' 
            ? (process.env.AD_NETWORK || 'default')
            : 'development';
        this.isAdVisible = false;
        this.gameStarted = false;
        this.isAdReady = false;
        this.isAdLoaded = false;

        // --- Bigabid-specific state ---
        this.bigabidInteractionCount = 0;
        this.hasBigabidEngaged = false;
        this.hasBigabidCompleted = false;
    }

    // --- Helper to fire Bigabid macros ---
    fireBigabidMacro(macroName) {
        if (
            window.BIGABID_BIDTIMEMACROS &&
            window.BIGABID_BIDTIMEMACROS[macroName]
        ) {
            const url = window.BIGABID_BIDTIMEMACROS[macroName];
            const img = new window.Image();
            img.src = url;
        }
    }

    // --- Call this on any user interaction (pointerdown, etc.) ---
    handleBigabidEngagement() {
        if (this.adNetwork !== 'bigabid') return;

        this.bigabidInteractionCount += 1;

        // Fire engagement macro on first interaction
        if (!this.hasBigabidEngaged) {
            this.hasBigabidEngaged = true;
            this.fireBigabidMacro('engagement');
            console.log('Bigabid: engagement fired');
        }

        // Fire complete macro after 3+ interactions, only once
        if (
            this.bigabidInteractionCount >= 3 &&
            !this.hasBigabidCompleted
        ) {
            this.hasBigabidCompleted = true;
            this.fireBigabidMacro('complete');
            console.log('Bigabid: complete fired'); 
            this.fireBigabidMacro('final_url');
            console.log('Bigabid: final_url fired');
        }
    }

    clickCTA() {
        switch (this.adNetwork) {
            // Add any specific CTA Click logic here
            case 'development':
                if (typeof url !== 'undefined') {
                    window.open(url);
                } else {
                    console.log('%cAdNetwork Manager::Development: No URL defined', 'color: #f87c00; background:rgb(29, 29, 29);');
                }
                break;
            case 'google':
                //window.open(window.globalThis.clickTag);
                if (!window.ExitApi) {
                    console.warn("ExitApi not defined");
                    console.warn(
                      "ExitApi.exit() called in development environment! Test it on: https://h5validator.appspot.com/adwords/asset"
                    );
                    return;
                  }
                  window.ExitApi.exit();
                break;
            case 'adikteev':
                // Fire the click pixel
                if (typeof AK_CLICK_PIXEL_URL !== 'undefined') {
                    const img = new Image();
                    img.src = AK_CLICK_PIXEL_URL;
                }
                // Open the destination URL
                if (typeof AK_CLICK_DESTINATION_URL !== 'undefined') {
                    mraid.open(AK_CLICK_DESTINATION_URL);
                } else {
                    mraid.open(); // Fallback
                }
                break;
            case 'aarki':
                window.open();
                break;
            case 'ironsource':
                mraid.open(url); 
                break;
            case 'facebook':
                FbPlayableAd.onCTAClick();
                break;
            case 'moloco':
                FbPlayableAd.onCTAClick();
                break;  
            case 'tencent':
                FbPlayableAd.onCTAClick();
                break;
            case 'applovin':
                mraid.open();
                break;
            case 'liftoff':
                mraid.open();
                break;
            case 'adcolony':
                mraid.open();
                break;
            case 'chartboost':
                mraid.open();
                break;
            case 'tiktok':
                window.openAppStore();
                break;
            case 'unity':
                mraid.open(url);
                break;
            case 'smadex':
                // Only open the app store for non-Facebook builds
                // NOTE: Disable for Facebook & Moloco builds
                window.open(window.location.href = '{$CLICK_TRACK_URL$}');
                break;
            case 'mintegral':
                window.gameEnd && window.gameEnd();
                window.gameClose();
                window.install && window.install();
                break;
            case 'vungle':
                parent.postMessage('download', '*');
                break;
            case 'bigabid':
                // Fire click, complete, and final_url macros (no redirect)
                this.fireBigabidMacro('click');
                this.fireBigabidMacro('complete');
                this.fireBigabidMacro('final_url');
                console.log('Bigabid: click, complete, and final_url fired');
                break;
            default:
                console.log('%cAdNetwork Manager::Development CTA click', 'color: #f87c00; background:rgb(29, 29, 29);');

        }
    }

    endGameAd() {
        switch (this.adNetwork) {
            // Add any specific end game ad logic here
            case 'vungle':
                parent.postMessage('complete', '*');
                console.log('Ad experience has completed');
                break;
            case 'mintegral':
                window.gameEnd && window.gameEnd();
                break;
            case 'bigabid':
                this.fireBigabidMacro('complete');
                this.fireBigabidMacro('final_url');
                console.log('Bigabid: complete and final_url fired');
                break;
            case 'development':
                console.log('%cAdNetwork Manager::Development end game ad', 'color: #f87c00; background:rgb(29, 29, 29);');
                break;
            default:
                console.log('%cAdNetwork Manager::Development end game ad', 'color: #f87c00; background:rgb(29, 29, 29);');
        }
    }

    startGameAd() {
        switch (this.adNetwork) {
            // Add any specific start game ad logic here
            case 'mintegral':
                window.gameStart();
                break;
            case 'ironsource':
                if (this.isAdVisible && !this.gameStarted) {
                    this.gameStarted = true;
                    console.log('IS: Game started due to ad being visible');
                }
                    break;
            case 'unity':
                if (this.isAdVisible && !this.gameStarted) {
                    this.gameStarted = true;
                    console.log('Unity: Game started due to ad being visible');
                }
                break;
            case 'bigabid':
                this.fireBigabidMacro('game_viewable');
                break;
            case 'development':
                console.log('%cAdNetwork Manager::Development start game ad', 'color: #f87c00; background:rgb(29, 29, 29);');
                break;
            default:
                console.log('%cAdNetwork Manager::Development start game ad', 'color: #f87c00; background:rgb(29, 29, 29);');
        }
    }

    loadedGameAd() {
        switch (this.adNetwork) {
            // Add any specific load game ad logic here
            case 'applovin':
                mraid.getState();
                break;
                case 'ironsource':
                    if (typeof mraid !== 'undefined') {
                        // 1 helper so we don't duplicate the start logic
                        const tryStartGame = () => {
                            if (
                                this.isAdVisible &&          // the ad is on‑screen
                                this.isMraidReady &&         // 'ready' event has fired
                                this.isStatePlayable &&      // state is default|expanded
                                !this.gameStarted            // we haven't started yet
                            ) {
                                this.startGameAd();
                            }
                        };
    
                        // 2 READY 
                        this.isMraidReady = false;
                        mraid.addEventListener('ready', () => {
                            console.log('IS: mraid ready');
                            this.isMraidReady = true;
                            tryStartGame();
                        });
    
                        // 3 STATE CHANGE
                        this.isStatePlayable = false;
                        const onStateChange = (state) => {
                            this.isStatePlayable = (state === 'default' || state === 'expanded');
                            console.log(`IS: state → ${state}`);
                            tryStartGame();
                        };
                        mraid.addEventListener('stateChange', onStateChange);
    
                        // If mraid is already injected & ready you won't get a ready
                        // event, so we normalise the current values immediately.
                        if (mraid.getState() !== 'loading') {
                            this.isMraidReady = true;
                            onStateChange(mraid.getState());
                        }
    
                        // 4 VIEWABILITY
                        mraid.addEventListener(
                            'viewableChange',
                            this.handleViewableChange.bind(this)
                        );
                        // prime the visibility flag
                        this.isAdVisible = mraid.isViewable();
                    }
                    break;
            case 'mintegral':
                window.gameReady && window.gameReady();
                break;
            case 'unity':
                // Set up viewableChange event listener for Unity ads
                if (typeof mraid !== 'undefined') {
                    mraid.addEventListener('viewableChange', this.handleViewableChange.bind(this));
                    
                    // Check if the ad is already viewable
                    if (mraid.isViewable()) {
                        this.isAdVisible = true;
                        console.log('Unity: Ad is initially viewable');
                    }
                }
                break;
            case 'bigabid':
                this.fireBigabidMacro('mraid_viewable');
                console.log('Bigabid: mraid_viewable fired');
                break;
            case 'development':
                console.log('%cAdNetwork Manager::Development loaded game ad', 'color: #f87c00; background:rgb(29, 29, 29);');
                break;
            default:
                console.log('%cAdNetwork Manager::Development loaded game ad', 'color: #f87c00; background:rgb(29, 29, 29);');
        }
    }

    audioVolumeChange(volume) {
        switch (this.adNetwork) {
            case 'ironsource':
                mraid.setVolume(volume);
                break;
            case 'development':
                console.log('%cAdNetwork Manager::Development audio volume change', 'color: #f87c00; background:rgb(29, 29, 29);');
                break;
            default:
                console.log('%cAdNetwork Manager::Development audio volume change', 'color: #f87c00; background:rgb(29, 29, 29);');
        }
    }
    
    // Handle viewable change events for Unity & ironsource ads
    handleViewableChange(viewable) {
        if (this.adNetwork !== 'unity' && this.adNetwork !== 'ironsource' /*&& this.adNetwork !== 'facebook'*/) return;
        
        this.isAdVisible = viewable;
        
        if (viewable) {
            console.log('Ad became viewable');
            // If the ad becomes viewable, start the game if it hasn't started yet
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.startGameAd();
            }
            
            // Dispatch a custom event that the game can listen for
            const viewableEvent = new CustomEvent('adViewableChange', { detail: { viewable: true } });
            window.dispatchEvent(viewableEvent);
        } else {
            console.log('Ad is no longer viewable');
            // Dispatch a custom event that the game can listen for to pause gameplay
            const viewableEvent = new CustomEvent('adViewableChange', { detail: { viewable: false } });
            window.dispatchEvent(viewableEvent);
        }
    }
}
