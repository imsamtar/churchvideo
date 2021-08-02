<script type="ts">
    import { createEventDispatcher } from "svelte"
    import { fade } from "svelte/transition"

    const dispatch = createEventDispatcher();
    function onClose() {
        dispatch('close')
    }
</script>

<div class="mx-auto w-11/12 container sm:mx-2 py-10 px-4 md:px-10 md:w-2/5  p-3 z-50 fixed bg-white border border-black shadow rounded-xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transform" transition:fade>
	<slot />
	<button class="btn bg-red mt-5 float-right" on:click={onClose}> Close </button>
</div>
