﻿const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Import store links configuration
const storeLinks = require('./src/store-links.js');

// All available ad networks
const allAdNetworks = [
    'development',
    'aarki',
    'adcolony',
    'adikteev',
    'applovin',
    'bigabid',
    'facebook',
    'google',
    'ironsource',
    'liftoff',
    'mintegral',
    'moloco',
    'smadex',
    'tencent',
    'tiktok',
    'unity',
    'vungle'
    //'chartboost'
];

const buildDir = path.join(__dirname, 'dist');
const templateDir = path.join(__dirname, 'src', 'index');

console.log('Current working directory:', process.cwd());
console.log('Template directory:', templateDir);

// Ensure the build directory exists
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask a question and return a promise
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Add this function after the imports (around line 8)
function injectStoreLinks(htmlContent, network) {
    // Get links for this network, falling back to default
    const links = storeLinks[network] || storeLinks.default;
    
    // Replace the hardcoded URLs with the configured ones
    htmlContent = htmlContent.replace(
        /var url = '.*?';\s*\/\/\s*IOS/g,
        `var url = '${links.ios}'; // IOS`
    );
    
    htmlContent = htmlContent.replace(
        /var android = '.*?';\s*\/\/\s*ANDROID/g,
        `var android = '${links.android}'; // ANDROID`
    );
    
    return htmlContent;
}

