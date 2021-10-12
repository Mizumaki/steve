<script lang="ts">
  import type { ClusterJob } from "src/logics/Job";
  export let item: ClusterJob
</script>

<div class='jobRow'>
  <div>{item.name}</div>
  <div>{item.status}</div>
</div>

<style>
  .jobRow {
    display: flex;
    justify-content: space-between;
    padding: 1em;
  }
</style>