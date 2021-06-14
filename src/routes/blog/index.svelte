<script context="module" lang="ts">
  export async function load({ fetch }) {
    // Use a `limit` querystring parameter to fetch a limited number of posts
		// e.g. fetch('posts.json?limit=5') for 5 most recent posts
		const posts: Post[] = await fetch('/posts.json').then((res) => res.json());
		return {
      props: {
        posts
			}
		};
	}
</script>

<script>
  import BlogCard from "$lib/components/BlogCard.svelte";
  export let posts;
</script>

<style>
  section {
    display: flex;
    flex-direction: column;
    margin: 0 0 1em 0;
    line-height: 1.5;
    list-style-type: none;
  }
</style>

<svelte:head>
  <title>Blog</title>
</svelte:head>

<section>
  {#each posts as {slug, title, date}}
    <BlogCard title={title} postDate={date} slug={slug} />
  {/each}
</section>
