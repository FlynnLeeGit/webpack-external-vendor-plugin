const Plugin = require('../index')
const path = require('path')
const webpackMerge = require('webpack-merge')
const _ = require('lodash')
const { spawnSync } = require('child_process')
const webpack = require('webpack')
const fse = require('fs-extra')

class Urls {
  constructor(name) {
    this.outputPath = path.join(__dirname, 'dist')
    this.externalPath = path.join(this.outputPath, name)
    this.externalFile = this.externalPath + '.js'
  }
}

const urls = new Urls('external_vendor')

const WebpackBuilder = class {
  constructor(webpackUserConfig, pluginUserConfig = {}) {
    this.webpackConfig = webpackMerge(
      {
        context: __dirname,
        entry: {
          one: './fixtures/one.js'
        },
        output: {
          path: urls.outputPath,
          filename: '[name].js'
        },
        plugins: [
          new Plugin(
            _.merge(
              {},
              {
                entry: {
                  external_vendor: ['./fixtures/1.js', './fixtures/2.js'],
                  base: ['./fixtures/1.css', './fixtures/2.css']
                }
              },
              pluginUserConfig
            )
          )
        ]
      },
      webpackUserConfig
    )
  }
  compile(cb) {
    spawnSync('rm', ['-rf', urls.outputPath], { stdio: 'inherit' })

    const compiler = webpack(this.webpackConfig)
    compiler.run((err, stats) => {
      let vendor
      try {
        vendor = fse.readFileSync(urls.externalFile, 'utf-8')
      } catch (e) {
        vendor = null
      }
      expect(err).toBeFalsy()
      expect(stats.hasErrors()).toBe(false)
      cb(vendor, stats)
    })
  }
}

describe('WebpackExternalVendorPlugin', () => {
  describe('basic usage', () => {
    test('throws if an incorrect config is passed in', () => {
      expect(() => {
        new Plugin({
          entry: 'a'
        })
      }).toThrow()
    })

    test('should produce one file', done => {
      new WebpackBuilder().compile(vendor => {
        expect(vendor).toBe(';console.log(1)\r\n;console.log(2)')
        done()
      })
    })

    test('should import node_modules', done => {
      new WebpackBuilder(
        {},
        {
          entry: {
            external_vendor: ['vue']
          }
        }
      ).compile(vendor => {
        expect(vendor.indexOf('Vue.js') > -1).toBeTruthy()
        done()
      })
    })

    test('should has correct hash', done => {
      new WebpackBuilder(
        {},
        {
          filename: '[name][ext]?[hash]'
        }
      ).compile((vendor, stats) => {
        const assets = stats.toJson().assets
        expect(
          _.find(assets, {
            name: 'external_vendor.js?87ff1ce64ba00b82a289'
          })
        ).toBeDefined()
        done()
      })
    })

    test('should has corrent length hash', done => {
      new WebpackBuilder(
        {},
        {
          filename: '[name][ext]?[hash:5]'
        }
      ).compile((vendor, stats) => {
        const assets = stats.toJson().assets
        expect(
          _.find(assets, {
            name: 'external_vendor.js?87ff1'
          })
        ).toBeDefined()
        done()
      })
    })

    test('should produce correct location', done => {
      new WebpackBuilder(
        {},
        {
          filename: 'static/externals[ext]'
        }
      ).compile((__, stats) => {
        const urls = new Urls('static/externals')
        const vendor = fse.readFileSync(urls.externalFile, 'utf-8')
        console.log(vendor)
        expect(vendor).toBe(';console.log(1)\r\n;console.log(2)')
        done()
      })
    })
  })
})
