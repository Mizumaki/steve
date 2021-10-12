<script lang="ts">
  import type { Job } from "src/logics/Job";
  export let items: Job[];
</script>

<div>
  <ul>
    {#each items as job}
      <li>{job.name}</li>
    {/each}
  </ul>
</div>

<style>
</style>
