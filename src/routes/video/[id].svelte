<script type="ts" context="module">
	export const router = false;
	export const load: Load = async ({ page, fetch }) => {
		const { params } = page;
		const roomId = params.id;

		const res = await fetch('/church.json?roomId=' + roomId);
		const churches: ChurchType[] = await res.json();

		if (churches.length === 0) {
			return {
				redirect: '/video/'
			};
		}

		const { noParticipants } = churches[0];

		return {
			status: 200,
			props: { roomId, noParticipants }
		};
	};
</script>

<script type="ts">
	// import { } from "$app/navigation"
	import { prayers } from '../../stores';
	import io from 'socket.io-client';
	import YouTube from '$lib/Youtube.svelte';
	export let noParticipants: number;
	let videoChats: video[] = [];

	for (let i = 0; i < noParticipants; i++) {
		videoChats = [...videoChats, { name: '', userId: `userId`, seat: +i, taken: false }];
	}

	let peer;
	videoChats.length = noParticipants;

	import Chat from '$lib/Chat.svelte';

	import { onMount } from 'svelte';
	import Modal from '$lib/AutorisationModal.svelte';
	import { get } from 'svelte/store';

	export let roomId: number;

	let chat = false;
	let mic = false;
	let cam = false;
	let seat: number;
	let authorization = false;
	let authorizationModal = false;
	let isHost = false;
	let yt: string;
	let userName: string;
	let seatsReceived = false;

	/**
	 * Three processes are involved
	 * 0 : The chair view
	 * 1 : Thumbnail
	 * 2 : View
	 */

	let process = 0;

	const socket = io('/');

	interface video {
		name?: string;
		stream?: MediaStream;
		userId?: string;
		seat: number;
		taken: boolean;
	}

	socket.on('link', (link) => (yt = link));

	socket.emit('guest-room', roomId);
	socket.on('seats', (seats, link) => {
		if (!seatsReceived) {
			videoChats = seats;
			seatsReceived = true;
		}

		if (!yt) {
			yt = link;
		}
	});
	socket.on('guest-room', () => {
		const mappedVideoChats = videoChats.map(({ taken, seat }) => {
			return { taken, seat };
		});
		socket.emit('seats', mappedVideoChats, yt);
	});

	function clickMySeat(seatIndex: number, name: string, stream: MediaStream, userId: string) {
		videoChats[seat] = { name, stream, userId, seat: seatIndex, taken: true };
	}

	function nextProcess(seatIndex: number, taken: boolean) {
		if (!authorization) {
			if (!taken) {
				seat = seatIndex;

				authorizationModal = true;
				return;
			} else return;
		}

		if (process === 2) process -= 1;
		else process += 1;
	}

	async function toggleMic(e, value = !mic) {
		if (authorization) {
			mic = value;
			videoChats[seat].stream.getAudioTracks()[0].enabled = mic;
		}
	}

	async function toggleCam(e: Event, value = !cam) {
		if (authorization) {
			cam = value;
			videoChats[seat].stream.getVideoTracks()[0].enabled = cam;
		}
	}

	async function allowStream() {
		return await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
	}

	function disconnected(seat) {
		videoChats[seat] = { taken: false, seat };
	}
	socket.on('disconnected', disconnected);

	function video(node: HTMLVideoElement, stream: MediaStream) {
		if (stream?.getTracks().length) node.srcObject = stream;

		node.onloadedmetadata = function (e) {
			node.play();
		};

		return {
			update(stream: MediaStream) {
				video(node, stream);
			}
		};
	}

	interface prayer {
		name: string;
		message: string;
	}

	socket.on('prayers', (prayer) => {
		if ($prayers.length === 0) {
			prayers.set(prayer);
		}
	});

	function addPrayer(prayer: prayer) {
		console.log('Addig this one', prayer);
		$prayers = [...$prayers, prayer];
	}

	socket.on('prayer', addPrayer);

	socket.on('user-connected', (seat) => {
		videoChats[seat].taken = true;
		socket.emit('prayers', get(prayers));
	});

	async function startConnection() {
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true
			})
			.then((stream) => {
				console.log('stream started');
				clickMySeat(seat, userName, stream, undefined);
				// videoChats[seat].stream.muted = true;
				toggleCam(null, false);
				toggleMic(null, false);

				peer = new Peer(undefined, { host: '/', port: 9000 });
				// let replyConn;
				// peer.on('connection', () => console.log('connected'));

				peer.on('open', (id: string) => {
					videoChats[seat].userId = id;
					console.log('After changing USER_ID', { videoChats });

					socket.emit('join-room', seat, userName, id);

					// Received stream
					peer.on('call', (call) => {
						console.log('someone asked for our stream sendig it');
						call.answer(stream); // Answering it with our stream

						// When we receive it we, add search for the data
						call.on('stream', (userMediaStream: MediaStream) => {
							console.log('Received the replied stream');
							peer.on('connection', (conn) => {
								conn.on('data', (data: video) => {
									console.log('Received Data', data);
									let { userId, name, seat } = data;
									// When we get the seat,name, userId annd stream, we add a new videoChats
									if (userId === call.peer) {
										console.log('Got all info of user', seat);
										addVideoStream(seat, userMediaStream, name, userId);
									}
								});
							});
						});
					});

					socket.on('user-connected', (seat, name, userId) =>
						connectToNewUser(seat, name, userId, stream)
					);
				});
			});
	}

	function connectToNewUser(seatIndex: number, name: string, userId: string, stream: MediaStream) {
		console.log('A user connected in seat', seatIndex);
		const call = peer.call(userId, stream);
		console.log('before stream', videoChats[seat]);

		call.on('stream', (userVideoStream: MediaStream) => {
			console.log(seatIndex, 'User gave his stream');
			addVideoStream(seatIndex, userVideoStream, name, userId);

			call.on('close', () => disconnected(seat));
			const conn = peer.connect(userId);

			console.log('goig to send', videoChats[seat]);
			conn.on('open', () => {
				console.log(
					'Successfull joiened to seat',
					seatIndex,
					userId,
					'goig to send',
					videoChats[seat]
				);
				console.log('Sending Data to the new participant');
				conn.send({ ...videoChats[seat], stream: undefined });
				console.log('sent', videoChats[seat]);
			});
		});

		// call.on('close', () => (videoChats[seatIndex] = { seatIndex, taken: false }));
	}

	function addVideoStream(seat: number, stream: MediaStream, name: string, userId: string) {
		videoChats[seat] = { name, stream, userId, seat, taken: true };
	}

	function closeAuthorization() {
		authorizationModal = false;
	}

	async function authorized(e: CustomEvent) {
		const { host, name } = e.detail;
		if (host === 'host') {
			isHost = true;
			console.log({ isHost });
		}

		userName = name;
		videoChats[seat].name = name;

		closeAuthorization();
		authorization = true;
		console.log('Starting connection');
		await startConnection();
	}

	function changeLink(e: Event) {
		const { value } = e.target;

		let url: URL;
		try {
			url = new URL(value);
		} catch (e) {
			url = new URL('http://youtube.com');
		}

		let videoId: string;
		if (url.searchParams.has('v')) {
			videoId = url.searchParams.get('v');
		} else {
			const lastSlash = value.lastIndexOf('/') + 1;
			videoId = value.substring(lastSlash);
		}

		yt = videoId;
		socket.emit('yt', yt);
	}
