<script lang="ts">
	import { tick } from 'svelte';
	import { currentFile, currentWorkingDir } from './store';

	import Parser, { Language, SyntaxNode } from 'web-tree-sitter';

	interface Line {
		text: string;
		indent: number;
		uuid: number;
	}

	let Content: string = '';
	let RenderLines: Line[] = [];

	const readFile = async (path: string) => {
		const text = await window.fs.readFile(path);
		Content = text;
		RenderLines = await convertTextToLines(text);
		initalParse();
	};

	//not really uuid
	const NoReUUID = () => Math.random() * 100 * Math.random();

	const convertTextToLines = async (text: string): Promise<Line[]> => {
		const lines: Line[] = [];
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

	const convertLinesToText = async (lines: Line[]): Promise<string> => {
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

	const handleInputs: svelte.JSX.KeyboardEventHandler<HTMLSpanElement> = async (e) => {
		if (e.key == 'Enter') {
			//stop linebreak
			e.preventDefault();

			const newLineNumber = parseInt((e.composedPath()[1] as HTMLElement).dataset.lineNumber);
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
		if (e.key == 'Backspace' && (e.composedPath()[0] as HTMLElement).innerText === '') {
			e.preventDefault();

			const newLineNumber = parseInt((e.composedPath()[1] as HTMLElement).dataset.lineNumber);
			// let NewRenderLines = [...RenderLines];

			const linesFront = RenderLines.slice(0, newLineNumber);
			const linesBehind = RenderLines.slice(newLineNumber + 1, -1);

			RenderLines = linesFront.concat(linesBehind);

			await tick();

			const cursor = window.getSelection();

			const newLine = document.getElementById('line-index-editable-' + (newLineNumber - 1));
			const range = document.createRange();

			range.setStart(newLine, 0);
			range.collapse(true);

			cursor.removeAllRanges();
			cursor.addRange(range);

			console.log(cursor);

			return;
		}
	};

	const recursiveTreePrint = (input: SyntaxNode) => {
		input.children.forEach((element) => {
			recursiveTreePrint(element);
		});
	};

	const initalParse = async () => {
		await Parser.init();
		const [JavaScript, TypeScript] = await Promise.all([
			Parser.Language.load('tree-sitter-javascript.wasm'),
			Parser.Language.load('tree-sitter-typescript.wasm')
		]);

		const parser = new Parser();
		parser.setLanguage(JavaScript);

		try {
			const tree = parser.parse(Content);
			console.log(TypeScript);
			recursiveTreePrint(tree.rootNode);
		} catch (e) {}
	};
	$: readFile($currentFile);
</script>

<div id="editor" class="w-full h-full bg-green-300 overflow-scroll">
	{#each RenderLines as Line, index (Line.uuid)}
		<div
			id="line-index-{index}"
			class="w-full"
			on:keydown|stopPropagation={handleInputs}
			data-line-number={index}
		>
			<span class="inline-block w-10 select-none">
				{index}
			</span>
			<span
				contenteditable="true"
				spellcheck="false"
				style="margin-left: {Line.indent * 2}em;"
				class="active:border-none focus-visible:outline-none content select-text"
				id="line-index-editable-{index}"
			>
				{Line.text}
			</span>
		</div>
	{/each}
</div>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<style>
	div {
		font-family: Fira Code;
	}
	.content {
		all: unset;
	}
	#editor::-webkit-scrollbar {
		width: 10px;
		height: 10px;
		background-color: rgba(255, 255, 255);
	}
	#editor::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.548);
		width: 5px;
	}
</style>
