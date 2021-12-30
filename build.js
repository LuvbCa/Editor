const { spawn } = require("child_process");
const path = require("path");
const { mkdir, rm } = require("fs").promises;

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

		elctronBuilder.stdout.on("data", (chunk) => {
			process.stdout.write("[Electron-Forge | Log]: ");
			process.stdout.write(chunk);
		});

		elctronBuilder.stderr.on("data", (chunk) => {
			process.stdout.write("[Electron-Forge | ERR]: ");
			process.stdout.write(chunk);
		});

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

		svelteBuilder.stdout.on("data", (chunk) => {
			process.stdout.write("[Svelte-Kit | Log]: ");
			process.stdout.write(chunk);
		});

		svelteBuilder.stderr.on("data", (chunk) => {
			process.stdout.write("[Svelte-Kit | ERR]: ");
			process.stdout.write(chunk);
		});

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
	} catch (e) {
		if (e.code === "EEXIST") {
			console.log("deleting build dir");
			await rm("./build", {
				recursive: true,
				force: true,
			});
			return main();
		}
	}
	await build();
};

main();
