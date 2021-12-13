<script lang="ts">
	import IconButton from './components/IconButton.svelte';
	import { XIcon, MinimizeIcon, MaximizeIcon, MinusIcon } from 'svelte-feather-icons';
	console.log('shu');

	let maximized = true;

	const close = () => {
		window.ipc.send.async('close', '');
	};
	const minimize = () => {
		window.ipc.send.async('minimize', '');
	};
	const maximize = async () => {
		await window.ipc.send.async('maximize', '');
	};

	window.ipc.listen('maximized', (value) => {
		maximized = !value;
	});
</script>

<div class="bg-black flex justify-end h-full w-screen">
	<IconButton icon={MinusIcon} on:click={minimize} size={9} />
	<IconButton icon={maximized ? MaximizeIcon : MinimizeIcon} on:click={maximize} size={9} />
	<IconButton icon={XIcon} on:click={close} size={9} />
</div>

<style>
	div {
		-webkit-app-region: drag;
	}
</style>
