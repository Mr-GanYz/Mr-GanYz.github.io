!function(t){var i={};function e(s){if(i[s])return i[s].exports;var r=i[s]={i:s,l:!1,exports:{}};return t[s].call(r.exports,r,r.exports,e),r.l=!0,r.exports}e.m=t,e.c=i,e.d=function(t,i,s){e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:s})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,i){if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(e.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var r in t)e.d(s,r,function(i){return t[i]}.bind(null,r));return s},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},e.p="",e(e.s=0)}([function(t,i,e){"use strict";e.r(i);e(1);(()=>{class t{constructor(t){Object.assign(this,t)}set end({x:t=0,y:i=0}){this.endX=t,this.endY=i,this.vx=(t-this.currX)/10,this.vy=(i-this.currY)/10}get isArrived(){return 0===this.vy&&this.currX>=this.endX||this.currY<=this.endY}}new class{constructor(t){const i=document.getElementById(t);if(this.staticCvs=document.createElement("canvas"),!this.staticCvs.getContext)throw Error("浏览器版本太低，请升级！！！");this.width=900,this.height=700,this.staticCvs.setAttribute("width",this.width),this.staticCvs.setAttribute("height",this.height),this.staticCtx=this.staticCvs.getContext("2d"),i.appendChild(this.staticCvs),this.movingCvs=document.createElement("canvas"),this.movingCvs.setAttribute("width",this.width),this.movingCvs.setAttribute("height",this.height),this.movingCtx=this.movingCvs.getContext("2d"),i.appendChild(this.movingCvs),this.img=new Image,this.img.src=e(5),this.pokerListY=230,this.listSpaceX=40,this.tempListY=100,this.pokerWidth=60,this.pokerHeight=78,this.isMousedown=!1,this.movingCvs.addEventListener("mousedown",t=>{const i=this.gameStatus,{offsetX:e,offsetY:s}=t;if("success"===i||"fail"===i)return e>=390&&e<=510&&s>=320&&s<=380&&this.play();if(e>=320&&e<=440&&s>=10&&s<=70)return this.play();if("gaming"===i&&0===this.movingList.length){this.isMousedown=!0,(this.isMousedownPokerList(e,s)||this.isMousedownTempList(e,s))&&(this.drawStaticCvs(),this.drawMovingList())}}),this.movingCvs.addEventListener("mousemove",t=>{this.isMousedown&&(this.pokerMoveWithMouse(this.movingList,t.offsetX,t.offsetY),this.drawMovingList())}),this.movingCvs.addEventListener("mouseup",()=>{if(!this.isMousedown)return;if(this.isMousedown=!1,!(this.isPushPokerList()||this.isPushTempList()||this.isPushReadyList())){const{index:t,list:i}=this.movingListInfo;this[i][t].push(...this.movingList.splice(0))}this.drawStaticCvs(),this.drawMovingList(),this.autoPushReadyList()})}get gameStatus(){if(this.dealtList.length>0)return"dealtting";if(this.movingPoker)return"autoMoving";const t=this.readyList.every(t=>13===t.length);return t?this.timeRemain>0?"transform":"success":this.score<0||!t&&this.timeRemain<=0?"fail":"gaming"}getPokerSpaceY(t){return t<=8?30:240/t}getListX(t){return this.listSpaceX+(this.pokerWidth+this.listSpaceX)*t}getReadListX(t){return 40+this.getListX(4+t)}drawPoker(t,i=this.staticCtx){const e=this.img.width/13,s=this.img.height/5;i.drawImage(this.img,t.num*e,t.color*s,e,s,t.currX,t.currY,this.pokerWidth,this.pokerHeight)}createDealtList(){const t=[];for(let i=0;i<13;i++)for(let e=0;e<4;e++)t.push({num:i,color:e});return t}dealtPoker(){this.drawStaticCvs();const i=this.dealtList,e=52-i.length;if(52===e)return this.autoPushReadyList(),void this.timeCutDown();const s=Math.floor(Math.random()*i.length),r=Object.assign({},...i.splice(s,1)),n=e%8,o=(e-n)/8,h=new t(r);return h.index=n,h.currX=.5*(this.width-this.pokerWidth),h.currY=this.height-.5*this.pokerHeight,h.end={x:this.getListX(n),y:this.pokerListY+o*this.getPokerSpaceY(o)},this.movingPoker=h,this.drawMovingPoker("dealt")}drawMovingPoker(t){const i=this.movingPoker;if(i){if(this.movingCtx.clearRect(0,0,this.width,this.height),i.isArrived)return this.movingPoker=null,window.cancelAnimationFrame(this.raf),"dealt"===t?(this.pokerList[i.index].push(i),this.dealtPoker()):(this.readyList[i.index].push(i),this.autoPushReadyList()),void this.drawStaticCvs();i.currX+=i.vx,i.currY+=i.vy,i.isArrived&&(i.currX=i.endX,i.currY=i.endY),this.drawPoker(i,this.movingCtx),this.raf=window.requestAnimationFrame(this.drawMovingPoker.bind(this,t))}}drawStaticCvs(){this.staticCtx.clearRect(0,80,this.width,this.height-100),this.drawPokerList(),this.drawTempList(),this.drawReadyList(),this.drawScore()}drawPokerList(){this.pokerList.map((t,i)=>{const e=this.getPokerSpaceY(t.length);return t.map((t,s)=>(t.currX=this.getListX(i),t.currY=this.pokerListY+e*s,this.drawPoker(t,this.staticCtx)))})}drawTempList(){this.tempList.map((t,i)=>{if(1!==t.length)return this.drawRect(this.getListX(i),this.tempListY,"green");const e=t[0];return e.currX=this.getListX(i),e.currY=this.tempListY,this.drawPoker(e,this.staticCtx)})}drawRect(t,i,e){this.staticCtx.beginPath(),this.staticCtx.strokeStyle=e,this.staticCtx.lineJoin="round",this.staticCtx.strokeRect(t,i,this.pokerWidth,this.pokerHeight)}drawReadyList(){this.readyList.map((t,i)=>{if(0===t.length)return this.drawRect(this.getReadListX(i),this.tempListY,"blue");const[e]=t.slice(-1);return e.currX=this.getReadListX(i),e.currY=this.tempListY,this.drawPoker(e,this.staticCtx)})}drawScore(){this.drawBackground(500,this.width-500);const t=this.staticCtx;t.restore(),t.save(),t.beginPath(),t.font="900 36px serif",t.fillStyle="#fff",t.textBaseline="middle",t.fillText(`得分：${this.score}   移动：${this.step}`,500,40)}drawBackground(t,i){const e=this.staticCtx;e.restore(),e.save(),e.clearRect(t,0,i,80),e.beginPath(),e.fillStyle="#4e72b8",e.fillRect(t,0,i,80)}timeCutDown(){clearTimeout(this.timer),this.timer=setTimeout(()=>{if(--this.timeRemain,this.drawTimeRemain(),this.timeRemain<=0)return this.drawGameOver();this.timeCutDown()},1e3)}drawTimeRemain(){const t=(this.timeRemain%60).toString().padStart(2,"0"),i=Math.floor(this.timeRemain/60).toString().padStart(2,"0");this.drawBackground(0,300);const e=this.staticCtx;e.restore(),e.save(),e.beginPath(),e.font="900 36px serif",e.fillStyle="#fff",e.textBaseline="middle",e.fillText(`时间：${i}:${t}`,20,40)}drawMovingList(){this.movingCtx.clearRect(0,0,this.width,this.height),this.movingList.map(t=>this.drawPoker(t,this.movingCtx))}isMousedownPokerList(t,i){let e=-1,s=-1;if(i>this.pokerListY&&(e=this.pokerList.findIndex((i,e)=>{const s=this.getListX(e);return t>=s&&t<=s+this.pokerWidth}))>=0&&(s=this.pokerList[e].findIndex((t,e,s)=>e===s.length-1?i>=t.currY&&i<=t.currY+this.pokerHeight:i>=t.currY&&i<=s[e+1].currY)),e>=0&&s>=0){if(this.pokerList[e].slice(s).every((t,i,e)=>{const s=t,r=e[i-1];return this.isDiffConsecutive({smallPoker:s,bigPoker:r})}))return this.movingListInfo=Object.assign({index:e,list:"pokerList"},this.getEmptyMun()),this.pokerMoveWithMouse(this.pokerList[e].splice(s),t,i),!0}return!1}isMousedownTempList(t,i){let e=-1;return i<=this.tempListY+this.pokerHeight&&(e=this.tempList.findIndex((i,e)=>{const s=this.getListX(e);return t>=s&&t<=s+this.pokerWidth})),e>=0&&(this.movingListInfo=Object.assign({index:e,list:"tempList"},this.getEmptyMun()),this.pokerMoveWithMouse(this.tempList[e].splice(0),t,i),!0)}isPushPokerList(){if(0===this.movingList.length)return!1;let t=-1;const{currX:i,currY:e}=this.movingList[0];return e>this.tempListY+this.pokerHeight&&(t=this.pokerList.findIndex((t,e)=>{const s=this.getListX(e);if(i>s-this.listSpaceX&&i<s+this.pokerWidth){const[i]=t.slice(-1),e=this.movingList[0],s=0===t.length;return this.movingList.length<=this.getMaxMoveNum(s)&&this.isDiffConsecutive({smallPoker:e,bigPoker:i})}return!1})),t>=0&&(this.pokerList[t].push(...this.movingList.splice(0)),this.score-=1,this.step+=1,!0)}isPushTempList(){if(1!==this.movingList.length)return!1;let t=-1;const{currX:i,currY:e}=this.movingList[0];return e<=this.tempListY+this.pokerHeight&&e+this.pokerHeight>=this.tempListY&&(t=this.tempList.findIndex((t,e)=>{const s=this.getListX(e);return 0===t.length&&i>s-this.listSpaceX&&i<s+this.pokerWidth})),t>=0&&(this.tempList[t].push(...this.movingList.splice(0)),this.score-=1,this.step+=1,!0)}isPushReadyList(){if(1!==this.movingList.length)return!1;let t=-1;const{currX:i,currY:e}=this.movingList[0];return e<=this.tempListY+this.pokerHeight&&e+this.pokerHeight>=this.tempListY&&(t=this.readyList.findIndex((t,e)=>{const s=this.getReadListX(e);if(i>s-this.listSpaceX&&i<s+this.pokerWidth){const[i]=t.slice(-1),e=this.movingList[0];return this.isSameConsecutive({smallPoker:i,bigPoker:e})}return!1})),t>=0&&(this.readyList[t].push(...this.movingList.splice(0)),this.score+=3,this.step+=1,!0)}isDiffConsecutive({smallPoker:t,bigPoker:i}){return!!t&&(!i||t.num+1===i.num&&t.color!==i.color&&t.color+i.color!==3)}isSameConsecutive({smallPoker:t,bigPoker:i}){return!!i&&(t?t.num+1===i.num&&t.color===i.color:0===i.num)}pokerMoveWithMouse(t,i,e){const s=this.getPokerSpaceY(this.movingList.length);this.movingList=t.map((t,r)=>(t.currX=i-this.pokerWidth/2,t.currY=e+(r-.5)*s,t))}getPokersSpaceY(t){return t<=8?30:240/t}getMaxMoveNum(t){const{top:i,btm:e}=this.movingListInfo;return t?(i+1)*e:(i+1)*(e+1)}getEmptyMun(){return{top:this.tempList.reduce((t,i)=>(0===i.length&&t++,t),0),btm:this.pokerList.reduce((t,i)=>(0===i.length&&t++,t),0)}}autoPushReadyList(){const t=this.gameStatus;return"success"===t||"transform"===t?this.timeTransformScore():"fail"===t?(this.drawGameOver(),!1):this.isPokerAutoMove(this.pokerList)||this.isPokerAutoMove(this.tempList)?(this.drawStaticCvs(),void this.drawMovingPoker()):void 0}isPokerAutoMove(t){const i=Math.min(...Array.from(this.readyList,t=>t.length)),e=t.findIndex(t=>{const[e]=t.slice(-1);if(!e)return!1;if(1===e.num){const t=e;return this.readyList.some(([i])=>this.isSameConsecutive({smallPoker:i,bigPoker:t}))}return e.num===i});if(-1===e)return!1;const s=this.readyList.findIndex(i=>{const[s]=i.slice(-1),[r]=t[e].slice(-1);return this.isSameConsecutive({smallPoker:s,bigPoker:r})});return-1!==s&&(this.movingPoker=t[e].pop(),this.movingPoker.end={x:this.getReadListX(s),y:this.tempListY},this.movingPoker.index=s,this.score+=3,!0)}timeTransformScore(){clearTimeout(this.timer),this.timer=setTimeout(()=>(--this.timeRemain,this.score+=5,this.drawTimeRemain(),this.drawScore(),this.timeRemain<=0?(this.drawGameOver(),clearTimeout(this.timer)):this.timeTransformScore()),200)}play(){this.dealtList=this.createDealtList(),this.pokerList=Array.from({length:8},()=>[]),this.tempList=Array.from({length:4},()=>[]),this.readyList=Array.from({length:4},()=>[]),this.movingList=[],this.movingListInfo={index:-1,list:"",top:4,btm:0},this.score=20,this.step=0,this.timeRemain=600,clearTimeout(this.timer),this.timer=null,this.movingPoker=null,this.raf&&window.cancelAnimationFrame(this.raf),this.drawTimeRemain(),this.drawReplayBtn(),this.dealtPoker()}drawReplayBtn(){this.drawBackground(300,200);const t=this.staticCtx;this.drawButton(t,{x:320,y:10,text:"重玩"})}drawGameOver(){const t=this.movingCtx;t.clearRect(0,0,this.width,this.height),t.restore(),t.fillStyle="rgba(0, 0, 0, 0.2)",t.fillRect(0,0,this.width,this.height),t.fillStyle="#4e72b8",t.fillRect(300,200,300,200),t.restore(),t.fillStyle="#fff",t.font="900 36px serif",t.textBaseline="middle",t.textAlign="center",t.fillText(this.gameStatus,.5*this.width,260),this.drawButton(t,{x:390,y:320,text:"开始"})}drawButton(t,{x:i,y:e,width:s=120,height:r=60,text:n,radius:o=5}){t.restore(),t.save(),t.moveTo(i+o,e),t.lineTo(i+s-o,e),t.quadraticCurveTo(i+s,e,i+s,e+o),t.lineTo(i+s,e+r-o),t.quadraticCurveTo(i+s,e+r,i+s-o,e+r),t.lineTo(i+o,e+r),t.quadraticCurveTo(i,e+r,i,e+r-o),t.lineTo(i,e+o),t.quadraticCurveTo(i,e,i+o,e),t.fillStyle="#409eff",t.shadowOffsetX=0,t.shadowOffsetY=5,t.shadowBlur=0,t.shadowColor="#3C93D5",t.fill(),t.restore(),t.save(),t.font="900 36px serif",t.fillStyle="#fff",t.textBaseline="middle",t.textAlign="center",t.fillText(n,i+.5*s,e+.5*r)}}("cvs-box").play()})()},function(t,i,e){var s=e(2);"string"==typeof s&&(s=[[t.i,s,""]]);var r={insert:"head",singleton:!1};e(4)(s,r);s.locals&&(t.exports=s.locals)},function(t,i,e){(t.exports=e(3)(!1)).push([t.i,"#cvs-box canvas {\r\n  margin: 0 auto;\r\n  position: absolute;\r\n  left: 50%;\r\n  transform: translate(-50%);\r\n  box-shadow: 0 0 10px 10px #888888;\r\n}\r\n",""])},function(t,i,e){"use strict";t.exports=function(t){var i=[];return i.toString=function(){return this.map((function(i){var e=function(t,i){var e=t[1]||"",s=t[3];if(!s)return e;if(i&&"function"==typeof btoa){var r=(o=s,h=btoa(unescape(encodeURIComponent(JSON.stringify(o)))),a="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(h),"/*# ".concat(a," */")),n=s.sources.map((function(t){return"/*# sourceURL=".concat(s.sourceRoot).concat(t," */")}));return[e].concat(n).concat([r]).join("\n")}var o,h,a;return[e].join("\n")}(i,t);return i[2]?"@media ".concat(i[2],"{").concat(e,"}"):e})).join("")},i.i=function(t,e){"string"==typeof t&&(t=[[null,t,""]]);for(var s={},r=0;r<this.length;r++){var n=this[r][0];null!=n&&(s[n]=!0)}for(var o=0;o<t.length;o++){var h=t[o];null!=h[0]&&s[h[0]]||(e&&!h[2]?h[2]=e:e&&(h[2]="(".concat(h[2],") and (").concat(e,")")),i.push(h))}},i}},function(t,i,e){"use strict";var s,r={},n=function(){return void 0===s&&(s=Boolean(window&&document&&document.all&&!window.atob)),s},o=function(){var t={};return function(i){if(void 0===t[i]){var e=document.querySelector(i);if(window.HTMLIFrameElement&&e instanceof window.HTMLIFrameElement)try{e=e.contentDocument.head}catch(t){e=null}t[i]=e}return t[i]}}();function h(t,i){for(var e=[],s={},r=0;r<t.length;r++){var n=t[r],o=i.base?n[0]+i.base:n[0],h={css:n[1],media:n[2],sourceMap:n[3]};s[o]?s[o].parts.push(h):e.push(s[o]={id:o,parts:[h]})}return e}function a(t,i){for(var e=0;e<t.length;e++){var s=t[e],n=r[s.id],o=0;if(n){for(n.refs++;o<n.parts.length;o++)n.parts[o](s.parts[o]);for(;o<s.parts.length;o++)n.parts.push(g(s.parts[o],i))}else{for(var h=[];o<s.parts.length;o++)h.push(g(s.parts[o],i));r[s.id]={id:s.id,refs:1,parts:h}}}}function c(t){var i=document.createElement("style");if(void 0===t.attributes.nonce){var s=e.nc;s&&(t.attributes.nonce=s)}if(Object.keys(t.attributes).forEach((function(e){i.setAttribute(e,t.attributes[e])})),"function"==typeof t.insert)t.insert(i);else{var r=o(t.insert||"head");if(!r)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(i)}return i}var u,l=(u=[],function(t,i){return u[t]=i,u.filter(Boolean).join("\n")});function d(t,i,e,s){var r=e?"":s.css;if(t.styleSheet)t.styleSheet.cssText=l(i,r);else{var n=document.createTextNode(r),o=t.childNodes;o[i]&&t.removeChild(o[i]),o.length?t.insertBefore(n,o[i]):t.appendChild(n)}}function m(t,i,e){var s=e.css,r=e.media,n=e.sourceMap;if(r&&t.setAttribute("media",r),n&&btoa&&(s+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(n))))," */")),t.styleSheet)t.styleSheet.cssText=s;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(s))}}var f=null,p=0;function g(t,i){var e,s,r;if(i.singleton){var n=p++;e=f||(f=c(i)),s=d.bind(null,e,n,!1),r=d.bind(null,e,n,!0)}else e=c(i),s=m.bind(null,e,i),r=function(){!function(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t)}(e)};return s(t),function(i){if(i){if(i.css===t.css&&i.media===t.media&&i.sourceMap===t.sourceMap)return;s(t=i)}else r()}}t.exports=function(t,i){(i=i||{}).attributes="object"==typeof i.attributes?i.attributes:{},i.singleton||"boolean"==typeof i.singleton||(i.singleton=n());var e=h(t,i);return a(e,i),function(t){for(var s=[],n=0;n<e.length;n++){var o=e[n],c=r[o.id];c&&(c.refs--,s.push(c))}t&&a(h(t,i),i);for(var u=0;u<s.length;u++){var l=s[u];if(0===l.refs){for(var d=0;d<l.parts.length;d++)l.parts[d]();delete r[l.id]}}}}},function(t,i,e){t.exports=e.p+"03584551506231548f50cee4bbdae908.svg"}]);