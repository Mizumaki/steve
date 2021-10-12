<script lang="ts">
  import { onMount } from 'svelte';
  import List from './components/JobList/index.svelte';
  import type { Job } from './logics/Job';
  import { fetchJobs } from './logics/Job/fetchJobs';
  let jobs: Job[] | undefined = undefined;
  let error: string = '';

  onMount(async () => {
    const res = await fetchJobs();
    if (res.isFailed) {
      error = res.error;
      return;
    }
    jobs = res.data;
  });
</script>

<main>
  {#if error}
    <p>Error: {error}</p>
  {:else if jobs === undefined}
    <p>Loading...</p>
  {:else}
    <List items={jobs} />
  {/if}
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
      'Helvetica Neue', sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }
</style>
