process.env.PORT = 3001;
console.log(process.env.PORT);

setTimeout(() => {
	import('./build/index.js');
}, 2000);
