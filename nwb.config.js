module.exports = {
	type: "react-component",
	npm: {
		esModules: true,
		umd: false
	},
	devServer: {
		proxy: {
			"/shop": "http://localhost:3100/"
		}
	}
};
