<script lang="ts">
	import { page } from '$app/stores'
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	async function logout() {
		const res = await fetch('/api/logout', { method: 'POST' })
		if (res.ok) {
			location.href = '/login';
		} else {
			console.error('Logout failed');
		}
	}
			

</script>

<main>
	<div class="flex p-6 justify-between">
		<h2 class="h2 font-semibold">Hello, <b>{$page.data.firstName ?? $page.data.username ?? "Not Set"}</b></h2>
		<button type="button" class="btn variant-filled w-1/4 md:w-[8em] " on:click={logout}>
			logout
		</button>
	</div>
	
	{#if ($page.data.username)}
		<form class="flex flex-col gap-4 p-4 md:w-1/4 " method="POST" use:enhance>
			<h2 class="h2">Change Info</h2>
			<input class="input p-2" type="text" name="username" id="username" value={$page.data.username}/>
			<input class="input p-2" type="text" name="firstName" id="firstName" value={$page.data.firstName}/>
			<input class="input p-2" type="text" name="lastName" id="lastName" value={$page.data.lastName}/>
			<input class="input p-2" type="text" name="email" id="email" value={$page.data.email}/>
			<button class="btn variant-filled" type="submit">Update</button>
			<p>{form?.message ?? ''}</p>
		</form>
	{/if}
</main>