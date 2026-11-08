const http = require("http");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../dist");
http
  .createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(req.url.split("?")[0]));
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403);
      return res.end();
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
      file = path.join(root, "index.html");
    const types = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".html": "text/html",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "application/octet-stream",
    );
    if (!fs.existsSync(file)) {
      res.writeHead(503);
      return res.end("Build the web preview with npm run export:web.");
    }
    fs.createReadStream(file).pipe(res);
  })
  .listen(8081, "127.0.0.1", () =>
    console.log("Super Todo preview: http://127.0.0.1:8081"),
  );
