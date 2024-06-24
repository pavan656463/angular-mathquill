import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnChanges  {
  MQ;
  fillIn;

  @Input() name: string;
  @Input() latex: string;
  @Input() mathObj: any;

  ngAfterViewInit(){
    // const s = document.getElementById('fill-in');
    // this.MQ = (window as any).MathQuill.getInterface(2);
    // this.fillIn = this.MQ.StaticMath(s);

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    document.getElementById('con').appendChild(changes.mathObj.currentValue.span);
    
    // const s = document.getElementById('fill-in');
    // s.innerHTML = changes.mathObj.currentValue.innerHTML;



    // this.fillIn.latex(changes.latex.currentValue)


    // const wrapper = '<span class="mq-math-mode" data-text="' + changes.latex.currentValue +
    // '" contentEditable="false"><span class="mq-root-block">' + changes.mathObj.currentValue + '</span></span>';
    // const s = document.getElementById('fill-in');
    // s.innerHTML = wrapper;
    // console.log(changes.latex, '   *** ',changes.mathObj.currentValue)
  }

}
