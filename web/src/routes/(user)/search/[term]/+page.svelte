<script lang="ts">
	import SideBar from '$lib/components/shared-components/side-bar/side-bar.svelte';
	import { onMount } from 'svelte';
	import { PageData } from './$types';

	export let data: PageData;

	onMount(async () => {
		console.log({ data });
	});
</script>

<section
	class="grid grid-cols-[250px_auto] relative pt-[72px] h-screen bg-immich-bg dark:bg-immich-dark-bg"
>
	<SideBar />
	<h1>Search</h1>

	<pre>{{ data }}</pre>
</section>
