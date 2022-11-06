/**
 * Functions for ucaBot
 */
//% weight=5 color=#6AF195  icon="\uf207"
namespace ucaBot {
  const ADDR = 0x10;
  let f: string= null;
  let d: string= null;
  let c: string= null;
  let p: string[]= null;
  let resp: string=null;
  let id = '';
  let n_a = '';
  let name: string= null;
  let x= 0;
  let y= 0;
  let act= false;
  let tt= 0;
  let called= false;
  let wait= false;
  let repeat= false;
  let calls= '';
  let id_ar= '';
  let arr = false;
  let a2h = false;
  let id2fw= '';
  let fw_req= false;
  let cl= false;
  let al= false;
  let home: number[]= [];
  let sc= false;
  let found= false;
  let type= '';
  let x_o: number= null;
  let y_o: number= null;
  let r_o: number= null;
  let id_ob= '';
  let busy= false;
  let r_angle= 0;
  let wan = false;
  let ar2so = false;
  let ar2bo = false;
  let arr_home = false;
  let w = 0;
  let z = 0;
  let all = false;
  let to = false;
  let sf = false;

  export enum Pos {
    //% block="x"
    x,
    //% block="y"
    y,
  }

  export enum Dir {
    //% block="Right"
    right,
    //% block="Left"
    left,
  }
  export enum Or {
    //% block="North"
    north,
    //% block="South"
    south,
  }
   //% group="micro:bit (V2)"
  //% block="Init agent"
  //% weight=200
  //% parts="v2"
  export function initAgent(){
    radio.setGroup(23);
    radio.onReceivedString(function (msg) {
      d = msg[1];
      if (d == 'F' || d == id){
        console.log('received: '+msg);
        f = msg[0];
        c = msg[2] + msg[3];
        p = [];
        if (msg.length > 4){
          let str_p = msg.slice(4);
          let n = (str_p.split("/").length-1); 
          if (n){
            let j = 0;
            let aux = 0;
            for (let i = 0; i < n; i++){ 
              if (!i){
                j = str_p.indexOf('/');
                p.push(str_p.slice(0, j));
              }
              else{
                j = str_p.indexOf('/', j + 1);
                p.push(str_p.slice(aux + 1, j));
              } 
              aux = j;
              let f = 0;
              for (let char = 0; char < p[i].length; char++){  
                if (!((p[i][char] >= '0' && p[i][char] <= '9') || p[i][char]=='.'))
                  f+=1; 
              }
              if (f)
                p[i] = p[i].replace('0',''); 
            }
          }
        }
        if (f == '0'){
          if (!id && c == 'II'){
            id = p[0];
            basic.showString(id);
            basic.pause(1000);
            basic.clearScreen();
          }
          else if (c == 'AI')
            n_a = p[0];
          else if (c == 'GP'){
            act = true;
            x = parseFloat(p[0]);
            y = parseFloat(p[1]);
            tt = parseInt(p[2]);
          }
          else if (c == 'NM' || c == 'AC')
            act = true;
          else if (c == 'CA'){
            if (p.length){
              if (p[0] != id){
                calls = p[0];
                w = parseInt(p[1]);
                z = parseInt(p[2]);
                id_ob = p[3];
                called = true;
              }
              else
                act = true;
            }
          }
          else if (c == 'NF' && wait)
            repeat = true;
          else if (c == 'AR'){
            id_ar = p[0];
            arr = true;
          }
          else if (c == 'FM'){
            id2fw = p[0];
            fw_req = true;
          }
          else if (c == 'CL' && !al)
            cl = true;
          else if (c == 'HO'){
            if (p.length){
              home.push(parseInt(p[0]));
              home.push(parseInt(p[1]));
              home.push(parseInt(p[2]));
            }
            act = true;
          }
          else if ((c == 'BO' || c == 'SO') && sc && !found && !busy){
            found = true;
            type = c;
            x_o = parseInt(p[0]);
            y_o = parseInt(p[1]);
            id_ob = p[2];
            r_o = parseFloat(p[3]);
          }
          else if(c == 'TO')
            to = true;
          else if (c == 'GA'){
            x_o = parseFloat(p[0]);
            y_o = parseFloat(p[1]);
            act = true;
          }
          else if (c == 'SF')
            sf = true;
        }
      }
    });
    while (true) { 
      if (n_a && id){
        all = true;
        break; 
      }
      delay(); 
    }
  } 

