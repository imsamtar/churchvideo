<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	const navLinks = [
		{ name: 'home', href: '/' },
		{ name: 'plus', href: '/church/add' }
	];
</script>

<header class="md:my-10 md:flex mx-10 md:justify-between items-baseline">
	<h1 class="text-2xl text-center md:text-left flex-auto hidden md:block" id="nav-brand">
		My Church
	</h1>

	<nav
		class="fixed -inset-x-0 bottom-0 flex justify-around p-3 border border-top text-2xl md:relative md:border-none flex-auto bg-gray-50 md:bg-white"
	>
		{#each navLinks as { name, href }}
			<a
				{href}
				class="hover:text-blue-800"
				class:text-blue-800={$page.path == href}
				sveltekit:prefetch><i class="fas fa-{name}" /></a
			>
		{/each}
	</nav>
</header>

<slot />

<style>
	#nav-brand {
		flex: 4;
	}
</style>
