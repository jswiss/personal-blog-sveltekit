<script context="module" lang="ts">
	export async function load({ page, fetch }) {
		const post = await fetch(`${page.path}.json`).then((res) => res.json());
		if (!post || !post.published) {
			return {
				status: 404,
				error: new Error('Post could not be found')
			};
		}
		return {
			props: {
				post
			}
		};
	}
</script>

<script lang="ts">
	export let post: Metadata;
</script>

<svelte:head>
	<title>{post.title}</title>
	<meta name="keywords" content={post.tags} />
	<meta name="description" content={post.summary} />
</svelte:head>

<h2>{post.title}</h2>

<section>
	<slot />
</section>

<style>
	section :global(pre) {
		background-color: #f9f9f9;
		box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.05);
		padding: 0.5em;
		border-radius: 2px;
		overflow-x: auto;
	}
	section :global(pre) :global(code) {
		background-color: transparent;
		padding: 0;
	}
	section :global(ul) {
		line-height: 1.5;
	}
	section :global(li) {
		margin: 0 0 0.5em 0;
	}
	section :global(img, twitter-widget) {
		max-width: fit-content;
		height: auto;
	}
	h2 {
		margin-bottom: 2rem;
		display: inline;
		text-align: center;
		font-size: 4rem;
		font-family: 'Gilroy';
	}
</style>
