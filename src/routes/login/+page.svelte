<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData } from './$types';

	export let form: ActionData;

	$: codeSent = form?.codeSent
	$: rectify = form?.rectify || null

	let email = '';
</script>

<main class="flex-column items-center justify-center">
	{#if codeSent}
	<div class="p-4 h-[100vh] flex justify-center items-center">
		<div class="card flex flex-col p-10 h-[50%] gap-y-5 justify-center items-center text-center">
			<h1 class="h1 font-semibold ">Verify Code</h1>
			<p class="text-s">for : {email}</p>
			<form method="post" class="flex flex-col gap-y-2" use:enhance>
				<label class="label" for="code">Code</label>
				<input class="input p-2" name="code" id="code" type="text" />
				<input class="input" name="email" id="email" type="email" bind:value={email} hidden />
				<button type="submit" class="variant-filled btn" >Continue</button>
				<button type="button" class="variant-outlined btn" on:click={()=> codeSent = false } >Rectify email</button>
				<p>{form?.message ?? ''}</p>
			</form>
		</div>
	</div>
	{:else}
		<div class="p-4 h-[100vh] flex justify-center items-center">
			<div class="animate-slideUp card flex flex-col p-10 h-[50%] gap-y-5 justify-center items-center text-center">
				<h1 class="h1 font-semibold ">Sign in</h1>
				<form method="post" class="flex flex-col gap-y-2" use:enhance>
					<label class="label text-lg" for="email">Email</label>
					<input class="input p-2" name="rectify" id="rectify" type="text"  bind:value={rectify} hidden />
					<input class="input p-2" name="email" id="email" type="email" on:change={()=> {rectify = null}} bind:value={email} />
					<button type="submit" class="variant-filled btn">Continue</button>
					<p>{form?.message ?? ''}</p>
				</form>
			</div>
		</div>
	{/if}
</main>
