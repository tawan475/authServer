const { v4: uuidv4 } = require('uuid');
let bcrypt = require('bcryptjs');


module.exports = {
	POST: async (req, res, app, next, pathInfo, locals) => {
		const { username, password } = req.body
		if (username.length >= 16) {
			return res.json({
				status: 400,
				message: "Username must be shorter than 16 character!"
			});
		}

		if (password.length < 8) {
			return res.json({
				status: 400,
				message: "Password must be longer than 8 character!"
			});
		}
		let collision = await app.db.runQuery(`SELECT username, password FROM user WHERE username = ?`, [username]);
		if (!collision.length || !bcrypt.compareSync(password, collision[0].password)) return res.json({
			status: 401,
			message: 'Invalid credentials.',
		});

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