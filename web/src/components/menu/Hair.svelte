<script lang="ts">
    import ColourDropdown from '@components/micro/ColourDropdown.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE, BLACKLIST, LOCALE } from '@stores/appearance';
    import type { THeadOverlay } from '@typings/apperance';

    $: drawables = $APPEARANCE.drawables;
    $: drawTotal = $APPEARANCE.drawTotal;
    $: headOverlay = $APPEARANCE.headOverlay as THeadOverlay;
    $: headOverlayTotal = $APPEARANCE.headOverlayTotal;
    $: hairColor = $APPEARANCE.hairColor;

    $: blacklist = $BLACKLIST.drawables;
</script>

{#if drawTotal?.hair?.total > 0}
    <Wrapper label={$LOCALE.HAIR_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.hair.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.hair.value}
                total={drawTotal.hair.total}
                none={false}
                blacklist={blacklist.hair ? blacklist.hair.values : null}
                on:change={e =>{
                    drawables.hair.texture = 0;
                    APPEARANCE.setDrawable(drawables.hair, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.hair.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            {#key drawables.hair.value}
            <NumberStepper
                bind:value={drawables.hair.texture}
                total={drawTotal.hair.textures}
                none={false}
                blacklist={blacklist.hair ? blacklist.hair.textures[drawables.hair.value] || null : null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.hair, e.detail, true)}
            />
            {/key}
        </svelte:fragment>

        <svelte:fragment slot="extra_primary-start">{$LOCALE.COLOR_SUBTITLE}</svelte:fragment>
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
    <Wrapper label={$LOCALE.FACIALHAIR_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {headOverlayTotal.FacialHair}</svelte:fragment
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

        <svelte:fragment slot="extra_primary-start">{$LOCALE.COLOR_SUBTITLE}</svelte:fragment>
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

        <svelte:fragment slot="extra_tertiary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>
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
    <Wrapper label={$LOCALE.CHESTHAIR_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {headOverlayTotal.ChestHair}</svelte:fragment
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

        <svelte:fragment slot="extra_primary-start">{$LOCALE.COLOR_SUBTITLE}</svelte:fragment>
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

        <svelte:fragment slot="extra_tertiary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>
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
    <Wrapper label={$LOCALE.EYEBROWS_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {headOverlayTotal.Eyebrows}</svelte:fragment
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

        <svelte:fragment slot="extra_primary-start">{$LOCALE.COLOR_SUBTITLE}</svelte:fragment>
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

        <svelte:fragment slot="extra_tertiary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>
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
