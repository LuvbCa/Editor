<script lang="ts">
	import Tab from './components/Tab.svelte';

	let openTabs = [];

	const openNewTab = () => {
		console.log('hallo');

		if (openTabs.length > 10) {
			alert('no new tabs');
			return;
		}

		openTabs = [...openTabs, 'tab2'];
	};
</script>

<div class="bg-gray-700 overflow-hidden">
	{#each openTabs as currentTab}
		<Tab />
	{/each}
	<button class="justify-self-end" on:click={openNewTab}>+</button>
</div>

<style>
	div {
		display: flex;
	}
</style>
