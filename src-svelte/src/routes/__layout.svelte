<script lang="ts">
	import '../app.postcss';
	import 'svelte-highlight/src/styles/3024.css';
	import { onMount } from 'svelte';

	const test = async () => {
		const input = 'C:\\Users\\lmima\\Desktop\\ownEditor\\src-electron\\index.ts';
		const huh = await window.fs.readFile(input);
	};

	onMount(() => {
		test();
	});
</script>

<main class="relative select-text">
	<slot />
</main>

<style>
	main {
		min-height: 100%;
		width: 100%;
	}
	:global(body) {
		min-height: 100%;
		width: 100%;
	}
</style>
