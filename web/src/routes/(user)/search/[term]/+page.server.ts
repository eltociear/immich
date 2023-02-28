import type { PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
	const term = params.term;

	// try {
	// 	const results = await locals.api.searchApi.search({ query: term });
	// 	return { results };
	// } catch (error: any) {
	// 	console.log('[Error] searching by term', term);
	// 	return { results: error };
	// }

	return { term };
}) satisfies PageServerLoad;
