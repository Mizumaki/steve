<script lang="ts">
  import type { Job } from 'src/logics/Job';
  import SingleJobRow from './SingleJobRow.svelte';
  import ChainJobRow from './ChainJobRow.svelte';
  import ClusterJobRow from './ClusterJobRow.svelte';

  export let item: Job;
  let component = (() => {
    switch (item.type) {
      case 'single':
        return SingleJobRow;
      case 'chain':
        return ChainJobRow;
      case 'cluster':
        return ClusterJobRow;
    }
  })();
</script>

<svelte:component this={component} {item} />
