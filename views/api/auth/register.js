const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
	POST: async (req, res, app, next, pathInfo, locals) => {
		const { username, password, passwordConfirm } = req.body

		if (username.length >= 16) {
			return res.json({
				status: 400,
				message: "Username must be shorter than 16 character!"
			});
		}

		if (password !== passwordConfirm) {
			return res.json({
				status: 400,
				message: "Password mismatch!"
			});
		}

		if (password.length < 8) {
			return res.json({
				status: 400,
				message: "Password must be longer than 8 character!"
			});
		}

		if (password !== passwordConfirm) return res.json({
			status: 400,
			message: 'Password unmatched.'
		});

		let collision = await app.db.runQuery(`SELECT username FROM user WHERE username = ?`, [username]);
		if (collision.length) return res.json({
			status: 409,
			message: 'Username taken.'
		});
		let salt = bcrypt.genSaltSync();
		let hash = bcrypt.hashSync(password, salt);

		await app.db.runQuery(`INSERT INTO user (username, password) VALUES (?, ?)`, [username, hash]);

		let cookie = uuidv4();

		await app.db.runQuery(`INSERT INTO cookie (username, cookie, expire) VALUES (?, ?, ?)`, [username, cookie, new Date(Date.now() + 43200000).toISOString().slice(0, 19).replace('T', ' ')]);
		res.cookie('auth', cookie, { maxAge: 43200000, domain: '.tawan475.dev' });

		return res.json({
			status: 200,
			message: 'Success!',
			cookie,
		});
	}
}