const path = require('path');
const fs = require('fs');
const createError = require('http-errors');
module.exports = (app) => {
    let viewFolder = fs.readdirSync(app.viewPath, { withFileTypes: true });
    routerGenerator(viewFolder, app.viewPath)

    function routerGenerator(dirents, AbsPath) {
        dirents.sort((a,b) => b.name.localeCompare(a.name)).forEach((dirent) => {
            let direntRelativePath = path.join(path.relative(app.viewPath, AbsPath), dirent.name);
            let absDirentPath = path.join(app.viewPath, direntRelativePath)
            if (dirent.isDirectory()) {
                return routerGenerator(fs.readdirSync(absDirentPath, { withFileTypes: true }), absDirentPath)
            }

            if (!dirent.name.endsWith('.js')) return;

            let filePath = absDirentPath;
            let fileName = dirent.name;
            let routerPath = path.normalize('/' + direntRelativePath.replace(/\.js$/, '')).replace(/[\\\/]/g, '/').replaceAll("#", ":");
            let viewPath = absDirentPath.replace(/\.js$/, '.ejs');
            let viewName = fileName.replace(/\.js$/, '.ejs');


            if (filePath.endsWith('index.js')) routerPath = path.normalize('/' + path.relative(app.viewPath, AbsPath).replace(/\.js$/, '')).replace(/[\\\/]/g, '/').replaceAll("#", ":");
            console.log(`use ${filePath}+${viewName} for ${routerPath}`)
            
            let folderTemplatePath = path.join(path.relative(app.viewPath, AbsPath), "template.ejs");
            if (!fs.existsSync(folderTemplatePath)) folderTemplatePath = path.join(app.viewPath, "template.ejs");

            let pathInfo = {
                filePath: filePath,
                fileName: fileName,
                routerPath: routerPath,
                viewPath: viewPath,
                viewName: viewName,
                templatePath: folderTemplatePath
            };

            app.all(routerPath, function (req, res, next) {
                let locals = {};
                locals.lastServerUpdate = fs.statSync(pathInfo.filePath).mtime;
                if (fs.existsSync(pathInfo.viewPath)) locals.lastHTMLUpdate = fs.statSync(pathInfo.viewPath).mtime;

                let logic = require(filePath);
                if (!logic[req.method]) return next(createError(405));
                return logic[req.method](req, res, app, next, pathInfo, locals);
            })
        });
    }
}