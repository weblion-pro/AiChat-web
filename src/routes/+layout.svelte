<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { updated } from '$app/stores';
	import { initializeStores, Toast, Drawer, getToastStore, getDrawerStore} from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	initializeStores();

	const toastStore = getToastStore();
	const drawerStore = getDrawerStore();

	async function showToast() {
		const t: ToastSettings = {
			message: 'NEW Version Available',
			action: {
				label: 'Reload',
				response: () => location.reload()
			},
			autohide: false,
			hideDismiss: true,
			background: "variant-filled-tertiary"
		};
		toastStore.trigger(t);
	}

	if ($updated) {
		showToast();
	}

	async function logout() {
		const res = await fetch('/api/logout', { method: 'POST' })
		if (res.ok) {
			location.href = '/login';
		} else {
			console.error('Logout failed');
		}
	}

	let imgArray= [] as {prompt: string, imgData: string}[];

	onMount(async () => {
		const indexedDB = window.indexedDB

		if (!indexedDB) {
		console.log("IndexedDB could not be found in this browser.");
		}

		// 2
		const request = indexedDB.open("generatedImages", 1);

		request.onerror = function(event) {
			console.log("Database error: " + event);
			console.error('Database error: ', event);
		};

		request.onupgradeneeded = function() {
			const db = request.result;
			const objectStore = db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
			objectStore.createIndex("prompt", "prompt", { unique: false });
			objectStore.createIndex("imgData", "imgData", { unique: false });
		};

		request.onsuccess = function() {
		console.log("Database opened successfully");
		const db = request.result;
		const tx = db.transaction("images","readonly");
		const store = tx.objectStore("images");
		const promptIndex = store.index("prompt");
		const imgDataIndex = store.index("imgData");
		const getAllImgData = imgDataIndex.getAll();
		getAllImgData.onsuccess = function() {
			const imgData = getAllImgData.result;
			console.log(imgData);
			imgData.forEach((img) => {
				imgArray.push(img);
			});
			console.log(imgArray);
		};
	};
	});

	let prompt = "";
	let loading = false;

	async function generateImages() {
		loading = true;
		try {
			const res = await fetch('/api/generateImage', { 
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt })
			});
			if (res.ok) {

				const data = await res.text();
				imgArray = [...imgArray, {prompt, imgData: "data:image/png;base64," + data}];
				loading = false;

				const indexedDB = window.indexedDB

				if (!indexedDB) {
					throw new Error("IndexedDB could not be found in this browser.");
				}

				const request = indexedDB.open("generatedImages", 1);
				
				request.onerror = function(event) {
					throw new Error("Database error: " + event);
				};

				request.onsuccess = function() {
					const db = request.result;
					const tx = db.transaction("images","readwrite");
					const store = tx.objectStore("images");
					store.add(imgArray[imgArray.length - 1]);
				};

			} else {
				console.error('Failed to generate images');
				loading = false;
				prompt = "";
			}
		} catch (e) {
			console.error('Failed to generate images', e);
			loading = false;
			prompt = "";
		}
	}

</script>

<svelte:head>{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}</svelte:head>
<div class="announcement-bar bg-[#335C4C] text-white py-2 px-4 flex items-center justify-between">
    <div class="flex items-center">
        <svg class="h-5 w-5 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0zM9 5a1 1 0 0 1 2 0v3a1 1 0 1 1-2 0V5zm0 7a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0v-1z" clip-rule="evenodd"/>
        </svg>
        <span class="text-sm">This is a demo app made by <a class="font-bold" href="https://weblion.pro">Weblion</a>  found @ https://weblion.pro</span>
    </div>
	<div class="justify-center items-center  px-4">
        <LightSwitch />
    </div>
</div>
{#if $page.data.username}
	<div class="flex w-1/2 flex-row-reverse align-end justify-end">
		<button type="button" class="btn variant-filled w-1/4 md:w-[8em] fixed top-24 right-24 z-10 " on:click={logout}>
			logout
		</button>
	</div>
{/if}


<Toast />
<Drawer>
	<div class="flex flex-col w-100 p-5 items-end justify-center">
		{#if imgArray.length > 0}
			{#each imgArray as img}
				<div class="flex flex-row items-cemter justify-center gap-4">
					<img src={img.imgData} alt={img.prompt} class="w-1/2 h-1/2" />
					<p>{img.prompt}</p>
				</div>
			{/each}
		{:else}
			<p>No images to display</p>
		{/if}
		<form class="flex flex-row items-center justify-center gap-4" on:submit={generateImages}>
			<input type="text" bind:value={prompt} placeholder="Enter a prompt" class="w-1/2 bg-primary-400" />
			<button type="submit" class="btn variant-filled w-1/4 md:w-[8em]" disabled={loading}>
				{#if loading}
					Generating...
				{:else}
					Generate
				{/if}
			</button>
		</form>
	</div>
	<!-- If you want more drawers -->
	<!-- {#if $drawerStore.id === 'example-1'}
		(show 'example-1' contents)
	{:else if $drawerStore.id === 'example-2'}
	 (show 'example-2' contents) 
	{:else}
		(fallback contents)
	{/if} -->
</Drawer>



<slot></slot>
