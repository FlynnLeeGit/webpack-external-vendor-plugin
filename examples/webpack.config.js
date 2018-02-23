const $ = require('webpack-bricks')
const ExternalVendorPlugin = require('../index')
const ManifestExtraPlugin = require('webpack-manifest-extra-plugin')

const jsTask = $().lay(
  $.entry(),
  $.output(),
  $.plugins([
    new ExternalVendorPlugin({
      entry: {
        external_vendor: [
          'babel-polyfill/dist/polyfill.min',
          'jquery/dist/jquery.min',
          'vue/dist/vue.js'
        ]
      },
      externals: {
        jquery: 'jQuery',
        vue: 'Vue'
      }
    }),
    new ManifestExtraPlugin()
  ])
)

const styleTask = $().lay(
  $.entry({
    common_default: './src/common_default.less'
  }),
  $.output(),
  $.less(),
  $.plugin(new ManifestExtraPlugin())
)

module.exports = [jsTask, styleTask]
