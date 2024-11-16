const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // 第一次请求：转发到 8081
    app.use(
        '/api/edges',
        createProxyMiddleware({
            target: 'http://localhost:8081',
            changeOrigin: true,
        })
    );

    // 第二次请求：转发到 3000
    app.use(
        '/api/shade',
        createProxyMiddleware({
            target: 'http://localhost:3000',
            changeOrigin: true,
        })
    );

    // 第三次请求：回到 8081
    app.use(
        '/api/route',
        createProxyMiddleware({
            target: 'http://localhost:8081',
            changeOrigin: true,
        })
    );
};
