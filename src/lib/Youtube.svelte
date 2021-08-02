<script type="ts">
	import type { Socket } from 'socket.io-client';
	import YouTube from 'svelte-youtube';
	export let socket: Socket;
	export let isHost: boolean;
	export let videoId: string;

	let duration: number;


	function onReady(e: CustomEvent) {
		const { target: player } = e.detail;

		player.playVideo();

		socket.on('buffer', (time) => {
			console.log('Buffering');
			player.seekTo(time, true);
			duration = time;
		});

		socket.on('pause', (time) => {
			console.log('Pausing');

			player.pauseVideo();
			player.seekTo(time, true);

			duration = time;
		});

		socket.on('play', (time) => {
			console.log('Playing');

			player.playVideo();
			player.seekTo(time, true);

			duration = time;
		});
	}


	function play(e: CustomEvent) {
		const time = e.detail.target.getCurrentTime();
		socket.emit('play', time);
	}

	function pause(e: CustomEvent) {
		const time = e.detail.target.getCurrentTime();
		socket.emit('pause', time);
	}

	let adminPlayerVars = {
		autoplay: 1,
		controls: 1,
		rel: 0,
		modestbranding: 1
	};

	const userPlayerVars = {
		autoplay: 1,
		rel: 0,
		controls: 0,
		disablekb: 1,
		modestbranding: 1
	};

</script>

{#if isHost}
	<YouTube
		videoId={videoId ?? 'v'}
		options={{ playerVars : adminPlayerVars }}
		class="overflow-hidden relative w-full video-container"
		on:play={play}
		on:pause={pause}
		on:ready={onReady}
	/>
{:else}
	<YouTube
		videoId={videoId ?? 'v'}
		options={{ playerVars: userPlayerVars }}
		class="overflow-hidden relative w-full video-container"
		on:ready={onReady}
	/>
{/if}
