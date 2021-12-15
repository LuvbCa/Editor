export interface PluginManifest {
	name: string;
	entryPoint: string;
	version: string;
}

export interface PluginIdentifier {
	name: string;
	uuid: string;
}

export interface PluginCode {
	onPluginRegistered: (pluginIdentifier: PluginIdentifier) => {};
	[key: string | symbol | number]: any;
}

export interface MessageEvent {
	type: string;
	input: any;
}
