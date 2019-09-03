module.exports = {
	type: "react-component",
	npm: {
		esModules: true,
		umd: false
	},
	devServer: {
		proxy: {
			"/api": "http://localhost:3100/",
			"/public": "http://localhost:3100/"
		}
	}
};
