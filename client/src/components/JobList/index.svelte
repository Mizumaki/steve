<script lang="ts">
  import type { Job } from "src/logics/Job";
  import JobRow from './JobRow.svelte'
  export let items: Job[];
</script>

<div>
  <ul>
    {#each items as job}
      <li>
        <div class='jobRow'>
          <JobRow item={job} />
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .jobRow {
    border: 1px solid gray;
  }
</style>
