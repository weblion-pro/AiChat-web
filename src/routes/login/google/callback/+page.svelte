<script>
    import { page } from "$app/stores";
    import { redirect } from "@sveltejs/kit";
	import { onMount } from "svelte";
    $: username = $page?.data.username
    $: error = $page?.data.error
    
    onMount(() => {
        if (username) {
            setTimeout(() => {
                location.href = '/'
            }, 3000)
        }
    })

</script>

<main class="flex-column items-center justify-center">
    {#if username}
    <div class="p-4 h-[100vh] flex justify-center items-center">
        <div class="card flex flex-col p-10 h-[50%] gap-y-5 justify-center items-center text-center">
            <h1 class="h1">Welcome <bold>{username}</bold></h1>
            <p>You are logged in. Redirecting... </p>
        </div>
    </div>
    {:else}
    <div class="p-4 h-[100vh] flex justify-center items-center">
        <div class="animate-slideUp card flex flex-col p-10 h-[50%] gap-y-5 justify-center items-center text-center">
            <h1 class="h1 font-semibold ">Error</h1>
            <p>{error}</p>
        </div>
    </div>
    {/if}
</main>