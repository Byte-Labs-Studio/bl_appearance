<script lang="ts">
    import ColourDropdown from '@components/micro/ColourDropdown.svelte';
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Slider from '@components/micro/Slider.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE, LOCALE } from '@stores/appearance';
    import type { TValue, THeadOverlay, TEyeColor } from '@typings/apperance';

    $: data = $APPEARANCE.headStructure;
    let eyeColor = ($APPEARANCE.headOverlay?.EyeColor as TValue) || null;

    $: headOverlay = $APPEARANCE.headOverlay as THeadOverlay;

    $: headOverlayTotal = $APPEARANCE.headOverlayTotal;
</script>

{#if !data}
    <Wrapper label={$LOCALE.NO_FACEMENU} />
{:else}
    {#if data.Nose_Width}
        <Wrapper label={$LOCALE.NOSE_TITLE}>
            <svelte:fragment slot="primary-start">{$LOCALE.WIDTH_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="primary">
                <Slider
                    bind:value={data.Nose_Width.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Nose_Width)}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">{$LOCALE.PEAKHEIGHT_SUBTITLE}</svelte:fragment
            >

            <svelte:fragment slot="secondary">
                <Slider
                    bind:value={data.Nose_Peak_Height.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Nose_Peak_Height)}
                />
            </svelte:fragment>

            <svelte:fragment slot="tertiary-start">{$LOCALE.PEAKLENGTH_SUBTITLE}</svelte:fragment>

            <svelte:fragment slot="tertiary">
                <Slider
                    bind:value={data.Nose_Peak_Lenght.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Nose_Peak_Lenght)}
                />
            </svelte:fragment>

            <svelte:fragment slot="quaternary-start"
                >{$LOCALE.BONEHEIGHT_SUBTITLE}</svelte:fragment
            >

            <svelte:fragment slot="quaternary">
                <Slider
                    bind:value={data.Nose_Bone_Height.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Nose_Bone_Height)}
                />
            </svelte:fragment>

            <svelte:fragment slot="quinary-start">{$LOCALE.PEAKLOWERING_SUBTITLE}</svelte:fragment
            >

            <svelte:fragment slot="quinary">
                <Slider
                    bind:value={data.Nose_Peak_Lowering.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Nose_Peak_Lowering)}
                />
            </svelte:fragment>

            <svelte:fragment slot="senary-start">{$LOCALE.BONETWIST_SUBTITLE}</svelte:fragment>

            <svelte:fragment slot="senary">
                <Slider
                    bind:value={data.Nose_Bone_Twist.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Nose_Bone_Twist)}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if data.EyeBrown_Height}
        <Wrapper label={$LOCALE.EYEBROW_TITLE}>
            <svelte:fragment slot="primary-start">{$LOCALE.HEIGHT_SUBTITLE}</svelte:fragment>

            <svelte:fragment slot="primary">
                <Slider
                    bind:value={data.EyeBrown_Height.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.EyeBrown_Height)}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">{$LOCALE.DEPTH_SUBTITLE}</svelte:fragment>

            <svelte:fragment slot="secondary">
                <Slider
                    bind:value={data.EyeBrown_Forward.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.EyeBrown_Forward)}
                />
            </svelte:fragment>
        </Wrapper>
    {/if}

    {#if data.Cheeks_Bone_High}
        <Wrapper label={$LOCALE.CHEEKS_TITLE}>
            <svelte:fragment slot="primary-start">{$LOCALE.BONEHEIGHT_SUBTITLE}</svelte:fragment>

            <svelte:fragment slot="primary">
                <Slider
                    bind:value={data.Cheeks_Bone_High.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Cheeks_Bone_High)}
                />
            </svelte:fragment>

            <svelte:fragment slot="secondary-start">{$LOCALE.BONEWIDTH_SUBTITLE}</svelte:fragment>

            <svelte:fragment slot="secondary">
                <Slider
                    bind:value={data.Cheeks_Bone_Width.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Cheeks_Bone_Width)}
                />
            </svelte:fragment>

            <svelte:fragment slot="extra_primary-start">{$LOCALE.WIDTH_SUBTITLE}</svelte:fragment>
            <svelte:fragment slot="extra_primary">
                <Slider
                    bind:value={data.Cheeks_Width.value}
                    min={-1.0}
                    max={1.0}
                    step={0.01}
                    on:change={() =>
                        APPEARANCE.setHeadStructure(data.Cheeks_Width)}
                />
            </svelte:fragment>
        </Wrapper>

        {#if data.Eyes_Openning}
            <Wrapper label={$LOCALE.EYES_TITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.SQUINT_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data.Eyes_Openning.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(data.Eyes_Openning)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="extra_primary">
                    <div
                        class="flex flex-col items-center justify-center w-full"
                    >
                        <span
                            class="opacity-75 w-full flex items-center justify-end gap-[0.5vh]"
                        >
                            <p>Colour</p>
                        </span>
                        <ColourDropdown
                            bind:index={eyeColor.value}
                            on:change={() => APPEARANCE.setEyeColor(eyeColor)}
                        />
                    </div>
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data.Lips_Thickness}
            <Wrapper label={$LOCALE.LIPS_TITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.THICKNESS_SUBTITLE}</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data.Lips_Thickness.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(data.Lips_Thickness)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data.Jaw_Bone_Width}
            <Wrapper label={$LOCALE.JAW_TITLE}>
                <svelte:fragment slot="primary-start"
                    >{$LOCALE.BONEWIDTH_SUBTITLE}</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data.Jaw_Bone_Width.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(data.Jaw_Bone_Width)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start"
                    >{$LOCALE.BONELENGHT_SUBTITLE}</svelte:fragment
                >

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={data.Jaw_Bone_Back_Lenght.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(
                                data.Jaw_Bone_Back_Lenght,
                            )}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data.Chin_Bone_Lowering}
            <Wrapper label={$LOCALE.CHIN_TITLE}>
                <svelte:fragment slot="primary-start"
                    >{$LOCALE.BONELOWERING_SUBTITLE}</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data.Chin_Bone_Lowering.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(
                                data.Chin_Bone_Lowering,
                            )}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start"
                    >{$LOCALE.BONELENGHT_SUBTITLE}</svelte:fragment
                >

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={data.Chin_Bone_Length.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(data.Chin_Bone_Length)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="tertiary-start"
                    >{$LOCALE.BONEWIDTH_SUBTITLE}</svelte:fragment
                >

                <svelte:fragment slot="tertiary">
                    <Slider
                        bind:value={data.Chin_Bone_Width.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(data.Chin_Bone_Width)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="quaternary-start">{$LOCALE.HOLE_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="quaternary">
                    <Slider
                        bind:value={data.Chin_Hole.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(data.Chin_Hole)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if data.Neck_Thikness}
            <Wrapper label={$LOCALE.NECKTHICK_TITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.THICKNESS_SUBTITLE}</svelte:fragment
                >

                <svelte:fragment slot="primary">
                    <Slider
                        bind:value={data.Neck_Thikness.value}
                        min={-1.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadStructure(data.Neck_Thikness)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if headOverlay?.Blemishes?.overlayValue !== null}
            <Wrapper label={$LOCALE.BLEMISHES_SUBTITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment
                >
                <svelte:fragment slot="primary">
                    <NumberStepper
                        bind:value={headOverlay.Blemishes.overlayValue}
                        total={headOverlayTotal.Blemishes}
                        none={true}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.Blemishes)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={headOverlay.Blemishes.overlayOpacity}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.Blemishes)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if headOverlay?.Ageing?.overlayValue !== null}
            <Wrapper label={$LOCALE.AGEING_SUBTITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment
                >
                <svelte:fragment slot="primary">
                    <NumberStepper
                        bind:value={headOverlay.Ageing.overlayValue}
                        total={headOverlayTotal.Ageing}
                        none={true}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.Blemishes)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={headOverlay.Ageing.overlayOpacity}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.Ageing)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if headOverlay?.Complexion?.overlayValue !== null}
            <Wrapper label={$LOCALE.COMPLEXION_SUBTITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment
                >
                <svelte:fragment slot="primary">
                    <NumberStepper
                        bind:value={headOverlay.Complexion.overlayValue}
                        total={headOverlayTotal.Complexion}
                        none={true}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.Complexion)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={headOverlay.Complexion.overlayOpacity}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.Complexion)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if headOverlay?.SunDamage?.overlayValue !== null}
            <Wrapper label={$LOCALE.SUNDAMAGE_SUBTITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment
                >
                <svelte:fragment slot="primary">
                    <NumberStepper
                        bind:value={headOverlay.SunDamage.overlayValue}
                        total={headOverlayTotal.SunDamage}
                        none={true}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.SunDamage)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={headOverlay.SunDamage.overlayOpacity}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.SunDamage)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if headOverlay?.MolesFreckles?.overlayValue !== null}
            <Wrapper label={$LOCALE.MOLESFRECKLES_SUBTITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment
                >
                <svelte:fragment slot="primary">
                    <NumberStepper
                        bind:value={headOverlay.MolesFreckles.overlayValue}
                        total={headOverlayTotal.MolesFreckles}
                        none={true}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.MolesFreckles)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={headOverlay.MolesFreckles.overlayOpacity}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.MolesFreckles)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}

        {#if headOverlay?.BodyBlemishes?.overlayValue !== null}
            <Wrapper label={$LOCALE.BODYBLEMISHES_SUBTITLE}>
                <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment
                >
                <svelte:fragment slot="primary">
                    <NumberStepper
                        bind:value={headOverlay.BodyBlemishes.overlayValue}
                        total={headOverlayTotal.BodyBlemishes}
                        none={true}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.BodyBlemishes)}
                    />
                </svelte:fragment>

                <svelte:fragment slot="secondary-start">{$LOCALE.OPACITY_SUBTITLE}</svelte:fragment>

                <svelte:fragment slot="secondary">
                    <Slider
                        bind:value={headOverlay.BodyBlemishes.overlayOpacity}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        on:change={() =>
                            APPEARANCE.setHeadOverlay(headOverlay.BodyBlemishes)}
                    />
                </svelte:fragment>
            </Wrapper>
        {/if}
    {/if}
{/if}
