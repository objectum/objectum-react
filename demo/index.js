const code = "rmp";
const path = require ("path");

const express = require ("express");
const proxy = require ("express-http-proxy");
const app = express ();

app.use (`/${code}`, proxy (`http://127.0.0.1:8200`, {
	proxyReqPathResolver: function (req) {
		let parts = req.url.split ('?');
		let queryString = parts [1];
		
		if (parts [0].substr (0, 7) == "/public") {
			return `${parts [0]}${queryString ? "?" + queryString : ""}`;
		} else {
			return `/projects/${code}${parts [0]}${queryString ? "?" + queryString : ""}`;
		}
	},
	proxyErrorHandler: function (err, res) {
		console.error (err.message);
		res.send ({error: err.message});
	}
}));
app.use (express.static (path.join (__dirname, "dist")));
app.get ("/*", function (req, res) {
	res.sendFile (path.join (__dirname, "dist", "index.html"));
});
app.listen (3100, function () {
	console.log (`server listening on port 3100`);
});
