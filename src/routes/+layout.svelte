<script lang="ts">
	import '../app.css';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { updated } from '$app/stores';
	import { initializeStores, Toast} from '@skeletonlabs/skeleton';
	import { getToastStore } from "@skeletonlabs/skeleton";
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	initializeStores();

	const toastStore = getToastStore();

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
</script>

<svelte:head>{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}</svelte:head>
<LightSwitch />
<Toast />



<slot></slot>
