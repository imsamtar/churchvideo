<script type="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		const res = await fetch('/church.json');

		if (res.ok) {
			const churches = await res.json();
			return {
				props: {
					churches
				}
			};
		}
	};
</script>

<script type="ts">
	export let churches: ChurchType[];
</script>

<div class=" container mx-auto py-10">
	<h2 class="text-2xl mx-4">Public Churches</h2>
	<div class="grid md:grid-cols-5 grid-cols-1">
		{#each churches as { id, name, location, color } (id)}
			<a
				href="/video/{id}"
				style="background-color: {color};"
				class="border border-black hover:shadow-xl  p-10 my-7 mx-4 rounded-xl md:text-center bg-cover  church flex flex-col justify-center items-center"
			>
				<h3 class="font-bold">{name}</h3>
				<p>{location}</p>
			</a>
		{/each}
	</div>
</div>
