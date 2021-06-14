/// <reference types="@sveltejs/kit" />

interface Nullable<T> {
	T: T | null;
}

interface Status {
	status: number;
}

interface Metadata {
	layout: string;
	title: string;
	summary?: string;
	date: string;
	tags: string;
	published: boolean;
}
interface Post {
	html: string;
	metadata: Metadata;
	filename: string;
	date?: number;
}
