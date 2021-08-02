/// <reference types="@sveltejs/kit" />

declare type Load = import('@sveltejs/kit').Load;
declare type DndEvent = import('svelte-dnd-action').DndEvent;
declare type RequestHandler = import('@sveltejs/kit').RequestHandler;

declare namespace svelte.JSX {
	interface HTMLAttributes<T> {
		onconsider?: (event: CustomEvent<DndEvent> & { target: EventTarget & T }) => void;
		onfinalize?: (event: CustomEvent<DndEvent> & { target: EventTarget & T }) => void;
	}
}

declare interface ChurchType {
	id: number;
	name: string;
	location: string;
	color: string;
	adminCode? : string ;
	participantCode? : string ;
	noParticipants : number
}

