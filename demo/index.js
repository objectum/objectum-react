/*
const fastify = require ("fastify") ();
const proxy = require ("fastify-http-proxy");

fastify.addHook ("onError", async (req, res, error) => {
	console.error (error);
});
fastify.register (proxy, {
	upstream: "http://127.0.0.1:8200",
	prefix: "/api/projects/catalog/",
	rewritePrefix: "/projects/catalog/",
	http2: false
});
fastify.register (proxy, {
	upstream: "http://127.0.0.1:8200",
	prefix: "/public",
	rewritePrefix: "/public",
	http2: false
});
async function start () {
	await fastify.listen (3100);
	console.log (`server listening on ${fastify.server.address ().port}`);
};
start ().catch (err => {
	console.error (err);
	process.exit (1);
});
*/
// package.json -> start dev server

const path = require ("path");

const express = require ("express");
const proxy = require ("express-http-proxy");
const app = express ();

app.use (`/api/projects/catalog/`, proxy (`http://127.0.0.1:8200`, {
	proxyReqPathResolver: function (req) {
		let parts = req.url.split ('?');
		let queryString = parts [1];
		
		return `/projects/catalog/${queryString ? "?" + queryString : ""}`;
	}
}));
app.use ("/public/*", proxy (`http://127.0.0.1:8200`, {
	proxyReqPathResolver: function (req) {
		return req.baseUrl;
	}
}));

app.use (express.static (path.join (__dirname, "dist")));
app.get ("/*", function (req, res) {
	res.sendFile (path.join (__dirname, "dist", "index.html"));
});
app.listen (3100, function () {
	console.log (`server listening on port 3100`);
});
