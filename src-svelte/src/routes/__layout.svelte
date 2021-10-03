<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';

	const test = async () => {
		const input = 'C:\\Users\\lmima\\Desktop\\ownEditor\\src-electron';
		const huh = await window.fs.readDir(input);
	};

	onMount(() => {
		test();
	});
</script>

<main class="relative">
	<slot />
</main>

<style>
	main {
		height: 100vh;
		width: 100vw;
	}
	:global(body) {
		height: 100%;
		width: 100%;
	}
</style>
