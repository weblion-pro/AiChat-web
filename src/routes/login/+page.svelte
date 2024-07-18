<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData } from './$types';

	export let form: ActionData;

	$: codeSent = form?.codeSent
	$: rectify = form?.rectify || null

	let email = '';
</script>

<main class="flex h-[80vh] md:h-[90vh] justify-center items-center">
	<div class="animate-slideUp flex flex-col card m-10 p-5 md:w-[40%]" >
		<div class="flex justify-center items-center p-2 ">
			<a href="/login/google"
				class="w-full flex items-center justify-center border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white px-4 hover:bg-gray-50 md:px-8 py-3">
				<img class="h-7 w-7" src="https://www.svgrepo.com/show/506498/google.svg" alt="">
				<span class=" text-md md:text-lg font-semibold ml-4">Sign in with Google</span>
			</a>
		</div>
		<div class="flex justify-between items-center">
			<hr class="my-5 w-1/3 border-gray-300" />
			<span class="">or</span>
			<hr class="my-5 w-1/3 border-gray-300" />
		</div>
		{#if codeSent}
			<div class="card flex flex-col p-4 gap-y-5 justify-center items-center text-center">
				<h1 class="h1 font-semibold ">Verify Code</h1>
				<p class="text-s">for : {email}</p>
				<form method="post" class="flex flex-col gap-y-2" use:enhance>
					<label class="label" for="code">Code</label>
					<input class="input p-2" name="code" id="code" type="text" />
					<input class="input p-2" name="rectify" id="rectify" type="text"  bind:value={rectify} hidden />
					<input class="input" name="email" id="email" type="email" bind:value={email} hidden />
					<button type="submit" class="variant-filled btn" >Continue</button>
					<button type="button" class="variant-outlined btn" on:click={()=> codeSent = false } >Rectify email</button>
					<p class="text-khoukhi">{form?.message ?? ''}</p>
				</form>
			</div>
		{:else}
			<div class="card flex flex-col p-4 h-[50%] gap-y-5 justify-center items-center text-center">
				<h1 class="h1 font-semibold ">Sign in</h1>
				<form method="post" class="flex w-full flex-col gap-y-2" use:enhance>
					<label class="label text-lg" for="email">Email</label>
					<input class="input p-2" name="rectify" id="rectify" type="text"  bind:value={rectify} hidden />
					<input class="input p-2" name="email" id="email" type="email" on:change={()=> {rectify = null}} bind:value={email} />
					<button type="submit" class="variant-filled btn">Continue</button>
					<p class="text-khoukhi">{form?.message ?? ''}</p>
				</form>
			</div>
		{/if}
	</div>
</main>
