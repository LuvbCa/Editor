<script lang="ts">
	import { tick } from 'svelte';
	import { currentFile } from './store';

	import Parser, { Language, SyntaxNode } from 'web-tree-sitter';
	import LineRenderer from './components/LineRenderer.svelte';

	let Content: string = '';
	let RenderLines: EditorLine[] = [];

	const readFile = async (path: string) => {
		const text = await window.fs.readFile(path);
		// Content = text;
		RenderLines = await convertTextToLines(text);
		initalParse();
	};

	//not really uuid
	const NoReUUID = () => Math.random() * 100 * Math.random();

	const convertTextToLines = async (text: string): Promise<EditorLine[]> => {
		const lines: EditorLine[] = [];
		const matches = text.matchAll(/\r\n/g);
		const matchesArray: RegExpMatchArray[] = [];
		for (const match of matches) {
			matchesArray.push(match);
		}

		for (let i = 0; i < matchesArray.length; i++) {
			const element = matchesArray[i];
			const prevElement = i == 0 ? null : matchesArray[i - 1];

			if (prevElement) {
				const slicedInput = element.input.slice(prevElement.index, element.index);

				const tabs = slicedInput.matchAll(/\t/g);
				const tabsArray = [];

				const sanitizedSlicedInput = slicedInput.replaceAll('\r\n', '').replaceAll('\t', '');
				for (const tab of tabs) {
					tabsArray.push(tab);
				}

				lines.push({
					indent: tabsArray.length,
					text: sanitizedSlicedInput,
					uuid: NoReUUID()
				});
			} else {
				const slicedInput = element.input.slice(0, element.index);

				lines.push({
					indent: 0,
					text: slicedInput,
					uuid: NoReUUID()
				});
			}
		}
		return lines;
	};

	const convertLinesToText = async (lines: EditorLine[]): Promise<string> => {
		let text = '';

		for (let i = 0; i < lines.length; i++) {
			let subText = '';
			const element = lines[i];

			for (let x = 0; x < element.indent; x++) {
				subText += '\t';
			}

			subText += element.text + '\r\n';

			text += subText;
		}
		return text;
	};

	const handleInputs = async (
		event: CustomEvent<KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }>
	) => {
		const e = event.detail;

		const newLineNumber = parseInt((e.composedPath()[1] as HTMLElement).dataset.line);
		const cursor = window.getSelection();
		RenderLines[newLineNumber].text = document.getElementById(
			`line-index-editable-${newLineNumber}`
		).innerText;
		RenderLines = RenderLines;

		if (e.key == 'Enter') {
			//stop linebreak
			e.preventDefault();

			const prevElement = RenderLines[newLineNumber];
			const cursor = window.getSelection();

			const newLineText = prevElement.text.slice(cursor.anchorOffset, prevElement.text.length);
			const newOldLineText = prevElement.text.slice(0, cursor.anchorOffset);

			prevElement.text = newOldLineText;

			RenderLines.splice(newLineNumber + 1, 0, {
				text: newLineText,
				indent: 0,
				uuid: NoReUUID()
			});

			RenderLines = [...RenderLines];

			await tick();

			const newLine = document.getElementById('line-index-editable-' + (newLineNumber + 1));
			const range = document.createRange();

			range.setStart(newLine, 1);
			range.collapse(true);

			cursor.removeAllRanges();
			cursor.addRange(range);

			console.log(cursor);

			return;
		}
		if (e.key === 'Backspace' && cursor.focusOffset + cursor.anchorOffset === 0) {
			e.preventDefault();
			const indent = parseInt((e.composedPath()[1] as HTMLElement).dataset.indent);

			if (indent === 0) {
				const lineText = RenderLines[newLineNumber].text;
				const newCursorPosition = RenderLines[newLineNumber - 1].text.length;
				RenderLines[newLineNumber - 1].text += lineText;

				const linesFront = RenderLines.slice(0, newLineNumber);
				const linesBehind = RenderLines.slice(newLineNumber + 1, -1);

				RenderLines = linesFront.concat(linesBehind);

				await tick();

				const newLine = document.getElementById('line-index-editable-' + (newLineNumber - 1));

				cursor.setPosition(newLine, 0);
				for (let i = 0; i < newCursorPosition; i++) {
					//@ts-ignore not in typescript?
					cursor.modify('move', 'right', 'character');
				}
			} else {
				RenderLines[newLineNumber].indent--;
				RenderLines = RenderLines;
			}
			return;
		}
		if (e.key === 'Tab') {
			//check tab event as it skips to the next line by default?
			e.preventDefault();

			RenderLines[newLineNumber].indent++;
			RenderLines = RenderLines;

			return;
		}
		if (e.key.startsWith('Arrow')) {
			switch (e.key) {
				case 'ArrowUp': {
					e.preventDefault();
					const newLineNumberDown = newLineNumber - 1;
					const el = document.getElementById(`line-index-editable-${newLineNumberDown}`);
					if (newLineNumberDown >= 0) cursor.setPosition(el, 0);
					break;
				}

				case 'ArrowDown':
					e.preventDefault();
					const newLineNumberUp = newLineNumber + 1;
					const el = document.getElementById(`line-index-editable-${newLineNumberUp}`);
					if (newLineNumberUp < RenderLines.length) cursor.setPosition(el, 0);
					break;
			}
		}
	};

	const recursiveColoring = (input: SyntaxNode) => {
		if (input.childCount == 0) {
			RenderLines[input.startPosition.row].styling.push({
				from: input.startPosition.column,
				to: input.endPosition.column,
				style: 'color: red;'
			});

			return;
		}

		for (let i = 0; i < input.childCount; i++) {
			const element = input.child(i);
			recursiveColoring(element);
		}

		return;
	};

	const initalParse = async () => {
		await Parser.init();
		const [JavaScript, TypeScript] = await Promise.all([
			Parser.Language.load('tree-sitter-javascript.wasm'),
			Parser.Language.load('tree-sitter-typescript.wasm')
		]);
		const parser = new Parser();
		parser.setLanguage(TypeScript);

		try {
			const tree = parser.parse(Content);

			recursiveColoring(tree.rootNode);
			// for (let i = 0; i < tree.rootNode.childCount; i++) {
			// 	const currNode = tree.rootNode.child(i);

			// 	const totalLinesAffected = currNode.endPosition.row - currNode.startPosition.row + 1;

			// 	for (let x = 0; x < totalLinesAffected; x++) {
			// 		RenderLines[currNode.startPosition.row + x].style = 'color: red;';
			// 	}
			// }
			RenderLines = [...RenderLines];
		} catch (e) {}
	};
	$: readFile($currentFile);
</script>

<div id="editor" class="w-full h-full bg-gray-700 text-white overflow-y-scroll">
	{#each RenderLines as line, index (line.uuid)}
		<LineRenderer on:key={handleInputs} {line} {index} />
	{/each}
</div>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<style>
	div {
		font-family: Fira Code;
	}

	#editor::-webkit-scrollbar {
		@apply bg-transparent;
		width: 10px;
	}
	#editor::-webkit-scrollbar-thumb {
		@apply bg-white;
		@apply bg-opacity-10;
		border-radius: 0.5em;
		width: 5px;
	}
</style>
