<script lang="ts">
    import { SendEvent } from '@utils/eventsHandlers';

    let canExecute = true;
    let isMouseDown = false;
    let level = 0;
    let moveHandler = (e: MouseEvent) => {
        let moveX = e.movementX;
        let moveY = e.movementY;
        let x = moveX / 8;
        let y = moveY / 8;

        if (isMouseDown) SendEvent('cam:move', { x: x, y: y });
    };

    function scrollHandler(e: WheelEvent) {
        if (!canExecute) return;

        let direction = e.deltaY > 0 ? 'down' : 'up';
        level = direction === 'up' ? level + 1 : level - 1;

        if (level < 1) level = 1;
        if (level > 3) level = 3;

        if (e.shiftKey) {
            SendEvent('cam:zoom', direction);
        } else {
            canExecute = false;
            setTimeout(function () {
                canExecute = true;
            }, 500);
            SendEvent('cam:scroll', level);
        }
    }
</script>

<svelte:window
    on:mousemove={isMouseDown ? moveHandler : null}
    on:mouseup={() => (isMouseDown = false)}
/>
<div
    class={`absolute-centered w-[103rem] h-[103rem] cursor-ew-resize active:cursor-ew-resize z-[1] rounded-full`}
    role="slider"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={1}
    tabindex="0"
    on:mousedown={() => (isMouseDown = true)}
    on:wheel={scrollHandler}
/>
