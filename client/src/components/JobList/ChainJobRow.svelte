<script lang="ts">
  import type { ChainJob } from "src/logics/Job";
  export let item: ChainJob
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