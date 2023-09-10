require('dotenv').config();
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
(async() => {
	app.db = await require('./libs/db')(app);
})();
app.dirname = __dirname;
app.viewPath = path.join(app.dirname, 'views');

// view engine setup
app.set('views', app.viewPath);
app.set('view engine', 'ejs');


// require middlwares
require('./libs/middlewares')(app);

require('./router.js')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

function errorHandler(err, req, res, next) {
	if (!err) return; // no error
	// render the error page
	let errorID = uuidv4();
	let errorRequestLog = `o:${req.get('origin') || "direct"} code:${res.statusCode} ${req.trustedip} ${req.method}:${req.protocol}://${req.get('host')}${req.url}`;
	let errorMessage = `[${Date.now()}] errorID: ${errorID} | ${errorRequestLog}\r\n${err.stack}`

	console.error(errorMessage)

	fs.appendFile(path.join(req.app.dirname, "./error_logs.log"), errorMessage + "\r\n", (err) => {
		if (err) console.log(err)
	});

	if (!err.status || err.status == 500) err.message = 'Internal Server Error';

	res.status(err.status || 500).json({ status: err.status || 500, errorID: errorID, message: err.message || 'Internal Server Error' });
}

// error handler
app.use(errorHandler);

// if (process.env.NODE_ENV !== 'production') process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const options = {
	key: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/tawan475.dev/fullchain.pem'),
}

// const http = require('http').createServer(app).listen(process.env.PORT, () => {
// 	console.log(`listening at HTTP ${process.env.PORT}`)
// })
const https = require('https').createServer(options, app).listen(process.env.SECURE_PORT, () => {
	console.log(`listening at HTTPS ${process.env.SECURE_PORT}`)
});

process.on('uncaughtException', (error, source) => {
	console.error(error, source)
});