  function send(d: string, c: string, p: string, stop: number){
    resp = id + d + c;
    if (!p)
      resp = resp + ',';
    else
      resp = resp + p + '/,';
    radio.sendString(resp);
    console.log('sent: '+resp);
    wait = true;
    delay();
    let i = 0;
    while(true){
      if (act){
        wait = false;
        act = false;
        break;
      }
      else{
        if (i == 29){
          radio.sendString(id+'0SS,');
          delay();
          act = false;
          send(d, c, p, stop);
          break;
        }
        if (i == stop)
          stopcar();
        if (repeat){
          repeat = false;
          if (stop > 0)
            stopcar();
          send(d, c, p, stop);
          break;
        }
      }
      i+=1;
      basic.pause(50);
    }
    delay();
  }
  function pid(p: number, min_a: number, max_a: number, min_n: number, max_n: number): number{
    return Math.round((p - min_a) / (max_a - min_a) * (max_n - min_n) + min_n);
  }
    //% block="My position %pos (cm)"
  //% weight=190
  export function myPos(pos: Pos): number { 
    send('0', 'GP', null, -1);
    if(!pos)
      return x;
    else
      return y;
  }
  //% block="Set name %a"
  //% weight=196
  export function setName(a: string){
    name = a;
    send('0', 'NM', name, -1);
  }
  //% block="My name"
  //% weight=196
  export function myName(): string {
    if (name)
      return name;
    else
      return 'Name not set';
  }
  //% block="My number (ID)"
  //% weight=195
  export function myNum(): number {
    return parseInt(id);
  }
  //% block="My direction (°)"
  //% weight=185
  export function myDir(): number { 
    send('0', 'GP', null, -1);
    return tt;
  }
  /**
  * @param p degrees to rotate, eg: 90
  */ 
  //% block="Rotate agent %p ° to %dir"
  //% p.shadow="protractorPicker"
  //% p.min = 5 p.max = 180
  //% weight=180 
  export function rotate(p: number, dir: Dir) { 
    send('0', 'GP', null, -1);
    let tt_p = 0;
    let d = 0;
    if (!dir){
      tt_p = tt - p;
      if (tt_p < 0)
        tt_p = 360 + tt_p;
    }
    else{
      tt_p = tt + p;
      if (tt_p > 360)
        tt_p = tt_p - 360;
    }
    r_angle = tt_p;
    let p_aux = p;
    while (p > 6 && p <= p_aux){
      d = 18;
      if (!dir)
        motors(d, -d-8);
      else
        motors(-d-8, d);
      basic.pause(90);
      send('0', 'GP', null, 0);
      p_aux = p;
      p =  Math.abs(tt_p - tt); 
      if (p > 180)
        p = 360 - p;  
    } 
    stopcar();
  }
  /**
  * @param cm cm to move, eg: 30 
  */ 
  //% block="Move forward %cm cm"
  //% cm.min = 1 cm.max = 90
  //% weight=175 
  export function move(cm: number){ 
    send('0', 'GP', null, -1);
    let aux = cm;  let v = 0;
    let xv = 0;    let yv = 0;
    let tt_o = tt; 
    let d_tt = 0;  let vc = 0;
    while (cm > 0 && cm <= aux){
      xv = x; 
      yv = y;
      v = pid(cm, 5, 100, 18, 25);
      motors(v, v);  
      basic.pause(150);
      send('0', 'GP', null, 4);
      cm = cm - Math.sqrt((x - xv) ** 2 + (y - yv) ** 2);
      d_tt = tt_o - tt;
      if (Math.abs(d_tt) > 300)
        d_tt = 360 + d_tt;
      if (d_tt != 0 && Math.abs(d_tt) > 1){
        vc = pid(Math.abs(d_tt), 2, 15, 6, 12);
        if (d_tt < 0)
          motors(v + vc, v - vc);
        else
          motors(v - vc, v + vc);
        basic.pause(50);
      }
    }
    stopcar();
  }
  function cm(x1: number, x2: number, y1: number, y2: number): number{
    return Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
  }
  function d2r(angle: number): number{
    return angle / 180 * Math.PI;
  }
  function r2d(angle: number): number{
    return angle * 180 / Math.PI;
  }
  function rt_angle(xa: number, xb: number, ya: number, yb: number, angle_a: number, d: number): number{
    let angle = -1 * d2r(angle_a);
    let xt = ((xb - xa) * Math.cos(angle)) - ((yb - ya) * Math.sin(angle));
    let yt = ((xb - xa) * Math.sin(angle)) + ((yb - ya) * Math.cos(angle));
    angle = Math.asin(yt / d);
    angle = r2d(angle);
    if (xt < 0)
      angle = 180 - angle;
    else{
      if (yt < 0)
        angle = 360 + angle;
    }
    return Math.round(angle);
  }
  //% block="Go to point x:%px y:%py"
  //% x.min = 5 x.max = 100
  //% y.min = 5 y.max = 57
  //% weight=170 
  export function toPoint(px: number, py: number, space = 0) {
    send('0', 'GP', null, -1);
    let d = cm(px, x, py, y);
    let d_tt = 0;
    let v = 0;
    let vc = 0;
    let aux = 999;
    let angle = rt_angle(x, px, y, py, tt, d);
    if (angle > 6){
      if (angle > 180){
        angle = 360 - angle; 
        rotate(angle, 0);
      }
      else 
        rotate(angle, 1); 
    }
    else
      r_angle = tt;
    let i = 0;
    while (d > 1.5 + space){
      send('0', 'GP', null, 2);
      aux = d;
      d_tt = r_angle - tt;
      if (Math.abs(d_tt) > 300)
        d_tt = 360 + d_tt;
      if (d_tt != 0 && Math.abs(d_tt) > 1){
        vc = pid(Math.abs(d_tt), 2, 30, 4, 8);
        if (d_tt < 0)
          motors(v + vc, v - vc);
        else
          motors(v - vc, v + vc);
        basic.pause(40);
      }
      v = pid(d, 5, 100, 15, 22);
      motors(v, v);  
      d = cm(px, x, py, y);
      basic.pause(100);
      if (i > 3 && d > aux)
        break;
      i+=1;
    }
    stopcar();
  }
  //% block="Wander around"
  //% weight=168 
  export function wander(){
    wan = true;
    control.inBackground(() => {
      while (wan){
        if (!cl && !al && !ir() && !busy)
          motors(16, 16);
        if (ir())
          stopcar();
        basic.pause(25);
      }
      stopcar();
    });
  }
  //% block="Stop current task(s)"
  //% weight=168 
  export function stop(){
    if (wan)
      wan = false;
    if (sc){
      sc = false;
      send('0', 'FS', null, -1);
    }
  }
  //% block="Direction to %a"
  //% weight=168 
  export function dirTo(a: Or){
    // if (!a)
    
    // else
  }
  
