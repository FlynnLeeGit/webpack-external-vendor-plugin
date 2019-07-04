const fse = require('fs-extra')
const path = require('path')
const merge = require('webpack-merge')
const validateOptions = require('schema-utils')
const createHash = require('crypto').createHash

const schema = require('./schema.json')

const getFilePath = (filePath, name, fileHash, ext) => {
  const hashReg = /\[hash(?:(?::)([\d]+))?\]/
  let finalPath = filePath.replace('[name]', name).replace('[ext]', ext)
  if (hashReg.test(finalPath)) {
    const hashResult = finalPath.match(hashReg)
    // needed hash length
    const hashLength = hashResult[1] ? Number(hashResult[1]) : 20
    return finalPath.replace(hashReg, fileHash.slice(0, hashLength))
  }
  return finalPath
}

const getContent = (file, ctx) => {
  // if relative use fileSystem to read
  if (file[0] === '.') {
    return fse.readFileSync(path.join(ctx, file), 'utf-8')
  }
  // use require to resolve module path
  return fse.readFileSync(require.resolve(file), 'utf-8')
}

const getConcatContent = (modules, ctx) => {
  return modules.map(m => getContent(m, ctx)).join('\r\n')
}

const getMd5Hash = content => {
  return createHash('md5')
    .update(content)
    .digest('hex')
}

const defaultConfig = {
  entry: {},
  filename: '[name][ext]'
}

const WebpackExternalVendorPlugin = class {
  constructor(config = {}) {
    this.name = 'WebpackExternalVendorPlugin'
    validateOptions(schema, config, '[WebpackExternalVendorPlugin]')
    this.config = merge(defaultConfig, config)
  }

  apply(compiler) {
    this.compiler = compiler
    this.webpackOptions = compiler.options
    this.context = compiler.context
    compiler.hooks.compilation.tap(this.name, this.applyHtmlPlugin.bind(this))
  }
  applyHtmlPlugin(compilation) {
    let firstCompile = true
    let files = []
    if (firstCompile) {
      files = Object.keys(this.config.entry).map(name => {
        const vendorPaths = this.config.entry[name]
        const vendorContent = getConcatContent(vendorPaths, this.context)
        const hash = getMd5Hash(vendorContent)
        const ext = path.extname(vendorPaths[0]) || '.js'
        const file = {
          name,
          source: vendorContent,
          size: vendorContent.length,
          ext: ext,
          filename: getFilePath(this.config.filename, name, hash, ext)
        }
        return file
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
      firstCompile = false
    }

    const hook = compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration
    const webpackPublicPath = this.webpackOptions.output.publicPath || '/'
    if (hook) {
      hook.tapAsync(this.name, appendToChunks)
    }
    function appendToChunks(data, callback) {
      files.forEach(f => {
        if (f.ext === '.js') {
          data.assets.js = [webpackPublicPath + f.filename, ...data.assets.js]
        }
        if (f.ext === '.css') {
          data.assets.css = [webpackPublicPath + f.filename, ...data.assets.js]
        }
        data.assets.chunks = {
          [f.name]: {
            entry: webpackPublicPath + f.filename
          },
          ...data.assets.chunks
        }
      })
      callback(null, data)
    }
  }
}

module.exports = WebpackExternalVendorPlugin
