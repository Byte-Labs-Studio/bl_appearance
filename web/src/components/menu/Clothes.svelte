<script lang="ts">
    import NumberStepper from '@components/micro/NumberStepper.svelte';
    import Wrapper from '@components/micro/Wrapper.svelte';
    import { APPEARANCE } from '@stores/appearance';

    $: drawables = $APPEARANCE.drawables || {};
    $: drawTotal = $APPEARANCE.drawTotal || {};
</script>

{#if drawTotal?.masks?.total > 0}
    <Wrapper label="Mask">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.masks.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.masks.value}
                total={drawTotal.masks.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.masks, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.masks.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.masks.texture}
                total={drawTotal.masks.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.masks, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.jackets?.total > 0}
    <Wrapper label="Jacket">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.jackets.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.jackets.value}
                total={drawTotal.jackets.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.jackets, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.jackets.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.jackets.texture}
                total={drawTotal.jackets.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.jackets, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.shirts?.total > 0}
    <Wrapper label="Shirt">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.shirts.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.shirts.value}
                total={drawTotal.shirts.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.shirts, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.shirts.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.shirts.texture}
                total={drawTotal.shirts.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.shirts, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.torsos?.total > 0}
    <Wrapper label="Arms/Gloves">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.torsos.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.torsos.value}
                total={drawTotal.torsos.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.torsos, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.shirts.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.torsos.texture}
                total={drawTotal.torsos.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.torsos, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.vest?.total > 0}
    <Wrapper label="Arms/Gloves">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.vest.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.vest.value}
                total={drawTotal.vest.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.vest, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.vest.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.vest.texture}
                total={drawTotal.vest.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.vest, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.legs?.total > 0}
    <Wrapper label="Pants">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.legs.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.legs.value}
                total={drawTotal.legs.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.legs, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.legs.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.legs.texture}
                total={drawTotal.legs.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.legs, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.shoes?.total > 0}
    <Wrapper label="Shoes">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.shoes.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.shoes.value}
                total={drawTotal.shoes.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.shoes, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.shoes.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.shoes.texture}
                total={drawTotal.shoes.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.shoes, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.bags?.total > 0}
    <Wrapper label="Bags">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.bags.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.bags.value}
                total={drawTotal.bags.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.bags, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.bags.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.bags.texture}
                total={drawTotal.bags.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.bags, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.neck?.total > 0}
    <Wrapper label="Neck Wearables">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.neck.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.neck.value}
                total={drawTotal.neck.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.neck, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.neck.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.neck.texture}
                total={drawTotal.neck.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.neck, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}

{#if drawTotal?.decals?.total > 0}
    <Wrapper label="Decals">
        <svelte:fragment slot="primary-start">Design</svelte:fragment>
        <svelte:fragment slot="primary-end"
            >Total: {drawTotal.decals.total}</svelte:fragment
        >
        <svelte:fragment slot="primary">
            <NumberStepper
                value={drawables.decals.value}
                total={drawTotal.decals.total}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.decals, e.detail);
                }}
            />
        </svelte:fragment>

        <svelte:fragment slot="secondary-start">Texture</svelte:fragment>
        <svelte:fragment slot="secondary-end"
            >Total: {drawTotal.decals.textures}</svelte:fragment
        >

        <svelte:fragment slot="secondary">
            <NumberStepper
                value={drawables.decals.texture}
                total={drawTotal.decals.textures}
                none={false}
                on:change={e => {
                    APPEARANCE.setDrawable(drawables.decals, e.detail, true);
                }}
            />
        </svelte:fragment>
    </Wrapper>
{/if}
