<script lang="ts">
    import Wrapper from '@components/micro/Wrapper.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import ColourDropdown from '@components/micro/ColourDropdown.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import { APPEARANCE, LOCALE } from '@stores/appearance';
    import type { THeadOverlayTotal, THeadOverlay } from '@typings/apperance';

    $: headOverlay = $APPEARANCE.headOverlay as THeadOverlay;
    $: headOverlayTotal = $APPEARANCE.headOverlayTotal as THeadOverlayTotal;
</script>

{#if !headOverlay}
    <Wrapper label={$LOCALE.NO_MAKEUP} />
{:else}
    {#if headOverlay?.Makeup?.overlayValue !== undefined}
        <Wrapper label={$LOCALE.MAKEUP_TITLE}>
            <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >{$LOCALE.TOTAL_SUBTITLE}: {headOverlayTotal.Makeup}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    bind:value={headOverlay.Makeup.overlayValue}
                    total={headOverlayTotal.Makeup}
                    none={true}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Makeup)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">{$LOCALE.COLOR_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <ColourDropdown
                    colourType="makeup"
                    bind:index={headOverlay.Makeup.firstColor}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Makeup)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_secondary-start"
                >{$LOCALE.HIGHLIGHT_SUBTITLE}</svelte:fragment
            >
            <svelte:fragment slot="extra_secondary">
                <ColourDropdown
                    colourType="makeup"
                    bind:index={headOverlay.Makeup.secondColor}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Makeup)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_tertiary-start"
                >{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment
            >
            <svelte:fragment slot="extra_tertiary">
                <Slider
                    bind:value={headOverlay.Makeup.overlayOpacity}
                    min={0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Makeup)}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if headOverlay?.Blush?.overlayValue !== undefined}
        <Wrapper label={$LOCALE.BLUSH_TITLE}>
            <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >{$LOCALE.TOTAL_SUBTITLE}: {headOverlayTotal.Blush}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    bind:value={headOverlay.Blush.overlayValue}
                    total={headOverlayTotal.Blush}
                    none={true}
                    on:change={() => {
                        APPEARANCE.setHeadOverlay(headOverlay.Blush);
                    }}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">{$LOCALE.COLOR_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <ColourDropdown
                    colourType="makeup"
                    bind:index={headOverlay.Blush.firstColor}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Blush)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_secondary-start"
                >{$LOCALE.HIGHLIGHT_SUBTITLE}</svelte:fragment
            >
            <svelte:fragment slot="extra_secondary">
                <ColourDropdown
                    colourType="makeup"
                    bind:index={headOverlay.Blush.secondColor}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Blush)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_tertiary-start"
                >{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment
            >
            <svelte:fragment slot="extra_tertiary">
                <Slider
                    bind:value={headOverlay.Blush.overlayOpacity}
                    min={0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Blush)}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if headOverlay?.Lipstick?.overlayValue !== undefined}
        <Wrapper label={$LOCALE.LIPSTICK_TITLE}>
            <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >{$LOCALE.TOTAL_SUBTITLE}: {headOverlayTotal.Lipstick}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    bind:value={headOverlay.Lipstick.overlayValue}
                    total={headOverlayTotal.Lipstick}
                    none={true}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Lipstick)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">{$LOCALE.COLOR_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <ColourDropdown
                    colourType="makeup"
                    bind:index={headOverlay.Lipstick.firstColor}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Lipstick)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_secondary-start"
                >{$LOCALE.HIGHLIGHT_SUBTITLE}</svelte:fragment
            >
            <svelte:fragment slot="extra_secondary">
                <ColourDropdown
                    colourType="makeup"
                    bind:index={headOverlay.Lipstick.secondColor}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Lipstick)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_tertiary-start"
                >{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment
            >
            <svelte:fragment slot="extra_tertiary">
                <Slider
                    bind:value={headOverlay.Lipstick.overlayOpacity}
                    min={0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadOverlay(headOverlay.Lipstick)}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}
{/if}
