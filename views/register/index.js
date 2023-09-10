module.exports = {
	GET: (req, res, app, next, pathInfo, locals) => {
		if (req.auth) return res.redirect("/");
		res.renderMin(pathInfo.viewPath, locals, function (err, html) {
			if (err) return next(err);
			locals.content = html
			return res.renderMin(pathInfo.templatePath, locals, function (err, html) {
				if (err) return next(err);

				return res.send(html);
			});
		});

	}
}
