const { spawn } = require("child_process");
const path = require("path");
const { mkdir } = require("fs").promises;

const buildElectron = () => {
	return new Promise((resolve, reject) => {
		const elctronBuilder = spawn(
			/^win/.test(process.platform) ? "npm.cmd" : "npm",
			["run", "make"],
			{
				cwd: path.resolve("./electron"),
				stdio: ["pipe", "pipe", "pipe"],
			}
		);

		elctronBuilder.stdout.pipe(process.stdout);
		elctronBuilder.stderr.pipe(process.stderr);

		elctronBuilder.on("close", () => {
			console.log("finished building electron!");
			resolve();
		});

		elctronBuilder.on("error", (e) => {
			console.log("electron forge errored out!");
			reject(e);
		});
	});
};

const buildSvelte = () => {
	return new Promise((resolve, reject) => {
		const svelteBuilder = spawn(
			/^win/.test(process.platform) ? "npm.cmd" : "npm",
			["run", "build"],
			{
				cwd: path.resolve("./svelte"),
				stdio: ["pipe", "pipe", "pipe"],
			}
		);

		svelteBuilder.stdout.pipe(process.stdout);
		svelteBuilder.stderr.pipe(process.stderr);

		svelteBuilder.on("close", () => {
			console.log("finished building svelte!");
			resolve();
		});

		svelteBuilder.on("error", (e) => {
			console.log("svelte-kit errored out!");
			reject(e);
		});
	});
};

const build = async () => {
	await buildElectron();
	await buildSvelte();
};

const main = async () => {
	try {
		await mkdir("./build");
		await build();
	} catch (e) {
		if (e.code === "EEXIST") await build();
	}
};

main();
