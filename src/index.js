import './styles/index.css';

(() => {
  class Poker {
    constructor(options) {
      Object.assign(this, options);
    }

    set end({ x = 0, y = 0 }) {
      this.endX = x;
      this.endY = y;
      this.vx = (x - this.currX) / 10;
      this.vy = (y - this.currY) / 10;
    }

    get isArrived() {
      return (this.vy === 0 && this.currX >= this.endX) || (this.vy !== 0 && this.currY <= this.endY);
    }
  }

  class Game {
    constructor(boxId) {
      const box = document.getElementById(boxId);
      this.staticCvs = document.createElement('canvas');
      if (!this.staticCvs.getContext) {
        throw Error('浏览器版本太低，请升级！！！');
      }

      this.width = 900;

      this.height = 700;

      this.staticCvs.setAttribute('width', this.width);
      this.staticCvs.setAttribute('height', this.height);
      this.staticCtx = this.staticCvs.getContext('2d');
      box.appendChild(this.staticCvs);

      this.movingCvs = document.createElement('canvas');
      this.movingCvs.setAttribute('width', this.width);
      this.movingCvs.setAttribute('height', this.height);
      this.movingCtx = this.movingCvs.getContext('2d');
      box.appendChild(this.movingCvs);

      this.img = new Image();
      this.img.src = require('./images/poker-cards.png');

      this.pokerListY = 230; // y 方向上 pokerList 的基线
      this.listSpaceX = 40; // 扑克 x 方向的间距
      this.tempListY = 100; // y 方向上 tempList 的基线
      this.pokerWidth = 60;
      this.pokerHeight = 78;

      this.isMousedown = false;

      this.movingCvs.addEventListener('mousedown', e => {
        const status = this.gameStatus;
        const { offsetX: x, offsetY: y } = e;
        // 游戏结束后，点击 开始
        if (status === 'success' || status === 'fail') {
          return (x >= 390 && x <= 510 && y >= 320 && y <= 380) && this.play();
        }
        // 游戏未结束时，点击 重玩
        if (x >= 320 && x <= 440 && y >= 10 && y <= 70) {
          return this.play();
        }

        if (status !== 'gaming') {
          return;
        }
        // 鼠标带着 movingList 移出 canvas 后再移入时，movingList 不为空数组
        if (this.movingList.length === 0) {
          this.isMousedown = true;
          const isReDraw = this.isMousedownPokerList(x, y) || this.isMousedownTempList(x, y);
          if (isReDraw) {
            this.drawStaticCvs();
            this.drawMovingList();
          }
        }
      });

      this.movingCvs.addEventListener('mousemove', e => {
        if (!this.isMousedown) { return; }
        this.pokerMoveWithMouse(this.movingList, e.offsetX, e.offsetY);
        this.drawMovingList();
      });

      this.movingCvs.addEventListener('mouseup', () => {
        if (!this.isMousedown) { return; }
        this.isMousedown = false;
        const isPokerLand = this.isPushPokerList() || this.isPushTempList() || this.isPushReadyList();
        if (!isPokerLand) {
          const { index, list } = this.movingListInfo;
          this[list][index].push(...this.movingList.splice(0));
        }
        this.drawStaticCvs();
        this.drawMovingList();
        this.autoPushReadyList();
      });
    }

    get gameStatus() {
      if (this.dealtList.length > 0) { return 'dealtting'; }

      if (this.movingPoker) { return 'autoMoving'; }

      const isDone = this.readyList.every(pokers => pokers.length === 13);

      if (isDone) {
        return this.timeRemain > 0 ? 'transform' : 'success';
      }

      if (this.score < 0 || (!isDone && this.timeRemain <= 0)) { return 'fail'; }

      return 'gaming';
    }

    // 获取 扑克 Y 方向的间距
    getPokerSpaceY(num) {
      return num <= 8 ? 30 : 240 / num;
    }

    // 获取扑克 x 方向离 canvas 的距离
    getListX(index) {
      return this.listSpaceX + (this.pokerWidth + this.listSpaceX) * index;
    }

    // 获取readyList 中扑克 x 方向离 canvas 的距离
    getReadListX(index) {
      return 40 + this.getListX(4 + index);
    }

    drawPoker(poker, ctx = this.staticCtx) {
      const w = this.img.width / 13;
      const h = this.img.height / 4;
      ctx.drawImage(this.img, poker.num * w, poker.color * h, w, h, poker.currX, poker.currY, this.pokerWidth, this.pokerHeight);
    }

    createDealtList() {
      const dealtList = [];
      for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 4; j++) {
          dealtList.push({
            num: i,
            color: j
          });
        }
      }
      return dealtList;
    }

    dealtPoker() {
      this.drawStaticCvs();
      const pokers = this.dealtList;
      const num = 52 - pokers.length;
      if (num === 52) {
        this.autoPushReadyList();
        this.timeCutDown();
        return;
      }
      const random = Math.floor(Math.random() * pokers.length);
      const pokerInfo = Object.assign({}, ...pokers.splice(random, 1));
      const index = num % 8;
      const subIndex = (num - index) / 8;
      const poker = new Poker(pokerInfo);
      poker.index = index;
      poker.currX = 0.5 * (this.width - this.pokerWidth);
      poker.currY = this.height - 0.5 * this.pokerHeight;
      poker.end = {
        x: this.getListX(index),
        y: this.pokerListY + subIndex * this.getPokerSpaceY(subIndex)
      };

      this.movingPoker = poker;
      return this.drawMovingPoker('dealt');
    }

    drawMovingPoker(status) {
      const poker = this.movingPoker;
      if (!poker) { return; }
      this.movingCtx.clearRect(0, 0, this.width, this.height);
      if (poker.isArrived) {
        this.movingPoker = null;
        window.cancelAnimationFrame(this.raf);
        if (status === 'dealt') {
          this.pokerList[poker.index].push(poker);
          this.dealtPoker();
        } else {
          this.readyList[poker.index].push(poker);
          this.autoPushReadyList();
        }
        this.drawStaticCvs();
        return;
      }

      poker.currX += poker.vx;
      poker.currY += poker.vy;

      if (poker.isArrived) {
        poker.currX = poker.endX;
        poker.currY = poker.endY;
      }

      this.drawPoker(poker, this.movingCtx);
      this.raf = window.requestAnimationFrame(this.drawMovingPoker.bind(this, status));
    }

    drawStaticCvs() {
      this.staticCtx.clearRect(0, 80, this.width, this.height - 100);
      this.drawPokerList();
      this.drawTempList();
      this.drawReadyList();
      this.drawScore();
    }

    drawPokerList() {
      this.pokerList.map((pokers, index) => {
        const pokerSpaceY = this.getPokerSpaceY(pokers.length);
        return pokers.map((poker, subIndex) => {
          poker.currX = this.getListX(index);
          poker.currY = this.pokerListY + pokerSpaceY * subIndex;
          return this.drawPoker(poker, this.staticCtx);
        });
      });
    }

    drawTempList() {
      this.tempList.map((pokers, index) => {
        if (pokers.length !== 1) {
          return this.drawRect(this.getListX(index), this.tempListY, 'green');
        }
        const poker = pokers[0];
        poker.currX = this.getListX(index);
        poker.currY = this.tempListY;
        return this.drawPoker(poker, this.staticCtx);
      });
    }

    drawRect(x, y, color) {
      this.staticCtx.beginPath();
      this.staticCtx.strokeStyle = color;
      this.staticCtx.lineJoin = 'round';
      this.staticCtx.strokeRect(x, y, this.pokerWidth, this.pokerHeight);
    }

    drawReadyList() {
      this.readyList.map((pokers, index) => {
        if (pokers.length === 0) {
          return this.drawRect(this.getReadListX(index), this.tempListY, 'blue');
        }
        const [poker] = pokers.slice(-1);
        poker.currX = this.getReadListX(index);
        poker.currY = this.tempListY;
        return this.drawPoker(poker, this.staticCtx);
      });
    }

    drawScore() {
      this.drawBackground(500, this.width - 500);
      const ctx = this.staticCtx;
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.font = '900 36px serif';
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText(`得分：${this.score}   移动：${this.step}`, 500, 40);
    }

    drawBackground(x, w) {
      const ctx = this.staticCtx;
      ctx.restore();
      ctx.save();
      ctx.clearRect(x, 0, w, 80);
      ctx.beginPath();
      ctx.fillStyle = '#4e72b8';
      ctx.fillRect(x, 0, w, 80);
    }

    timeCutDown() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        --this.timeRemain;
        this.drawTimeRemain();
        if (this.timeRemain <= 0) {
          return this.drawGameOver();
        }
        this.timeCutDown();
      }, 1000);
    }

    drawTimeRemain() {
      const ss = (this.timeRemain % 60).toString().padStart(2, '0');
      const mm = Math.floor(this.timeRemain / 60).toString().padStart(2, '0');
      this.drawBackground(0, 300);
      const ctx = this.staticCtx;
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.font = '900 36px serif';
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText(`时间：${mm}:${ss}`, 20, 40);
    }

    drawMovingList() {
      this.movingCtx.clearRect(0, 0, this.width, this.height);
      this.movingList.map(poker => this.drawPoker(poker, this.movingCtx));
    }

    isMousedownPokerList(x, y) {
      let listIndex = -1;
      let pokerIndex = -1;
      if (y > this.pokerListY) {
        listIndex = this.pokerList.findIndex((pokers, index) => {
          const pokerX = this.getListX(index);
          return x >= pokerX && x <= (pokerX + this.pokerWidth);
        });

        if (listIndex >= 0) {
          pokerIndex = this.pokerList[listIndex].findIndex((poker, index, pokers) => {
            if (index === pokers.length - 1) {
              return y >= poker.currY && y <= poker.currY + this.pokerHeight;
            }
            return y >= poker.currY && y <= pokers[index + 1].currY;
          });
        }
      }
      if (listIndex >= 0 && pokerIndex >= 0) {
        const isOrder = this.pokerList[listIndex].slice(pokerIndex).every((poker, index, arr) => {
          const smallPoker = poker;
          const bigPoker = arr[index - 1];
          return this.isDiffConsecutive({ smallPoker, bigPoker });
        });
        if (isOrder) {
          this.movingListInfo = Object.assign({
            index: listIndex,
            list: 'pokerList'
          }, this.getEmptyMun());
          this.pokerMoveWithMouse(this.pokerList[listIndex].splice(pokerIndex), x, y);
          return true;
        }
      }
      return false;
    }

    isMousedownTempList(x, y) {
      let listIndex = -1;
      if (y <= this.tempListY + this.pokerHeight) {
        listIndex = this.tempList.findIndex((pokers, index) => {
          const pokerX = this.getListX(index);
          return x >= pokerX && x <= (pokerX + this.pokerWidth);
        });
      }
      if (listIndex >= 0) {
        this.movingListInfo = Object.assign({
          index: listIndex,
          list: 'tempList'
        }, this.getEmptyMun());
        this.pokerMoveWithMouse(this.tempList[listIndex].splice(0), x, y);
        return true;
      }
      return false;
    }

    isPushPokerList() {
      if (this.movingList.length === 0) {
        return false;
      }
      let listIndex = -1;
      const { currX, currY } = this.movingList[0];
      if (currY > this.tempListY + this.pokerHeight) {
        listIndex = this.pokerList.findIndex((pokers, index) => {
          const listX = this.getListX(index);
          if ((currX > listX - this.listSpaceX) && (currX < listX + this.pokerWidth)) {
            const [bigPoker] = pokers.slice(-1);
            const smallPoker = this.movingList[0];
            const isEmpty = pokers.length === 0;
            return this.movingList.length <= this.getMaxMoveNum(isEmpty) && this.isDiffConsecutive({ smallPoker, bigPoker });
          }
          return false;
        });
      }

      if (listIndex >= 0) {
        this.pokerList[listIndex].push(...this.movingList.splice(0));

        this.score -= 1;
        this.step += 1;
        return true;
      }
      return false;
    }

    isPushTempList() {
      if (this.movingList.length !== 1) {
        return false;
      }

      let listIndex = -1;
      const { currX, currY } = this.movingList[0];

      if (currY <= this.tempListY + this.pokerHeight && currY + this.pokerHeight >= this.tempListY) {
        listIndex = this.tempList.findIndex((pokers, index) => {
          const listX = this.getListX(index);
          return pokers.length === 0 && (currX > listX - this.listSpaceX) && (currX < listX + this.pokerWidth);
        });
      }

      if (listIndex >= 0) {
        this.tempList[listIndex].push(...this.movingList.splice(0));

        this.score -= 1;
        this.step += 1;
        return true;
      }

      return false;
    }

    isPushReadyList() {
      if (this.movingList.length !== 1) {
        return false;
      }

      let listIndex = -1;
      const { currX, currY } = this.movingList[0];

      if (currY <= this.tempListY + this.pokerHeight && currY + this.pokerHeight >= this.tempListY) {
        listIndex = this.readyList.findIndex((pokers, index) => {
          const listX = this.getReadListX(index);
          if ((currX > listX - this.listSpaceX) && (currX < listX + this.pokerWidth)) {
            const [smallPoker] = pokers.slice(-1);
            const bigPoker = this.movingList[0];
            return this.isSameConsecutive({ smallPoker, bigPoker });
          }
          return false;
        });
      }

      if (listIndex >= 0) {
        this.readyList[listIndex].push(...this.movingList.splice(0));

        this.score += 3;
        this.step += 1;
        return true;
      }

      return false;
    }

    // 判断相连的两张不同花色的牌
    isDiffConsecutive({ smallPoker, bigPoker }) {
      if (!smallPoker) {
        return false;
      }
      if (!bigPoker) {
        return true;
      }
      return (smallPoker.num + 1 === bigPoker.num) && (smallPoker.color !== bigPoker.color) && (smallPoker.color + bigPoker.color !== 3);
    }

    // 判断相连的两张相同花色的牌
    isSameConsecutive({ smallPoker, bigPoker }) {
      if (!bigPoker) {
        return false;
      }

      if (!smallPoker) {
        return bigPoker.num === 0;
      }
      return (smallPoker.num + 1 === bigPoker.num) && (smallPoker.color === bigPoker.color);
    }

    pokerMoveWithMouse(pokers, x, y) {
      const pokerSpaceY = this.getPokerSpaceY(this.movingList.length);
      this.movingList = pokers.map((poker, index) => {
        poker.currX = x - this.pokerWidth / 2;
        poker.currY = y + (index - 0.5) * pokerSpaceY;
        return poker;
      });
    }

    getPokersSpaceY(num) {
      return num <= 8 ? 30 : 240 / num;
    }

    // 获取最大可移动的扑克数
    getMaxMoveNum(isEmpty) {
      const { top, btm } = this.movingListInfo;

      if (isEmpty) {
        return (top + 1) * btm;
      }
      return (top + 1) * (btm + 1);
    }

    // 获取tempList和pokerList的空列
    getEmptyMun() {
      const top = this.tempList.reduce((num, pokers) => {
        if (pokers.length === 0) {
          num++;
        }
        return num;
      }, 0);

      const btm = this.pokerList.reduce((num, pokers) => {
        if (pokers.length === 0) {
          num++;
        }
        return num;
      }, 0);

      return { top, btm };
    }

    autoPushReadyList() {
      const status = this.gameStatus;

      if (status === 'success' || status === 'transform') {
        return this.timeTransformScore();
      }

      if (status === 'fail') {
        this.drawGameOver();
        return false;
      }

      const isPokerAutoMove = this.isPokerAutoMove(this.pokerList) || this.isPokerAutoMove(this.tempList);

      if (isPokerAutoMove) {
        this.drawStaticCvs();
        this.drawMovingPoker();
        return;
      }
    }

    isPokerAutoMove(list) {
      const bigPokerNum = Math.min(...Array.from(this.readyList, item => item.length));

      const bigPokerIndex = list.findIndex(pokers => {
        const [poker] = pokers.slice(-1);
        if (!poker) {
          return false;
        }
        // 如果是张 2，找 readyList里面有没有相同花色的 1
        if (poker.num === 1) {
          const bigPoker = poker;
          return this.readyList.some(([smallPoker]) => this.isSameConsecutive({ smallPoker, bigPoker }));
        }

        return poker.num === bigPokerNum;
      });

      if (bigPokerIndex === -1) {
        return false;
      }

      const minPokerIndex = this.readyList.findIndex(pokers => {
        const [smallPoker] = pokers.slice(-1);
        const [bigPoker] = list[bigPokerIndex].slice(-1);
        return this.isSameConsecutive({ smallPoker, bigPoker });
      });

      if (minPokerIndex === -1) {
        return false;
      }

      this.movingPoker = list[bigPokerIndex].pop();
      this.movingPoker.end = {
        x: this.getReadListX(minPokerIndex),
        y: this.tempListY
      };
      this.movingPoker.index = minPokerIndex;
      this.score += 3;
      return true;
    }

    timeTransformScore() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        --this.timeRemain;
        this.score += 5;
        this.drawTimeRemain();
        this.drawScore();
        if (this.timeRemain <= 0) {
          this.drawGameOver();
          return clearTimeout(this.timer);
        }
        return this.timeTransformScore();
      }, 200);
    }

    play() {
      this.dealtList = this.createDealtList();
      this.pokerList = Array.from({ length: 8 }, () => []);
      this.tempList = Array.from({ length: 4 }, () => []);
      this.readyList = Array.from({ length: 4 }, () => []);

      this.movingList = [];
      this.movingListInfo = {
        index: -1,
        list: '',
        top: 4,
        btm: 0
      };

      this.score = 20;
      this.step = 0;

      this.timeRemain = 10 * 60;
      clearTimeout(this.timer);
      this.timer = null;
      this.movingPoker = null;

      if (this.raf) {
        window.cancelAnimationFrame(this.raf);
      }

      this.drawTimeRemain();
      this.drawReplayBtn();
      this.dealtPoker();
    }

    drawReplayBtn() {
      this.drawBackground(300, 200);
      const ctx = this.staticCtx;

      this.drawButton(ctx, {
        x: 320,
        y: 10,
        text: '重玩'
      });
    }

    drawGameOver() {
      const ctx = this.movingCtx;
      ctx.clearRect(0, 0, this.width, this.height);

      ctx.restore();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = '#4e72b8';
      ctx.fillRect(300, 200, 300, 200);

      ctx.restore();
      ctx.fillStyle = '#fff';
      ctx.font = '900 36px serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(this.gameStatus, 0.5 * this.width, 260);

      this.drawButton(ctx, {
        x: 390,
        y: 320,
        text: '开始'
      });
    }

    drawButton(ctx, { x, y, width = 120, height = 60, text, radius = 5 }) {
      ctx.restore();
      ctx.save();
      // 圆角矩形
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);

      ctx.fillStyle = '#409eff';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 0;
      ctx.shadowColor = '#3C93D5';
      ctx.fill();

      ctx.restore();
      ctx.save();
      ctx.font = '900 36px serif';
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, x + 0.5 * width, y + 0.5 * height);
    }
  }

  const game = new Game('cvs-box');
  game.play();
})();