const babel = require("rollup-plugin-babel");
const changeCase = require("change-case");
const commonjs = require("rollup-plugin-commonjs");
const createBanner = require("create-banner");
const nodeResolve = require("rollup-plugin-node-resolve");
const pkg = require("./package");
const typescript = require("rollup-plugin-typescript");

pkg.name = pkg.name.replace(/^.+\//, "");

const name = changeCase.pascalCase(pkg.name);
const banner = createBanner({
	data: {
		year: "2018-present"
	}
});

module.exports = {
	input: "src/index.ts",
	output: [
		{
			banner,
			name,
			file: `dist/${pkg.name}.js`,
			format: "umd"
		},
		{
			banner,
			file: `dist/${pkg.name}.common.js`,
			format: "cjs"
		},
		{
			banner,
			file: `dist/${pkg.name}.esm.js`,
			format: "esm"
		}
	],
	plugins: [
		typescript(),
		nodeResolve(),
		commonjs(),
		babel({
			exclude: "node_modules/**"
		})
	]
};
