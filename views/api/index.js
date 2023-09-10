module.exports = {
	GET: (req, res, app, next, pathInfo, locals) => {
		res.json({
			status: 200,
			message: 'Welcome to cashbook.tawan475.dev! maybe documentations soon?'
		});
	}
}