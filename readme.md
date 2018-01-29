## webpack-external-vendor-plugin

useful for some libiaries which are included globally,it will inject global variables in webpack,then all deps can use external modules

## Usage

```js
const ExternalVendorPlugin = require('webpack-external-vendor-plugin')

// webpack.config.js
{
  //...
  plugins: [
    new ExternalVendorPlugin({
      // notice all js files you need include the browser version
      entry: {
        external_vendor: [
          'jquery/dist/jquery.min',
          'vue/dist/vue.js',
          'babel-polyfill/dist/polyfill.min.js'
        ]
      }, // default {}
      // same as webpack.externals
      externals: {
        // default {}
        // moduleName:global Vars
        vue: 'Vue',
        jquery: 'jQuery'
      },
      filename: 'static/[name].js?[hash:7]' // default [name].js
    })
  ]

  //...
}
```

options.externals see [webpack.external](https://webpack.js.org/configuration/externals/#externals)
