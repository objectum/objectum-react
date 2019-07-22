/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

function getDateString (d) {
	function pad (number) {
		let r = String (number);
		
		if (r.length === 1) {
			r = "0" + r;
		}
		return r;
	};
	if (!d || typeof d == "string") {
		return d;
	}
	return d.getFullYear () + "-" + pad (d.getMonth () + 1) + "-" + pad (d.getDate ());
};

/*
function getHash () {
	try {
		let hash = {};
		let s1 = window.location.hash.substr (1);
		
		if (s1) {
			s1.split ("&").forEach (s2 => {
				let tokens1 = s2.split ("=");
				let key = tokens1 [0];
				
				hash [key] = hash [key] || {};
				
				tokens1 [1].split (",").forEach (s3 => {
					let tokens2 = s3.split (":");
					
					hash [key][tokens2 [0]] = tokens2 [1] == "null" ? null : Number (tokens2 [1]);
				});
			});
		}
		return hash;
	} catch (err) {
		return {};
	}
};

function setHash (next) {
	let hash = getHash ();
	
	for (let key in next) {
		hash [key] = hash [key] || {};
		
		let o1 = next [key];
		let o2 = hash [key];
		
		for (let a in o1) {
			o2 [a] = o1 [a];
		}
	}
	let s1 = [];
	
	for (let key in hash) {
		let o = hash [key];
		let s2 = [];
		
		for (let a in o) {
			s2.push (`${a}:${o [a]}`);
		}
		s1.push (`${key}=${s2.join (",")}`);
	}
	window.location.hash = s1.join ("&");
};
*/

function getHash () {
	try {
		let s = unescape (window.location.hash.substr (1) || "{}");
		
		return JSON.parse (s);
	} catch (err) {
		console.log (err);
		return {};
	}
};

function setHash (next) {
	let hash = getHash ();
	
	for (let key in next) {
		hash [key] = hash [key] || {};
		
		let o1 = next [key];
		let o2 = hash [key];
		
		for (let a in o1) {
			o2 [a] = o1 [a];
		}
	}
	window.location.hash = JSON.stringify (hash);
};

function toString (value, col) {
	if (value === null) {
		value = "";
	} else
	if (col.type == 3) {
		value = getDateString (value);
	}
	return value;
};

function loadCSS (file) {
	return new Promise (resolve => {
		let link = document.createElement ("link");
		
		link.setAttribute ("rel", "stylesheet");
		link.setAttribute ("type", "text/css");
		link.setAttribute ("href", file);
		
		if (link.onreadystatechange === undefined) {
			link.onload = resolve;
		} else {
			link.onreadystatechange = function () {
				if (this.readyState == "complete" || this.readyState == "loaded") {
					resolve ();
				}
			}
		}
		document.getElementsByTagName ("head")[0].appendChild (link)
	});
};

function loadJS (file) {
	return new Promise (resolve => {
		let script = document.createElement ("script");
		
		script.src = file;
		script.type = "text/javascript";
		script.language = "javascript";
		
		let head = document.getElementsByTagName ("head")[0];
		
		if (script.onreadystatechange === undefined) {
			script.onload = resolve;
		} else {
			script.onreadystatechange = function () {
				if (this.readyState == "complete" || this.readyState == "loaded") {
					resolve ();
				}
			}
		}
		head.appendChild (script);
	});
};

module.exports = {
	getHash,
	setHash,
	toString,
	loadCSS,
	loadJS,
	getDateString
};
