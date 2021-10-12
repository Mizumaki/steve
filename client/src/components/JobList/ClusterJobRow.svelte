<script lang="ts">
  import type { ClusterJob } from 'src/logics/Job';
  import JobRow from './JobRow.svelte';
  export let item: ClusterJob;
</script>

<div>
  <div class="head">
    <div>{item.name}</div>
    <div>{item.status}</div>
  </div>
  <div class="jobCluster">
    <ul>
      {#each item.jobCluster as job}
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
  .jobCluster {
    padding-left: 1em;
  }
  ul li + li {
    margin-top: 2rem;
  }
</style>
