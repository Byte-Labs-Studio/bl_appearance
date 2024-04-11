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
                bind:value={drawables.hair.value}
                total={drawTotal.hair.total}
                none={false}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.hair, e.detail)}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.hair.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.hair.texture}
                total={drawTotal.hair.textures}
                none={false}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.hair, e.detail, true)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown
                colourType="hair"
                bind:index={hairColor.color}
                on:change={() => APPEARANCE.setHairColor(hairColor)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown
                colourType="hair"
                bind:index={hairColor.highlight}
                on:change={() => APPEARANCE.setHairColor(hairColor)}
            />
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
                bind:value={headOverlay.FacialHair.overlayValue}
                total={headOverlayTotal.FacialHair}
                none={false}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.FacialHair)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown
                colourType="hair"
                bind:index={headOverlay.FacialHair.firstColor}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.FacialHair)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown
                colourType="hair"
                bind:index={headOverlay.FacialHair.secondColor}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.FacialHair)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_tertiary-start">Opacity</svelte:fragment>
        <svelte:fragment slot="extra_tertiary">
            <Slider
                bind:value={headOverlay.FacialHair.overlayOpacity}
                min={0}
                max={1.0}
                step={0.01}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.FacialHair)}
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
                bind:value={headOverlay.ChestHair.overlayValue}
                total={headOverlayTotal.ChestHair}
                none={false}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.ChestHair)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown
                colourType="hair"
                bind:index={headOverlay.ChestHair.firstColor}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.ChestHair)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown
                colourType="hair"
                bind:index={headOverlay.ChestHair.secondColor}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.ChestHair)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_tertiary-start">Opacity</svelte:fragment>
        <svelte:fragment slot="extra_tertiary">
            <Slider
                bind:value={headOverlay.ChestHair.overlayOpacity}
                min={0}
                max={1.0}
                step={0.01}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.ChestHair)}
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
                bind:value={headOverlay.Eyebrows.overlayValue}
                total={headOverlayTotal.Eyebrows}
                none={false}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.Eyebrows)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">Colour</svelte:fragment>
        <svelte:fragment slot="extra_primary">
            <ColourDropdown
                colourType="hair"
                bind:index={headOverlay.Eyebrows.firstColor}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.Eyebrows)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_secondary-start"
            >Hightlight</svelte:fragment
        >
        <svelte:fragment slot="extra_secondary">
            <ColourDropdown
                colourType="hair"
                bind:index={headOverlay.Eyebrows.secondColor}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.Eyebrows)}
            />
        </svelte:fragment>

        <svelte:fragment slot="extra_tertiary-start">Opacity</svelte:fragment>
        <svelte:fragment slot="extra_tertiary">
            <Slider
                bind:value={headOverlay.Eyebrows.overlayOpacity}
                min={0}
                max={1.0}
                step={0.01}
                on:change={() =>
                    APPEARANCE.setHeadOverlay(headOverlay.Eyebrows)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}
