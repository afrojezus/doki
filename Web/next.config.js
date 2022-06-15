module.exports = {
    serverRuntimeConfig: {
        PROJECT_ROOT: __dirname
    },
    distDir: 'dist',
    webpack(config) {
        config.module.rules.push({
            test: /\.worker\.js$/,
            use: {loader: 'worker-loader'}
        });
        return config
    }
}
