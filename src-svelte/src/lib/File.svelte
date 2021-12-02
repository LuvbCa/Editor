<script lang="ts">
	import { currentFile } from './store';

	export let name: string;
	export let path: string;
	let type = name.slice(name.lastIndexOf('.') + 1);

	const getType = () => {
		if (type == name) return `default_file`;

		switch (type) {
			case 'ts':
				type = 'typescript_official';
				break;
			case 'js':
				type = 'js_official';
				break;
			case 'txt':
				type = 'text';
				break;
			case 'ps1':
				type = 'powershell';
				break;
		}
		return `file_type_${type}`;
	};

	const readFileIntoEditor = () => {
		currentFile.set(path);
	};
</script>

<span
	class="h-6 w-full text-sm flex items-center text-white transition"
	on:click={readFileIntoEditor}
>
	<img height="32" src="icons/files/{getType()}.svg" alt="" />
	{name}
</span>

<style>
	span {
		/* padding: 0 0 0 1.5em; */
		cursor: pointer;
	}
	img {
		padding-right: 0.5em;
		height: 1em;
		aspect-ratio: 1/1;
	}
</style>
