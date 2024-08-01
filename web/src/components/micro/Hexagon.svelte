<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Component props
    export let width: string = '98%';
    export let height: string = '98%';
    export let scale: string = '1';
    export let active: boolean = false;
    export let disabled: boolean = false;
    export let strokeWidth: string = '0.5vh';
    export let variant: 'accent' | 'success' | 'error' = 'accent';

    // CSS variable for the variant
    let cssVar = `var(--${variant})`;

    // Tailwind classes for fill colors
    const fills = {
        accent: 'fill-accent',
        success: 'fill-success',
        error: 'fill-error'
    };

    const transparentFills = {
        accent: 'fill-accent/25',
        success: 'fill-success/25',
        error: 'fill-error/25'
    };

    // Reactive statements
    $: fill = fills[variant];
    $: transparentFill = transparentFills[variant];
    $: filter = active ? `drop-shadow(0 0 0.5vh ${cssVar})` : (disabled ? '' : `drop-shadow(0 0 0.1vw ${cssVar})`);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<svg
    {width}
    {height}
    version="1.1"
    style="filter: {filter}; transform: scale({scale});"
    class="origin-center transition-all duration-200 {active ? fill : transparentFill}"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 184.751 184.751"
    xml:space="preserve"
    on:click={() => dispatch('click')}
>
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
        <path
            stroke={cssVar}
            stroke-width={active || disabled ? '0' : strokeWidth}
            d="M0,92.375l46.188-80h92.378l46.185,80l-46.185,80H46.188L0,92.375z"
        />
    </g>
</svg>
