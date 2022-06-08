const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const path = require('path')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'development',
        devServer:
            {
                host: "local-ip",
                open: true,
                https: false,
                static: {
                    directory: path.resolve(__dirname, "../dist"),
                    watch: true,
                }
            }
    }
)
