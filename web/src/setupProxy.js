const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // 将 /api/shade 请求转发到 3000
    app.use(
        '/api/shade',
        createProxyMiddleware({
            target: 'http://localhost:3000',
            changeOrigin: true,
            logLevel: 'debug', // 打开调试日志
        })
    );

    // 将其他 /api/ 请求转发到 8081
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8081',
            changeOrigin: true,
            logLevel: 'debug',
        })
    );
};