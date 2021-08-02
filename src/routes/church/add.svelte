<script type="ts">
	import { fade } from 'svelte/transition';

	let form: HTMLFormElement;
	let result: boolean = undefined;
	async function addChurch() {
		const params = new URLSearchParams(new FormData(form));
		console.log(params.toString());
		const res = await fetch('/church.json', { method: 'POST', body: params.toString() });
		result = (await res.json()).result;
	}
</script>

{#if result === undefined}
	<form
		transition:fade
		bind:this={form}
		action="post"
		class="grid grid-cols-1 md:grid-cols-2 container w-screen py-6 px-4 container mx-auto md:gap-x-28 md:gap-y-14  gap-x content-center items-stretch"
		on:submit|preventDefault={addChurch}
	>
		<h2 class=" text-center text-3xl md:col-span-2 my-10">Add a church</h2>

		<div>
			<input required type="text" placeholder="Church name" name="name" />
			<input required type="text" placeholder="Location" name="location" />

			<label>
				<h3 class="p-3">Color</h3>
				<input required type="color" class="h-16 bg-white" name="color" value="#1E40AF" />
			</label>
		</div>

		<div>
			<input required type="number" placeholder="Number of Participants" name="noParticipants" min="2" />

			<input required type="text" placeholder="Admin code" name="adminCode" />
			<input required type="text" placeholder="Participant code" name="participantCode" />
			<div class="md:mt-3 h-16">
				<button type="submit" class="btn float-right border-black"> Next </button>
			</div>
		</div>
	</form>
{:else}
	<div class="container mx-auto flex flex-col items-center gap-y-5" transition:fade>
		<h1 class="text-center">
			{#if result} Success {:else} Failure {/if}
		</h1>

		<div class="my-5">
			<a href={result ? '/' : '/church/add'} sveltekit:prefetch class="btn mx-auto"
				>{#if result} Home {:else} Try again {/if}</a
			>
		</div>
	</div>
{/if}

<style>
	input {
		@apply border-b p-3 outline-none focus:border-blue-800 mx-auto w-full mb-10;
	}
</style>
