/* Portfolio albums — one album per event; drag a bottom corner to turn the page (page curl, no library). */
(function(){
var root=document.querySelector('[data-albums]');if(!root)return;
var V='20261111a',VJ='20261111r',lang=(document.documentElement.lang||'en').slice(0,2).toLowerCase();
var SZ={"cl-engagement-beach":[1600,1280],"cl-engagement-cover":[1600,1280],"cl-engagement-embrace":[1280,1600],"cl-engagement-hands":[1280,1600],"cl-engagement-seawall":[1600,1067],"cl-engagement-shore":[1600,1067],"cl-engagement-silhouette":[1600,1280],"cl-engagement-walk":[1600,1280],"cl-wedding-bench":[1600,1066],"cl-wedding-bride":[1280,1600],"cl-wedding-cake":[1600,1067],"cl-wedding-cover":[1600,1280],"cl-wedding-dance":[1488,1600],"cl-wedding-dip":[1600,1066],"cl-wedding-kiss":[1066,1600],"cl-wedding-path":[1600,1067],"cl-wedding-portrait":[1296,1600],"cl-wedding-rings":[1600,1066],"cl-wedding-veil":[1280,1600],"cl-wedding-vows":[1265,1600],"cl-wedding-walk":[1067,1600],"je-1":[900,1600],"je-2":[1600,1066],"je-3":[1600,1066],"je-7":[1600,1066],"je-cover":[1600,1280],"je-s4":[1600,1280],"jh-cover":[1600,1280],"jh-engaged":[1600,1280],"jh-gaze":[1280,1600],"jh-kiss":[1280,1600],"jh-lookout":[1600,1280],"st-01":[1600,1280],"st-02":[1280,1600],"st-03":[1280,1600],"st-04":[1600,1280],"st-07":[1067,1600],"st-08":[1600,1280],"st-10":[1600,1280],"st-bench":[1600,1280],"st-cover":[1600,1067]};
var T={
en:{eb:'Albums',h:'Open an album and turn the pages',hint:'<b>Drag a bottom corner</b> to turn the page, like a real album',cover:'Cover',back:'Back cover',page:'Page {a} of {b}',pages:'Pages {a}–{b}',prev:'Previous page',next:'Next page',album:'The album',how:'Drag the bottom corner to turn the page',ceb:'Your album',ch:"Let's start your story.",cp:'Tell me your date and what you are planning. A 20% deposit holds your date.',cb:'Book your date',thanks:'Thank you',wed:'Wedding',eng:'Engagement',prop:'Surprise proposal',
 a1k:'A garden wedding in autumn',a1d:'From the last quiet minutes of getting ready to the first dance.',a1c1:'The walk down the aisle',a1c2:'Rings on, then a walk through the garden',a1c3:'Autumn light',a1c4:'A few minutes alone before dinner',a1c5:'Mr & Mrs',a1c6:'The first dance',
 a2k:'Sunset by the water',a2d:'Blossoms in the park, then the beach as the sun went down.',a2c1:'A walk in the park',a2c2:'Golden hour',a2c3:'Last light',a2c4:'Until the sun was gone',
 a3k:'Spring among the tulips',a3d:'A bright afternoon in the gardens, dressed in white and cream.',a3c1:'Under the willows, shoes in hand',a3c2:'In full bloom',
 a4k:'She said yes at Bowen Lookout',a4d:'I stayed hidden nearby, so Hannah never saw the camera until she said yes.',a4c1:'The question',a4c2:'Just engaged',
 a5k:'A quiet walk for two',a5d:'No rush and no posing, only time together outdoors.',a5c1:'By the willows',a5c2:'Together'},
fr:{eb:'Albums',h:'Ouvrez un album et tournez les pages',hint:'<b>Faites glisser un coin du bas</b> pour tourner la page, comme un vrai album',cover:'Couverture',back:'Dos de l’album',page:'Page {a} sur {b}',pages:'Pages {a}–{b}',prev:'Page précédente',next:'Page suivante',album:'L’album',how:'Faites glisser le coin du bas pour tourner la page',ceb:'Votre album',ch:'Commençons votre histoire.',cp:'Dites-moi votre date et ce que vous prévoyez. Un acompte de 20 % réserve votre date.',cb:'Réserver votre date',thanks:'Merci',wed:'Mariage',eng:'Fiançailles',prop:'Demande surprise',
 a1k:'Un mariage d’automne au jardin',a1d:'Des derniers instants de préparation jusqu’à la première danse.',a1c1:'L’entrée dans l’allée',a1c2:'Les alliances, puis une promenade au jardin',a1c3:'Lumière d’automne',a1c4:'Quelques minutes à deux avant le dîner',a1c5:'M. et Mme',a1c6:'La première danse',
 a2k:'Coucher de soleil au bord de l’eau',a2d:'Les fleurs du parc, puis la plage au soleil couchant.',a2c1:'Une promenade au parc',a2c2:'L’heure dorée',a2c3:'Dernière lumière',a2c4:'Jusqu’à ce que le soleil disparaisse',
 a3k:'Le printemps parmi les tulipes',a3d:'Un après-midi lumineux dans les jardins, en blanc et crème.',a3c1:'Sous les saules, chaussures à la main',a3c2:'En pleine floraison',
 a4k:'Elle a dit oui au belvédère Bowen',a4d:'Je suis resté caché tout près : Hannah n’a vu l’appareil qu’après avoir dit oui.',a4c1:'La question',a4c2:'Tout juste fiancés',
 a5k:'Une promenade tranquille à deux',a5d:'Sans se presser et sans poser, simplement du temps ensemble dehors.',a5c1:'Près des saules',a5c2:'Ensemble'},
es:{eb:'Álbumes',h:'Abre un álbum y pasa las páginas',hint:'<b>Arrastra una esquina inferior</b> para pasar la página, como en un álbum de verdad',cover:'Portada',back:'Contraportada',page:'Página {a} de {b}',pages:'Páginas {a}–{b}',prev:'Página anterior',next:'Página siguiente',album:'El álbum',how:'Arrastra la esquina inferior para pasar la página',ceb:'Tu álbum',ch:'Empecemos tu historia.',cp:'Cuéntame tu fecha y lo que estás planeando. Un depósito del 20 % reserva tu fecha.',cb:'Reserva tu fecha',thanks:'Gracias',wed:'Boda',eng:'Compromiso',prop:'Pedida sorpresa',
 a1k:'Una boda de otoño en el jardín',a1d:'Desde los últimos minutos de preparación hasta el primer baile.',a1c1:'El camino al altar',a1c2:'Los anillos y un paseo por el jardín',a1c3:'Luz de otoño',a1c4:'Unos minutos a solas antes de la cena',a1c5:'Sr. y Sra.',a1c6:'El primer baile',
 a2k:'Atardecer junto al agua',a2d:'Flores en el parque y después la playa al caer el sol.',a2c1:'Un paseo por el parque',a2c2:'La hora dorada',a2c3:'Última luz',a2c4:'Hasta que se fue el sol',
 a3k:'Primavera entre tulipanes',a3d:'Una tarde luminosa en los jardines, vestidos de blanco y crema.',a3c1:'Bajo los sauces, con los zapatos en la mano',a3c2:'En plena floración',
 a4k:'Dijo que sí en el mirador Bowen',a4d:'Me quedé escondido cerca: Hannah no vio la cámara hasta que dijo que sí.',a4c1:'La pregunta',a4c2:'Recién comprometidos',
 a5k:'Un paseo tranquilo para dos',a5d:'Sin prisa y sin poses, solo tiempo juntos al aire libre.',a5c1:'Junto a los sauces',a5c2:'Juntos'},
zh:{eb:'相册',h:'打开相册，翻阅每一页',hint:'<b>拖动页面下角</b>即可翻页，就像翻阅真正的相册',cover:'封面',back:'封底',page:'第 {a} 页，共 {b} 页',pages:'第 {a}–{b} 页',prev:'上一页',next:'下一页',album:'相册',how:'拖动下角翻页',ceb:'你们的相册',ch:'开始你们的故事。',cp:'告诉我你们的日期和计划。支付 20% 订金即可预留日期。',cb:'预订日期',thanks:'谢谢',wed:'婚礼',eng:'订婚',prop:'惊喜求婚',
 a1k:'秋日花园婚礼',a1d:'从准备时最后的安静时刻，到第一支舞。',a1c1:'走向仪式',a1c2:'交换戒指，然后漫步花园',a1c3:'秋日的光',a1c4:'晚宴前两个人的片刻',a1c5:'新郎与新娘',a1c6:'第一支舞',
 a2k:'水边的日落',a2d:'公园里的花开，然后是日落时分的海滩。',a2c1:'公园漫步',a2c2:'黄金时刻',a2c3:'最后一缕光',a2c4:'直到太阳落下',
 a3k:'郁金香丛中的春天',a3d:'花园里明亮的午后，一身白色与米色。',a3c1:'柳树下，手提着鞋',a3c2:'繁花盛开',
 a4k:'在 Bowen 观景台，她说“我愿意”',a4d:'我藏在附近，Hannah 直到说出“我愿意”才看到相机。',a4c1:'那个问题',a4c2:'刚刚订婚',
 a5k:'两个人的安静漫步',a5d:'不赶时间，也不摆拍，只是一起在户外的时光。',a5c1:'柳树旁',a5c2:'在一起'},
pa:{eb:'ਐਲਬਮ',h:'ਐਲਬਮ ਖੋਲ੍ਹੋ ਅਤੇ ਪੰਨੇ ਪਲਟੋ',hint:'ਪੰਨਾ ਪਲਟਣ ਲਈ <b>ਹੇਠਲਾ ਕੋਨਾ ਖਿੱਚੋ</b>, ਬਿਲਕੁਲ ਅਸਲੀ ਐਲਬਮ ਵਾਂਗ',cover:'ਕਵਰ',back:'ਪਿਛਲਾ ਕਵਰ',page:'ਪੰਨਾ {a} / {b}',pages:'ਪੰਨੇ {a}–{b}',prev:'ਪਿਛਲਾ ਪੰਨਾ',next:'ਅਗਲਾ ਪੰਨਾ',album:'ਐਲਬਮ',how:'ਪੰਨਾ ਪਲਟਣ ਲਈ ਹੇਠਲਾ ਕੋਨਾ ਖਿੱਚੋ',ceb:'ਤੁਹਾਡੀ ਐਲਬਮ',ch:'ਆਓ ਤੁਹਾਡੀ ਕਹਾਣੀ ਸ਼ੁਰੂ ਕਰੀਏ।',cp:'ਮੈਨੂੰ ਆਪਣੀ ਤਾਰੀਖ਼ ਅਤੇ ਯੋਜਨਾ ਦੱਸੋ। 20% ਡਿਪਾਜ਼ਿਟ ਨਾਲ ਤੁਹਾਡੀ ਤਾਰੀਖ਼ ਰਾਖਵੀਂ ਹੋ ਜਾਂਦੀ ਹੈ।',cb:'ਆਪਣੀ ਤਾਰੀਖ਼ ਬੁੱਕ ਕਰੋ',thanks:'ਧੰਨਵਾਦ',wed:'ਵਿਆਹ',eng:'ਮੰਗਣੀ',prop:'ਸਰਪ੍ਰਾਈਜ਼ ਪ੍ਰਪੋਜ਼ਲ',
 a1k:'ਪਤਝੜ ਵਿੱਚ ਬਾਗ਼ ਦਾ ਵਿਆਹ',a1d:'ਤਿਆਰ ਹੋਣ ਦੇ ਆਖ਼ਰੀ ਸ਼ਾਂਤ ਪਲਾਂ ਤੋਂ ਪਹਿਲੇ ਡਾਂਸ ਤੱਕ।',a1c1:'ਰਸਮ ਵੱਲ ਤੁਰਦਿਆਂ',a1c2:'ਮੁੰਦਰੀਆਂ, ਫਿਰ ਬਾਗ਼ ਵਿੱਚ ਸੈਰ',a1c3:'ਪਤਝੜ ਦੀ ਰੌਸ਼ਨੀ',a1c4:'ਖਾਣੇ ਤੋਂ ਪਹਿਲਾਂ ਕੁਝ ਪਲ ਇਕੱਲੇ',a1c5:'ਮਿਸਟਰ ਅਤੇ ਮਿਸਿਜ਼',a1c6:'ਪਹਿਲਾ ਡਾਂਸ',
 a2k:'ਪਾਣੀ ਕੰਢੇ ਸੂਰਜ ਡੁੱਬਣ ਵੇਲੇ',a2d:'ਪਾਰਕ ਵਿੱਚ ਖਿੜੇ ਫੁੱਲ, ਫਿਰ ਸੂਰਜ ਡੁੱਬਣ ਵੇਲੇ ਬੀਚ।',a2c1:'ਪਾਰਕ ਵਿੱਚ ਸੈਰ',a2c2:'ਸੁਨਹਿਰੀ ਘੜੀ',a2c3:'ਆਖ਼ਰੀ ਰੌਸ਼ਨੀ',a2c4:'ਸੂਰਜ ਡੁੱਬਣ ਤੱਕ',
 a3k:'ਟਿਊਲਿਪਾਂ ਵਿਚਕਾਰ ਬਸੰਤ',a3d:'ਬਾਗ਼ਾਂ ਵਿੱਚ ਇੱਕ ਚਮਕਦੀ ਦੁਪਹਿਰ, ਚਿੱਟੇ ਅਤੇ ਕਰੀਮ ਰੰਗ ਦੇ ਕੱਪੜਿਆਂ ਵਿੱਚ।',a3c1:'ਵਿਲੋ ਹੇਠ, ਹੱਥ ਵਿੱਚ ਜੁੱਤੀਆਂ',a3c2:'ਪੂਰੇ ਖਿੜਾਅ ਵਿੱਚ',
 a4k:'Bowen Lookout ’ਤੇ ਉਸ ਨੇ ਹਾਂ ਕਹੀ',a4d:'ਮੈਂ ਨੇੜੇ ਹੀ ਲੁਕਿਆ ਰਿਹਾ, ਇਸ ਲਈ Hannah ਨੇ ਹਾਂ ਕਹਿਣ ਤੱਕ ਕੈਮਰਾ ਨਹੀਂ ਦੇਖਿਆ।',a4c1:'ਸਵਾਲ',a4c2:'ਹੁਣੇ-ਹੁਣੇ ਮੰਗਣੀ ਹੋਈ',
 a5k:'ਦੋ ਜਣਿਆਂ ਦੀ ਸ਼ਾਂਤ ਸੈਰ',a5d:'ਨਾ ਕੋਈ ਕਾਹਲੀ, ਨਾ ਪੋਜ਼, ਬੱਸ ਬਾਹਰ ਇਕੱਠੇ ਬਿਤਾਇਆ ਸਮਾਂ।',a5c1:'ਵਿਲੋ ਦੇ ਕੋਲ',a5c2:'ਇਕੱਠੇ'}
};
var t=T[lang]||T.en,pre=lang==='en'?'':'/'+lang;
var ALB=[
 {names:'Chris & Lorena',eb:t.wed,kind:t.a1k,d:t.a1d,cover:'cl-wedding-cover',pages:[['full','cl-wedding-veil'],['full','cl-wedding-bride'],['mat','cl-wedding-walk',t.a1c1],['full','cl-wedding-vows'],['duo',['cl-wedding-rings','cl-wedding-path'],t.a1c2],['full','cl-wedding-portrait'],['mat','cl-wedding-kiss',t.a1c3],['duo',['cl-wedding-dip','cl-wedding-bench'],t.a1c4],['mat','cl-wedding-cake',t.a1c5],['mat','cl-wedding-dance',t.a1c6]]},
 {names:'Jake & Hannah',eb:t.prop,kind:t.a4k,d:t.a4d,cover:'jh-cover',pages:[['full','jh-kiss'],['mat','jh-lookout',t.a4c1],['full','jh-gaze'],['mat','jh-engaged',t.a4c2]]},
 {names:'Shaun & Tina',eb:t.eng,kind:t.a3k,d:t.a3d,cover:'st-cover',pages:[['full','st-03'],['mat','st-08'],['full','st-02'],['mat','st-07',t.a3c1],['mat','st-01'],['mat','st-04'],['mat','st-10',t.a3c2],['mat','st-bench']]},
 {names:'Jenn & Erin',eb:t.eng,kind:t.a5k,d:t.a5d,cover:'je-cover',pages:[['mat','je-1',t.a5c1],['mat','je-s4'],['duo',['je-2','je-3']],['mat','je-7',t.a5c2]]},
 {names:'Chris & Lorena',eb:t.eng,kind:t.a2k,d:t.a2d,cover:'cl-engagement-beach',pages:[['full','cl-engagement-embrace'],['mat','cl-engagement-walk',t.a2c1],['full','cl-engagement-hands'],['mat','cl-engagement-cover',t.a2c2],['mat','cl-engagement-silhouette',t.a2c3],['duo',['cl-engagement-shore','cl-engagement-seawall'],t.a2c4]]}
];
var url=function(n){return '/images/alb-'+n+'.jpg?v='+V};
var OPEN=({en:['Open this album','Previous album','Next album'],fr:['Ouvrir cet album','Album précédent','Album suivant'],es:['Abrir este álbum','Álbum anterior','Álbum siguiente'],zh:['打开这本相册','上一本相册','下一本相册'],pa:['ਇਹ ਐਲਬਮ ਖੋਲ੍ਹੋ','ਪਿਛਲੀ ਐਲਬਮ','ਅਗਲੀ ਐਲਬਮ']})[lang]||['Open this album','Previous album','Next album'];
if(!document.querySelector('link[data-alb-font]')){var lf=document.createElement('link');lf.rel='stylesheet';lf.setAttribute('data-alb-font','');lf.href='https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap';document.head.appendChild(lf);}
root.className='alb'+(lang==='zh'||lang==='pa'?' plain':'');root.tabIndex=0;root.style.setProperty('--script',lang==='zh'||lang==='pa'?'var(--serif)':'"Pinyon Script","Snell Roundhand",var(--serif)');
root.innerHTML='<div class="alb-show" role="region" aria-roledescription="carousel" aria-label="'+t.eb+'"><div class="as-bg"><img alt="" data-nowm><img alt="" data-nowm></div><div class="as-head"><span class="eb">'+t.eb+'</span><h2>'+t.h+'</h2></div><div class="as-track">'+ALB.map(function(a,i){return '<button type="button" class="as-card" data-i="'+i+'" aria-label="'+a.names+' – '+a.eb+'"><span class="as-ph"><img src="'+url(a.cover)+'" alt="" loading="'+(i<3?'eager':'lazy')+'" decoding="async" data-nowm></span><span class="nm">'+a.names+'</span><span class="kd">'+a.eb+'</span><span class="as-open">'+OPEN[0]+' <i aria-hidden="true">&rarr;</i></span><span class="as-prog"><i></i></span></button>'}).join('')+'</div><button type="button" class="as-nav as-pv" aria-label="'+OPEN[1]+'">&#8249;</button><button type="button" class="as-nav as-nx" aria-label="'+OPEN[2]+'">&#8250;</button><div class="as-dots">'+ALB.map(function(a,i){return '<button type="button" data-i="'+i+'" aria-label="'+a.names+' – '+a.eb+'"></button>'}).join('')+'</div></div><div class="alb-stage"><div class="alb-book"></div></div><div class="alb-ctrl"><button type="button" class="pv" aria-label="'+t.prev+'">&#8249;</button><span class="count" aria-live="polite"></span><button type="button" class="nx" aria-label="'+t.next+'">&#8250;</button></div><p class="alb-hint">'+t.hint+'</p>';
var book=root.querySelector('.alb-book'),stage=root.querySelector('.alb-stage'),cnt=root.querySelector('.count'),bPrev=root.querySelector('.pv'),bNext=root.querySelector('.nx');
var P=[],N=0,W=0,H=0,mode='',pos=0,busy=false,turn=null,cur=0;
function setAlbum(i){cur=i;var a=ALB[i];P=[{t:'cover',a:a},{t:'chap',a:a}];a.pages.forEach(function(p){P.push({t:p[0],img:p[1],cap:p[2]})});P.push({t:'cta'});P.push({t:'backc',a:a});N=P.length;pos=0;
  mode='';build();}
function ph(n,w,h){var s=(w&&h)?' style="width:'+w+'px;height:'+h+'px"':'';return '<span class="ph"'+s+'><img src="'+url(n)+'" alt="" draggable="false" decoding="sync"><span class="wmk" aria-hidden="true"></span></span>'}
function fit(n,bw,bh){var r=SZ[n][0]/SZ[n][1],w=bw,h=w/r;if(h>bh){h=bh;w=h*r}return [Math.round(w),Math.round(h)]}
function pageHTML(i,side){
  if(i<0||i>=N)return '';
  var p=P[i],cls=side||((i%2===0)?'R':'L'),fol=(i>0&&i<N-1)?'<span class="folio">'+('0'+i).slice(-2)+'</span>':'',inner='',f,a,b;
  if(p.t==='cover'){f=fit(p.a.cover,W*0.76,H*0.5);inner='<div class="gframe"></div>'+ph(p.a.cover,f[0],f[1])+'<div class="our">'+p.a.eb+'</div><div class="title">'+p.a.names+'</div><div class="kd">'+p.a.kind+'</div><div class="meta">Joenell Photography</div>'}
  else if(p.t==='backc')inner='<div class="gframe"></div><div class="title">'+t.thanks+'</div><div class="meta">joenellphotography.ca</div>';
  else if(p.t==='full')inner=ph(p.img)+(p.cap?'<div class="cap">'+p.cap+'</div>':'');
  else if(p.t==='mat'){f=fit(p.img,W*0.84,H*(p.cap?0.72:0.8));inner=ph(p.img,f[0],f[1])+(p.cap?'<div class="cap">'+p.cap+'</div>':'')+fol}
  else if(p.t==='duo'){a=fit(p.img[0],W*0.8,H*0.37);b=fit(p.img[1],W*0.8,H*0.37);inner=ph(p.img[0],a[0],a[1])+ph(p.img[1],b[0],b[1])+(p.cap?'<div class="cap">'+p.cap+'</div>':'')+fol}
  else if(p.t==='chap')inner='<div class="gframe"></div><p class="eb">'+p.a.eb+'</p><div class="names">'+p.a.names+'</div><p class="kind">'+p.a.kind+'</p><div class="rule"></div><p class="d">'+p.a.d+'</p><p class="how">'+t.how+'</p>'+fol;
  else inner='<div class="gframe"></div><p class="eb">'+t.ceb+'</p><h3>'+t.ch+'</h3><div class="rule"></div><p class="d">'+t.cp+'</p><p class="d">wedding@joenellphotography.ca<br>(236) 234-1041</p><a href="'+pre+'/contact#enquire">'+t.cb+'</a>'+fol;
  return '<div class="pg '+p.t+' '+cls+'">'+inner+'</div>';
}
function maxPos(){return mode==='spread'?N/2:N-1}
function build(){
  var vw=stage.clientWidth,vh=window.innerHeight,m=vw>=760?'spread':'single';
  if(mode&&m!==mode){pos=m==='spread'?Math.ceil(pos/2):Math.max(0,pos*2-1)}
  mode=m;var maxH=Math.max(380,vh-190);
  W=Math.floor(m==='spread'?Math.min(500,(vw-20)/2,maxH*0.8):Math.min(480,vw,maxH*0.8));H=Math.round(W*1.25);
  pos=Math.min(pos,maxPos());
  stage.className='alb-stage '+m;book.className='alb-book '+m;book.style.cssText='width:'+(m==='spread'?2*W:W)+'px;height:'+H+'px;--u:'+(W/100)+'px';
  book.innerHTML='<div class="bookshadow"></div><div class="slot l"></div><div class="slot r"></div>'+(m==='spread'?'<div class="spine"></div>':'')+'<div class="corner l"></div><div class="corner r"></div>';
  [].forEach.call(book.querySelectorAll('.slot'),function(s){s.style.width=W+'px';s.style.height=H+'px'});
  book.querySelector('.slot.r').style.left=(m==='spread'?W:0)+'px';if(m==='single')book.querySelector('.slot.l').remove();
  if(m==='spread')book.querySelector('.spine').style.left=W+'px';
  rest();
}
function preload(){var a=mode==='spread'?2*pos+1:pos+1,b=a+(mode==='spread'?4:2);for(var i=a;i<b&&i<N;i++){var p=P[i];if(!p||!p.img)continue;[].concat(p.img).forEach(function(n){var im=new Image();im.src=url(n)})}}
function rest(){
  var L=book.querySelector('.slot.l'),R=book.querySelector('.slot.r'),sh=book.querySelector('.bookshadow');
  if(mode==='spread'){L.innerHTML=pageHTML(2*pos-1);R.innerHTML=pageHTML(2*pos);
    var x=pos===0?-W/2:pos===N/2?W/2:0;book.style.transform='translateX('+x+'px)';sh.style.left=pos===0?W+'px':'0';sh.style.right=pos===N/2?W+'px':'0';
    book.querySelector('.spine').style.opacity=(pos===0||pos===N/2)?0:1;}
  else{R.innerHTML=pageHTML(pos,'R');book.style.transform='';}
  bPrev.disabled=pos===0;bNext.disabled=pos===maxPos();
  if(mode==='spread')cnt.textContent=pos===0?t.cover:pos===N/2?t.back:t.pages.replace('{a}',2*pos-1).replace('{b}',2*pos);
  else cnt.textContent=pos===0?t.cover:pos===N-1?t.back:t.page.replace('{a}',pos).replace('{b}',N-2);
  preload();
}
function clipPoly(poly,M,n,keepPos){var out=[];for(var i=0;i<poly.length;i++){var a=poly[i],b=poly[(i+1)%poly.length],da=(a[0]-M[0])*n[0]+(a[1]-M[1])*n[1],db=(b[0]-M[0])*n[0]+(b[1]-M[1])*n[1],ia=keepPos?da>=0:da<=0,ib=keepPos?db>=0:db<=0;if(ia)out.push(a);if(ia!==ib){var k=da/(da-db);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]);}}return out}
function polyCSS(p){return p.length?'polygon('+p.map(function(v){return v[0].toFixed(1)+'px '+v[1].toFixed(1)+'px'}).join(',')+')':'polygon(0 0,0 0,0 0)'}
function startTurn(dir){
  if(busy||turn)return null;if(dir>0&&pos>=maxPos())return null;if(dir<0&&pos<=0)return null;
  var o={dir:dir,side:'R',slotX:mode==='spread'?W:0,rev:false},L=book.querySelector('.slot.l'),R=book.querySelector('.slot.r'),front,back,sh=book.querySelector('.bookshadow');
  if(mode==='spread'){
    if(dir>0){front=pageHTML(2*pos);back=pageHTML(2*pos+1);R.innerHTML=pageHTML(2*pos+2);}
    else{o.side='L';o.slotX=0;front=pageHTML(2*pos-1);back=pageHTML(2*pos-2);L.innerHTML=pageHTML(2*pos-3);}
    sh.style.left='0';sh.style.right='0';
  }else{
    if(dir>0){front=pageHTML(pos,'R');back='<div class="blank"></div>';R.innerHTML=pageHTML(pos+1,'R');}
    else{o.rev=true;front=pageHTML(pos-1,'R');back='<div class="blank"></div>';}
  }
  var el=document.createElement('div');el.className='turn';el.style.cssText='left:'+o.slotX+'px;width:'+W+'px;height:'+H+'px';
  el.innerHTML='<div class="under"><i></i></div><div class="front">'+front+'</div><div class="flapw"><div class="flap" style="width:'+W+'px;height:'+H+'px">'+back+'<i></i></div></div>';
  book.appendChild(el);o.el=el;o.C=o.side==='R'?[W,H]:[0,H];o.S=o.side==='R'?[0,H]:[W,H];o.end=o.side==='R'?[-W,H]:[2*W,H];
  o.P=o.rev?o.end.slice():o.C.slice();turn=o;draw(o.P);return o;
}
function clampP(o,p){var x=p[0],y=p[1],S=o.S,dx=x-S[0],dy=y-S[1],d=Math.sqrt(dx*dx+dy*dy);if(d>W){x=S[0]+dx/d*W;y=S[1]+dy/d*W}
  var D=Math.sqrt(W*W+H*H);dx=x-S[0];dy=y;d=Math.sqrt(dx*dx+dy*dy);if(d>D){x=S[0]+dx/d*D;y=dy/d*D}return [x,y]}