// Main async function to handle the interactive flow
async function main() {
    try {
        // Prompt user for project name prefix
        const prefix = await question('Enter the project name prefix: ');

        // Display available networks
        console.log('\nAvailable ad networks:');
        allAdNetworks.forEach((network, index) => {
            console.log(`${index + 1}. ${network}`);
        });
        console.log('\nYou can select networks by:');
        console.log('- Entering numbers separated by commas (e.g., 1,3,5)');
        console.log('- Entering "all" to build all networks');
        console.log('- Entering network names separated by commas (e.g., facebook,google,unity)');

        // Get user selection
        const selection = await question('\nSelect networks to build: ');

        let selectedNetworks = [];

        if (selection.toLowerCase() === 'all') {
            selectedNetworks = allAdNetworks;
        } else if (/^\d+(,\d+)*$/.test(selection.trim())) {
            // User entered numbers
            const indices = selection.split(',').map(s => parseInt(s.trim()) - 1);
            selectedNetworks = indices
                .filter(i => i >= 0 && i < allAdNetworks.length)
                .map(i => allAdNetworks[i]);
        } else {
            // User entered network names
            const names = selection.split(',').map(s => s.trim().toLowerCase());
            selectedNetworks = allAdNetworks.filter(network => 
                names.includes(network.toLowerCase())
            );
        }

        if (selectedNetworks.length === 0) {
            console.log('No valid networks selected. Exiting...');
            rl.close();
            return;
        }

        console.log(`\nBuilding for: ${selectedNetworks.join(', ')}`);
        console.log('Starting build process...\n');

        // Build selected networks
        for (const network of selectedNetworks) {
            console.log(`Building for ${network}...`);

            // Determine if this network requires inlining
            const requiresInlining = ['tencent', 'smadex'].includes(network);

            try {
                // Create webpack config for this network
                const configContent = createWebpackConfig(network, requiresInlining, prefix);

                // Write the webpack config to a temporary file
                const tempConfigPath = path.join(__dirname, `webpack.${network}.config.js`);
                fs.writeFileSync(tempConfigPath, configContent);

                // Run the build command with the custom config
                execSync(`npx webpack --config ${tempConfigPath}`, { stdio: 'inherit', env: process.env });

                // Remove the temporary config file
                fs.unlinkSync(tempConfigPath);

                // Copy playable-preview.html for development network
                if (network === 'development') {
                    const previewSrcPath = path.join(templateDir, 'development', 'playable-preview.html');
                    const previewDestPath = path.join(buildDir, `${prefix}_development`, 'playable-preview.html');
                    if (fs.existsSync(previewSrcPath)) {
                        fs.copyFileSync(previewSrcPath, previewDestPath);
                        console.log('playable-preview.html copied to build directory for development.');
                    } else {
                        console.warn('playable-preview.html not found for development.');
                    }
                }

                // Copy config.json for tiktok network
                if (network === 'tiktok') {
                    const configSrcPath = path.join(templateDir, 'tiktok', 'config.json');
                    const configDestPath = path.join(buildDir, `${prefix}_tiktok`, 'config.json');
                    if (fs.existsSync(configSrcPath)) {
                        fs.copyFileSync(configSrcPath, configDestPath);
                        console.log('config.json copied to build directory for tiktok.');
                    } else {
                        console.warn('config.json not found for tiktok.');
                    }
                }

                // Copy ad.txt for bigabid network
                if (network === 'bigabid') {
                    const configSrcPath = path.join(templateDir, 'bigabid', 'ad.txt');
                    const configDestPath = path.join(buildDir, `${prefix}_bigabid`, 'ad.txt');
                    if (fs.existsSync(configSrcPath)) {
                        fs.copyFileSync(configSrcPath, configDestPath);
                        console.log('ad.txt copied to build directory for bigabid.');
                    } else {
                        console.warn('ad.txt not found for bigabid.');
                    }
                }

                // Copy style.css for adikteev
                if (network === 'adikteev') {
                    const styleSrcPath = path.join(templateDir, 'adikteev', 'style.css');
                    const styleDestPath = path.join(buildDir, `${prefix}_adikteev`, 'style.css');
                    if (fs.existsSync(styleSrcPath)) {
                        fs.copyFileSync(styleSrcPath, styleDestPath);
                        console.log('style.css copied to build directory for adikteev.');
                    } else {
                        console.warn('style.css not found for adikteev.');
                    }
                }

                // Embed the compiled script into index.html for specified networks
                if (!requiresInlining && network !== 'adikteev') {
                    const buildPath = path.join(buildDir, `${prefix}_${network}`);
                    const indexPath = path.join(buildPath, 'index.html');
                    const scriptPath = path.join(buildPath, network === 'adikteev' ? 'creative.js' : 'playable.js');

                    if (fs.existsSync(indexPath) && fs.existsSync(scriptPath)) {
                        let indexContent = fs.readFileSync(indexPath, 'utf8');
                        const scriptContent = fs.readFileSync(scriptPath, 'utf8');

                        // Replace the placeholder with the script content
                        indexContent = indexContent.replace('// P3 SCRIPT HERE', `${scriptContent}`);
                        
                        // Inject store links
                        indexContent = injectStoreLinks(indexContent, network);

                        // Write the modified index.html back to the build directory
                        fs.writeFileSync(indexPath, indexContent);

                        // Optionally, remove the standalone script file if no longer needed
                        fs.unlinkSync(scriptPath);

                        console.log(`Embedded script into index.html for ${network}.`);
                    } else {
                        console.warn(`index.html or playable.js not found for ${network}.`);
                    }
                } else {
                    // For networks that require inlining or adikteev, still inject store links
                    const buildPath = path.join(buildDir, `${prefix}_${network}`);
                    const indexPath = path.join(buildPath, 'index.html');
                    
                    if (fs.existsSync(indexPath)) {
                        let indexContent = fs.readFileSync(indexPath, 'utf8');
                        indexContent = injectStoreLinks(indexContent, network);
                        fs.writeFileSync(indexPath, indexContent);
                        console.log(`Injected store links into index.html for ${network}.`);
                    }
                }

                console.log(`Build for ${network} completed successfully.`);
            } catch (error) {
                console.error(`Error building for ${network}:`, error.message);
            }
        }

        console.log('\nAll builds completed.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        rl.close();
    }
}

function createWebpackConfig(network, inline, prefix) {
    const templatePath = path.join(templateDir, network, 'index.html');
    
    console.log(`Checking for template file: ${templatePath}`);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
    }

    const configContent = `
const path = require('path');
const webpack = require('webpack');
const CustomHtmlWebpackPlugin = require('./CustomHtmlWebpackPlugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: ${network === 'adikteev' ? '"creative.js"' : '"playable.js"'},
        path: path.resolve(__dirname, 'dist', '${prefix}_${network}'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            },
            {
                test: /\\.(gif|png|jpe?g|svg|mp3|m4a|ogg|wav|json|xml)$/i,
                type: 'asset/inline'
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.AD_NETWORK': JSON.stringify('${network}')
        }),
        new CustomHtmlWebpackPlugin({
            template: '${templatePath.replace(/\\/g, '\\\\')}',
            filename: 'index.html'
        }),
    ]
};
`;

    return configContent;
}

// Run the main function
main();