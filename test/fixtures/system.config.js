System.config({
	"baseURL": ".",
	"transpiler": "babel",
	"babelOptions": {
		"optional": [
			"runtime"
		]
	},
	"paths": {
		"*": "*.js"
	},
	"buildCSS": true,
	"separateCSS": false
});
