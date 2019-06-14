import {combineLatest, fromEvent, of} from 'rxjs';
import {finalize, map, switchMap, takeUntil, tap} from 'rxjs/operators';

export const selection$ = (el: HTMLElement) => {

    /**
     *  1. before mousedown create a new selection block with default styles
     */
    const divSelector = document.createElement('div');
    divSelector.className = 'mouse-selection-overlay';
    divSelector.style.position = 'fixed';
    divSelector.style.zIndex = '100500';

    /**
     * 2. return Observable with final coordinates
     */
    return fromEvent<MouseEvent>(el, 'mousedown').pipe(

        /**
         * 2.1
         * append the selection block to the component
         */
        tap(() => document.body.appendChild(divSelector)),

        /**
         * 2.2
         * combine two events in one array = [mousedown event, mousemove event] into
         * new stream so that we could track both events at a time;
         */
        switchMap((e) =>
            combineLatest([
                of(e),
                fromEvent<MouseEvent>(document, 'mousemove')
            ]).pipe(

                /**
                 * 2.3
                 * key logic to find and determine the selection block position values
                 */
                map(([mouseDown, mouseMove]) => {

                    /**
                     * 2.4
                     * first cursor placement (mousedown);
                     * define left and top as initial coordinates for the selection block position
                     */
                    divSelector.style.left = `${mouseDown.clientX}px`;
                    divSelector.style.top = `${mouseDown.clientY}px`;

                    /**
                     * 2.5
                     * define width and height of the selection block depending on
                     * the result of subtraction between movement coordinates and initial coordinates;
                     */
                    let width = mouseMove.clientX - mouseDown.clientX;
                    let height = mouseMove.clientY - mouseDown.clientY;

                    /**
                     * 2.6
                     * check if width value is negative and change direction of selection
                     * by switching its position from 'left' to 'right'
                     */
                    if (width < 0) {
                        divSelector.style.right = window.innerWidth - mouseDown.clientX + 'px';
                        divSelector.style.left = `initial`;
                    }

                    /**
                     * 2.7
                     * check if height value is negative and change direction of selection
                     * by switching its position from 'top' to 'bottom'
                     */
                    if (height < 0) {
                        divSelector.style.bottom = window.innerHeight - mouseDown.clientY + 'px';
                        divSelector.style.top = 'initial';
                    }

                    /**
                     * 2.8
                     * get final positive values of the selection block's width and height
                     */
                    width = Math.abs(width);
                    height = Math.abs(height);

                    /**
                     * 2.9
                     * set styles for the selection block
                     */
                    divSelector.style.width = `${width}px`;
                    divSelector.style.height = `${height}px`;

                    /**
                     * 2.10
                     * get and return an array of coordinates [topLeft{ClientY, ClientX},rightBottom{ClientY, ClientX}]
                     * by finding the final coordinates of the selection block;
                     */
                    const divSelectorCoordinates = divSelector.getBoundingClientRect();
                    return [
                        {
                            clientX: divSelectorCoordinates.left,
                            clientY: divSelectorCoordinates.top,
                        },
                        {
                            clientX: divSelectorCoordinates.right,
                            clientY: divSelectorCoordinates.bottom,
                        },
                    ];
                }),

                /**
                 * 3.
                 * abort the selection block values of width and height and remove it from the DOM
                 */
                finalize(() => {
                    divSelector.remove();
                    divSelector.style.width = '0px';
                    divSelector.style.height = '0px'
                }),

                /**
                 * 3.1
                 * stop the event and selection after mouse up event
                 */
                takeUntil(fromEvent(document, 'mouseup'))
            )));
};
