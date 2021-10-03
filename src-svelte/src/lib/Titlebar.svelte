<script lang="ts">
	console.log('shu');

	const close = () => {
		window.ipc.send.async('close', '');
	};
	const minimize = () => {
		window.ipc.send.async('minimize', '');
	};
	const maximize = () => {
		window.ipc.send.async('maximize', '');
	};
</script>

<div class="flex justify-end w-screen">
	<button class="w-10" on:click={minimize}>_</button>
	<button class="w-10 bg-yellow-600" on:click={maximize}>o</button>
	<button class="w-10 bg-red-600" on:click={close}>x</button>
</div>

<style>
	div {
		-webkit-app-region: drag;
	}
	div button {
		-webkit-app-region: no-drag;
	}
</style>