function draw(p){
  var o=turn;if(!o)return;p=clampP(o,p);o.P=p;var C=o.C,el=o.el,front=el.querySelector('.front'),fw=el.querySelector('.flapw'),flap=el.querySelector('.flap'),under=el.querySelector('.under');
  var dx=C[0]-p[0],dy=C[1]-p[1],dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<1.5){front.style.clipPath='';front.style.webkitClipPath='';fw.style.display='none';under.style.display='none';return}
  fw.style.display='';under.style.display='';
  var n=[dx/dist,dy/dist],M=[(C[0]+p[0])/2,(C[1]+p[1])/2],rect=[[0,0],[W,0],[W,H],[0,H]],fp=clipPoly(rect,M,n,false),cp=clipPoly(rect,M,n,true);
  var c1=polyCSS(fp),c2=polyCSS(cp),c3=polyCSS(cp.map(function(v){return [W-v[0],v[1]]}));
  front.style.clipPath=c1;front.style.webkitClipPath=c1;under.style.clipPath=c2;under.style.webkitClipPath=c2;flap.style.clipPath=c3;flap.style.webkitClipPath=c3;
  var a=-(1-2*n[0]*n[0]),c=-2*n[0]*n[1],b=2*n[0]*n[1],d=1-2*n[1]*n[1],mn=M[0]*n[0]+M[1]*n[1],e=(1-2*n[0]*n[0])*W+2*mn*n[0],f=-2*n[0]*n[1]*W+2*mn*n[1];
  fw.style.transform='matrix('+a+','+b+','+c+','+d+','+e+','+f+')';
  var us=under.firstElementChild,th=Math.atan2(-n[0],n[1]);us.style.height=Math.min(150,dist*0.55)+'px';
  us.style.transform='translate('+M[0]+'px,'+M[1]+'px) rotate('+th+'rad) translate(-1500px,0)';
  var fs=flap.lastElementChild,th2=Math.atan2(n[0],n[1]);fs.style.height=(dist/2+2)+'px';
  fs.style.transform='translate('+(W-M[0])+'px,'+M[1]+'px) rotate('+th2+'rad) translate(-1500px,0)';
}
function finish(o,complete){
  busy=true;var from=o.P.slice(),to=complete?(o.rev?o.C:o.end):(o.rev?o.end:o.C),t0=performance.now(),span=Math.abs(to[0]-from[0])/(2*W),dur=Math.max(220,560*span);
  (function step(now){var k=Math.min(1,(now-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    draw([from[0]+(to[0]-from[0])*e,from[1]+(to[1]-from[1])*e-Math.sin(Math.PI*e)*H*0.10*span]);
    if(k<1)requestAnimationFrame(step);else{if(complete)pos+=o.dir;o.el.remove();turn=null;busy=false;rest();}
  })(t0);
}
function go(dir){var o=startTurn(dir);if(o)finish(o,true)}
var drag=null;
function local(e){var r=book.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
function toP(o,q){var x=q[0]-o.slotX,y=q[1];if(o.rev)x=2*x-W;return [x,Math.min(y,H+40)]}
book.addEventListener('pointerdown',function(e){
  if(busy||turn||e.target.closest('a')||(e.pointerType==='mouse'&&e.button!==0))return;var q=local(e),bw=mode==='spread'?2*W:W,dir=0;
  if(q[0]>bw-W*0.42)dir=1;else if(q[0]<W*0.42)dir=-1;if(!dir)return;
  if(mode==='spread'){if(dir>0&&pos===N/2)return;if(dir<0&&pos===0)return;}
  var o=startTurn(dir);if(!o)return;drag={o:o,x0:e.clientX,y0:e.clientY,moved:false};try{book.setPointerCapture(e.pointerId)}catch(_){}
  draw(toP(o,q));e.preventDefault();
});
book.addEventListener('pointermove',function(e){if(!drag)return;if(Math.abs(e.clientX-drag.x0)+Math.abs(e.clientY-drag.y0)>6)drag.moved=true;draw(toP(drag.o,local(e)));});
function endDrag(cancel){if(!drag)return;var o=drag.o,moved=drag.moved;drag=null;var pr=Math.sqrt(Math.pow(o.P[0]-o.C[0],2)+Math.pow(o.P[1]-o.C[1],2))/(2*W),complete;
  if(cancel)complete=false;else if(!moved)complete=true;else complete=o.rev?pr<0.7:pr>0.3;finish(o,complete);}
book.addEventListener('pointerup',function(){endDrag(false)});book.addEventListener('pointercancel',function(){endDrag(true)});
book.addEventListener('touchmove',function(e){if(drag)e.preventDefault()},{passive:false});
book.addEventListener('contextmenu',function(e){e.preventDefault()});
bPrev.addEventListener('click',function(){go(-1)});bNext.addEventListener('click',function(){go(1)});
root.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(1);e.preventDefault()}if(e.key==='ArrowLeft'){go(-1);e.preventDefault()}});
(function(){
var sh=root.querySelector('.alb-show'),cards=[].slice.call(sh.querySelectorAll('.as-card')),dots=[].slice.call(sh.querySelectorAll('.as-dots button')),bg=[].slice.call(sh.querySelectorAll('.as-bg img')),n=cards.length,act=0,tm=null,hold=false,seen=false,opened=false,bgi=0,DUR=4600;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function sbw(){sh.style.setProperty('--sbw',(window.innerWidth-document.documentElement.clientWidth)+'px')}
function lay(){cards.forEach(function(c,i){var o=((i-act)%n+n)%n;if(o>n/2)o-=n;var a=Math.abs(o);c.style.setProperty('--off',o);c.style.setProperty('--s',a===0?1:a===1?.74:.56);c.style.setProperty('--o',a===0?1:a===1?.62:.22);c.style.zIndex=10-a;c.classList.toggle('on',a===0);c.setAttribute('aria-current',a===0?'true':'false');c.tabIndex=a===0?0:-1});
  dots.forEach(function(d,i){d.setAttribute('aria-current',i===act?'true':'false')});
  var nb=bg[bgi^1],ob=bg[bgi],done=false;nb.onload=function(){if(done)return;done=true;nb.onload=null;nb.classList.add('on');ob.classList.remove('on');bgi=bg.indexOf(nb)};nb.src=url(ALB[act].cover);if(nb.complete&&nb.naturalWidth)nb.onload();
  sh.classList.remove('run');void sh.offsetWidth;if(!RM&&!hold&&seen&&!opened)sh.classList.add('run');}
function go(i){act=(i+n)%n;lay();}
function next(){if(RM){go(act+1);return}sh.classList.add('fading');setTimeout(function(){sh.classList.remove('fading');go(act+1)},520)}
function play(){clearInterval(tm);if(RM||hold||!seen||opened)return;tm=setInterval(next,DUR);sh.classList.add('run')}
function stop(){clearInterval(tm);sh.classList.remove('run')}
function open(i){opened=true;stop();if(busy||turn)return;setAlbum(i);var top=stage.getBoundingClientRect().top+window.pageYOffset-96;window.scrollTo({top:top,behavior:RM?'auto':'smooth'});}
cards.forEach(function(c,i){c.addEventListener('click',function(){if(i===act)open(i);else{go(i);play();}})});
dots.forEach(function(d,i){d.addEventListener('click',function(){go(i);play()})});
sh.querySelector('.as-pv').addEventListener('click',function(){go(act-1);play()});sh.querySelector('.as-nx').addEventListener('click',function(){go(act+1);play()});
sh.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){hold=true;stop()}});sh.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){hold=false;play()}});
sh.addEventListener('focusin',function(){hold=true;stop()});sh.addEventListener('focusout',function(){hold=false;play()});
var sx=null;sh.addEventListener('pointerdown',function(e){sx=e.clientX});sh.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>45){go(act+(dx<0?1:-1));play();}});
sh.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(act+1);e.preventDefault();e.stopPropagation()}if(e.key==='ArrowLeft'){go(act-1);e.preventDefault();e.stopPropagation()}});
if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(en){seen=en.isIntersecting&&en.intersectionRatio>0.35;if(seen)play();else stop();})},{threshold:[0,0.35,0.6]}).observe(sh);}else{seen=true}
sbw();window.addEventListener('resize',sbw);lay();play();
})();
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(!turn&&!busy)build()},160);});
setAlbum(0);
var peeled=false;function peel(){if(peeled||busy||turn||pos!==0||(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches))return;peeled=true;var o=startTurn(1);if(!o)return;busy=true;var t0=performance.now();
  (function s(now){var k=Math.min(1,(now-t0)/1400),a=Math.sin(Math.PI*k);draw([o.C[0]-a*W*0.34,o.C[1]-a*H*0.17]);if(k<1)requestAnimationFrame(s);else{o.el.remove();turn=null;busy=false;rest();}})(t0);}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting&&en.intersectionRatio>0.6){setTimeout(peel,500);io.disconnect();}})},{threshold:[0.6]});io.observe(stage);}
})();
