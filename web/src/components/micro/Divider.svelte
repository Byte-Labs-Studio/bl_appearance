<script lang="ts">
    import { scale } from 'svelte/transition';
</script>

<div
    transition:scale|global={{ delay: 1000 }}
    class="w-full h-[0.2vh] bg-primary/20 {$$props.class}"
></div>
