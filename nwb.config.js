module.exports = {
	type: "react-component",
	npm: {
		esModules: false,
		umd: false
	},
	devServer: {
		proxy: {
			"/api": "http://localhost:3100/"
		}
	}
};
