const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cloudflareIpProcessor = require('../libs/cloudflareIpProcessor');
const logger = require('../libs/logger');
const path = require('path');

module.exports = async (app) => {
    app.use((req, res, next) => {
        // res.header("Access-Control-Allow-Origin", "https://tawan475.dev");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader('X-Powered-By', 'tawan475');

        // if (req.socket.localAddress !== req.socket.remoteAddress) {
        //     if (!req.subdomains.length && req.headers.host != 'tawan475.dev') {
        //         return res.redirect(301, 'https://tawan475.dev' + req.url);
        //     }

        //     if (!req.secure) {
        //         return res.redirect(301, 'https://' + req.headers.host + req.url);
        //     }

        //     if (req.get('host').indexOf('www.') === 0 && (req.method === "GET" && !req.xhr)) {
        //         return res.redirect(req.protocol + '://' + req.get('host').substring(4) + req.originalUrl);
        //     }
        // };
        next()
    })

    app.use(express.static(path.join(app.dirname, 'public')));

    app.use(cloudflareIpProcessor)
    app.use(logger)
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(require('express-minify-html-2')({
        override: true,
        htmlMinifier: {
            caseSensitive: true,
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            minifyJS: true,
            trimCustomFragments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            html5: true,
            decodeEntities: true,
            minifyCSS: true,
            processConditionalComments: true,
            removeAttributeQuotes: true,
            useShortDoctype: true,
            removeStyleLinkTypeAttributes: true
        }
    }));
    app.use(compression());

    app.use(async (req, res, next) => {
        if (req.cookies.auth) {
            let cookieData = (await app.db.runQuery(`SELECT username, expire FROM cookie WHERE cookie = ?`, [req.cookies.auth]))[0];
            if (!cookieData) {
                res.clearCookie("auth");
                return next();
            }
            if (Date.now() >= cookieData.expire.getTime()) {
                await app.db.runQuery(`DELETE FROM cookie WHERE cookie = ?`, [req.cookies.auth]);
            } else {
                req.auth = {
                    username: cookieData.username
                }
            }
        }

        next()
    })

}