module.exports = {
	type: "react-component",
	babel: {
		presets: "es2015"
	},
	npm: {
		esModules: true,
		umd: false
	},
	devServer: {
		proxy: {
			"/rmp": "http://localhost:3100/"
		}
	}
};
