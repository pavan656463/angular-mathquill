import { Component } from '@angular/core';

enum ButtonType {
  OPERATIONAL = 'OPERATIONAL',
  REGULAR = 'REGULAR',
  VARIABLE = 'VARIABLE',
  SPECIAL = 'SPECIAL',
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  MQ = null;
  mathFieldSpan;
  fillInTheBlank;
  mathField;
  res = '';
  specialKeys = {
    right: 'Right',
    left: 'Left',
    Down: 'Down',
    Up: 'Up',
    bksp: 'Backspace',
    tab: 'Tab',
  };
  buttons = [
    this.buildRegularButton('7'),
    this.buildRegularButton('8'),
    this.buildRegularButton('9'),
    this.buildRegularButton('/'),

    this.buildRegularButton('4'),
    this.buildRegularButton('5'),
    this.buildRegularButton('6'),
    this.buildRegularButton('*'),

    this.buildRegularButton('1'),
    this.buildRegularButton('2'),
    this.buildRegularButton('3'),
    this.buildRegularButton('-'),

    this.buildRegularButton('0'),
    this.buildRegularButton('.'),
    this.buildRegularButton('='),
    this.buildRegularButton('+'),
    this.buildRegularButton('\\square', '\\square'),

    this.buildRegularButton('a', 'a', 'cmd', ButtonType.VARIABLE),
    this.buildRegularButton('b', 'b', 'cmd', ButtonType.VARIABLE),
    this.buildRegularButton('c', 'c', 'cmd', ButtonType.VARIABLE),

    this.buildRegularButton('x', 'x', 'cmd', ButtonType.VARIABLE),
    this.buildRegularButton('y', 'y', 'cmd', ButtonType.VARIABLE),
    this.buildRegularButton('z', 'z', 'cmd', ButtonType.VARIABLE),
    this.buildRegularButton(
      '\\vdots\\MathQuillMathField{}\\vdots',
      'input',
      'write'
    ),

    this.buildRegularButton('\\int', '\\int'),
    this.buildRegularButton('\\forall', 'A'),
    this.buildRegularButton('\\begin{matrix} ... \\end{matrix}', 'matrix', 'write'),
    this.buildOperationalButton('Backspace', 'backspace', 'key'),
    this.buildOperationalButton('Left', '<-', 'key'),
    this.buildOperationalButton('Right', '->', 'key'),
    this.buildOperationalButton('Up', 'up', 'key'),
    this.buildOperationalButton('Down', 'down', 'key'),
  ];
  config;
  innerFields = [];
  varHash = {};
  varSet = new Set();
  removeCharPressed = false;
  outputLatex;
  mathObj;
  keysInputIndexMap = {};
  constructor() {}

  ngOnInit() {
    console.log('jquery in angular', (window as any).jQuery);
    console.log('mathquill in angular', (window as any).MathQuill);
    console.log(evaluatex('1 + 2 * 3 / 4')());
    let fn = evaluatex('\\frac 1{2}3', {}, { latex: true });
    console.log(fn());
    this.config = {
      spaceBehavesLikeTab: true,
      restrictMismatchedBrackets: true,
      supSubsRequireOperand: true,
      handlers: {
        edit: function (maths) {
          var enteredMath = maths.latex(); // Get entered math in LaTeX format
          console.log('in handler config', enteredMath);
        },
      },
    };
  }

  ngAfterViewInit() {
    this.mathFieldSpan = document.getElementById('math-field');

    var latexSpan = document.getElementById('latex');
    this.MQ = (window as any).MathQuill.getInterface(2);
    this.mathField = this.MQ.MathField(this.mathFieldSpan, {
      spaceBehavesLikeTab: true,
      supSubsRequireOperand: true,
      maxDepth: 1,
      handlers: {
        edit: (mathField) => {
          latexSpan.textContent = mathField.latex(); // simple API
          if (this.removeCharPressed) {
            this.removeCharPressed = false;
            this.tempFunc();
          }
        },
      },
    });
    this.fillInTheBlank = this.MQ.StaticMath(
      document.getElementById('fill-in-the-blank')
    );
  }

