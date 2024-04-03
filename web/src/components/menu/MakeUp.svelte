<script lang="ts">
    import Wrapper from '@components/micro/Wrapper.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import ColourDropdown from '@components/micro/ColourDropdown.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import { APPEARANCE } from '@stores/appearance';
    import type { THeadOverlayTotal, THeadOverlay } from '@typings/apperance';

    $: headOverlay = $APPEARANCE.headOverlay as THeadOverlay;
    $: headOverlayTotal = $APPEARANCE.headOverlayTotal as THeadOverlayTotal;
</script>

{#if !headOverlay}
    <Wrapper label="You can't add Make Up" />
{:else}
    {#if headOverlay?.Makeup?.overlayValue !== undefined}
        <Wrapper label="Make Up">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {headOverlayTotal.Makeup}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={headOverlay.Makeup.overlayValue}
                    total={headOverlayTotal.Makeup}
                    none={false}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <ColourDropdown
                    colourType="hair"
                    index={headOverlay.Makeup.firstColor}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_secondary-start"
                >Hightlight</svelte:fragment
            >
            <svelte:fragment slot="extra_secondary">
                <ColourDropdown
                    colourType="hair"
                    index={headOverlay.Makeup.secondColor}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_tertiary-start"
                >Opacity</svelte:fragment
            >
            <svelte:fragment slot="extra_tertiary">
                <Slider
                    bind:value={headOverlay.Makeup.overlayOpacity}
                    min={0}
                    max={1.0}
                    step={0.01}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if headOverlay?.Blush?.overlayValue !== undefined}
        <Wrapper label="Blush">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {headOverlayTotal.Blush}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={headOverlay.Blush.overlayValue}
                    total={headOverlayTotal.Blush}
                    none={false}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <ColourDropdown
                    colourType="hair"
                    index={headOverlay.Blush.firstColor}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_secondary-start"
                >Hightlight</svelte:fragment
            >
            <svelte:fragment slot="extra_secondary">
                <ColourDropdown
                    colourType="hair"
                    index={headOverlay.Blush.secondColor}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_tertiary-start"
                >Opacity</svelte:fragment
            >
            <svelte:fragment slot="extra_tertiary">
                <Slider
                    bind:value={headOverlay.Blush.overlayOpacity}
                    min={0}
                    max={1.0}
                    step={0.01}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if headOverlay?.Lipstick?.overlayValue !== undefined}
        <Wrapper label="Lipstick">
            <svelte:fragment slot="primary-start">Design</svelte:fragment>
            <svelte:fragment slot="primary-end"
                >Total: {headOverlayTotal.Lipstick}</svelte:fragment
            >
            <svelte:fragment slot="primary">
                <NumberStepper
                    value={headOverlay.Lipstick.overlayValue}
                    total={headOverlayTotal.Lipstick}
                    none={false}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <ColourDropdown
                    colourType="hair"
                    index={headOverlay.Lipstick.firstColor}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_secondary-start"
                >Hightlight</svelte:fragment
            >
            <svelte:fragment slot="extra_secondary">
                <ColourDropdown
                    colourType="hair"
                    index={headOverlay.Lipstick.secondColor}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_tertiary-start"
                >Opacity</svelte:fragment
            >
            <svelte:fragment slot="extra_tertiary">
                <Slider
                    bind:value={headOverlay.Lipstick.overlayOpacity}
                    min={0}
                    max={1.0}
                    step={0.01}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}
{/if}
