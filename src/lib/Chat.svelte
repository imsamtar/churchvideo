<script type="ts">
	import { prayers } from '../stores';
	// session.update((session) => {
	// 	if (!session.$prayers) return { $prayers: [] };
	// 	return session;
	// });

	import { createEventDispatcher } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { fly } from 'svelte/transition';
	const dispatch = createEventDispatcher();

	export let socket: Socket;
	// export let userId: string;
	export let name: string;

	interface prayer {
		name: string;
		message: string;
	}

	function submit(e: Event) {
		const message = e.target.prayer.value;
		const prayer = { name, message };
		console.log('Submittin this pmessage', prayer);

		addPrayer(prayer);
		socket.emit('prayer', prayer);
	}

	function addPrayer(prayer: prayer) {
		console.log('Addig this one', prayer);
		$prayers = [...$prayers, prayer];
	}

	socket.on('prayer', addPrayer);
</script>

<div
	class="fixed w-full md:w-3/12  bg-white top-0 bottom-0 left-0 p-10 flex flex-col"
	transition:fly={{ duration: 1000, x: 0 }}
>
	<h1 class="text-2xl">
		<i class="fas fa-arrow-left mr-6" on:click={() => dispatch('visible', false)} /> Prayer Requests
	</h1>
	<div class="flex-auto overflow-y-scroll">
		{#each $prayers as { name, message }}
			<div class="p-5" transition:fly>
				<h1 class="text-lg">{name}</h1>
				<p>{message}</p>
			</div>
		{/each}
	</div>

	<form action="" class="flex" on:submit|preventDefault={submit}>
		<input
			name="prayer"
			type="text"
			placeholder="Your request"
			class="focus:border-black outline-none border border-r-0 p-2 flex-auto"
		/>

		<button class="btn"><i class="fas fa-arrow-up" /></button>
	</form>
</div>
