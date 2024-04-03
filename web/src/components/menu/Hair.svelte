<script lang="ts">
    import ColourDropdown from '@components/micro/ColourDropdown.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE } from '@stores/appearance';
    import type { THeadOverlay } from '@typings/apperance';

    $: drawables = $APPEARANCE.drawables;
    $: drawTotal = $APPEARANCE.drawTotal;
    $: headOverlay = $APPEARANCE.headOverlay as THeadOverlay;
    $: headOverlayTotal = $APPEARANCE.headOverlayTotal;
    $: hairColor = $APPEARANCE.hairColor;
</script>

{#if drawTotal?.hair?.total > 0}
    <Wrapper label="Hair">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.hair.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.hair.value}
                total={drawTotal.hair.total}
                none={false}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.hair.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.hair.texture}
                total={drawTotal.hair.textures}
                none={false}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown colourType="hair" index={hairColor.color} />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown colourType="hair" index={hairColor.highlight} />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if headOverlayTotal?.FacialHair && headOverlay.FacialHair?.overlayValue !== undefined}
    <Wrapper label="Facial Hair">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {headOverlayTotal.FacialHair}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={headOverlay.FacialHair.overlayValue}
                total={headOverlayTotal.FacialHair}
                none={false}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown
                colourType="hair"
                index={headOverlay.FacialHair.firstColor}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown
                colourType="hair"
                index={headOverlay.FacialHair.secondColor}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_tertiary-start">Opacity</svelte:fragment>
        <svelte:fragment slot="extra_tertiary">
            <Slider
                bind:value={headOverlay.FacialHair.overlayOpacity}
                min={0}
                max={1.0}
                step={0.01}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if headOverlayTotal?.ChestHair && headOverlay.ChestHair?.overlayValue !== undefined}
    <Wrapper label="Chest Hair">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {headOverlayTotal.ChestHair}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={headOverlay.ChestHair.overlayValue}
                total={headOverlayTotal.ChestHair}
                none={false}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown
                colourType="hair"
                index={headOverlay.ChestHair.firstColor}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown
                colourType="hair"
                index={headOverlay.ChestHair.secondColor}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_tertiary-start">Opacity</svelte:fragment>
        <svelte:fragment slot="extra_tertiary">
            <Slider
                bind:value={headOverlay.ChestHair.overlayOpacity}
                min={0}
                max={1.0}
                step={0.01}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if headOverlayTotal?.Eyebrows && headOverlay.Eyebrows?.overlayValue !== undefined}
    <Wrapper label="Eyebrows">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {headOverlayTotal.Eyebrows}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={headOverlay.Eyebrows.overlayValue}
                total={headOverlayTotal.Eyebrows}
                none={false}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown
                colourType="hair"
                index={headOverlay.Eyebrows.firstColor}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown
                colourType="hair"
                index={headOverlay.Eyebrows.secondColor}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_tertiary-start">Opacity</svelte:fragment>
        <svelte:fragment slot="extra_tertiary">
            <Slider
                bind:value={headOverlay.Eyebrows.overlayOpacity}
                min={0}
                max={1.0}
                step={0.01}
            />
        </svelte:fragment>
    </Wrapper>
{/if}
