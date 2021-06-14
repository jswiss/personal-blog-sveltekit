<script context="module" lang="ts">
  export async function preload({ params }) {
    // the `slug` parameter is available because
    // this file is called [slug].svelte
    const res = await this.fetch(`blog/${params.slug}.json`);
    const data = await res.json();

    if (res.status === 200) {
      return { post: data };
    } else {
      this.error(res.status, data.message);
    }
  }
</script>

<script lang="ts">
  export let post: Post;
</script>

<style>
  h1 {
    margin-bottom: 3rem;
  }
  .content :global(h2) {
    font-size: 1.4em;
    font-weight: 500;
  }
  .content :global(pre) {
    background-color: #f9f9f9;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.05);
    padding: 0.5em;
    border-radius: 2px;
    overflow-x: auto;
  }
  .content :global(pre) :global(code) {
    background-color: transparent;
    padding: 0;
  }
  .content :global(ul) {
    line-height: 1.5;
  }
  .content :global(li) {
    margin: 0 0 0.5em 0;
  }
  .content :global(img, twitter-widget) {
    max-width: 100%;
    height: auto;
  }

</style>

<svelte:head>
  <title>{post.metadata.title}</title>
  <meta name="keywords" content={post.metadata.tags}>
  <meta name="description" content={post.metadata.summary}>
</svelte:head>

<h1>{post.metadata.title}</h1>

<div class="content">
  {@html post.html}
</div>
