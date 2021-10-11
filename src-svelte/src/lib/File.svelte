<script lang="ts">
	import { currentFile } from './store';

	export let name: string;
	export let path: string;

	const readFileIntoEditor = () => {
		currentFile.set(path);
	};
</script>

<span class="w-full text-sm" on:click={readFileIntoEditor}>{name}</span>

<style>
	span {
		padding: 0 0 0 1.5em;
		cursor: pointer;
	}
</style>
