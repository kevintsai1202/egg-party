import * as THREE from 'three';
import {TouchControls} from './touch-controls';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header><a class="brand" href="./"><span class="brand-egg">●</span> 蛋仔出發<span class="brand-bang">！</span></a><span class="edition">EGG GO! ／ PLAYGROUND 01</span><button id="sound" class="small-button" aria-label="切換音效">♪ 音效關閉</button></header>
<main><section class="intro"><div><div class="eyebrow"><span></span> 準備好了嗎？快樂即刻出發</div><h1>小小蛋仔，<br>大大<span>冒險。</span><i>✦</i></h1><p>跳過障礙，滾向終點。<br>在雲端遊樂場，來一場不怕跌倒的比賽！</p></div><div class="ticket"><span class="ticket-icon">⚑</span><div><small>今日冒險</small><strong>糖果天空賽</strong><span>單人闖關 + 5 位電腦對手</span></div><b>01</b></div></section>
<section class="play-area"><div class="game-top"><span><b class="live-dot"></b> 糖果天空賽 <small>／ CANDY SKY</small></span><div><span id="stage">準備出發</span><span class="divider">│</span><span id="timer">00:00.00</span></div></div><div id="viewport"><canvas id="game"></canvas><div class="scene-label"><span>☁ 天空遊樂場</span><small>今天，也是適合冒險的一天</small></div><div id="hud" hidden><div class="progress-label"><span id="checkpoint">起點</span><span id="percent">0%</span></div><div class="progress-track"><i id="progress"></i></div><span id="rank"></span></div><div id="countdown" hidden></div><div id="toast" role="status"></div><div id="welcome"><span class="pill">一起滾出好心情</span><h2>下一位冠軍，<br>就是你！</h2><button id="start" class="primary">開始冒險 <span>↗</span></button><small>約 1–2 分鐘 · 掉下去也能再出發</small></div><div id="result" hidden><span class="pill">NICE RUN!</span><h2>你做到了！<span>✦</span></h2><p id="result-text"></p><button id="replay" class="primary">再挑戰一次 ↻</button><button id="home" class="small-button">回到遊樂場</button></div><div class="scene-bottom"><span>✦ 保持可愛，勇敢向前</span><button id="reset" title="重新開始這一局">↻ 重新開始</button></div></div><div class="game-bottom"><span><b>●</b> THREE.JS 3D WORLD</span><span>一路向前，好事正在終點等你。 <b>↗</b></span></div></section>
<section class="below"><div class="customize"><div class="section-number">01</div><div><h3>今天，當哪一顆蛋？</h3><p>選一個顏色，帶上你的好心情。</p><div class="swatches"><button class="swatch selected" data-color="#ffca58" style="--swatch:#ffca58" aria-label="奶油黃" aria-pressed="true"></button><button class="swatch" data-color="#fa93b5" style="--swatch:#fa93b5" aria-label="草莓粉" aria-pressed="false"></button><button class="swatch" data-color="#92d9c4" style="--swatch:#92d9c4" aria-label="薄荷綠" aria-pressed="false"></button><button class="swatch" data-color="#aba3ed" style="--swatch:#aba3ed" aria-label="葡萄紫" aria-pressed="false"></button><span id="color-name">奶油黃</span></div></div></div><div class="controls"><div class="section-number">02</div><div><h3>三招，就能快樂出發</h3><div class="key-list"><div><kbd>W A S D</kbd><span>移動 / 方向鍵</span></div><div><kbd>SPACE</kbd><span>跳高高</span></div><div><kbd>SHIFT</kbd><span>加速衝刺</span></div></div></div></div><div class="tip"><span>☀</span><p>跌倒沒關係，<br><strong>每次出發都算數。</strong></p></div></section>
<footer><span>EGG GO! <b>用一點勇氣，換很多快樂。</b></span><span>原創蛋仔障礙賽 · MADE FOR FUN ↗</span></footer></main>`;

/** 取得必定存在的介面元素。 */
function el(id: string): HTMLElement { return document.getElementById(id)!; }
const canvas = el('game') as HTMLCanvasElement;
// 觸控裝置降低像素與陰影解析度，減少高 DPI 手機的 GPU 負載。
const touchDevice=navigator.maxTouchPoints>0||matchMedia('(pointer: coarse)').matches;
document.body.classList.toggle('touch-device',touchDevice);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, touchDevice?1.5:2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor('#b9e8ef');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#b9e8ef', 75, 155);
const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 220);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8b88b8, 2.4));
const sun = new THREE.DirectionalLight(0xfff2d4, 3.2);
sun.position.set(-15, 30, 10); sun.castShadow = true;
sun.shadow.mapSize.set(touchDevice?1024:2048, touchDevice?1024:2048);
Object.assign(sun.shadow.camera, {left:-45,right:45,top:60,bottom:-60,far:120});
sun.position.z = -15; sun.target.position.z = -35;
scene.add(sun, sun.target);

/** 建立帶柔和高光的材質。 */
function material(color: THREE.ColorRepresentation): THREE.MeshStandardMaterial { return new THREE.MeshStandardMaterial({color, roughness:0.55}); }
/** 建立具有陰影的幾何模型並放入指定群組。 */
function mesh(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, x=0,y=0,z=0, parent: THREE.Object3D=scene): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material(color)); object.position.set(x,y,z); object.castShadow=true; object.receiveShadow=true; parent.add(object); return object;
}
/** 建立球體，用於角色與場景裝飾。 */
function ball(color: THREE.ColorRepresentation,x:number,y:number,z:number,r:number,parent:THREE.Object3D=scene): THREE.Mesh { return mesh(new THREE.SphereGeometry(r,24,16),color,x,y,z,parent); }
/** 建立原創蛋形角色，原點位於腳底。 */
function egg(color:string): THREE.Group {
  const group = new THREE.Group();
  const body = ball(color,0,0.85,0,0.7,group); body.scale.set(1,1.2,0.88); body.name='body';
  for(const side of [-1,1]) {
    ball('#302c47',side*0.22,1.04,0.565,0.075,group);
    ball('#ffffff',side*0.22-0.02,1.065,0.621,0.021,group);
    const cheek=ball('#f49aa8',side*0.39,0.88,0.51,0.11,group);cheek.scale.set(1,0.52,0.35);
    const foot=ball('#fff4df',side*0.3,0.13,0.12,0.22,group);foot.scale.set(1,0.62,1.5);
    const arm=ball(color,side*0.69,0.72,0,0.19,group);arm.scale.set(0.6,1.6,0.9);arm.name='arm';
  }
  const mouth=mesh(new THREE.TorusGeometry(0.11,0.022,8,12,Math.PI),'#302c47',0,0.88,0.616,group);mouth.rotation.z=Math.PI;
  const hat=mesh(new THREE.ConeGeometry(0.34,0.43,4),'#fff6da',0,1.77,0,group);hat.rotation.y=Math.PI/4;
  scene.add(group);return group;
}

// 平台表同時是可視場景與角色落地判斷的資料來源。
type Platform = {x:number;z:number;w:number;d:number;top:number;object:THREE.Mesh;moving?:boolean;previousX:number};
const platforms:Platform[]=[];
/** 建立平台，頂面高度固定為零。 */
function platform(x:number,z:number,w:number,d:number,color:string,moving=false):void {
  const object=mesh(new THREE.BoxGeometry(w,1.3,d),color,x,-0.65,z);
  mesh(new THREE.BoxGeometry(w+0.1,0.14,d+0.1),'#fff5df',0,0.67,0,object);
  platforms.push({x,z,w,d,top:0,object,moving,previousX:x});
  if(!moving) for(const side of [-1,1]) mesh(new THREE.BoxGeometry(0.15,0.12,d-0.2),'#f3bb74',x+side*(w/2-0.2),0.11,z);
}
platform(0,2,14,14,'#a9a1e5');
platform(0,-15,12,16,'#f7bb91');
platform(0,-29,7,8,'#96d2c8');
platform(0,-40,7,8,'#a9a1e5',true);
platform(0,-51,9,8,'#96d2c8');
platform(0,-67,14,18,'#f7bb91');
platform(0,-83,12,10,'#a9a1e5');

/** 使用畫布建立賽道標誌貼圖。 */
function sign(text:string,x:number,y:number,z:number,color='#69619c'):void {
  const c=document.createElement('canvas');c.width=512;c.height=128;
  const ctx=c.getContext('2d')!;ctx.fillStyle='#fffaf0';ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.font='bold 52px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,83);
  const board=new THREE.Mesh(new THREE.BoxGeometry(6,1.5,0.25),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c)}));board.position.set(x,y,z);scene.add(board);
}
/** 建立起終點拱門與旗幟。 */
function gate(z:number,label:string,color:string):void {
  for(const side of [-1,1]) {mesh(new THREE.CylinderGeometry(0.22,0.22,4.8),color,side*4,2.4,z);ball('#fff5d8',side*4,4.9,z,0.35);}
  sign(label,0,4.5,z,color);
}
gate(-2,'LET’S GO!','#ed967d');gate(-85,'FINISH!','#8e82c8');
for(let i=0;i<12;i++) for(let j=0;j<2;j++) mesh(new THREE.BoxGeometry(1,0.03,0.6),(i+j)%2?'#faf6ef':'#71618f',i-5.5,0.11,-83+j*0.6);
for(const z of [-26,-58]) {mesh(new THREE.BoxGeometry(6,0.035,0.65),'#fff3a6',0,0.14,z);sign('CHECKPOINT',0,3.3,z,'#6baaa0');}
// 旋轉橫桿的角度同步提供碰撞判斷。
const spinners:{group:THREE.Group;z:number;angle:number;speed:number}[]=[];
for(const [z,speed] of [[-15,1.3],[-64,-1.15],[-71,1.6]]) {
  const group=new THREE.Group();group.position.set(0,0.55,z);scene.add(group);
  mesh(new THREE.BoxGeometry(10.5,0.42,0.48),'#ed8fac',0,0,0,group);
  for(const side of [-1,1]) ball('#ffdb78',side*5.25,0,0,0.38,group);
  mesh(new THREE.CylinderGeometry(0.55,0.65,0.9),'#a591dd',0,0.02,0,group);
  spinners.push({group,z,angle:0,speed});
}
// 雲朵、浮島與氣球形成輕盈的天空遊樂場。
for(let i=0;i<30;i++) {
  const x=(i%2?1:-1)*(13+(i*7%20)),z=15-i*4;
  for(let j=0;j<3;j++) {const cloud=ball('#fffaf5',x+j*1.4,-4+(i%4)*2,z,1.7+j*0.35);cloud.scale.set(1.5,0.65,1);cloud.castShadow=false;}
}
for(const [x,z,color] of [[-11,-8,'#efa0ba'],[12,-25,'#b1a5e9'],[-13,-54,'#ffce68'],[12,-79,'#efa0ba']] as const) {
  const balloon=ball(color,x,8,z,1.25);balloon.scale.y=1.3;
  mesh(new THREE.CylinderGeometry(0.02,0.02,5),'#fff8ef',x,4,z);
  mesh(new THREE.BoxGeometry(0.6,0.5,0.6),'#f3c397',x,1.4,z);
}
for(let i=0;i<9;i++) {const candy=mesh(new THREE.TorusGeometry(1.3,0.3,12,36),i%2?'#f6a0bb':'#ffe392',(i%2?1:-1)*11,1,-i*9);candy.rotation.y=0.3;}

const player=egg('#ffca58');player.position.set(0,0,5);
const botColors=['#fa93b5','#92d9c4','#aba3ed','#ff9b70','#80c9ec'];
const bots=botColors.map((color,i)=>({object:egg(color),progress:0,speed:3.8+i*0.27,lane:(i-2)*1.65,finished:false}));
// 狀態機統一管理開始、倒數、遊玩與結算，避免背景畫面觸發遊戲邏輯。
let state:'idle'|'countdown'|'playing'|'finished'='idle';
let elapsed=0,count=0,vy=0,grounded=true,checkpoint=0,falls=0,hitCooldown=0,animTime=0;
// 短按跳躍緩衝可跨越渲染幀，避免按下放開都發生在同一幀時漏接。
let jumpBuffer=0;
let standing:Platform|undefined;
let soundEnabled=false,audioContext:AudioContext|undefined;
const keys=new Set<string>();
const checkpointPositions=[new THREE.Vector3(0,0,5),new THREE.Vector3(0,0,-28),new THREE.Vector3(0,0,-59)];
const follow=new THREE.Vector3();
const touch=new TouchControls(el('viewport'),()=>{if(state==='playing')jumpBuffer=0.15;});
el('hud').insertAdjacentHTML('beforeend','<span id="touch-timer">00:00.00</span>');
const exitGame=document.createElement('button');exitGame.id='exit-game';exitGame.textContent='‹ 返回大廳';exitGame.addEventListener('click',()=>reset(false));el('viewport').append(exitGame);
if(touchDevice){el('welcome').querySelector('small')!.textContent='拖曳搖桿移動 · 按鈕跳躍與衝刺';document.querySelector('.key-list')!.innerHTML='<div><kbd>左側搖桿</kbd><span>拖曳移動</span></div><div><kbd>↑ 跳躍</kbd><span>點一下跳高高</span></div><div><kbd>» 衝刺</kbd><span>按住加速</span></div>';}

/** 播放短音符，音訊由使用者互動啟用。 */
function beep(frequency=600):void {if(!soundEnabled)return;audioContext??=new AudioContext();void audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.connect(gain);gain.connect(audioContext.destination);osc.frequency.value=frequency;gain.gain.setValueAtTime(0.06,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime+0.16);osc.start();osc.stop(audioContext.currentTime+0.17);}
let toastTimer=0;
/** 顯示短暫提示並覆蓋舊提示的計時器。 */
function toast(message:string):void {el('toast').textContent=message;el('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>el('toast').classList.remove('show'),2200);}
/** 重設所有本局狀態，可返回大廳或立即開始倒數。 */
function reset(start:boolean):void {
  state=start?'countdown':'idle';elapsed=0;count=3.2;vy=0;checkpoint=0;falls=0;grounded=true;hitCooldown=0;jumpBuffer=0;standing=undefined;keys.clear();player.position.copy(checkpointPositions[0]);player.rotation.set(0,0,0);
  bots.forEach((bot,i)=>{bot.progress=0;bot.finished=false;bot.object.position.set(bot.lane,0,2+i*0.5);});
  el('welcome').hidden=start;el('result').hidden=true;el('hud').hidden=!start;el('countdown').hidden=!start;el('stage').textContent=start?'準備起跑':'準備出發';el('timer').textContent='00:00.00';el('checkpoint').textContent='起點';el('percent').textContent='0%';el('progress').style.width='0%';
  document.body.classList.toggle('in-game',start);touch.reset();
}
/** 將秒數格式化為競賽時間。 */
function formatTime(seconds:number):string {return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toFixed(2).padStart(5,'0')}`;}
/** 掉落後返回最近檢查點，保留計時。 */
function respawn():void {player.position.copy(checkpointPositions[checkpoint]);vy=0;grounded=true;standing=undefined;hitCooldown=1;falls++;toast('拍拍身上的雲，再出發！');beep(260);}
/** 抵達終點後停止操作並呈現本局成績。 */
function finish():void {state='finished';keys.clear();el('toast').classList.remove('show');el('result').hidden=false;el('stage').textContent='挑戰完成';el('result-text').textContent=`第 ${1+bots.filter(b=>b.finished).length} 名抵達 · ${formatTime(elapsed)} · 重生 ${falls} 次`;el('timer').textContent=formatTime(elapsed);el('progress').style.width='100%';el('percent').textContent='100%';beep(880);}
/** 處理角色物理、平台落地、障礙碰撞及檢查點。 */
function updatePlayer(dt:number):void {
  hitCooldown=Math.max(0,hitCooldown-dt);
  if(standing?.moving&&grounded) player.position.x+=standing.x-standing.previousX;
  let dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+touch.axis.x;
  let dz=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))+touch.axis.y;
  const length=Math.hypot(dx,dz);if(length>1){dx/=length;dz/=length;}
  const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')||touch.sprint?11:7.2;
  player.position.x+=dx*speed*dt;player.position.z+=dz*speed*dt;
  if(length)player.rotation.y=THREE.MathUtils.lerp(player.rotation.y,Math.atan2(dx,dz),0.2);
  if(jumpBuffer>0&&grounded){vy=9.1;grounded=false;standing=undefined;jumpBuffer=0;beep(540);}
  jumpBuffer=Math.max(0,jumpBuffer-dt);
  const previousY=player.position.y;vy-=23*dt;player.position.y+=vy*dt;grounded=false;
  standing=undefined;
  for(const p of platforms) if(Math.abs(player.position.x-p.x)<p.w/2+0.2&&Math.abs(player.position.z-p.z)<p.d/2+0.2&&previousY>=p.top-0.08&&player.position.y<=p.top&&vy<=0){player.position.y=p.top;vy=0;grounded=true;standing=p;break;}
  player.rotation.z=grounded&&length?Math.sin(animTime*16)*0.08:0;
  for(const s of spinners) {
    const rx=player.position.x,rz=player.position.z-s.z;
    const localX=rx*Math.cos(s.angle)-rz*Math.sin(s.angle),localZ=rx*Math.sin(s.angle)+rz*Math.cos(s.angle);
    if(Math.abs(localX)<5.7&&Math.abs(localZ)<0.7&&player.position.y<0.9&&player.position.y>-0.5&&hitCooldown===0){vy=5;player.position.x+=Math.cos(s.angle+Math.PI/2)*1.3;player.position.z-=Math.sin(s.angle+Math.PI/2)*1.3;grounded=false;hitCooldown=1.1;toast('哎呀！跳起來閃過旋轉糖果棒');beep(190);}
  }
  if(player.position.y<-9)respawn();
  if(grounded&&checkpoint<1&&player.position.z<-26&&player.position.z>-33){checkpoint=1;toast('第一個檢查點 ✓ 繼續跳向前方！');beep(720);}
  if(grounded&&checkpoint<2&&player.position.z<-58&&player.position.z>-75){checkpoint=2;toast('最後衝刺！終點就在前面');beep(780);}
  if(grounded&&player.position.z<-83&&Math.abs(player.position.x)<6)finish();
}
/** 更新電腦對手的賽道位置與跳躍動畫，移動平台區會等待對齊。 */
function updateBots(dt:number):void {
  for(const bot of bots){if(bot.finished)continue;
    const next=bot.progress+bot.speed*dt;const z=5-next;
    const moving=platforms[3];
    if(z<-33&&z>-37&&Math.abs(moving.x)>1.7)continue;
    bot.progress=next;bot.object.position.z=z;
    bot.object.position.x=z<-24&&z>-56? (z<-35&&z>-45?moving.x:0)+bot.lane*0.3:bot.lane;
    const gap=!platforms.some(p=>Math.abs(z-p.z)<=p.d/2&&Math.abs(bot.object.position.x-p.x)<p.w/2);
    bot.object.position.y=gap?1.2:Math.max(0,Math.sin(bot.progress*1.3))*0.55;bot.object.rotation.y=Math.PI;bot.object.rotation.z=Math.sin(animTime*12)*0.07;
    if(z<-84){bot.finished=true;bot.object.position.z=-84;}
  }
}
/** 調整畫布與相機，保持場景比例正確。 */
function resize():void {const rect=el('viewport').getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(el('viewport'));
window.addEventListener('keydown',(event)=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)&&state==='playing')event.preventDefault();if(state==='playing'){keys.add(event.code);if(event.code==='Space'&&!event.repeat)jumpBuffer=0.15;}});
window.addEventListener('keyup',event=>keys.delete(event.code));
window.addEventListener('blur',()=>{keys.clear();touch.reset();jumpBuffer=0;});
document.addEventListener('visibilitychange',()=>{keys.clear();touch.reset();jumpBuffer=0;});
window.addEventListener('orientationchange',()=>{keys.clear();touch.reset();jumpBuffer=0;});
el('start').addEventListener('click',()=>{reset(true);beep();});el('replay').addEventListener('click',()=>reset(true));el('reset').addEventListener('click',()=>reset(true));el('home').addEventListener('click',()=>reset(false));
el('sound').addEventListener('click',()=>{soundEnabled=!soundEnabled;el('sound').textContent=soundEnabled?'♪ 音效開啟':'♪ 音效關閉';beep();});
document.querySelectorAll<HTMLButtonElement>('.swatch').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.swatch').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});button.classList.add('selected');button.setAttribute('aria-pressed','true');el('color-name').textContent=button.getAttribute('aria-label');player.traverse(object=>{if(object instanceof THREE.Mesh&&['body','arm'].includes(object.name))(object.material as THREE.MeshStandardMaterial).color.set(button.dataset.color!);});}));
let previous=performance.now();
/** 每幀推進固定上限時間步，背景分頁時暫停比賽。 */
function frame(now:number):void {
  requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,0.04);previous=now;if(document.hidden)return;animTime+=dt;
  for(const p of platforms){p.previousX=p.x;if(p.moving){p.x=Math.sin(animTime*0.75)*2.8;p.object.position.x=p.x;}}
  for(const s of spinners){s.angle+=s.speed*dt;s.group.rotation.y=s.angle;}
  if(state==='countdown'){count-=dt;el('countdown').textContent=count>0.2?String(Math.ceil(count-0.2)):'GO!';if(count<=0){state='playing';el('countdown').hidden=true;beep(800);}}
  if(state==='playing') {elapsed+=dt;updatePlayer(dt);if(state==='playing'){updateBots(dt);el('timer').textContent=formatTime(elapsed);el('stage').textContent=['暖身跳跳','雲端跳躍','糖果衝刺'][checkpoint];el('checkpoint').textContent=`檢查點 ${checkpoint} / 2`;const progress=THREE.MathUtils.clamp((5-player.position.z)/88*100,0,100);el('percent').textContent=`${Math.floor(progress)}%`;el('progress').style.width=`${progress}%`;el('rank').textContent=`目前第 ${1+bots.filter(b=>b.object.position.z<player.position.z).length} 名 / 6`;}}
  el('touch-timer').textContent=formatTime(elapsed);
  if(state==='idle') {camera.position.lerp(new THREE.Vector3(22,24,30),0.035);follow.lerp(new THREE.Vector3(-2,0,-15),0.035);player.rotation.y=Math.sin(animTime*0.6)*0.25;player.position.y=Math.sin(animTime*2)*0.055;}
  else {camera.position.lerp(new THREE.Vector3(player.position.x*0.45,Math.max(player.position.y,0)+12,player.position.z+17),0.09);follow.lerp(new THREE.Vector3(player.position.x*0.5,0,player.position.z-7),0.1);}
  camera.lookAt(follow);renderer.render(scene,camera);
}
camera.position.set(22,24,30);follow.set(-2,0,-15);reset(false);resize();requestAnimationFrame(frame);

// 僅開發模式提供唯讀快照，瀏覽器驗證仍需透過真實鍵盤操作。
if(import.meta.env.DEV) Object.defineProperty(window,'eggSnapshot',{get:()=>({state,x:player.position.x,y:player.position.y,z:player.position.z,grounded,checkpoint,falls,elapsed,movingX:platforms[3].x,touch:{x:touch.axis.x,y:touch.axis.y,sprint:touch.sprint},color:(player.getObjectByName('body') as THREE.Mesh<THREE.SphereGeometry,THREE.MeshStandardMaterial>).material.color.getHexString()})});
