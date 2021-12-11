import { pluginLoader } from "./pluginLoader";

function main() {
	console.log("in forked process");
	console.log(process.versions);
	// pluginLoader();

}

main();
