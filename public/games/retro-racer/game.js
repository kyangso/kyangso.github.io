
const c=document.getElementById("game");
const x=c.getContext("2d");
const finish=document.getElementById("finish");
const keys={};
onkeydown=e=>keys[e.key.toLowerCase()]=true;
onkeyup=e=>keys[e.key.toLowerCase()]=false;

let speed=0, progress=0, lane=0;
const cpus=[
 {p:20,l:-25},{p:60,l:15},{p:90,l:-10},{p:130,l:30}
];

function car(px,py,col){
 x.fillStyle=col;
 x.fillRect(px-5,py-8,10,16);
 x.fillStyle="#111";
 x.fillRect(px-6,py-7,2,4);
 x.fillRect(px+4,py-7,2,4);
}

function loop(){
 requestAnimationFrame(loop);

 if(keys.w) speed=Math.min(speed+0.05,5);
 if(keys.s) speed=Math.max(speed-0.08,0);
 if(keys.a) lane-=2;
 if(keys.d) lane+=2;

 speed*=0.99;
 progress+=speed;

 x.fillStyle="#7ec0ee"; x.fillRect(0,0,320,180);
 x.fillStyle="#5ea54a"; x.fillRect(0,70,320,110);

 for(let y=70;y<180;y++){
   let p=(y-70)/110;
   let rw=40+p*180;
   let cx=160+Math.sin(progress*0.01)*20;
   x.fillStyle="#666";
   x.fillRect(cx-rw/2,y,rw,1);
 }

 for(const cpu of cpus){
   cpu.p += 1.2 + Math.random()*0.3;
 }

 let all=[...cpus.map((c,i)=>({n:"CPU"+(i+1),p:c.p})),{n:"YOU",p:progress}];
 all.sort((a,b)=>b.p-a.p);
 let rank=all.findIndex(v=>v.n==="YOU")+1;

 for(let i=0;i<cpus.length;i++){
   let dy=150-((cpus[i].p-progress)%120);
   if(dy>60&&dy<170) car(160+cpus[i].l,dy,"#fff");
 }

 car(160+lane,155,"#d22");

 x.fillStyle="#fff";
 x.font="8px monospace";
 x.fillText("SPD:"+Math.floor(speed*40),5,10);
 x.fillText("RANK:"+rank+"/"+(cpus.length+1),250,10);

 x.strokeStyle="#fff";
 x.strokeRect(250,130,60,40);
 x.fillStyle="red";
 x.fillRect(278,130+(progress%1000)/25,4,4);
 cpus.forEach((cpu,i)=>x.fillRect(255+i*10,130+(cpu.p%1000)/25,3,3));

 if(progress>=1000){
   finish.classList.remove("hidden");
 }
}
loop();
