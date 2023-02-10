import { Directive, ElementRef, OnInit, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ucpGlobalSlider]'
})
export class GlobalSliderDirective implements OnInit {

  @Input() ucpSliderType: any;

  constructor(private elementRefer: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.elementRefer.nativeElement.classList.add(this.ucpSliderType);
    this.renderer.addClass(this.elementRefer.nativeElement, this.ucpSliderType);
    // this.renderer.
    // nativeElement.style.-webkit-animation = 'right-to-left 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both';
  }

}
