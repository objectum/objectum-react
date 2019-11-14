"use strict";

let locales = {
	"en": require ("./locales/en"),
	"ru": require ("./locales/ru")
};
let map = {};

function lang (lang) {
	map = locales [lang];
};

function i18n (s) {
	return map [s] || s;
};

export default {
	lang,
	i18n
};
