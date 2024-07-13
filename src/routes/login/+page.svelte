<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData } from './$types';
	import { page } from '$app/stores';

	export let form: ActionData;

	$: codeSent = form?.codeSent
	$: rectify = form?.rectify || null

	let email = '';
</script>

<main class="flex h-lvh justify-center items-center">
	<div class="card w-[40%] p-10" >
		<div class="mt-6 grid grid-cols-3 gap-3">
			<div>
				<a href="#"
					class="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
					<img class="h-6 w-6" src="https://www.svgrepo.com/show/512120/facebook-176.svg"
						alt="">
				</a>
			</div>
			<div>
				<a href="/login/google"
					class="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
					<img class="h-6 w-6" src="https://www.svgrepo.com/show/506498/google.svg" alt="">
				</a>
			</div>
			<div>
				<a href="#"
					class="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
					<img class="h-6 w-6" src="https://www.svgrepo.com/show/513008/twitter-154.svg"
						alt="">
				</a>
			</div>
		</div>
		<p>{$page.data.key}</p>
		{#if codeSent}
			<div class="card flex flex-col h-[50%] gap-y-5 justify-center items-center text-center">
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
		{:else}
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
		{/if}
	</div>
</main>
