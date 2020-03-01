import path from "path";
import http from "http";
import express from "express";
import expressProxy from "express-http-proxy";
import objectumClient from "objectum-client";
const {Store} = objectumClient;
const __dirname = path.join (path.dirname (decodeURI (new URL (import.meta.url).pathname)));

class Proxy {
	constructor () {
		let me = this;
		
		me.registered = {};
		me.sessions = {};
		me.pool = {};
	}
	
	async getStore (sid) {
		let me = this;
		
		if (!me.sessions [sid]) {
			throw new Error (`unknown session: ${sid}`);
		}
		let store = me.pool [sid];
		
		if (!store) {
			store = new Store ();
			
			store.setUrl (`http://${me.config.objectum.host}:${me.config.objectum.port}/projects/${me.config.database.db}/`);
			store.setSessionId (sid);
			
			if (me.map) {
				store.map = me.map;
				store.dict = me.dict;
			} else {
				me.map = store.map;
				me.dict = store.dict;
				
				await store.load ();
				store.informer ();
			}
			for (let path in me.registered) {
				store.register (path, me.registered [path]);
			}
			me.pool [sid] = store;
		}
		return store;
	}
	
	async execute (opts) {
		let me = this;
		
		try {
			let store = await me.getStore (opts.sid);
			
			if (opts.id) {
				let record = await store.getRecord (opts.id);
				
				if (typeof (record [opts._method]) != "function") {
					return {error: `unknown method: ${opts._method}`};
				}
				return await record [opts._method] (opts);
			} else {
				let Model = store.registered [opts._model];
				
				if (!Model) {
					return {error: `model not registered: ${opts._model}`};
				}
				if (typeof (Model [opts._method]) != "function") {
					return {error: `unknown static method: ${opts._method}`};
				}
				return await Model [opts._method] (opts);
			}
		} catch (err) {
			return {error: err.message, stack: err.stack.split ("\n")};
		}
	}
	
	getFilter ({fn, store, session, alias}) {
		return new Promise ((resolve, reject) => {
			let promise;
			
			try {
				promise = fn ({store, session, alias});
			} catch (err) {
				return reject (err);
			}
			if (promise && promise.then) {
				promise.then (filter => resolve (filter)).catch (err => reject (err));
			} else {
				resolve (promise);
			}
		});
	}

	async getModelFilter ({store, mid, alias, session}) {
		let me = this;
		let Model = store.registered [mid];
		
		if (Model) {
			let fn = Model._accessFilter;
			
			if (typeof (fn) == "function") {
				let filter = await me.getFilter ({fn, store, session, alias});
				
				if (filter && filter.length) {
					return filter;
				}
			}
		}
	}
	
	async accessFilter (opts) {
		let me = this;
		let store = await me.getStore (opts.sid);
		let session = me.sessions [opts.sid];
		let filters = [];
		
		if (opts.model) {
			let filter = await me.getModelFilter ({store, mid: opts.model, alias: "a", session});
			
			if (filter && filter.length) {
				filters.push (filter);
			}
		}
		if (opts.query) {
			try {
				let query = store.getQuery (opts.query);
				let tokens = query.query.split ('{"model"');
				
				for (let i = 1; i < tokens.length; i ++) {
					let token = tokens [i];
					
					token = token.substr (0, token.indexOf ("}"));
					
					if (token) {
						let modelOpts = JSON.parse (`{"model"${token}}`);
						let filter = await me.getModelFilter ({store, mid: modelOpts.model, alias: modelOpts.alias, session});
						
						if (filter && filter.length) {
							filters.push (filter);
						}
					}
				}
			} catch (err) {
				throw new Error (`accessFilter.query: ${opts.query}, error: ${err.message}`);
			}
		}
		return filters;
	}
	
	async api (request, response) {
		let me = this;
		let data;
		let query = request.url.split ("?")[1];
		
		request.on ("data", chunk => {
			if (data) {
				data = Buffer.concat (data, chunk);
			} else {
				data = chunk;
			}
		});
		request.on ("end", async () => {
			let json;
			
			try {
				json = JSON.parse (data);
			} catch (err) {
				return response.send ({error: err.message});
			}
			if (json._model && json._method) {
				json.sid = request.query.sid;
				
				let result = await me.execute (json);
				
				return response.send (result);
			}
			if (json._fn == "getData") {
				json.sid = request.query.sid;
				
				try {
					let accessFilter = await me.accessFilter (json);
					
					if (accessFilter && accessFilter.length) {
						json.accessFilter = accessFilter;
						data = JSON.stringify (json);
					}
				} catch (err) {
					return response.send ({error: err.message});
				}
			}
			let resData, reqErr;
			let req = http.request ({
				host: config.objectum.host,
				port: config.objectum.port,
				path: `/projects/${config.database.db}/${query ? `?${query}` : ""}`,
				method: "POST",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"Content-Length": Buffer.byteLength (data, "utf8")
				}
			}, function (res) {
				res.setEncoding ("utf8");
				
				res.on ("data", function (d) {
					if (resData) {
						resData += d;
					} else {
						resData = d;
					}
				});
				res.on ("end", function () {
					if (!reqErr) {
						if (json._fn == "auth") {
							let d = JSON.parse (resData);
							
							if (d.sessionId) {
								me.sessions [d.sessionId] = d;
								resData = JSON.stringify (Object.assign (d, {
									code: config.code, name: config.name
								}));
							}
						}
						response.send (resData);
					}
				});
			});
			req.on ("error", function (err) {
				reqErr = err;
				response.send ({error: err.message});
			});
			req.end (data);
		});
	}
	
	proxyErrorHandler (err, res) {
		console.error (err.message);
		res.send ({error: err.message});
	}
	
	register (path, Cls) {
		this.registered [path] = Cls;
	}
	
	start ({app, config, code}) {
		let me = this;
		
		me.config = config;
		
		app.use (`/${code}/public`, expressProxy (`http://${config.objectum.host}:${config.objectum.port}`, {
			parseReqBody: false,
			proxyReqPathResolver: function (req) {
				return `/public/${req.url}`;
			},
			proxyErrorHandler: me.proxyErrorHandler
		}));
		app.use (`/${code}/upload`, expressProxy (`http://${config.objectum.host}:${config.objectum.port}`, {
			parseReqBody: false,
			proxyReqPathResolver: function (req) {
				return `/projects/${config.code}/upload${req.url}`;
			},
			proxyErrorHandler: me.proxyErrorHandler
		}));
		app.post (`/${code}`, (req, res) => {
			me.api (req, res);
		});
		app.use (express.static (path.join (__dirname, "build")));
		app.get ("/*", function (req, res) {
			res.sendFile (path.join (__dirname, "build", "index.html"));
		});
		app.listen (config.port, function () {
			console.log (`server listening on port ${config.port}`);
		});
	}
};

const app = express ();
import fs from "fs";
const config = JSON.parse (fs.readFileSync ("./config.json"));
import OrgModel from "./src/models/OrgModel.js";
/*
const TOrgProductModel = require ("./src/models/TOrgProductModel");
const MenuModel = require ("./src/models/MenuModel");
const TkModel = require ("./src/models/TkModel");
const MtModel = require ("./src/models/MtModel");
*/

const proxy = new Proxy ();

proxy.register ("org", OrgModel);
/*
proxy.register ("t.org.product", TOrgProductModel);
proxy.register ("tk", TkModel);
proxy.register ("menu", MenuModel);
proxy.register ("mt", MtModel);
*/

proxy.start ({app, config, code: "rmp"});
