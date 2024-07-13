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
	<div>
		<button type="button" class="btn-icon variant-filled" on:click={logout}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24">
			<path d="M 12 6 C 8.7099679 6 6 8.7099679 6 12 L 6 36 C 6 39.290032 8.7099679 42 12 42 L 29 42 C 31.776017 42 34.247059 40.180505 34.9375 37.498047 A 2.0004892 2.0004892 0 1 0 31.0625 36.501953 C 30.864941 37.269495 29.951983 38 29 38 L 12 38 C 10.872032 38 10 37.127968 10 36 L 10 12 C 10 10.872032 10.872032 10 12 10 L 29 10 C 29.951983 10 30.864941 10.730505 31.0625 11.498047 A 2.0004892 2.0004892 0 1 0 34.9375 10.501953 C 34.247059 7.8194949 31.776017 6 29 6 L 12 6 z M 33.978516 15.980469 A 2.0002 2.0002 0 0 0 32.585938 19.414062 L 35.171875 22 L 17 22 A 2.0002 2.0002 0 1 0 17 26 L 35.171875 26 L 32.585938 28.585938 A 2.0002 2.0002 0 1 0 35.414062 31.414062 L 41.414062 25.414062 A 2.0002 2.0002 0 0 0 41.414062 22.585938 L 35.414062 16.585938 A 2.0002 2.0002 0 0 0 33.978516 15.980469 z"></path>
			</svg></button>
	</div>
	<h2 class="h2 font-semibold">Hello, <b>{($page.data.username)}</b></h2>
	<h2 class="h2 font-semibold">Hello, <b>{$page.data.firstName ?? "Not Set"}</b></h2>
	<h2 class="h2 font-semibold">Hello, <b>{$page.data.secretVar ?? "Not Set"}</b></h2>
	
	{#if ($page.data.username)}
		<form class="flex flex-col gap-4 p-4 w-1/4 " method="POST" use:enhance>
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