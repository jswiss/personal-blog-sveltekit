<script>
	import { darkMode } from '$lib/stores/stores';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	{#if $darkMode === 'light'}
		<link rel="stylesheet" href="/styles/light-mode.css" />
	{:else if $darkMode === 'dark'}
		<link rel="stylesheet" href="/styles/dark-mode.css" />
	{/if}
</svelte:head>

<Nav />

<main>
	<h1 class="dark">Joshua Swiss</h1>
	<div id="main-border">
		<slot />
	</div>
</main>

<Footer />

<style>
	@font-face {
		font-family: 'Swansea';
		src: url('/fonts/Swansea-q3pd.ttf');
	}
	@font-face {
		font-family: 'Gilroy';
		src: url('/fonts/gilroy-extrabold.otf');
	}
	h1 {
		display: inline;
		text-align: center;
		font-size: 4rem;
		font-family: 'Gilroy';
	}
	main {
		display: grid;
		grid-template-rows: auto 1fr;
		font-family: 'Swansea';
	}
	#main-border {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
