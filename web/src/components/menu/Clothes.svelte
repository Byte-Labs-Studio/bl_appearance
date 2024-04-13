<script lang="ts">
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE, BLACKLIST, LOCALE } from '@stores/appearance';

    $: drawables = $APPEARANCE.drawables || {};
    $: drawTotal = $APPEARANCE.drawTotal || {};
    $: blacklist = $BLACKLIST.drawables || {};
</script>

{#if drawTotal?.masks?.total > 0}
    <Wrapper label={$LOCALE.MASK_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.masks.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.masks.value}
                total={drawTotal.masks.total}
                none={false}
                blacklist={blacklist.masks.values}
                on:change={e => {
                    drawables.masks.texture = 0;
                    APPEARANCE.setDrawable(drawables.masks, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.masks.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.masks.texture}
                total={drawTotal.masks.textures}
                none={false}
                blacklist={blacklist.masks.textures[drawables.masks.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.masks, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.jackets?.total > 0}
    <Wrapper label={$LOCALE.JACKET_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.jackets.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.jackets.value}
                total={drawTotal.jackets.total}
                none={false}
                blacklist={blacklist.jackets.values}
                on:change={e =>{
                    drawables.jackets.texture = 0;
                    APPEARANCE.setDrawable(drawables.jackets, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.jackets.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.jackets.texture}
                total={drawTotal.jackets.textures}
                none={false}
                blacklist={blacklist.jackets.textures[drawables.jackets.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.jackets, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.shirts?.total > 0}
    <Wrapper label={$LOCALE.SHIRT_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.shirts.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.shirts.value}
                total={drawTotal.shirts.total}
                none={false}
                blacklist={blacklist.shirts.values}
                on:change={e =>{
                    drawables.shirts.texture = 0;
                    APPEARANCE.setDrawable(drawables.shirts, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.shirts.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.shirts.texture}
                total={drawTotal.shirts.textures}
                none={false}
                blacklist={blacklist.shirts.textures[drawables.shirts.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.shirts, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.torsos?.total > 0}
    <Wrapper label={$LOCALE.ARMS_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.torsos.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.torsos.value}
                total={drawTotal.torsos.total}
                none={false}
                blacklist={blacklist.torsos.values}
                on:change={e =>{
                    drawables.torsos.texture = 0;
                    APPEARANCE.setDrawable(drawables.torsos, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.shirts.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.torsos.texture}
                total={drawTotal.torsos.textures}
                none={false}
                blacklist={blacklist.torsos.textures[drawables.torsos.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.torsos, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.vest?.total > 0}
    <Wrapper label={$LOCALE.VEST_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.vest.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.vest.value}
                total={drawTotal.vest.total}
                none={false}
                blacklist={blacklist.vest.values}
                on:change={e =>{
                    drawables.vest.texture = 0;
                    APPEARANCE.setDrawable(drawables.vest, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.vest.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.vest.texture}
                total={drawTotal.vest.textures}
                none={false}
                blacklist={blacklist.vest.textures[drawables.vest.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.vest, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.legs?.total > 0}
    <Wrapper label={$LOCALE.PANTS_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.legs.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.legs.value}
                total={drawTotal.legs.total}
                none={false}
                blacklist={blacklist.legs.values}
                on:change={e =>{
                    drawables.legs.texture = 0;
                    APPEARANCE.setDrawable(drawables.legs, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.legs.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.legs.texture}
                total={drawTotal.legs.textures}
                none={false}
                blacklist={blacklist.legs.textures[drawables.legs.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.legs, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.shoes?.total > 0}
    <Wrapper label={$LOCALE.SHOES_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.shoes.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.shoes.value}
                total={drawTotal.shoes.total}
                none={false}
                blacklist={blacklist.shoes.values}
                on:change={e =>{
                    drawables.shoes.texture = 0;
                    APPEARANCE.setDrawable(drawables.shoes, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.shoes.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.shoes.texture}
                total={drawTotal.shoes.textures}
                none={false}
                blacklist={blacklist.shoes.textures[drawables.shoes.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.shoes, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.bags?.total > 0}
    <Wrapper label={$LOCALE.BAGS_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.bags.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.bags.value}
                total={drawTotal.bags.total}
                none={false}
                blacklist={blacklist.bags.values}
                on:change={e =>{
                    drawables.bags.texture = 0;
                    APPEARANCE.setDrawable(drawables.bags, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.bags.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.bags.texture}
                total={drawTotal.bags.textures}
                none={false}
                blacklist={blacklist.bags.textures[drawables.bags.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.bags, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.neck?.total > 0}
    <Wrapper label={$LOCALE.NECK_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.neck.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.neck.value}
                total={drawTotal.neck.total}
                none={false}
                blacklist={blacklist.neck.values}
                on:change={e =>{
                    drawables.neck.texture = 0;
                    APPEARANCE.setDrawable(drawables.neck, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.neck.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.neck.texture}
                total={drawTotal.neck.textures}
                none={false}
                blacklist={blacklist.neck.textures[drawables.neck.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.neck, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.decals?.total > 0}
    <Wrapper label={$LOCALE.DECALS_TITLE}>
        <svelte:fragment slot="primary-start">{$LOCALE.DESIGN_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.decals.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                bind:value={drawables.decals.value}
                total={drawTotal.decals.total}
                none={false}
                blacklist={blacklist.decals.values}
                on:change={e =>{
                    drawables.decals.texture = 0;
                    APPEARANCE.setDrawable(drawables.decals, e.detail)}}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">{$LOCALE.TEXTURE_SUBTITLE}</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >{$LOCALE.TOTAL_SUBTITLE}: {drawTotal.decals.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                bind:value={drawables.decals.texture}
                total={drawTotal.decals.textures}
                none={false}
                blacklist={blacklist.decals.textures[drawables.decals.value] || null}
                on:change={e =>
                    APPEARANCE.setDrawable(drawables.decals, e.detail, true)}
            />
        </svelte:fragment>
    </Wrapper>
{/if}
