<script lang="ts">
	import { onMount } from 'svelte';
	import { currentEditor } from './store';
	import { HtmlTag } from 'svelte/internal';

	// const renderer = new Worker('$lib/worker.js');
	// console.log(renderer);

	interface Line {
		text: string;
		indent: number;
	}

	let HTMLLine: Line[] = [];

	onMount(() => {
		currentEditor.subscribe((value) => {
			renderEditor(value);
		});
	});

	const renderEditor = (text: string) => {
		const matches = text.matchAll(/\n/g);
		const matchesArray = [];
		for (const match of matches) {
			matchesArray.push(match);
		}
		
		for (let i = 0; i < matchesArray.length; i++) {
			const element = matchesArray[i];
			const prevElement = i == 0 ? null : matchesArray[i - 1];

			if (prevElement) {
				const slicedInput = element.input.slice(prevElement.index, element.index);

				const tabs = slicedInput.matchAll(/[\t]/g);
				const tabsArray = [];

				for (const tab of tabs) {
					tabsArray.push(tab);
				}

				HTMLLine.push({
					indent: tabsArray.length,
					text: slicedInput
				});
			} else {
				const slicedInput = element.input.slice(0, element.index);

				HTMLLine.push({
					indent: 0,
					text: slicedInput
				});
			}
			HTMLLine = [...HTMLLine];
		}
	};
</script>

<div class=" w-full bg-green-300">
	{#each HTMLLine as Line}
		<p style="margin-left: {Line.indent}em">
			{Line.text}
		</p>
	{/each}
</div>

<style>
	div {
		height: 100%;
		background-color: orange;
	}
</style>
