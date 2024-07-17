<script>
    import { page } from "$app/stores";
	import { onMount } from "svelte";

    


    $: username = $page?.data.username
    $: error = $page?.data.error
    
    onMount(async () => {
        if (username) {
            localStorage.removeItem('reload')
            setTimeout(() => {
                location.href = '/'
            }, 3000)
        }
        let reload =localStorage.getItem('reload')
        if (error && reload != "1") {
            localStorage.setItem('reload', "1")
        }
    })

</script>

<main class="flex flex-col items-center justify-center h-[80vh] md:h-[90vh]">
    {#if username}
    <div class="p-4 h-[50%] flex justify-center items-center">
        <div class="card flex flex-col p-10  gap-y-5 justify-center items-center text-center">
            <h1 class="h2 md:h1">Welcome, <bold>{username}</bold></h1>
            <p>You are logged in. Redirecting... </p>
        </div>
    </div>
    {:else}
    <div class="p-4 h-[50%] flex justify-center items-center">
        <div class="animate-slideUp card flex flex-col p-10 gap-y-5 justify-center items-center text-center">
            <h1 class="h1 font-semibold ">Error</h1>
            <p>{error}</p>
        </div>
    </div>
    {/if}
</main>