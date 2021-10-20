<script lang="ts">
  import type { ChainJob } from 'src/logics/Job';
  import JobRow from './JobRow.svelte';
  export let item: ChainJob;
</script>

<div>
  <div class="head">
    <div>{item.name}</div>
    <div>{item.status}</div>
  </div>
  <div class="chainJobs">
    <ul>
      {#each item.chainJobs as job}
        <li>
          <JobRow item={job} />
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  .chainJobs {
    padding-left: 1em;
  }
  ul li + li {
    margin-top: 2rem;
  }
</style>
