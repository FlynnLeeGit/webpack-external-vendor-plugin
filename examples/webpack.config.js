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
      externals: {
        jquery: 'jQuery',
        vue: 'Vue'
      }
    }),
    new ManifestExtraPlugin()
  )
])

const styleConfig = createConfig([
  bricks.entry({
    common_default: './src/common_default.less'
  }),
  bricks.output(),
  bricks.less(),
  addPlugin(new ManifestExtraPlugin())
])

module.exports = [jsConfig, styleConfig]
