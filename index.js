const fse = require('fs-extra')
const path = require('path')
const merge = require('webpack-merge')
const validateOptions = require('schema-utils')
const createHash = require('crypto').createHash

const schema = require('./schema.json')

const getFilePath = (filePath, name, fileHash) => {
  const hashReg = /\[hash(?:(?::)([\d]+))?\]/
  let finalPath = filePath.replace('[name]', name)

  if (hashReg.test(finalPath)) {
    const hashResult = finalPath.match(hashReg)
    // needed hash lenth
    const hashLength = hashResult[1] ? Number(hashResult[1]) : 20
    return finalPath.replace(hashReg, fileHash.slice(0, hashLength))
  }
  return finalPath
}

const getContent = path => {
  // use require to resolve
  const modulePath = require.resolve(path)
  return fse.readFileSync(modulePath, 'utf-8')
}

const getConcatContent = modules =>
  modules.reduce((a, b) => a + getContent(b), '')

const getMd5Hash = content => {
  return createHash('md5')
    .update(content)
    .digest('hex')
}

const defaultConfig = {
  entry: {},
  filename: '[name].js',
  externals: {}
}

const WebpackExternalVendorPlugin = class {
  constructor(config = {}) {
    validateOptions(schema, config, '[WebpackExternalVendorPlugin]')
    this.config = merge(defaultConfig, config)
  }
  resolveModule() {}

  apply(compiler) {
    // 添加 外部依赖
    compiler.options.externals = this.config.externals

    const webpackPublicPath = compiler.options.output.publicPath
    const webpackOutputPath = compiler.options.output.path

    let first = true
    let files = []

    compiler.plugin('compilation', compilation => {
      if (first) {
        files = Object.keys(this.config.entry).map(name => {
          const vendorPaths = this.config.entry[name]
          const vendorContent = getConcatContent(vendorPaths)
          const hash = getMd5Hash(vendorContent)
          return {
            name,
            source: vendorContent,
            size: vendorContent.length,
            filename: getFilePath(this.config.filename, name, hash)
          }
        })

        files.forEach(f => {
          compilation.assets[f.filename] = {
            source() {
              return f.source
            },
            size() {
              return f.size
            }
          }
        })
        first = false
      }
    })

    // add moudle assets
    compiler.plugin('emit', (compilation, callback) => {
      files.forEach(f => {
        console.log(f.name, f.filename)
        compilation.applyPlugins(
          'module-asset',
          {
            userRequest: f.name + '.js'
          },
          f.filename
        )
      })
      callback()
    })
  }
}

module.exports = WebpackExternalVendorPlugin
