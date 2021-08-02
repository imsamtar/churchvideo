<script type="ts">
	import Modal from './Modal.svelte';
	import { createEventDispatcher } from 'svelte';
	let status: 'Invalid Password' | '' = ''
	export let roomId: number;

	let name = ''

	const dispatch = createEventDispatcher();
	async function authenticate(e: Event) {
		console.log('Submitted')
		const body = new URLSearchParams(new FormData(e.target)).toString();

		console.log('The body is ', body)
		const res = await fetch('/video/auth.json', { method: 'POST', body });

		const { authentication, host } = await res.json();
		console.log('isHost', {host})

		console.log('Authentication result: ', authentication)

		if(authentication) dispatch('authenticated',{ host, name})
		else status = 'Invalid Password'
	}
</script>

<Modal on:close={e => dispatch('close')}>
	<form action="" on:submit|preventDefault={authenticate}>
		<input type="hidden" name="roomId" value={roomId} />
		<h1 class="text-2xl mb-4">Login</h1>

		<input type="text" class="input" name="name"  bind:value={name} placeholder="Name" required>
		<input type="password" class="input" placeholder="Password" name="password"  required/>

		<label class="px-2"><input type="checkbox" name="host" value="host"> Enter as Host</label>

		<p class="text-red-800 my-4 py-3 "> {status} </p>
		<button type="submit" class="btn flex-right"> Submit </button>
	</form>
</Modal>
