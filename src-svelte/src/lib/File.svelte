<script lang="ts">
	import { currentFile } from './store';

	export let name: string;
	export let path: string;

	const readFileIntoEditor = () => {
		currentFile.set(path);
	};
</script>

<span class="w-full text-sm flex items-center" on:click={readFileIntoEditor}>
	<img src="icons/file.svg" alt="" loading="lazy" />
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
