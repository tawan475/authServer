const { v4: uuidv4 } = require('uuid');

module.exports = {
	GET: async (req, res, app, next, pathInfo, locals) => {
		await app.db.runQuery(`DELETE FROM cookie WHERE cookie = ?`, [req.cookies.auth]);
		res.clearCookie("auth");

		return res.redirect('/login');
	},

	POST: async (req, res, app, next, pathInfo, locals) => {
		await app.db.runQuery(`DELETE FROM cookie WHERE cookie = ?`, [req.cookies.auth]);
		res.clearCookie("auth");
		return res.json({
			status: 200,
			message: 'Logged out!'
		});
	}
}