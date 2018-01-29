const { createConfig, addPlugin, bricks } = require('webpack-bricks')

const ExternalVendorPlugin = require('../index')
const ManifestExtraPlugin = require('webpack-manifest-extra-plugin')

const jsConfig = createConfig([
  bricks.entry(),
  bricks.output(),
  addPlugin(
    new ExternalVendorPlugin({
      entry: {
        external_vendor: [
          'babel-polyfill/dist/polyfill.min',
          'jquery/dist/jquery.min',
          'vue/dist/vue.js'
        ]
      },
      filename: 'static/js/[name].js?[hash:8]',
      externals: {
        jquery: 'jQuery',
        vue: 'Vue'
      }
    }),
    new ManifestExtraPlugin()
  )
])

module.exports = [jsConfig]
