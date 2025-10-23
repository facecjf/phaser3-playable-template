const fs = require('fs');
const path = require('path');

class CustomHtmlWebpackPlugin {
  constructor(options) {
    this.templatePath = options.template;
    this.filename = options.filename || './src/index.html';
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('CustomHtmlWebpackPlugin', (compilation, callback) => {
      let htmlContent;
      try {
        htmlContent = fs.readFileSync(this.templatePath, 'utf8');
      } catch (error) {
        compilation.errors.push(new Error(`CustomHtmlWebpackPlugin: ${error.message}`));
        return callback();
      }

      // Replace script tags with the bundled script, but preserve mraid.js
      htmlContent = htmlContent.replace(
        /<script.*?src=["'](.*?)["'].*?><\/script>/g,
        (match, src) => {
          // Preserve mraid.js script tag
          if (src.includes('mraid.js')) {
            return match;
          }
          // Replace other script tags with the bundled script
          return `<script src="${compilation.outputOptions.filename}"></script>`;
        }
      );

      compilation.assets[this.filename] = {
        source: () => htmlContent,
        size: () => htmlContent.length
      };

      callback();
    });
  }
}

module.exports = CustomHtmlWebpackPlugin;
