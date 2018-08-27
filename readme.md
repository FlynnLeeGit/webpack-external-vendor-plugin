## webpack-external-vendor-plugin

[![CircleCI](https://circleci.com/gh/FlynnLeeGit/webpack-external-vendor-plugin.svg?style=svg)](https://circleci.com/gh/FlynnLeeGit/webpack-external-vendor-plugin)

for webpack 4.0
useful for some libiaries which are included globally,it will inject global variables in webpack,then all deps can use external modules

## Usage

```js
const ExternalVendorPlugin = require('webpack-external-vendor-plugin')

// webpack.config.js
{
  // use webpack.externals options
  externals:{
    'vue':'window.Vue',
    'jquery':'window.jQuery',
    'babel-polyfill': 'window._babelPolyfill'
  },
  plugins: [
    new ExternalVendorPlugin({
      filename: 'static/[name].js?[hash:7]', // default [name].js
      // notice all js files you need include the browser version
      entry: {
        external_vendor: [
          'jquery/dist/jquery.min',
          'vue/dist/vue.js',
          'babel-polyfill/dist/polyfill.min.js'
        ]
      }
    })
  ]

  //...
}
```

options.externals see [webpack.externals](https://webpack.js.org/configuration/externals/#externals)
