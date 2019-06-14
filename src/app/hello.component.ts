import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, pairwise, map, startWith, scan, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'hello',
  template: ``,
  styles: [`:host { cursor: pointer; }`]
})
export class HelloComponent implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    fromEvent<MouseEvent>(this.el.nativeElement, 'mousedown').pipe(
      switchMap(() => fromEvent<MouseEvent>(document, 'mousemove').pipe(
        takeUntil(fromEvent(document, 'mouseup')),
      )),
      pairwise(),
      map(([mouseBefore, mouseAfter]) => ({
        dx: mouseAfter.clientX - mouseBefore.clientX,
        dy: mouseAfter.clientY - mouseBefore.clientY
      })),
      scan((acc, cur) => { 
        acc.x += cur.dx;
        acc.y += cur.dy;
        return acc;
      }, { x: 0, y: 0 }),
    ).subscribe(({ x, y }) => this.el.nativeElement.style.transform = `translate(${x}px, ${y}.px)`);
  }
}
