<script lang="ts">
  import type { SingleJob } from "src/logics/Job";
  export let item: SingleJob
</script>

<div class='jobRow'>
  <div>{item.name}</div>
  <div>{item.command}</div>
  <div>{item.status}</div>
</div>

<style>
  .jobRow {
    display: flex;
    justify-content: space-between;
    padding: 1em;
  }
</style>