  //% block="Take object"
  //% weight=168 
  export function takeObj(){
    delay();
    send('0', 'SO', id_ob, -1);
  }
  //% block="Go home"
  //% weight=168 
  export function goHome(){
    if (!home.length)
      send('0', 'HO', null, -1);
    if (!home.length)
      return;
    toPoint(home[0], home[1], home[2]);
    arr_home = true;
  }
  //% block="On arrived home"
  //% weight=168 
  export function onHome(hd: () => void){
    control.onEvent(106, 3508, hd);
    control.inBackground(() => {
      while (true) { 
        if (arr_home){
          arr_home = false;
          re(106, 3508); 
        }
        delay(); 
      }
    });
  }
  //% block="Detect objects"
  //% weight=167 
  export function detect(){
    sc = true;
    send('0', 'SC', null, -1);
    while (true){
      if (found)
        break;
      delay(); 
    }
  }
  //% block="On object detected"
  //% weight=166
  export function onDetect(hd: () => void){
    control.onEvent(103, 3505, hd);
    control.inBackground(() => {
      while (true) { 
        if (found){
          stopcar();
          found = false;
          re(103, 3505); 
        }
        delay(); 
      }
    });
  }
  //% block="Go to object"
  //% weight=167 
  export function goToObj(){
    setBusy();
    if (x_o)
      toPoint(x_o, y_o, r_o);
    if (type == 'SO')
      ar2so = true;
    else if (type == 'BO')
      ar2bo = true;
    notBusy();
  }
  //% block="On arrived to small object"
  //% weight=167 
  export function onSO(hd: () => void){
    control.onEvent(104, 3506, hd);
    control.inBackground(() => {
      while (true) { 
        if (ar2so && !busy){
          ar2so = false;
          re(104, 3506); 
        }
        delay(); 
      }
    });
  }
  //% block="On arrived to big object"
  //% weight=167 
  export function onBO(hd: () => void){
    control.onEvent(105, 3507, hd);
    control.inBackground(() => {
      while (true) { 
        if (ar2bo && !busy){
          ar2bo = false;
          re(105, 3507); 
        }
        delay(); 
      }
    });
  }
  //% block="On collision received"
  //% weight=167 
  export function onColl(hd: () => void){
    control.onEvent(102, 3504, hd);
    control.inBackground(() => {
      while (true) { 
        if (cl){
          cl = false;
          send('0', 'CL', null, -1);
          re(102, 3504); 
        }
        delay(); 
      }
    });
  }
  //% block="Avoid collision"
  //% weight=167 
  export function avoidColl(){
    stopcar();
    al = true;
    motors(-31,-31);
    basic.pause(300);
    stopcar();
    let dir = Math.floor(Math.random() * 2);
    let a = Math.floor(Math.random() * 110) + 90;
    rotate(a, dir);
    move(1);
    send('0', 'FC', null, -1);
    al = false;
  }
  //% weight=130 
  //% block="Drop load"
  export function drop() {
    send('0', 'DL', null, -1);
  }
  function motors(lspeed: number, rspeed: number) {
    let buf = pins.createBuffer(4);
    if (lspeed > 0) {
      buf[0] = 0x01; 
      buf[1] = 0x02; 
      buf[2] = lspeed; 
      buf[3] = 0; 
      pins.i2cWriteBuffer(ADDR, buf); 
    } else {
      buf[0] = 0x01;
      buf[1] = 0x01;
      buf[2] = lspeed * -1;
      buf[3] = 0;
      pins.i2cWriteBuffer(ADDR, buf); 
    }
    if (rspeed > 0) {
      buf[0] = 0x02;
      buf[1] = 0x02;
      buf[2] = rspeed;
      buf[3] = 0;
      pins.i2cWriteBuffer(ADDR, buf); 
    } else {
      buf[0] = 0x02;
      buf[1] = 0x01;
      buf[2] = rspeed * -1;
      buf[3] = 0;
      pins.i2cWriteBuffer(ADDR, buf);
    }
  }
  function stopcar() {
    motors(0, 0);
  }
  function ir(): boolean {
    pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
    pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
    let left = pins.digitalReadPin(DigitalPin.P13);
    let right = pins.digitalReadPin(DigitalPin.P14);
    if (!left && !right) 
      return true;
    else
      return false;
  }
  function delay(){
    basic.pause(20);
  }
  function setBusy(){
    busy = true;
    send('0', 'BU', null, -1);
  }
  function notBusy(){
    send('0', 'NB', null, -1);
    delay();
    busy = false;
  }
  function re(a:number, b:number){
    control.raiseEvent(a, b, EventCreationMode.CreateAndFire); 
  }
}