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
	console.log (`server listening on ${fastify.server.address().port}`);
};
start ().catch (err => {
	console.error (err);
	process.exit (1);
});
// package.json -> start dev server
