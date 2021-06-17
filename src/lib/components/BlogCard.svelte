<script lang="ts">
	export let title;
	export let slug;
	export let postDate;

	export function dateConverter(postDate) {
		const convertedPostDate = new Date(postDate);
		const dateOptions: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};
		return convertedPostDate.toLocaleString('en-UK', dateOptions);
	}
</script>

<article class="blog-card">
	<div class="title">
		<a href="/blog/{slug}" rel="prefetch">{title}</a>
	</div>
	<section class="card-footer">
		<p class="post-date">Published: {dateConverter(postDate)}</p>
	</section>
</article>

<style>
	a {
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
	article {
		display: flex;
		flex-direction: column;
		margin: 0.8rem;
		border: 1px solid #7e30a8;
		border-radius: 1%;
	}
	.title {
		margin: 0.5rem;
		font-size: 1.5rem;
	}
	.card-footer {
		background-color: #7e30a8;
	}
	.post-date {
		margin: 0.5rem;
		font-size: 0.9rem;
		font-style: italic;
		color: whitesmoke;
	}
</style>
