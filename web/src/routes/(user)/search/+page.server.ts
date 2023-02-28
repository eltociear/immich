import { redirect } from '@sveltejs/kit';
import { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	throw redirect(302, '/photos');
};
