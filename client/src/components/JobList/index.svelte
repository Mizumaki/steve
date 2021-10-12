<script lang="ts">
  import type { Job } from 'src/logics/Job';
  import JobRow from './JobRow.svelte';
  export let items: Job[];
</script>

<div class="container">
  <ul class="jobRows">
    {#each items as job}
      <li>
        <div class="jobRow">
          <JobRow item={job} />
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .container {
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
  }
  .jobRows {
    padding: 1em;
    border: 1px solid gray;
  }
  ul li + li {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid gray;
  }
</style>
