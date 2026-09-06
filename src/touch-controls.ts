/** 管理獨立觸點的搖桿、跳躍與衝刺，支援同時移動及跳躍。 */
export class TouchControls {
  // 搖桿方向為標準化平面向量；負 Y 對應往終點方向移動。
  readonly axis = {x:0, y:0};
  sprint = false;
  private stickPointer: number | null = null;
  private sprintPointers = new Set<number>();
  private readonly stick: HTMLElement;
  private readonly knob: HTMLElement;
  private readonly sprintButton: HTMLElement;
  private readonly jumpButton: HTMLElement;

  /** 建立觸控介面並綁定指標生命週期事件。 */
  constructor(parent: HTMLElement, private readonly onJump:()=>void) {
    const root=document.createElement('div');root.id='touch-controls';root.setAttribute('aria-label','觸控操作');
    root.innerHTML=`<div class="stick-area"><div id="joystick" role="group" aria-label="移動搖桿"><span class="stick-arrow up">⌃</span><span class="stick-arrow left">‹</span><span class="stick-arrow right">›</span><span class="stick-arrow down">⌄</span><div id="stick-knob"></div></div><span class="touch-label">拖曳移動</span></div><div class="touch-actions"><button id="touch-sprint" aria-label="按住衝刺"><span>»</span><small>按住衝刺</small></button><button id="touch-jump" aria-label="跳躍"><span>↑</span><small>跳躍</small></button></div>`;
    parent.append(root);
    this.stick=root.querySelector('#joystick')!;this.knob=root.querySelector('#stick-knob')!;
    this.sprintButton=root.querySelector('#touch-sprint')!;this.jumpButton=root.querySelector('#touch-jump')!;
    this.stick.addEventListener('pointerdown',event=>{if(this.stickPointer!==null)return;event.preventDefault();this.stickPointer=event.pointerId;this.stick.setPointerCapture(event.pointerId);this.moveStick(event);});
    this.stick.addEventListener('pointermove',event=>{if(event.pointerId===this.stickPointer)this.moveStick(event);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.stick.addEventListener(name,event=>{if((event as PointerEvent).pointerId===this.stickPointer)this.releaseStick();});
    this.jumpButton.addEventListener('pointerdown',event=>{event.preventDefault();this.jumpButton.setPointerCapture(event.pointerId);this.jumpButton.classList.add('pressed');this.onJump();});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.jumpButton.addEventListener(name,()=>this.jumpButton.classList.remove('pressed'));
    this.sprintButton.addEventListener('pointerdown',event=>{event.preventDefault();this.sprintButton.setPointerCapture(event.pointerId);this.sprintPointers.add(event.pointerId);this.sprint=true;this.sprintButton.classList.add('pressed');});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.sprintButton.addEventListener(name,event=>{this.sprintPointers.delete((event as PointerEvent).pointerId);this.sprint=this.sprintPointers.size>0;this.sprintButton.classList.toggle('pressed',this.sprint);});
    root.addEventListener('contextmenu',event=>event.preventDefault());
  }

  /** 根據搖桿中心計算方向，保留類比幅度並忽略微小手指晃動。 */
  private moveStick(event:PointerEvent):void {
    const rect=this.stick.getBoundingClientRect();const radius=rect.width*0.32;
    const dx=(event.clientX-rect.left-rect.width/2)/radius,dy=(event.clientY-rect.top-rect.height/2)/radius;
    const length=Math.hypot(dx,dy),scale=length>1?1/length:1;
    this.axis.x=length<0.13?0:dx*scale;this.axis.y=length<0.13?0:dy*scale;
    this.knob.style.transform=`translate(${this.axis.x*radius}px,${this.axis.y*radius}px)`;
  }

  /** 放開或取消觸點時立即停止移動並置中搖桿。 */
  private releaseStick():void {this.stickPointer=null;this.axis.x=0;this.axis.y=0;this.knob.style.transform='translate(0,0)';}

  /** 分頁切換、旋轉或重新開始時清除全部觸控輸入。 */
  reset():void {this.releaseStick();this.sprintPointers.clear();this.sprint=false;this.sprintButton.classList.remove('pressed');this.jumpButton.classList.remove('pressed');}
}