</script>

<svelte:head>
	<title>VIDEO CHAT</title>
	<script src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js" defer></script>
</svelte:head>

{#if authorizationModal}
	<Modal {roomId} on:close={() => (authorizationModal = false)} on:authenticated={authorized} />
{/if}

<div class="container mx-auto p-2">
	{#if isHost}
		<input
			type="url"
			placeholder="Youtube Link"
			class="flex-1 w-full p-3 px-5 border rounded-xl md:w-9/12 mx-auto block"
			on:input={changeLink}
		/>
	{/if}

	<div class="md:w-9/12 mx-auto my-5">
		<YouTube {...{ socket, isHost, videoId: yt }} />
	</div>

	<div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-4 md:gap-y-12">
		{#each videoChats as { name, taken, stream, seat: index } (index)}
			<div
				class="border flex flex-col justify-center items-center rounded-xl bg-white"
				class:py-6={process !== 2}
				on:click={() => nextProcess(index, taken)}
			>
				{#if process == 0}
					<h1 class="text-3xl my-4">{name || index + 1}</h1>

					<span class="fa-stack fa-2x"
						><i
							class="fas fa-circle fa-stack-2x "
							class:text-green-500={!taken}
							class:text-red-500={taken}
						/>
						<i class="fas fa-chair fa-stack-1x text-white" />
					</span>
				{:else if process == 1}
					<h1 class="text-3xl my-4">{name || index + 1}</h1>

					<video autoplay class="thumbnail-video" use:video={stream} muted={index === seat} />
				{:else}
					<video autoplay class="full-video" use:video={stream} muted={index === seat} />
				{/if}
			</div>
		{/each}
	</div>
</div>

{#if authorization}
	<div
		class="fixed md:left-0 right-0 bottom-16 md:bottom-5 container mx-auto flex justify-center text-xl flex-row "
		id="controls"
	>
		<div on:click={toggleMic}>
			<span class="fa-stack fa-lg rounded-full shadow-xl">
				<i class="fas fa-circle fa-stack-2x" class:text-green-600={mic} class:text-red-600={!mic} />
				<i
					class="fas fa-stack-1x fa-inverse"
					class:fa-microphone={mic}
					class:fa-microphone-slash={!mic}
				/>
			</span>
		</div>

		<div class="md:ml-5" on:click={toggleCam}>
			<span class="fa-stack fa-lg rounded-full shadow-xl">
				<i
					class="fas fa-circle fa-stack-2x "
					class:text-green-600={cam}
					class:text-red-600={!cam}
				/>
				<i class="fas fa-video fa-stack-1x fa-inverse" />
			</span>
		</div>

		<div on:click={() => (chat = !chat)} class="md:ml-5">
			<span class="fa-stack fa-lg rounded-full shadow-xl">
				<i class="fas fa-circle fa-stack-2x text-indigo-600" />
				<i class="fas fa-praying-hands fa-stack-1x fa-inverse" />
			</span>
		</div>

		<div
			on:click={() => {
				process = 0;
				mic = false;
				cam = false;
			}}
			class="md:ml-5"
		>
			<span class="fa-stack fa-lg rounded-full shadow-xl">
				<i class="fas fa-circle fa-stack-2x text-purple-700" />
				<i class="fas fa-chair fa-stack-1x fa-inverse" />
			</span>
		</div>
	</div>

	{#if chat}
		<Chat on:visible={() => (chat = false)} {socket} name={userName} />
	{/if}
{/if}

<style>
	video {
		@apply h-full w-full rounded-xl;
	}

	.full-video {
		object-fit: cover;
	}

	.thumbnail-video {
		height: 200px;
		width: 200px;
		object-position: center top;
		object-fit: cover;
	}

	iframe {
		aspect-ratio: 16/9;
	}

	:global(.video-container::after) {
		padding-top: 56.25%;
		display: block;
		content: '';
	}

	:global(.video-container iframe) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
