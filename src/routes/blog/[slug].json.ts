import { slugFromPath } from '$lib/util';

interface Body {
	body: Metadata;
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ params }): Promise<Body | Status> {
	const modules = import.meta.glob(`./posts/*.{md,svx,svelte.md}`);

	let match;
	for (const [path, resolver] of Object.entries(modules)) {
		if (slugFromPath(path) === params.slug) {
			match = [path, resolver];
			break;
		}
	}

	if (!match) {
		return {
			status: 404
		};
	}

	const post = await match[1]();

	return {
		body: post.metadata
	};
}
