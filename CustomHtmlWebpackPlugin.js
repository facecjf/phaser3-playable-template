const fs = require('fs');
const path = require('path');

class CustomHtmlWebpackPlugin {
  constructor(options) {
    this.templatePath = options.template;
    this.filename = options.filename || 'index.html';
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

      // Replace script tags with the bundled script
      htmlContent = htmlContent.replace(
        /<script.*?src=["'].*?["'].*?><\/script>/g,
        `<script src="${compilation.outputOptions.filename}"></script>`
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