  onClickMathButton(e: any, button) {
    const regex = /[a-z]/;
    if (button.action === 'write') {
      this.mathField.write(button.content);
    } else if (button.action === 'cmd') {
      if (button.type === ButtonType.VARIABLE) {
        this.varSet.add(button.content);
      }
      this.mathField.cmd(button.content);
    } else if (button.action === 'key') {
      this.mathField.keystroke(button.content);
    } else {
      this.mathField.keystroke(button.content);
    }
    this.mathField.focus();
    e.preventDefault();
  }

  private buildRegularButton(
    content: string,
    displayContent?: string,
    action: string = 'cmd',
    type: string = ButtonType.REGULAR
  ) {
    return {
      displayContent: displayContent ? displayContent : content,
      content: content,
      type: type,
      action: action,
    };
  }

  private buildOperationalButton(content: any, iconId: any, iconType?: string) {
    return {
      content: content,
      displayContent: iconId,
      action: 'keystroke',
      iconId: iconId,
      iconType: iconType ? iconType : 'material',
      type: ButtonType.OPERATIONAL,
    };
  }

  save() {
    let inputLatex = this.mathField.latex();
    let withInput = inputLatex.replaceAll(
      '\\vdots\\vdots',
      '\\MathQuillMathField{}'
    );
    let index = 0;
    this.varSet.forEach((key) => {
      this.keysInputIndexMap[index] = key;
      withInput = withInput.replaceAll(key, `\\MathQuillMathField{${key}}`);
      index++;
    });
    this.outputLatex = withInput;
    this.fillInTheBlank.latex(withInput);
    const spanDom = document.createElement('span');
    let fillIn = this.MQ.StaticMath(spanDom);
    fillIn.latex(withInput);
    this.mathObj = { span: spanDom, obj: fillIn };
    this.innerInputIndexing();
  }

  solve() {
    let strLatex = this.fillInTheBlank.latex();
    let exper;
    if (strLatex.includes('=')) {
      exper = this.fillInTheBlank.latex().split(/[=<>]/);
      if (
        evaluatex(exper[0], {}, { latex: true })() ===
        evaluatex(exper[1], {}, { latex: true })()
      )
        this.res = 'Correct';
      else this.res = 'Wrong';
    } else {
      this.res = evaluatex(this.fillInTheBlank.latex(), {}, { latex: true })();
    }
  }

  innerInputIndexing() {
    let index = 0;
    while (this.fillInTheBlank.innerFields[index]) {
      let outOfDel = false;
      let config = {
        spaceBehavesLikeTab: true,
        restrictMismatchedBrackets: true,
        supSubsRequireOperand: true,
        handlers: {
          edit: (maths) => {
            let x = index;
            var enteredMath = maths.latex(); // Get entered math in LaTeX format
          },
          deleteOutOf: (direction, mathField) => {
            if (direction == 1 || direction == -1) outOfDel = true;
          },
        },
      };
      this.fillInTheBlank.innerFields[index].config(config);
      let counterL = 0;
      this.fillInTheBlank.innerFields[index].el().onkeydown = (e) => {
        if (e.keyCode == 8 || e.keyCode == 46) {
          if (counterL > 0 && !outOfDel) counterL--;
        } else if (counterL > 10) e.preventDefault();
        else {
          outOfDel = false;
          counterL++;
        }
      };
      this.innerFields.push(index);
      index++;
    }
  }

  validate(evt) {
    if (evt.keyCode == 8 || evt.keyCode == 46) {
      this.removeCharPressed = true;
    }
    var theEvent = evt || window.event;
    if (theEvent.type === 'paste') {
      key = event.clipboardData.getData('text/plain');
    } else {
      var key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }
  }

  tempFunc() {
    for (const elemnt of this.varSet)
      if (this.mathField.latex().includes(elemnt)) continue;
      else {
        this.varSet.delete(elemnt);
      }
  }

  getCursorOffset(mathquill) {
    mathquill.focus();
    let offset = mathquill.__controller.cursor.offset();
    if (!offset) {
      offset = { top: 0, left: 0 };
    }
    return offset;
  }
}
