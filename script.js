(function(){
var EVENT=new Date('2026-12-06T11:00:00+05:30'),END=new Date('2026-12-06T14:30:00+05:30');
var $=function(i){return document.getElementById(i)};
var bgm=$('bgm');
var musicPlaying=false;
function updateMusicIcon(){
  $('music-icon-play').style.display=musicPlaying?'none':'block';
  $('music-icon-pause').style.display=musicPlaying?'block':'none';
}
$('music-toggle').onclick=function(){
  if(musicPlaying){bgm.pause();musicPlaying=false}
  else{bgm.volume=.6;bgm.play().catch(function(){});musicPlaying=true}
  updateMusicIcon();
};
document.addEventListener('visibilitychange',function(){if(document.hidden)bgm.pause()});
window.addEventListener('beforeunload',function(){bgm.pause()});
// one tap: the intro video plays, then it fades into the hero
var opened=false,done=false;
function finish(){
  if(done)return;done=true;
  $('site').hidden=false;
  document.querySelector('.hero').classList.add('enter');
  $('cover').classList.add('gone');
  document.body.classList.remove('locked');
}
$('cover').onclick=function(){
  if(opened)return finish();
  opened=true;
  $('cover').classList.add('revealing');
  // same tap unlocks audio
  bgm.volume=.6;bgm.play().catch(function(){});musicPlaying=true;updateMusicIcon();
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return finish();
  var op=$('opener');
  op.addEventListener('ended',finish,{once:true});
  op.addEventListener('error',finish,{once:true});
  setTimeout(finish,12000);
  var pr=op.play();if(pr&&pr.catch)pr.catch(finish);
};
// countdown
function tick(){
  var t=Math.max(0,EVENT-new Date()),d=Math.floor(t/864e5),h=Math.floor(t%864e5/36e5),m=Math.floor(t%36e5/6e4),s=Math.floor(t%6e4/1e3);
  var p=function(n){return String(n).padStart(2,'0')};
  $('d').textContent=p(d);$('h').textContent=p(h);$('m').textContent=p(m);$('s').textContent=p(s);
  $('line').textContent=d+' days '+h+' hours '+m+' min '+s+' sec';
}
$('cover').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();$('cover').onclick();}});
tick();setInterval(tick,1000);
// calendar (Dec 2026 starts on Tuesday)
var g=$('grid'),html='';
['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(function(x){html+='<div class="dow">'+x+'</div>'});
for(var i=0;i<2;i++)html+='<div></div>';
for(var n=1;n<=31;n++)html+=n===6?'<div class="on"><span>6</span></div>':'<div>'+n+'</div>';
g.innerHTML=html;
// add to calendar (.ics)
$('addcal').onclick=function(){
  var f=function(d){return d.toISOString().replace(/[-:]|\.\d{3}/g,'')};
  var ics=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','DTSTART:'+f(EVENT),'DTEND:'+f(END),
  'SUMMARY:Sharaf Ali & Aysha – Wedding Reception','LOCATION:Airport Garden Convention Centre\\, Karippur','END:VEVENT','END:VCALENDAR'].join('\r\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
  a.download='sharaf-aysha-reception.ics';a.click();
};
// wishes (stored in this browser only — see README to connect Supabase)
var KEY='sharaf-aysha-wishes';
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
function render(){$('wishes').innerHTML=load().map(function(w){return '<div class="wcard"><b>'+esc(w.n)+'</b><p>'+esc(w.m)+'</p></div>'}).join('')}
$('send').onclick=function(){
  var n=$('wn').value.trim(),m=$('wm').value.trim();
  if(!n||!m){alert('Please enter your name and your wishes.');return}
  var l=load();l.unshift({n:n,m:m});
  try{localStorage.setItem(KEY,JSON.stringify(l.slice(0,50)))}catch(e){}
  $('wn').value='';$('wm').value='';render();
};
render();
})();
