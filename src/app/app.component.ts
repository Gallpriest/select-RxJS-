import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {selection$} from './selection.rxjs';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements AfterViewInit  {

  constructor(private elRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    selection$(this.elRef.nativeElement.parentElement).subscribe(console.log);
  }

}
