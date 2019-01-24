(() => {
  'use strict';
  const KEY_SPACE = 32;
  const KEY_LEFT = 37;
  const KEY_UP = 38;
  const KEY_RIGHT = 39;
  const KEY_BOTTOM = 40;
  const CELL_LENGTH = 20;
  var INPUTED_KEY = KEY_RIGHT;//Default Right
  var INTERVAL = 50;//Default
  var TIMEOUT_ID;
  var COUNT = 0;
  var BOAL_POSITION = {}
  const HEAD_COLOR = 'rgb(54, 112, 0)';

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  var counter = document.getElementById('counter');
  var target = document.getElementById('target');
  const COUNT_LIMIT = Math.floor( (canvas.width / CELL_LENGTH) * (canvas.height / CELL_LENGTH) /20 );
  target.innerText = COUNT_LIMIT;
  window.addEventListener('keydown', check, false);

  function isWhiteColor(x, y) {
    const p = ctx.getImageData(x, y, 1, 1).data;
    return p[0] === 0 && p[1] === 0 && p[2] === 0 && p[3] === 0
  }

  function generateBoalPosition() {
    while (true) {
      BOAL_POSITION = {
        x: Math.floor(Math.random() * canvas.width/CELL_LENGTH ) * CELL_LENGTH,
        y: Math.floor(Math.random() * canvas.height/CELL_LENGTH) * CELL_LENGTH
      }
      if (isWhiteColor(BOAL_POSITION.x, BOAL_POSITION.y)) {
        break;
      }
    }

    newBall(BOAL_POSITION.x, BOAL_POSITION.y).draw();
  }

  function newBall( x , y ) {
    return {
        x: x + CELL_LENGTH/2,
        y: y + CELL_LENGTH/2,
        radius: CELL_LENGTH/2,
        color: 'red',
        draw: function () {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.fillStyle = this.color;
          ctx.fill();
      }
    }
  }

  function newCell( x, y , height , width , color) {
    return {
      x: x,
      y: y,
      height: height,
      width: width,
      color: color,
      childPosition: {},
      hasChildPosition: false ,
      draw: function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.height, this.width);
      },
      move: function (direction) {
        const lastX = this.x;
        const lastY = this.y;

        if (direction === KEY_RIGHT) {
          this.x += this.width;
        } else if (direction === KEY_LEFT) {
          this.x -= this.width;
        }else if (direction === KEY_UP) {
          this.y -= this.height;
        }else if (direction === KEY_BOTTOM) {
          this.y += this.height;
        } else {
          return;
        }

        if (isGameOver( this.x , this.y)) return;

        ctx.clearRect( lastX, lastY, CELL_LENGTH , CELL_LENGTH );
        this.draw();

        if (this.hasChildPosition) {
          this.childPosition.move(lastX, lastY);
        }

        if (this.tryEat(this.x, this.y)) {
          if (!this.hasChildPosition) {
            this.childPosition = newPosition(this.x, this.y);
            this.hasChildPosition = true
          } else {
            this.childPosition.setChildPosition(newPosition(this.x, this.y));
          }
          COUNT++;
          counter.innerText = COUNT;
          if (COUNT >= COUNT_LIMIT) {
            alert('Game Clear');
            clearTimeout(TIMEOUT_ID);
            return;
          }
          generateBoalPosition();
        }
      },
      tryEat: function (x, y) {
        return BOAL_POSITION.x === x && BOAL_POSITION.y === y
      }
    }
  }

  function newPosition(x,y) {
    return {
      x: x,
      y: y,
      childPosition: {},
      hasChildPosition: false ,
      setChildPosition: function (position) {
        if (!this.hasChildPosition) {
          this.childPosition = position;
          this.hasChildPosition = true
        } else {
          this.childPosition.setChildPosition(position);
        }
      },
      move: function (x, y) {
        ctx.clearRect(this.x, this.y, CELL_LENGTH, CELL_LENGTH);
        if (this.hasChildPosition) {
          this.childPosition.move(this.x, this.y);
        }
        newCell(x, y, CELL_LENGTH, CELL_LENGTH, 'black').draw();
        this.x = x
        this.y = y
      }
    }
  }

  function check(e) {
    //Prevent Scroll
    switch (e.keyCode) {
      case KEY_LEFT: case KEY_UP: case KEY_RIGHT: case KEY_BOTTOM:
      case KEY_SPACE: //Space
        e.preventDefault();
        INPUTED_KEY = e.keyCode;
        break;
      default:
        break;
    }
  }

  function isGameOver(x , y) {
    if ((x < 0 || canvas.width <= x) || (y < 0 || canvas.height <= y)  || !isWhiteColor(x,y) ) {
      clearTimeout(TIMEOUT_ID);
      alert('Game Over.Press F5 to continue.')
      return true;
    } else {
      return false;
    }
  }

  //----Main Process----
  function initialize() {
    const mainCell = newCell( 0 , 0 , CELL_LENGTH , CELL_LENGTH , HEAD_COLOR);
    mainCell.draw();
    generateBoalPosition();

    function run() {
      TIMEOUT_ID = setInterval(() => {
        mainCell.move(INPUTED_KEY);
      }, INTERVAL);
    }

    run();
  }

  initialize();
})();
