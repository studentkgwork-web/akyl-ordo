/* АКЫЛ-ОРДО: бардык барактардын логикасы. Демо маалыматтар localStorage ичинде сакталат. */
(() => {
  "use strict";
  const DB_KEY = "akylOrdoDB_v1";
  const SESSION_KEY = "akylOrdoSession_v1";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const uid = () => "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const seed = {
    users:[{id:"admin-seed",name:"Администратор",email:"admin@akylordo.kg",password:"Ordo2026!",role:"admin"}],
    categories:["Кыргыз тарыхы","Дүйнө тарыхы","География","Илим жана техника","Адабият","Логика","Маданият"],
    questions:[
      {id:"q1",text:"Кыргызстандын эгемендүүлүгү кайсы жылы жарыяланган?",answer:"1991-жылы, 31-августта.",level:"Оңой",category:"Кыргыз тарыхы",type:"question"},
      {id:"q2",text:"Кыргызстандын эң бийик чокусу кайсы?",answer:"Жеңиш чокусу (7439 м).",level:"Орто",category:"География",type:"question"},
      {id:"q3",text:"«Манас» эпосунун башкы каарманы ким?",answer:"Манас баатыр.",level:"Оңой",category:"Адабият",type:"question"},
      {id:"q4",text:"Кайсы планетанын табигый жандоочулары эң көп деп белгилүү?",answer:"Бул көрсөткүч жаңы ачылыштарга жараша өзгөрөт; учурда Сатурн алдыңкы орунда.",level:"Кыйын",category:"Илим жана техника",type:"question"},
      {id:"q5",text:"Өзү жок, көлөкөсү бар. Бул эмне?",answer:"Тоо.",level:"Орто",category:"Логика",type:"riddle"},
      {id:"q6",text:"Кыргыз алфавитинде «Ң» тамгасынан кийин кайсы тамга келет?",answer:"О тамгасы.",level:"Эксперт",category:"Маданият",type:"question"}
    ],
    news:[
      {id:"n1",title:"Акыл-Ордо платформасы ишке кирди",body:"Интеллектуалдык оюндарды уюштуруу, суроолорду топтоо жана командалардын жыйынтыгын сактоо үчүн жаңы платформа даярдалды.",date:new Date().toISOString(),image:""},
      {id:"n2",title:"Жаңы суроолор базасы толукталууда",body:"Ар түрдүү деңгээлдеги суроолор жана логикалык тапшырмалар этап-этабы менен кошулат.",date:new Date(Date.now()-86400000*2).toISOString(),image:""}
    ],
    resources:[
      {id:"r1",title:"Кыргызстандын тарыхы",description:"Кыргыз элинин тарыхы боюнча окуу материалдары.",type:"Китеп",url:""},
      {id:"r2",title:"Логикалык ой жүгүртүү",description:"Логикалык тапшырмаларды чечүүгө арналган материал.",type:"Макала",url:""},
      {id:"r3",title:"Дүйнө географиясы",description:"Өлкөлөр, борборлор жана географиялык объекттер.",type:"Китеп",url:""}
    ],
    teams:[],scores:[],history:[],events:[],chats:[],chatReports:[],kahootSessions:[],achievements:[],mutedUsers:[]
  };
  function loadDB(){
    try { const raw=localStorage.getItem(DB_KEY); if(!raw){localStorage.setItem(DB_KEY,JSON.stringify(seed));return structuredClone(seed);}
      const db=JSON.parse(raw); return {...structuredClone(seed),...db};
    } catch(e){localStorage.setItem(DB_KEY,JSON.stringify(seed));return structuredClone(seed);}
  }
  let db=loadDB();
  ["chats","chatReports","kahootSessions","achievements","mutedUsers","questionComments","eventComments","teamApplications"].forEach(k=>{if(!Array.isArray(db[k]))db[k]=[];});
  db.teams.forEach(t=>{if(!Array.isArray(t.players))t.players=[];if(!t.mode)t.mode="offline";});
  db.users.forEach(u=>{if(typeof u.avatar!=="string")u.avatar="";if(!u.bio)u.bio="";if(!Array.isArray(u.scoreHistory))u.scoreHistory=[];if(!Array.isArray(u.answeredQuestionIds))u.answeredQuestionIds=[];});
  const akylOrdoPack = [
    {number:1,text:"Анын үч көзү бар, бирок башы жок. Бир буту бар, бирок баса албайт. Ал дайыма жыпылыктап турат, бирок эч качан сүйлөбөйт. Ал эмне?",answer:"Светофор",level:"Оңой",category:"1-баскыч",type:"question",id:"akyl-pack-01"},
    {number:2,text:"Бул жапон сөзү болуп, Чыгыш Азиядагы сериалдарды ушундай деп атайбыз. Бул эмне?",answer:"Дорама",level:"Оңой",category:"1-баскыч",type:"question",id:"akyl-pack-02"},
    {number:3,text:"АЛАР планетада бизден бир-эки миллион жыл мурда жашаган. Алардын бир гана максаты бар — эң жаман адамга кызмат кылуу. Алар 2010-жылы чыккан бир мультфильмде биринчи жолу экранга чыгышкан. АЛАР кимдер?",answer:"Миньондор",level:"Оңой",category:"1-баскыч",type:"question",id:"akyl-pack-03"},
    {number:4,text:"Бул нейромедиатор мээде «бакыт гормону» деп аталат жана ырахат алууга жооптуу. Ал эмне?",answer:"Дофамин",level:"Оңой",category:"1-баскыч",type:"question",id:"akyl-pack-04"},
    {number:5,text:"Энрик таттууларды жегенде колун шире кылып, бул үчүн апасынан көп уруш уккан. Ал Жирона шаарына Сальвадор Дали менен жолугуу үчүн да барган. 1950-жылы Энрик кайсы брендди негиздеген?",answer:"Чупа-Чупс",level:"Оңой",category:"1-баскыч",type:"question",id:"akyl-pack-05"},
    {number:6,text:"Америкалыктар Линкольн абдан көрксүз болсо да, бир жерде Авраам абдан сулуу көрүнөт деп тамашалашат. Линкольн кайсы жерде сулуу көрүнөт?",answer:"5 долларлык банкнотто",level:"Оңой",category:"1-баскыч",type:"question",id:"akyl-pack-06"},
    {number:7,text:"Дүйнөдөгү эң акылдуу кыздарды Американын Гарвард университетинде, Япониянын, Англиянын Оксфорд университетинде жана …… учуратышыбыз мүмкүн. Бош чекитти толтуруңуз.",answer:"ОшКУУда",level:"Оңой",category:"1-баскыч",type:"question",id:"akyl-pack-07"},
    {number:8,text:"Япондордо «МАХОБИН» деген сөз бар. «Махо» — сыйкырдуу, «бин» — бөтөлкө дегенди билдирет. «Махобин» деген эмне?",answer:"Термос",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-08"},
    {number:9,text:"БУЛ компания башында таштанды челек, калькулятор, муздаткыч, кондиционер жана кир жуугуч машиналарды чыгарган. Сөз кайсы компания жөнүндө?",answer:"Samsung",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-09"},
    {number:10,text:"2018-жылы Sky Lee тарабынан негизделген кытайлык компания. 2021-жылы бул бренд дүйнөдөгү эң тез өнүккөн бренд болуп, дүйнөлүк смартфон базарынын тарыхындагы эң ылдам 100 миллион смартфон сатууга жеткен. Сөз кайсы бренд жөнүндө?",answer:"realme",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-10"},
    {number:11,text:"Жапония өлкөсүнө америкалыктарга чейин голландиялыктар кызыгышкан. Алар ачытылган ИКСтен жасалган соустун жайылышына жардам беришкен. Натыйжада Жапониядан бизге кайсы сөз кирип келген?",answer:"Соя",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-11"},
    {number:12,text:"Алгачкы варианттарында бул каармандын мурду кызыл, тиштери жок, таштанды челектин ичинде жашаган деп сүрөттөлгөн, бирок кийинчерээк бул көрүнүш өзгөртүлгөн жана каарман жашыл түстө чагылдырылган. Сөз кайсы каарман жөнүндө?",answer:"Шрек",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-12"},
    {number:13,text:"2001-жылы эң мыкты анимациялык фильм үчүн «Оскар» сыйлыгы биринчи жолу кайсы мультфильмге берилген?",answer:"Шрек",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-13"},
    {number:14,text:"Мультфильмдердин биринде бир каарман АГА баш кийим кийгизип койгондо, АЛ өчөт жана баш кийим кийгизген каарман уйкуга кетет. АЛ дегенде эмнени назарга тутуп жатканыбызды жазып бериңиздер.",answer:"Шам",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-14"},
    {number:15,text:"Жакында Кытайдын Wuling автоөндүрүү компаниясы электромобилдер үчүн дөңгөлөктүү ИКСти иштеп чыгууну пландаган. ИКСтер электромобилдердин жолдо токтоп калбашын камсыздайт. ИКСти кыргызча эмес, бир сөз менен жазыңыз.",answer:"Повербанк",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-15"},
    {number:16,text:"АКШда белгилүү бир сөз бар: өлүмдөн жана дагы бир нерседен качып кутулуу мүмкүн эмес. Америкада эмнеден качып кутулуу мүмкүн эмес?",answer:"Салыктан",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-16"},
    {number:17,text:"Стюардессалар жумушка кабыл алынышы үчүн сөзсүз түрдө белгилүү бир тармактын диплому болушу керек экен. Кайсы тармактын диплому?",answer:"Медайымдык диплом",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-17"},
    {number:18,text:"Бир белгилүү америкалык учкуч: «Учакты оптимисттер ойлоп табышкан, ал эми пессимисттер аны…» деген. Пессимисттер эмнени ойлоп табышкан?",answer:"Парашютту",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-18"},
    {number:19,text:"1987-жылы америкалык таланттуу тиш доктору Вильям Моррис «пахтанын» ушул түрүн ойлоп табат. Кандай «пахтанын»?",answer:"Пахтаканд",level:"Орто",category:"2-баскыч",type:"question",id:"akyl-pack-19"},
    {number:20,text:"Улантабыз. 1818-жылы британиялыктар АНЫ биринчи жолу колдонгон. Натыйжада тиштердин жана манжалардын сынып калуусу бир топ кыскарган. АНЫ эки сөз менен жазыңыз.",answer:"Бокс перчатки",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-20"},
    {number:21,text:"«Кичинекей аялдар» тасмасынын каармандарынын бири Джо Марч эжелеринен акылдуу болгон, ал китеп окуганды жана жазганды жакшы көрчү, турмушка чыгууну жактырчу эмес. БУЛ мультфильмдин жаратуучулары Джо Марчтын сырткы келбетинен жана мүнөзүнөн шыктанышкан. Кайсы мультфильм?",answer:"Сулуу жана жырткыч",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-21"},
    {number:22,text:"Журналисттердин пикири боюнча, интервью канчалык таасирдүү болушу АГА байланыштуу. АЛ жөнүндө сөз кеткенде саламдашуу, ийгилик каалоо жана старт тапанчасын эстейбиз. АНЫ эки сөз менен айтыңыз.",answer:"Биринчи суроо",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-22"},
    {number:23,text:"Стив Возняк биринчилерден болуп кооз ИКС сатып алган адамдардын бири. Бирок жаш балдардын билбестен, кокусунан жасаган иштери жана көп адашып алуучу адамдардын айынан Возняк ИКСтен тажайт. Арабызда да кооз ИКС ээлери көп эле болсо керек. ИКСтИН ордун эки сөз менен толтуруңуздар.",answer:"Телефон номери",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-23"},
    {number:24,text:"Көпчүлүк зоопарктарда «Дүйшөмбү синдрому» деп аталган шарттуу оору бар. Көңүл бургула, көптөгөн жаныбарларга дүйшөмбү синдрому кайдан келет?",answer:"Жекшембиден",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-24"},
    {number:25,text:"Байыркы грек спортчусу Луис Спирис чуркоо боюнча Олимпиада чемпиону болгон. Бирок эмнегедир ага алтын эмес, күмүш медаль беришкен. Эмне үчүн?",answer:"Анткени ошол мезгилде эң баалуу металл күмүш болгон",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-25"},
    {number:26,text:"Адамдын дене мүчөлөрүнүн бири ар бир 100 күндө жаңыланып турат. Ал кайсы мүчө?",answer:"Кирпик",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-26"},
    {number:27,text:"2011-жылдын июль айында Лондондун жана дүйнөнүн бир нече чоң шаарларынын көчөлөрүндө башына учтуу калпак кийип, колуна кичинекей жыгач таякчаларды кармаган адамдар массалык түрдө пайда боло баштаган. Муну көргөн полиция кызматкерлери жана коопсуздук кызматтары алгач чочулап, көзөмөлдү күчөтүшкөн. Бул адамдардын көчөгө мындай кийинип чыгуусуна эмне себеп болгон?",answer:"«Гарри Поттер» фильминин эң акыркы бөлүгүнүн дүйнөлүк премьерасы",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-27"},
    {number:28,text:"Бир тамашалуу макалада «Европада эң тез ашык болуп калуучу адамдар ушул шаарда жашашат» деп айтылат. Кайсы шаар?",answer:"Любляна",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-28"},
    {number:29,text:"Джеймс Гудфел «анын» ойлоп табуучусу болгондо, башында санын 10 кылууну каалаган. Бирок аялы 4төн ашык санды эстей албагандыктан, «анын» саны 4 болуп калып, бул эл аралык стандартка айланган. Ал эмне?",answer:"PIN-код",level:"Кыйын",category:"3-баскыч",type:"question",id:"akyl-pack-29"}
  ];
  // Берилген 29 суроону эски маалыматтарды өчүрбөстөн бир гана жолу кошобуз.
  db.categories = [...new Set([...(db.categories||[]), "1-баскыч", "2-баскыч", "3-баскыч"])];
  db.questions = db.questions || [];
  akylOrdoPack.forEach(q => { if (!db.questions.some(old => old.id === q.id)) db.questions.push(q); });
  save();
  if(!Array.isArray(db.events))db.events=[];
  db.users.forEach((u,i)=>{
    if(typeof u.points!=="number")u.points=0;
    if(!Array.isArray(u.answeredQuestionIds))u.answeredQuestionIds=[];
    if(!u.username){
      const base=String(u.email||("katyshuучу"+i)).split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,14)||"katyshuu";
      let candidate=base,suffix=1;
      while(db.users.some(v=>v!==u&&String(v.username||"").toLowerCase()===candidate.toLowerCase()))candidate=base+suffix++;
      u.username=candidate;
    }
    if(typeof u.bio!=="string")u.bio="";
  });
  function save(){localStorage.setItem(DB_KEY,JSON.stringify(db));}
  save(); // Эски аккаунттарга username жана bio талааларын кошуп сактоо.
  function currentUser(){
    try{const session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null");if(!session)return null;return db.users.find(u=>u.id===session.id)||session;}catch{return null;}
  }
  function toast(msg){const el=$("#toast");if(!el)return;el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2600);}
  function goLogin(){location.href="login.html";}
  function guard(){
    const page=document.body.dataset.page;
    if(page && page!=="login" && !currentUser()){goLogin();return false;}
    if(page==="admin" && currentUser()?.role!=="admin"){toast("Бул бөлүм администратор үчүн гана.");setTimeout(()=>location.href="index.html",800);return false;}
    return true;
  }
  function logout(){sessionStorage.removeItem(SESSION_KEY);goLogin();}
  function header(){
    const host=$("#appHeader");if(!host)return;
    const user=currentUser(), active=document.body.dataset.page;
    const links=[["index.html","Башкы бет","home"],["alphabet.html","Суроолор","alphabet"],["games.html","Оюндар","games"],["rating.html","Рейтинг","rating"],["library.html","Китепкана","library"],["news.html","Жаңылыктар","news"]];
    if(user?.role==="admin"){links.push(["kahoot.html","Kahoot","kahoot"]);links.push(["admin.html","Админ панель","admin"]);}
    const avatarMarkup=user?(user.avatar?`<img class="brand-avatar" src="${esc(user.avatar)}" alt="Профиль">`:`<span class="brand-mark">${esc((user.name||"К")[0].toUpperCase())}</span>`):`<span class="brand-mark">А</span>`;
    host.innerHTML=`<header class="site-header"><div class="header-inner"><a class="profile-shortcut" href="${user?"profile.html":"login.html"}" aria-label="Профилди ачуу">${avatarMarkup}</a><a class="brand" href="index.html" aria-label="Башкы бет"><span>АКЫЛ-ОРДО<small>Интеллектуалдык платформа</small></span></a><button class="menu-toggle" id="menuToggle" aria-label="Меню">☰</button><nav class="nav" id="mainNav">${links.map(([href,label,key])=>`<a class="${active===key?"active":""}" href="${href}">${label}</a>`).join("")}</nav><div class="user-area"><span>${esc(user?.name||"Колдонуучу")}</span><button class="link-btn" id="logoutBtn">Чыгуу</button></div></div></header>`;
    $("#menuToggle")?.addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
    $("#logoutBtn")?.addEventListener("click",logout);
  }
  function footer(){const f=$("#appFooter");if(f)f.innerHTML='<footer class="site-footer">© '+new Date().getFullYear()+' Акыл-Ордо · Билим — келечектин ачкычы</footer>';}
  function authPage(){
    const form=$("#authForm");if(!form)return;
    let mode="login";
    const switchBtn=$("#switchMode");
    function setMode(m){mode=m;$("#authTitle").textContent=m==="login"?"Аккаунтуңузга кириңиз":"Жаңы аккаунт түзүү";$("#authSubtitle").textContent=m==="login"?"Улантуу үчүн электрондук почтаңызды жана сырсөзүңүздү жазыңыз.":"Платформага кошулуу үчүн маалыматтарды толтуруңуз.";$("#nameField").classList.toggle("hidden",m==="login");$("#usernameField").classList.toggle("hidden",m==="login");$("#confirmField").classList.toggle("hidden",m==="login");$("#fullName").required=m==="register";$("#username").required=m==="register";$("#confirmPassword").required=m==="register";$("#authSubmit").textContent=m==="login"?"Кирүү":"Катталуу";$("#switchText").textContent=m==="login"?"Аккаунтуңуз жокпу?":"Аккаунтуңуз барбы?";switchBtn.textContent=m==="login"?"Катталуу":"Кирүү";}
    switchBtn.addEventListener("click",()=>setMode(mode==="login"?"register":"login"));
    $("#togglePassword").addEventListener("click",()=>{const p=$("#password");p.type=p.type==="password"?"text":"password";});
    form.addEventListener("submit",e=>{e.preventDefault();const email=$("#email").value.trim().toLowerCase(),password=$("#password").value;
      if(mode==="register"){const name=$("#fullName").value.trim(),username=$("#username").value.trim().replace(/^@/,"");if(!/^[A-Za-z0-9_]{3,20}$/.test(username)){toast("@username 3–20 белгиден турушу керек (A-Z, 0-9, _).");return;}if(db.users.some(u=>String(u.username||"").toLowerCase()===username.toLowerCase())){toast("Бул @username бош эмес. Башкасын тандаңыз.");return;}if(password!==$("#confirmPassword").value){toast("Сырсөздөр дал келген жок.");return;}if(db.users.some(u=>u.email===email)){toast("Бул почта мурда катталган.");return;}const user={id:uid(),name,email,username,bio:"",password,role:"user",points:0,answeredQuestionIds:[],scoreHistory:[]};db.users.push(user);save();sessionStorage.setItem(SESSION_KEY,JSON.stringify({id:user.id,name:user.name,role:user.role}));location.href="index.html";}
      else{const user=db.users.find(u=>u.email===email&&u.password===password);if(!user){toast("Почта же сырсөз туура эмес.");return;}sessionStorage.setItem(SESSION_KEY,JSON.stringify({id:user.id,name:user.name,role:user.role}));location.href="index.html";}
    });
    if(currentUser())location.href="index.html";
  }
  const kyrgyzOrder="АБВГДЕЁЖЗИЙКҢОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ";
  function kyrgyzSort(a,b){const x=(a.text||a.title||"").toLocaleUpperCase("ky"),y=(b.text||b.title||"").toLocaleUpperCase("ky");for(let i=0;i<Math.min(x.length,y.length);i++){const ax=kyrgyzOrder.indexOf(x[i]),by=kyrgyzOrder.indexOf(y[i]);const av=ax<0?1000+x.charCodeAt(i):ax,bv=by<0?1000+y.charCodeAt(i):by;if(av!==bv)return av-bv;}return x.length-y.length;}

  function renderThreadComments(rows, kind, targetId){
    const roots=rows.filter(c=>!c.parentId);
    return roots.slice(-8).map(c=>{
      const replies=rows.filter(r=>r.parentId===c.id);
      return `<div class="thread-comment"><p><b>${esc(c.name)}:</b> ${esc(c.text)}</p><button class="text-link" type="button" data-reply-${kind}="${esc(c.id)}">Жооп берүү</button><form class="thread-reply-form hidden" data-thread-reply="${kind}" data-parent="${esc(c.id)}" data-target="${esc(targetId)}"><input name="reply" maxlength="400" placeholder="Жооп жазыңыз..." required><button class="btn btn-outline btn-sm">Жөнөтүү</button></form>${replies.map(r=>`<div class="thread-reply"><p><b>${esc(r.name)}:</b> ${esc(r.text)}</p></div>`).join("")}</div>`;
    }).join("");
  }
  function questionCard(q){
    const user=currentUser(), done=!!user?.answeredQuestionIds?.includes(q.id);
    return `<article class="question-card"><div><div class="question-meta">${q.number?`<span class="tag">№${esc(q.number)}</span>`:""}<span class="tag">${esc(q.category)}</span><span class="tag ${q.level==="Кыйын"||q.level==="Эксперт"?"level-hard":q.level==="Оңой"?"level-easy":""}">${esc(q.level)}</span><span class="tag">${q.type==="riddle"?"Табышмак":q.type==="rebus"?"Ребус":"Суроо"}</span>${done?'<span class="tag level-easy">Жооп берилген</span>':''}</div><h3>${esc(q.text)}</h3></div><div class="question-play"><form class="answer-form" data-answer-form="${esc(q.id)}"><input name="userAnswer" required placeholder="Жообуңузду жазыңыз" ${done?'disabled':''}><button class="btn btn-primary btn-sm" type="submit" ${done?'disabled':''}>${done?'Аткарылды':'Текшерүү · +10'}</button></form><button class="answer-toggle" type="button" data-answer="${esc(q.id)}">Туура жоопту көрүү</button></div><div class="answer-area hidden" id="answer-${esc(q.id)}"><b>Туура жооп:</b> ${esc(q.answer)}</div>${q.fileData?`<div class="question-attachment"><a class="text-link" href="${q.fileData}" download="${esc(q.fileName||"тиркеме")}">📎 ${esc(q.fileName||"Тиркелген материал")}</a></div>`:""}<div class="question-discussion"><div class="discussion-title">💬 Пикирлер <span>${(db.questionComments||[]).filter(c=>c.questionId===q.id).length}</span></div><div class="discussion-comments">${renderThreadComments((db.questionComments||[]).filter(c=>c.questionId===q.id),"question",q.id)||'<small class="muted">Азырынча пикир жок. Биринчи болуп ой бөлүшүңүз.</small>'}</div><form class="inline-comment-form" data-question-comment="${esc(q.id)}"><input name="comment" maxlength="400" placeholder="Бул суроо боюнча пикириңиз..." required><button class="btn btn-outline btn-sm">Жарыялоо</button></form></div></article>`;
  }
  function initAlphabet(){
    const list=$("#questionList");if(!list)return;
    const cat=$("#categoryFilter");db.categories.forEach(c=>cat.insertAdjacentHTML("beforeend",`<option>${esc(c)}</option>`));
    function render(){const term=$("#questionSearch").value.toLocaleLowerCase("ky"),level=$("#levelFilter").value,category=cat.value,type=$("#typeFilter").value;
      const items=db.questions.filter(q=>(!term||(q.text+" "+q.answer+" "+q.category).toLocaleLowerCase("ky").includes(term))&&(!level||q.level===level)&&(!category||q.category===category)&&(!type||q.type===type)).sort((a,b)=>a.number&&b.number?a.number-b.number:a.number?-1:b.number?1:kyrgyzSort(a,b));
      $("#questionCount").textContent=items.length+" суроо";list.innerHTML=items.length?items.map(questionCard).join(""):'<div class="empty-state">Бул шарттарга туура келген суроо табылган жок.</div>';
    }
    ["questionSearch","levelFilter","categoryFilter","typeFilter"].forEach(id=>$("#"+id).addEventListener("input",render));
    list.addEventListener("submit",e=>{const form=e.target.closest("[data-question-comment]");if(!form)return;e.preventDefault();const user=currentUser();if(!user){toast("Пикир жазуу үчүн аккаунтка кириңиз.");return;}const text=form.elements.comment.value.trim();if(!text)return;db.questionComments.push({id:uid(),questionId:form.dataset.questionComment,userId:user.id,name:user.name||user.username,text,date:new Date().toISOString()});
    list.addEventListener("click",e=>{const b=e.target.closest("[data-reply-question]");if(b)b.parentElement.querySelector(".thread-reply-form")?.classList.toggle("hidden");});
    list.addEventListener("submit",e=>{const f=e.target.closest('[data-thread-reply="question"]');if(!f)return;e.preventDefault();const u=currentUser();db.questionComments.push({id:uid(),questionId:f.dataset.target,parentId:f.dataset.parent,userId:u.id,name:u.name||u.username,text:f.elements.reply.value.trim(),date:new Date().toISOString()});save();render();toast("Жообуңуз жарыяланды.");});save();render();toast("Пикириңиз жарыяланды.");});
    list.addEventListener("click",e=>{const btn=e.target.closest("[data-answer]");if(!btn)return;const area=$("#answer-"+btn.dataset.answer);area.classList.toggle("hidden");btn.textContent=area.classList.contains("hidden")?"Туура жоопту көрүү":"Жоопту жашыруу";});
    list.addEventListener("submit",e=>{
      const form=e.target.closest("[data-answer-form]");if(!form)return;e.preventDefault();
      const user=currentUser();if(!user){toast("Алгач аккаунтка кириңиз.");return;}
      const q=db.questions.find(x=>x.id===form.dataset.answerForm);if(!q)return;
      const input=form.querySelector('[name="userAnswer"]');
      const norm=v=>String(v||"").toLocaleLowerCase("ky")
        .replace(/ң/g,"н").replace(/ө/g,"о").replace(/ү/g,"у").replace(/ё/g,"е")
        .replace(/\([^)]*\)/g,"").replace(/[\s\p{P}\p{S}]/gu,"");
      const given=norm(input.value);
      const accepted=String(q.answer||"").split("|").flatMap(part=>[part,part.replace(/\([^)]*\)/g,"")]).map(norm).filter(Boolean);
      const aliases=(q.answerAliases||[]).map(norm).filter(Boolean);
      const correct=[...accepted,...aliases].some(a=>a===given);
      if(!correct){toast("Азырынча туура эмес. Кайра аракет кылып көр!");input.focus();return;}
      const dbUser=db.users.find(u=>u.id===user.id);if(!dbUser)return;
      if(!dbUser.answeredQuestionIds.includes(q.id)){dbUser.points=(dbUser.points||0)+10;dbUser.answeredQuestionIds.push(q.id);if(!Array.isArray(dbUser.scoreHistory))dbUser.scoreHistory=[];dbUser.scoreHistory.push({points:10,date:new Date().toISOString(),source:"question"});save();toast("Туура жооп! +10 упай 🎉");}
      else toast("Бул суроого мурда жооп бергенсиз.");
      render();
    });
    render();
  }
  function initHome(){
    const stats=[["#statQuestions",db.questions.length],["#statTeams",db.teams.length],["#statGames",db.history.length],["#statNews",db.news.length]];
    stats.forEach(([selector,value])=>{const el=$(selector);if(el)el.textContent=value;});
    const host=$("#homeNews");if(host){host.innerHTML=db.news.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3).map(newsCard).join("")||'<div class="empty-state">Азырынча жаңылык жок.</div>';}
  }
  function newsCard(n){return `<article class="news-card">${(n.imageData||n.image)?`<img class="news-cover" src="${n.imageData||esc(n.image)}" alt="">`:'<div class="news-cover">📢</div>'}<div class="news-content"><span class="news-date">${new Date(n.date).toLocaleDateString("ky-KG")}</span><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></div></article>`;}
  function initNews(){const host=$("#newsList");if(host)host.innerHTML=db.news.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(newsCard).join("")||'<div class="empty-state">Жаңылыктар азырынча кошула элек.</div>';}
  function initLibrary(){const host=$("#libraryList");if(!host)return;function render(){const term=$("#librarySearch").value.toLocaleLowerCase("ky"),type=$("#libraryType").value;const arr=db.resources.filter(r=>(!term||(r.title+" "+r.description).toLocaleLowerCase("ky").includes(term))&&(!type||r.type===type));host.innerHTML=arr.map(r=>`<article class="resource-card"><div class="resource-cover">${r.type==="Аудио"?"🎧":r.type==="Видео"?"▶️":r.type==="Макала"?"📝":"📘"}</div><div class="resource-content"><span class="tag">${esc(r.type)}</span><h3>${esc(r.title)}</h3><p>${esc(r.description||"")}</p>${r.fileData?`<a class="text-link" href="${r.fileData}" download="${esc(r.fileName||r.title)}">Файлды ачуу / жүктөө →</a>`:(r.url?`<a class="text-link" href="${esc(r.url)}" target="_blank" rel="noopener">Материалды ачуу →</a>`:"<span class='muted'>Файл же шилтеме кошула элек</span>")}</div></article>`).join("")||'<div class="empty-state">Материал табылган жок.</div>';}$("#librarySearch").addEventListener("input",render);$("#libraryType").addEventListener("change",render);render();}
  function teamTotalPoints(team){const live=db.scores.filter(x=>x.teamId===team.id).reduce((n,x)=>n+Number(x.points||0),0);const past=db.history.reduce((sum,g)=>sum+((g.results||[]).filter(r=>r.teamId===team.id||r.name===team.name).reduce((n,r)=>n+Number(r.points||0),0)),0);return live+past;}
  function renderTeams(){const list=$("#teamList"),sel=$("#scoreTeam");if(!list||!sel)return;list.innerHTML=db.teams.map(t=>`<div class="team-item team-item-expanded"><div><strong>👥 ${esc(t.name)}</strong><small class="muted">${t.mode==="online"?"Онлайн":"Оффлайн"} · ${(t.players||[]).length}/6 оюнчу · капитан: ${esc(t.captain||t.players?.[0]||"—")}</small><small>${(t.players||[]).map((name,i)=>(i+1)+". "+esc(name)).join(" · ")}</small>${t.code?`<small class="team-code">Команда коду: <b>${esc(t.code)}</b></small>`:""}</div>${currentUser()?.role==="admin"?`<button class="icon-btn" data-remove-team="${esc(t.id)}">Өчүрүү</button>`:""}</div>`).join("")||'<div class="muted">Команда азырынча жок.</div>';sel.innerHTML=db.teams.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("")||'<option value="">Адегенде команда кошуңуз</option>';renderScores();}
  function renderScores(){const body=$("#scoreTable");if(!body)return;const totals=db.teams.map(t=>({...t,points:teamTotalPoints(t)})).sort((a,b)=>b.points-a.points);body.innerHTML=totals.map((t,i)=>`<tr><td class="rank">${i+1}</td><td>${esc(t.name)}</td><td><b>${t.points}</b></td><td>${currentUser()?.role==="admin"?`<button class="icon-btn" data-remove-score="${esc(t.id)}">Упайларды тазалоо</button>`:"—"}</td></tr>`).join("")||'<tr><td colspan="4">Командалар жок.</td></tr>';}
  function renderHistory(){const h=$("#historyList");if(!h)return;h.innerHTML=db.history.slice().reverse().map(g=>`<div class="history-item"><div><strong>${esc(g.title)}</strong><span class="muted">${new Date(g.date).toLocaleString("ky-KG")}</span><div class="muted">${g.results.map(r=>esc(r.name)+" — "+r.points+" упай").join(" · ")}</div></div><span class="pill">${g.results[0]?esc(g.results[0].name):"Жыйынтык"}</span></div>`).join("")||'<div class="empty-state">Оюн тарыхы азырынча бош.</div>';}
  function initGames(){
    if(!$("#teamForm"))return;const isAdmin=currentUser()?.role==="admin";renderTeams();renderHistory();
    if(!isAdmin){$("#eventForm")?.closest(".panel")?.classList.add("hidden");$("#scoreForm")?.closest(".panel")?.classList.add("hidden");$("#pendingApplicationsPanel")?.classList.add("hidden");const modeSelect=$("#teamMode");if(modeSelect){modeSelect.innerHTML='<option value="online">Онлайн команда</option>';modeSelect.value="online";}const regPanel=$("#teamForm")?.closest(".panel");const liveOnline=db.events.some(g=>g.format==="Онлайн"&&g.status==="running");if(regPanel)regPanel.classList.add("hidden");const rosterPanel=$("#teamList")?.closest(".panel");if(rosterPanel)rosterPanel.classList.add("hidden");}
    const eventForm=$("#eventForm");
    function renderEventTeamOptions(){const select=$("#eventTeams");if(select)select.innerHTML=db.teams.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");}
    function renderEvents(){const host=$("#eventList");if(!host)return;host.innerHTML=db.events.slice().reverse().map(g=>`<article class="event-row"><div><strong>${esc(g.title)}</strong><p class="muted">${esc(g.format)} · ${new Date(g.date).toLocaleString("ky-KG")} · ${(g.teamIds||[]).length} команда</p></div><span class="pill">${g.status==="running"?"Өтүп жатат":g.status==="finished"?"Аяктады":"Пландалды"}</span>${!isAdmin&&g.format==="Онлайн"&&g.status==="running"?`<button class="btn btn-primary btn-sm" data-open-team-registration>Команда менен катталуу</button>`:""}<div class="event-public-discussion"><b>Пикирлер</b>${renderThreadComments((db.eventComments||[]).filter(c=>c.eventId===g.id),"event",g.id)}<form data-event-comment="${esc(g.id)}"><input name="comment" maxlength="400" placeholder="Оюн тууралуу пикириңиз..." required><button class="btn btn-outline btn-sm">Жазуу</button></form></div>${isAdmin?`<div class="event-actions">${g.status!=="finished"?`<button class="btn btn-primary btn-sm" data-start-event="${esc(g.id)}">${g.status==="running"?"Улантуу":"Оюнду баштоо"}</button><button class="btn btn-outline btn-sm" data-finish-event="${esc(g.id)}">Аяктоо</button>`:""}<button class="icon-btn" data-del-event="${esc(g.id)}">Өчүрүү</button></div>`:""}</article>`).join("")||'<div class="empty-state">Азырынча оюн уюштурула элек.</div>';}
    renderEventTeamOptions();renderEvents();
    function refreshPublicRegistration(){if(isAdmin)return;const regPanel=$("#teamForm")?.closest(".panel");if(regPanel)regPanel.classList.add("hidden");}
    refreshPublicRegistration();
    eventForm?.addEventListener("submit",e=>{e.preventDefault();if(!isAdmin){toast("Оюнду админ уюштурат.");return;}const title=$("#eventTitle").value.trim(),teamIds=[...$("#eventTeams").selectedOptions].map(o=>o.value);if(!title){toast("Оюндун аталышын жазыңыз.");return;}if(!teamIds.length){toast("Оюнга жок дегенде бир команда тандаңыз.");return;}const eventMode=$("#eventFormat").value;if(["Онлайн","Оффлайн"].includes(eventMode)){const wrong=teamIds.map(id=>db.teams.find(t=>t.id===id)).filter(t=>t&&t.mode!==(eventMode==="Онлайн"?"online":"offline"));if(wrong.length){toast(eventMode+" оюнга ошол форматтагы командаларды гана тандаңыз.");return;}}db.events.push({id:uid(),title,format:$("#eventFormat").value,date:$("#eventDate").value?new Date($("#eventDate").value).toISOString():new Date().toISOString(),teamIds,status:"planned"});save();eventForm.reset();renderEvents();toast("Оюн уюштурулду.");});
    function renderPendingApplications(){const host=$("#pendingApplications");if(!host)return;host.innerHTML=isAdmin?(db.teamApplications||[]).filter(a=>a.status==="pending").map(a=>`<article class="application-row"><div><b>${esc(a.name)}</b><p>${a.players.map(esc).join(" · ")}</p></div><button class="btn btn-primary btn-sm" data-approve-application="${esc(a.id)}">Бекитүү</button><button class="btn btn-outline btn-sm" data-reject-application="${esc(a.id)}">Четке кагуу</button></article>`).join("")||'<p class="muted">Жаңы арыз жок.</p>':"";}
    renderPendingApplications();
    $("#pendingApplications")?.addEventListener("click",e=>{const ok=e.target.closest("[data-approve-application]"),no=e.target.closest("[data-reject-application]");const a=db.teamApplications.find(x=>x.id===(ok?.dataset.approveApplication||no?.dataset.rejectApplication));if(!a)return;if(ok){db.teams.push({...a,id:uid(),code:String(Math.floor(100000+Math.random()*900000)),status:"approved"});a.status="approved";toast("Команда бекитилди.");}else{a.status="rejected";toast("Арыз четке кагылды.");}save();renderPendingApplications();renderTeams();renderEventTeamOptions();});
    $("#eventList")?.addEventListener("click",e=>{if(e.target.closest("[data-open-team-registration]")){$("#teamRegistrationPanel")?.classList.remove("hidden");$("#teamRegistrationPanel")?.scrollIntoView({behavior:"smooth",block:"start"});}});
    $("#eventList")?.addEventListener("submit",e=>{const f=e.target.closest("[data-event-comment]");if(!f)return;e.preventDefault();const u=currentUser();if(!u){toast("Пикир жазуу үчүн аккаунтка кириңиз.");return;}db.eventComments.push({id:uid(),eventId:f.dataset.eventComment,userId:u.id,name:u.name||u.username,text:f.elements.comment.value.trim(),date:new Date().toISOString()});
    $("#eventList")?.addEventListener("click",e=>{const b=e.target.closest("[data-reply-event]");if(b)b.parentElement.querySelector(".thread-reply-form")?.classList.toggle("hidden");});
    $("#eventList")?.addEventListener("submit",e=>{const f=e.target.closest('[data-thread-reply="event"]');if(!f)return;e.preventDefault();const u=currentUser();db.eventComments.push({id:uid(),eventId:f.dataset.target,parentId:f.dataset.parent,userId:u.id,name:u.name||u.username,text:f.elements.reply.value.trim(),date:new Date().toISOString()});save();renderEvents();toast("Жообуңуз жарыяланды.");});save();renderEvents();toast("Пикириңиз жарыяланды.");});
    $("#eventList")?.addEventListener("click",e=>{const start=e.target.closest("[data-start-event]"),finish=e.target.closest("[data-finish-event]"),del=e.target.closest("[data-del-event]");if(start){const g=db.events.find(x=>x.id===start.dataset.startEvent);if(g){g.status="running";save();renderEvents();refreshPublicRegistration();toast("Оюн башталды.");}}if(finish){const g=db.events.find(x=>x.id===finish.dataset.finishEvent);if(g){g.status="finished";g.finishedAt=new Date().toISOString();save();renderEvents();refreshPublicRegistration();toast("Оюн аяктады.");}}if(del){db.events=db.events.filter(x=>x.id!==del.dataset.delEvent);save();renderEvents();}});
    $("#teamForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#teamName").value.trim(),mode=$("#teamMode")?.value||"online",players=$("#teamPlayers")?.value.split("\n").map(x=>x.replace(/^\d+[.)]\s*/,"").trim()).filter(Boolean)||[];if(!name)return;if(mode==="offline"&&!isAdmin){toast("Оффлайн команданы админ гана каттайт.");return;}if(mode==="online"&&isAdmin===false&&db.teams.some(t=>t.mode==="online"&&t.players.some(p=>players.includes(p)))){toast("Бул оюнчулардын бири башка онлайн командада бар.");return;}if(players.length!==6){toast("Командада так 6 оюнчу болушу керек. Азыр: "+players.length);return;}if(new Set(players.map(x=>x.toLocaleLowerCase("ky"))).size!==6){toast("Бир оюнчунун аты эки жолу кайталанбашы керек.");return;}if(db.teams.some(t=>t.name.toLowerCase()===name.toLowerCase())){toast("Мындай команда бар.");return;}if(mode==="online"&&!isAdmin){db.teamApplications.push({id:uid(),name,mode,players,captain:players[0],status:"pending",createdAt:new Date().toISOString(),submittedBy:currentUser()?.id||""});save();$("#teamForm").reset();toast("Командага арыз админге жөнөтүлдү. Бекитилгенден кийин рейтингде көрүнөт.");renderPendingApplications();return;}const code=String(Math.floor(100000+Math.random()*900000));db.teams.push({id:uid(),name,mode,players,captain:players[0],code:mode==="online"?code:"",createdAt:new Date().toISOString()});save();$("#teamForm").reset();renderTeams();renderEventTeamOptions();toast("6 оюнчулуу команда катталды. Капитан — 1-оюнчу.");});
    $("#scoreForm").addEventListener("submit",e=>{e.preventDefault();if(!isAdmin){toast("Упайды админ гана өзгөртө алат.");return;}const teamId=$("#scoreTeam").value,points=Number($("#scoreValue").value);if(!teamId){toast("Алгач команда кошуңуз.");return;}db.scores.push({id:uid(),teamId,points,note:$("#scoreNote").value.trim(),date:new Date().toISOString()});save();$("#scoreNote").value="";renderScores();toast("Упай кошулду.");});
    $("#teamList").addEventListener("click",e=>{const b=e.target.closest("[data-remove-team]");if(!b)return;const id=b.dataset.removeTeam;db.teams=db.teams.filter(t=>t.id!==id);db.scores=db.scores.filter(s=>s.teamId!==id);save();renderTeams();});
    $("#scoreTable").addEventListener("click",e=>{const b=e.target.closest("[data-remove-score]");if(!b)return;db.scores=db.scores.filter(s=>s.teamId!==b.dataset.removeScore);save();renderScores();});
    $("#finishGame").addEventListener("click",()=>{if(!db.teams.length){toast("Жыйынтыктоо үчүн команда керек.");return;}const results=db.teams.map(t=>({teamId:t.id,name:t.name,points:db.scores.filter(s=>s.teamId===t.id).reduce((n,s)=>n+Number(s.points),0)})).sort((a,b)=>b.points-a.points);db.history.push({id:uid(),title:"Акыл-Ордо оюну №"+(db.history.length+1),date:new Date().toISOString(),results});db.scores=[];save();renderTeams();renderHistory();renderScores();toast("Оюндун жыйынтыгы тарыхка сакталды.");});
    $("#exportCsv").addEventListener("click",()=>{const rows=[["№","Команда","Упай"],...db.teams.map((t,i)=>[i+1,t.name,teamTotalPoints(t)])];const csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\n");download("akyl-ordo-jiyyntyk.csv",csv,"text/csv;charset=utf-8");});
    window.addEventListener("storage",e=>{if(e.key===DB_KEY){db=loadDB();renderTeams();renderHistory();renderEvents();}});
  }
  function formatQuestion(q){return `${q.number?"№"+q.number+". ":""}${q.text}\nЖооп: ${q.answer}`;}
  async function copyText(value){
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);return;}}catch(e){}
    const area=document.createElement("textarea");area.value=value;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();try{document.execCommand("copy");}finally{area.remove();}
  }
  function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
  function initAdmin(){
    if(!$("#questionForm"))return;
    const qcat=$("#qCategory");
    function fillCategories(){qcat.innerHTML=db.categories.map(c=>`<option>${esc(c)}</option>`).join("");}
    function renderQ(){const body=$("#adminQuestionRows");body.innerHTML=db.questions.slice().sort((a,b)=>(a.number||9999)-(b.number||9999)).map(q=>`<tr><td>${q.number?"№"+esc(q.number):"—"}</td><td>${esc(q.text)}</td><td>${esc(q.level)}</td><td>${esc(q.category)}</td><td><button class="edit-btn" data-edit-q="${esc(q.id)}">Өзгөртүү</button> <button class="copy-btn" data-copy-q="${esc(q.id)}">Көчүрүү</button> <button class="icon-btn" data-del-q="${esc(q.id)}">Өчүрүү</button></td></tr>`).join("")||'<tr><td colspan="5">Суроо жок.</td></tr>';}
    function renderNews(){const h=$("#adminNewsRows");h.innerHTML=db.news.map(n=>`<div class="admin-row"><span>${esc(n.title)}</span><span><button class="edit-btn" data-edit-news="${esc(n.id)}">Өзгөртүү</button><button data-del-news="${esc(n.id)}">Өчүрүү</button></span></div>`).join("")||'<p class="muted">Жаңылык жок.</p>';}
    function renderResources(){const h=$("#adminResourceRows");h.innerHTML=db.resources.map(r=>`<div class="admin-row"><span>${esc(r.title)} <small class="muted">(${esc(r.type)})</small></span><span><button class="edit-btn" data-edit-resource="${esc(r.id)}">Өзгөртүү</button><button data-del-resource="${esc(r.id)}">Өчүрүү</button></span></div>`).join("")||'<p class="muted">Материал жок.</p>';}
    function renderCats(){const h=$("#categoryRows");h.innerHTML=db.categories.map(c=>`<div class="admin-row"><span>${esc(c)}</span><button data-del-cat="${esc(c)}">Өчүрүү</button></div>`).join("");}
    function renderTeamApplications(){const h=$("#adminTeamApplications");if(!h)return;const rows=(db.teamApplications||[]).filter(a=>a.status==="pending");h.innerHTML=rows.map(a=>`<article class="application-row"><div><b>${esc(a.name)}</b><p>${a.players.map((n,i)=>(i+1)+". "+esc(n)).join(" · ")}</p><small class="muted">Жөнөтүлгөн: ${new Date(a.createdAt).toLocaleString("ky-KG")}</small></div><button class="btn btn-primary btn-sm" data-admin-approve="${esc(a.id)}">Бекитүү</button><button class="btn btn-outline btn-sm" data-admin-reject="${esc(a.id)}">Четке кагуу</button></article>`).join("")||'<div class="empty-state">Азырынча жаңы арыз жок.</div>';}
    function clearQ(){$("#questionForm").reset();$("#qId").value="";}
    fillCategories();renderQ();renderNews();renderResources();renderCats();renderTeamApplications();
    const tabButtons=$$(".admin-tabs [data-tab]"), tabSections=$$(".admin-section[id^='tab-']");
    function showAdminTab(name){
      const target=$("#tab-"+name);
      if(!target){toast("Бул бөлүм табылган жок.");return;}
      tabButtons.forEach(x=>{const active=x.dataset.tab===name;x.classList.toggle("active",active);x.setAttribute("aria-selected",String(active));});
      tabSections.forEach(x=>{const active=x.id==="tab-"+name;x.classList.toggle("hidden",!active);x.setAttribute("aria-hidden",String(!active));});
    }
    $(".admin-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b)showAdminTab(b.dataset.tab);});
    showAdminTab("questions");
    $("#adminTeamApplications")?.addEventListener("click",e=>{const ok=e.target.closest("[data-admin-approve]"),no=e.target.closest("[data-admin-reject]");const a=db.teamApplications.find(x=>x.id===(ok?.dataset.adminApprove||no?.dataset.adminReject));if(!a)return;if(ok){db.teams.push({...a,id:uid(),code:String(Math.floor(100000+Math.random()*900000)),status:"approved"});a.status="approved";toast("Команда бекитилди жана рейтингге кошулду.");}else{a.status="rejected";toast("Арыз четке кагылды.");}save();renderTeamApplications();});
    $("#questionForm").addEventListener("submit",e=>{e.preventDefault();const id=$("#qId").value,old=db.questions.find(q=>q.id===id),file=$("#qAttachment")?.files?.[0];if(file&&file.size>1024*1024){toast("Демо режимде тиркеме 1 МБдан ашпасын.");return;}const finish=(fileData="",fileName="")=>{const obj={id:id||uid(),number:$("#qNumber").value?Number($("#qNumber").value):undefined,text:$("#qText").value.trim(),answer:$("#qAnswer").value.trim(),level:$("#qLevel").value,category:qcat.value,type:$("#qType").value,fileData:fileData||old?.fileData||"",fileName:fileName||old?.fileName||""};if(id)db.questions=db.questions.map(q=>q.id===id?obj:q);else db.questions.push(obj);save();renderQ();clearQ();toast("Суроо жана тиркемеси сакталды.");};if(file){const rd=new FileReader();rd.onload=()=>finish(rd.result,file.name);rd.readAsDataURL(file);}else finish();});
    $("#clearQuestion").addEventListener("click",clearQ);
    $("#addBulkQuestions").addEventListener("click",()=>{
      const raw=$("#bulkQuestions").value.trim();
      if(!raw){toast("Алгач суроолорду жазыңыз.");return;}
      const rows=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
      const parsed=[],errors=[];
      rows.forEach((line,index)=>{
        const parts=line.split("|").map(x=>x.trim());
        if(parts.length<4||!parts[0]||!parts[1]){errors.push(index+1);return;}
        const hasNumber=parts.length>=6;
        const number=hasNumber&&/^\d+$/.test(parts[0])?Number(parts[0]):undefined;
        const offset=hasNumber?1:0;
        const text=parts[offset],answer=parts[offset+1];
        const level=["Оңой","Орто","Кыйын","Эксперт"].includes(parts[offset+2])?parts[offset+2]:"Орто";
        const category=parts[offset+3]||db.categories[0]||"Жалпы";
        if(!db.categories.includes(category))db.categories.push(category);
        const type=["question","riddle","rebus"].includes(parts[offset+4])?parts[offset+4]:"question";
        parsed.push({id:uid(),number,text,answer,level,category,type});
      });
      if(parsed.length){db.questions.push(...parsed);save();fillCategories();renderQ();renderCats();$("#bulkQuestions").value="";toast(parsed.length+" суроо ийгиликтүү кошулду.");}
      if(errors.length)toast("Ката саптар: "+errors.join(", ")+". Форматты текшериңиз.");
    });
    $("#adminQuestionRows").addEventListener("click",e=>{const edit=e.target.closest("[data-edit-q]"),del=e.target.closest("[data-del-q]");if(edit){const q=db.questions.find(x=>x.id===edit.dataset.editQ);$("#qId").value=q.id;$("#qNumber").value=q.number||"";$("#qText").value=q.text;$("#qAnswer").value=q.answer;$("#qLevel").value=q.level;$("#qCategory").value=q.category;$("#qType").value=q.type;}if(del){db.questions=db.questions.filter(q=>q.id!==del.dataset.delQ);save();renderQ();}});
    $("#adminQuestionRows").addEventListener("click",async e=>{const b=e.target.closest("[data-copy-q]");if(!b)return;const q=db.questions.find(x=>x.id===b.dataset.copyQ);if(q){await copyText(formatQuestion(q));toast("Суроо көчүрүлдү.");}});
    $$("[data-copy-stage]").forEach(b=>b.addEventListener("click",async()=>{const stage=b.dataset.copyStage;const items=db.questions.filter(q=>q.category===stage).sort((a,b)=>(a.number||9999)-(b.number||9999));if(!items.length){toast("Бул категорияда суроо жок.");return;}await copyText(items.map(formatQuestion).join("\n\n"));toast(stage+": "+items.length+" суроо көчүрүлдү.");}));
    $("#newsForm").addEventListener("submit",e=>{e.preventDefault();const id=$("#newsId").value,old=db.news.find(n=>n.id===id),file=$("#newsFile")?.files?.[0];if(file&&file.size>1024*1024){toast("Сүрөт 1 МБдан кичине болсун.");return;}const finish=(imageData="")=>{const obj={id:id||uid(),title:$("#newsTitle").value.trim(),body:$("#newsBody").value.trim(),image:$("#newsImage").value.trim(),imageData:imageData||old?.imageData||"",date:new Date().toISOString()};if(id)db.news=db.news.map(n=>n.id===id?obj:n);else db.news.push(obj);save();renderNews();$("#newsForm").reset();$("#newsId").value="";toast("Жаңылык сакталды.");};if(file){const rd=new FileReader();rd.onload=()=>finish(rd.result);rd.readAsDataURL(file);}else finish();});
    $("#clearNews").addEventListener("click",()=>{$("#newsForm").reset();$("#newsId").value="";});
    $("#adminNewsRows").addEventListener("click",e=>{const a=e.target.closest("[data-edit-news]"),d=e.target.closest("[data-del-news]");if(a){const n=db.news.find(x=>x.id===a.dataset.editNews);$("#newsId").value=n.id;$("#newsTitle").value=n.title;$("#newsBody").value=n.body;$("#newsImage").value=n.image||"";}if(d){db.news=db.news.filter(n=>n.id!==d.dataset.delNews);save();renderNews();}});
    $("#resourceForm").addEventListener("submit",async e=>{e.preventDefault();const id=$("#resourceId").value,existing=db.resources.find(r=>r.id===id),file=$("#resourceFile")?.files?.[0];if(file&&file.size>1.5*1024*1024){toast("Демо режимде файл 1.5 МБдан ашпасын.");return;}const finish=(fileData="",fileName="")=>{const obj={id:id||uid(),title:$("#resourceTitle").value.trim(),description:$("#resourceDescription").value.trim(),type:$("#resourceType").value,url:$("#resourceUrl").value.trim(),fileData:fileData||existing?.fileData||"",fileName:fileName||existing?.fileName||""};if(id)db.resources=db.resources.map(r=>r.id===id?obj:r);else db.resources.push(obj);save();renderResources();$("#resourceForm").reset();$("#resourceId").value="";toast("Материал сакталды.");};if(file){const reader=new FileReader();reader.onload=()=>finish(reader.result,file.name);reader.readAsDataURL(file);}else finish();});
    $("#clearResource").addEventListener("click",()=>{$("#resourceForm").reset();$("#resourceId").value="";});
    $("#adminResourceRows").addEventListener("click",e=>{const a=e.target.closest("[data-edit-resource]"),d=e.target.closest("[data-del-resource]");if(a){const r=db.resources.find(x=>x.id===a.dataset.editResource);$("#resourceId").value=r.id;$("#resourceTitle").value=r.title;$("#resourceDescription").value=r.description;$("#resourceType").value=r.type;$("#resourceUrl").value=r.url;}if(d){db.resources=db.resources.filter(r=>r.id!==d.dataset.delResource);save();renderResources();}});
    $("#categoryForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#categoryName").value.trim();if(name&&!db.categories.includes(name)){db.categories.push(name);save();fillCategories();renderCats();$("#categoryName").value="";}});
    $("#categoryRows").addEventListener("click",e=>{const b=e.target.closest("[data-del-cat]");if(!b)return;const name=b.dataset.delCat;if(db.questions.some(q=>q.category===name)){toast("Бул категорияда суроолор бар. Алгач аларды башка категорияга өткөрүңүз.");return;}db.categories=db.categories.filter(c=>c!==name);save();fillCategories();renderCats();});
    $("#backupData").addEventListener("click",()=>download("akyl-ordo-backup.json",JSON.stringify(db,null,2),"application/json"));
    $("#restoreData").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(!Array.isArray(incoming.questions)||!Array.isArray(incoming.users))throw Error();db={...db,...incoming};save();location.reload();}catch{toast("JSON файлы туура эмес.");}});
  }
  function leaderboardRows(limit){
    return db.users.filter(u=>u.role!=="admin").slice().sort((a,b)=>(b.points||0)-(a.points||0)||String(a.name).localeCompare(String(b.name),"ky")).slice(0,limit||db.users.length);
  }
  function initProfile(){
    if(!$("#profileName"))return;
    const user=currentUser();if(!user||user.role==="admin")return;
    const full=db.users.find(u=>u.id===user.id)||user;
    const update=()=>{
      $("#profileName").textContent=full.name||"Колдонуучу";
      $("#profileUsername").textContent="@"+(full.username||"katyshuuchu");
      $("#profileEmail").textContent=full.email||"";if($("#profileBio"))$("#profileBio").textContent=full.bio||"";
      if(full.avatar){$("#profileAvatar").innerHTML=`<img src="${esc(full.avatar)}" alt="Профиль сүрөтү">`;}else{$("#profileAvatar").textContent=(full.name||"К").trim()[0]?.toUpperCase()||"К";}
      const earned=[];const memberTeams=db.teams.filter(t=>(t.players||[]).some(n=>String(n).toLocaleLowerCase("ky")===String(full.name||"").toLocaleLowerCase("ky")));const wonTeams=db.history.filter(g=>g.results?.[0]&&memberTeams.some(t=>t.name===g.results[0].name));if(wonTeams.length)earned.push("🏆 Чемпион");if((full.points||0)>=100)earned.push("🧠 Билимпоз");if((full.answeredQuestionIds||[]).length>=10)earned.push("🔥 Активдүү оюнчу");if((full.points||0)>=500)earned.push("⭐ Топ оюнчу");if(memberTeams.length)earned.push("🤝 Команда оюнчусу");
      const periodStart=period=>{const now=new Date(),start=new Date(now);if(period==="week"){start.setDate(now.getDate()-((now.getDay()+6)%7));start.setHours(0,0,0,0);}else if(period==="month"){start.setDate(1);start.setHours(0,0,0,0);}else{start.setMonth(0,1);start.setHours(0,0,0,0);}return start;};
      [ ["week","🥇 Аптанын мыктысы"],["month","🏆 Айдын мыктысы"],["year","👑 Жылдын мыктысы"] ].forEach(([period,label])=>{const start=periodStart(period),ranked=db.users.filter(u=>u.role!=="admin").map(u=>({id:u.id,points:(u.scoreHistory||[]).filter(x=>new Date(x.date)>=start).reduce((sum,x)=>sum+Number(x.points||0),0)})).sort((a,b)=>b.points-a.points);if(ranked[0]?.id===full.id&&ranked[0].points>0)earned.push(label);});
      const badgeHost=$("#profileBadges");if(badgeHost)badgeHost.innerHTML=earned.map(x=>`<span class="tag">${x}</span>`).join("")||"";
      $("#profilePoints").textContent=full.points||0;
      $("#profileAnswered").textContent=(full.answeredQuestionIds||[]).length;
      const ranking=leaderboardRows(),rank=ranking.findIndex(u=>u.id===full.id)+1;
      $("#profileRank").textContent=rank?rank+"-орун":"—";
      const list=$("#profileHistory");
      const answered=(full.answeredQuestionIds||[]).map(id=>db.questions.find(q=>q.id===id)).filter(Boolean).reverse();
      list.innerHTML=answered.map(q=>`<div class="history-item"><div><strong>${esc(q.text)}</strong><span class="muted">${esc(q.category)} · ${esc(q.level)}</span></div><span class="pill">+10 упай</span></div>`).join("")||'<div class="empty-state">Сиз азырынча суроого жооп бере элексиз. Суроолор бөлүмүнө өтүп, упай топтоңуз!</div>';
      const board=$("#profileLeaderboard");
      if(board)board.innerHTML=ranking.slice(0,5).map((u,i)=>`<div class="leaderboard-row"><span class="leader-rank">${i+1}</span><span class="leader-avatar">${esc((u.name||"К")[0].toUpperCase())}</span><span class="leader-name">${esc(u.name||"Катышуучу")}<small>@${esc(u.username||"")}</small></span><strong>${Number(u.points)||0} упай</strong></div>`).join("")||'<div class="empty-state">Рейтинг азырынча бош.</div>';
    };
    update();
    $("#avatarUpload")?.addEventListener("change",e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith("image/")){toast("Сүрөт файлын тандаңыз.");return;}if(file.size>1024*1024){toast("Сүрөт 1 МБдан кичине болсун.");return;}const reader=new FileReader();reader.onload=()=>{full.avatar=reader.result;save();update();header();toast("Профиль сүрөтү жаңыртылды.");};reader.readAsDataURL(file);});
    const edit=$("#editProfileBtn"),panel=$("#profileEditPanel");
    edit?.addEventListener("click",()=>{ $("#editFullName").value=full.name||"";$("#editBio").value=full.bio||"";if($("#editInstitution"))$("#editInstitution").value=full.institution||"";if($("#editCity"))$("#editCity").value=full.city||"";if($("#editWebsite"))$("#editWebsite").value=full.website||"";panel.classList.toggle("hidden");});
    $("#cancelProfileEdit")?.addEventListener("click",()=>panel.classList.add("hidden"));
    $("#profileEditForm")?.addEventListener("submit",e=>{e.preventDefault();const name=$("#editFullName").value.trim();if(!name){toast("Аты-жөнүн жазыңыз.");return;}full.name=name;full.bio=$("#editBio").value.trim();full.institution=$("#editInstitution")?.value.trim()||"";full.city=$("#editCity")?.value.trim()||"";full.website=$("#editWebsite")?.value.trim()||"";save();panel.classList.add("hidden");update();toast("Профиль жаңыртылды. @username өзгөргөн жок.");});
  }
  function initRating(){
    const body=$("#ratingRows");if(!body)return;
    const rows=leaderboardRows();
    const periodTabs=$("#ratingPeriod");if(periodTabs){periodTabs.addEventListener("change",()=>{const period=periodTabs.value,now=new Date(),start=new Date(now);if(period==="week"){const day=(now.getDay()+6)%7;start.setDate(now.getDate()-day);start.setHours(0,0,0,0);}else if(period==="month"){start.setDate(1);start.setHours(0,0,0,0);}else if(period==="year"){start.setMonth(0,1);start.setHours(0,0,0,0);}else start.setFullYear(1970,0,1);const filtered=db.users.filter(u=>u.role!=="admin").map(u=>({...u,periodPoints:(u.scoreHistory||[]).filter(x=>new Date(x.date)>=start).reduce((a,x)=>a+x.points,0)})).sort((a,b)=>b.periodPoints-a.periodPoints);body.innerHTML=filtered.map((u,i)=>`<tr><td>${i+1}</td><td><b>${esc(u.name)}</b></td><td>@${esc(u.username||"")}</td><td>${(u.answeredQuestionIds||[]).length}</td><td><b>${u.periodPoints}</b></td></tr>`).join("")||"<tr><td colspan=5>Маалымат жок.</td></tr>";});}
    body.innerHTML=rows.map((u,i)=>`<tr><td class="rank">${i+1}</td><td><b>${esc(u.name||"Катышуучу")}</b></td><td>@${esc(u.username||"")}</td><td>${(u.answeredQuestionIds||[]).length}</td><td><b>${Number(u.points)||0}</b></td></tr>`).join("")||'<tr><td colspan="5">Азырынча катышуучу жок.</td></tr>';
  }

  function initCommunity(){
    const list=$("#chatMessages");if(!list)return;const user=currentUser();if(user.role!=="admin")$("#adminChatPanel")?.classList.add("hidden");
    const roomSelect=$("#chatRoomSelect"),recipientSelect=$("#chatRecipient");
    if(roomSelect){roomSelect.innerHTML='<option value="general">Жалпы чат</option>'+db.questions.slice().sort((a,b)=>(a.number||999)-(b.number||999)).map(q=>`<option value="${esc(q.id)}">${q.number?"№"+q.number+" — ":""}${esc(q.text.slice(0,75))}</option>`).join("");const requested=new URLSearchParams(location.search).get("room");if(requested&&db.questions.some(q=>q.id===requested))roomSelect.value=requested;}
    if(recipientSelect)recipientSelect.innerHTML='<option value="">Жеке чат тандалган жок</option>'+db.users.filter(u=>u.id!==user.id).map(u=>`<option value="${esc(u.id)}">${esc(u.name||u.username)} · @${esc(u.username||"")}</option>`).join("");
    const banned=["сөгүн","дурак","идиот","тупой","мразь","сука","блять","блядь","хуй","пизд","ебан","fuck","shit","bitch","asshole","damn","jerk"];
    const cleanText=v=>String(v||"").replace(/\s+/g," ").trim();
    function activeRoom(){if(recipientSelect?.value){return "dm:"+[user.id,recipientSelect.value].sort().join(":");}return roomSelect?.value||"general";}
    function render(){if(roomSelect)roomSelect.disabled=!!recipientSelect?.value;const rows=db.chats.filter(m=>(m.roomId||"general")===activeRoom()).slice(-150);list.innerHTML=rows.map(m=>`<article class="chat-message"><div class="chat-message-head"><b>${esc(m.name)}</b><small>${new Date(m.date).toLocaleString("ky-KG")}</small></div><p>${esc(m.text)}</p>${m.fileData?`<a class="text-link" href="${m.fileData}" download="${esc(m.fileName||"тиркеме")}">📎 ${esc(m.fileName||"Файл")}</a>`:""}<button class="text-link" data-report-chat="${esc(m.id)}">Даттануу</button></article>`).join("")||'<div class="empty-state">Бул бөлмөдө азырынча билдирүү жок. Талкууну баштаңыз!</div>';list.scrollTop=list.scrollHeight;}
    roomSelect?.addEventListener("change",render);recipientSelect?.addEventListener("change",render);
    window.addEventListener("storage",e=>{if(e.key===DB_KEY){db=loadDB();if(recipientSelect){const selected=recipientSelect.value;recipientSelect.innerHTML='<option value="">Жеке чат тандалган жок</option>'+db.users.filter(u=>u.id!==user.id).map(u=>`<option value="${esc(u.id)}">${esc(u.name||u.username)} · @${esc(u.username||"")}</option>`).join("");recipientSelect.value=selected;}render();}});
    $("#chatForm").addEventListener("submit",e=>{e.preventDefault();const text=cleanText($("#chatText").value),file=$("#chatFile").files[0];if(!text&&!file)return;if(db.mutedUsers.includes(user.id)){toast("Сиздин чатка жазуу укугуңуз убактылуу чектелген.");return;}if(text.length>800){toast("Билдирүү 800 белгиден ашпасын.");return;}const normalized=text.toLocaleLowerCase("ky").replace(/[0-9@#$!.*_\-\s]/g,"");if(banned.some(w=>normalized.includes(w.replace(/\s/g,"")))){toast("Сөгүнгөн же кемсинткен сөздөрдү колдонууга болбойт.");return;}if(file&&file.size>800*1024){toast("Чаттагы файл 800 КБдан кичине болсун.");return;}const send=(fileData="")=>{db.chats.push({id:uid(),userId:user.id,name:user.name||user.username||"Катышуучу",text,roomId:activeRoom(),date:new Date().toISOString(),fileData,fileName:file?.name||""});save();$("#chatText").value="";$("#chatFile").value="";render();};if(file){const rd=new FileReader();rd.onload=()=>send(rd.result);rd.readAsDataURL(file);}else send();});
    list.addEventListener("click",e=>{const b=e.target.closest("[data-report-chat]");if(!b)return;db.chatReports.push({id:uid(),messageId:b.dataset.reportChat,reporter:user.id,date:new Date().toISOString()});save();toast("Даттануу админге жөнөтүлдү.");});render();
    if(user.role==="admin"){const panel=$("#chatModeration");if(panel){function renderModeration(){panel.innerHTML=db.chatReports.map(r=>{const m=db.chats.find(x=>x.id===r.messageId);return m?`<div class="history-item"><div><b>${esc(m.name)}</b><p>${esc(m.text)}</p><small class="muted">Даттануулар: ${db.chatReports.filter(x=>x.messageId===m.id).length}</small></div><div class="form-actions"><button class="btn btn-outline btn-sm" data-mute-chat-user="${esc(m.userId)}">Жазууну чектөө</button><button class="btn btn-outline btn-sm" data-delete-chat="${esc(m.id)}">Өчүрүү</button></div></div>`:"";}).join("")||"Даттануулар жок.";panel.insertAdjacentHTML("beforeend",`<div class="panel-head"><h3>Чектелген аккаунттар</h3></div>${db.mutedUsers.map(id=>{const u=db.users.find(x=>x.id===id);return u?`<div class="admin-row"><span>${esc(u.name||u.username)}</span><button data-unmute-chat-user="${esc(id)}">Чектөөнү алуу</button></div>`:"";}).join("")}`);}renderModeration();panel.addEventListener("click",e=>{const del=e.target.closest("[data-delete-chat]"),mute=e.target.closest("[data-mute-chat-user]"),unmute=e.target.closest("[data-unmute-chat-user]");if(del){db.chats=db.chats.filter(m=>m.id!==del.dataset.deleteChat);db.chatReports=db.chatReports.filter(r=>r.messageId!==del.dataset.deleteChat);}if(mute&&!db.mutedUsers.includes(mute.dataset.muteChatUser))db.mutedUsers.push(mute.dataset.muteChatUser);if(unmute)db.mutedUsers=db.mutedUsers.filter(id=>id!==unmute.dataset.unmuteChatUser);save();renderModeration();render();});}}
  }
  function initKahoot(){
    const host=$("#kahootQuestion");if(!host)return;const user=currentUser();
    let kahootTimer=null,shownQuestionKey="";
    function buildQuizQuestions(){const count=$("#kahootQuestionCount")?.value||"5",pool=db.questions.slice().filter(q=>q.text&&q.answer);const chosen=(count==="all"?pool:pool.slice(0,Math.min(Number(count),pool.length)));const allAnswers=[...new Set(pool.map(q=>q.answer).filter(Boolean))];return chosen.map(q=>{const distractors=allAnswers.filter(a=>a!==q.answer).sort(()=>Math.random()-.5).slice(0,3);while(distractors.length<3)distractors.push("Жоопту кайра ойлонуп көрүңүз");return {text:q.text,answer:q.answer,options:[q.answer,...distractors].sort(()=>Math.random()-.5)};});}
    function draw(){const active=db.kahootSessions.filter(s=>s.status!=="finished").slice(-1)[0];$("#kahootCurrent").innerHTML=active?`<div class="kahoot-code">PIN: <strong>${esc(active.pin)}</strong></div><p>${esc(active.title)} · ${active.players.length} катышуучу</p>`:"Азыр активдүү оюн жок.";const board=$("#kahootRanking");if(board){const session=active||db.kahootSessions.slice(-1)[0];board.innerHTML=session?session.players.slice().sort((a,b)=>b.points-a.points).map((x,i)=>`<div class="leaderboard-row"><span class="leader-rank">${i+1}</span><span class="leader-name">${esc(x.name)}</span><b>${x.points} упай</b></div>`).join("")||"Катышуучулар PIN аркылуу кошулат.":"Азырынча оюн жок.";}}
    function renderKahootQuestion(session){if(kahootTimer)clearInterval(kahootTimer);shownQuestionKey=session.id+":"+session.index;const q=session.questions[session.index];let seconds=Number(session.duration)||20;$("#kahootQuestion").innerHTML=`<h2>${esc(q.text)}</h2><p class="kahoot-timer">Калган убакыт: <strong id="kahootSeconds">${seconds}</strong> сек.</p><div class="kahoot-options">${q.options.map((o,i)=>`<button class="btn btn-outline" data-k-answer="${i}">${esc(o)}</button>`).join("")}</div>`;kahootTimer=setInterval(()=>{seconds--;const label=$("#kahootSeconds");if(label)label.textContent=seconds;if(seconds<=0){clearInterval(kahootTimer);[...$("#kahootQuestion").querySelectorAll("button")].forEach(x=>x.disabled=true);toast("Убакыт бүттү!");}},1000);}
    $("#createKahoot")?.addEventListener("click",()=>{if(user.role!=="admin"){toast("Оюнду админ гана ача алат.");return;}const pin=String(Math.floor(100000+Math.random()*900000));const questions=buildQuizQuestions();if(!questions.length){toast("Викторина үчүн суроолор жок.");return;}const quizTitle=$("#kahootTitle").value.trim()||"Акыл-Ордо Quiz";const session={id:uid(),pin,title:quizTitle,duration:Number($("#kahootDuration")?.value)||20,status:"waiting",players:[],questions,index:0,answers:[],createdAt:new Date().toISOString()};db.kahootSessions.push(session);db.events.push({id:session.id,title:quizTitle,format:"Kahoot",date:new Date().toISOString(),teamIds:[],status:"planned",kahoot:true});save();draw();toast("Kahoot түзүлдү. Оюндар бөлүмүндө жарыяланды.");});
    $("#joinKahoot")?.addEventListener("click",()=>{const pin=$("#kahootPin").value.trim(),session=db.kahootSessions.find(s=>s.pin===pin&&s.status!=="finished");if(!session||session.status!=="waiting"){toast("PIN табылган жок же оюн башталып кеткен.");return;}if(!session.players.some(x=>x.userId===user.id))session.players.push({userId:user.id,name:user.name||user.username,points:0});save();draw();toast("Оюнга кошулду!");});
    $("#startKahoot")?.addEventListener("click",()=>{const session=db.kahootSessions.filter(s=>s.status==="waiting").slice(-1)[0];if(user.role!=="admin"||!session){toast("Админ активдүү PIN оюнун түзүшү керек.");return;}session.status="running";save();draw();renderKahootQuestion(session);});
    $("#kahootQuestion")?.addEventListener("click",e=>{const b=e.target.closest("[data-k-answer]");if(!b)return;const session=db.kahootSessions.filter(s=>s.status==="running").slice(-1)[0];if(!session)return;if(!session.players.some(x=>x.userId===user.id)){toast("Алгач PIN аркылуу оюнга кошулуңуз.");return;}const q=session.questions[session.index];if(session.answers.some(a=>a.userId===user.id&&a.question===session.index)){toast("Бул суроого жооп берип койдуңуз.");return;}const correct=q.options[Number(b.dataset.kAnswer)]===q.answer;session.answers.push({userId:user.id,correct,question:session.index});const pl=session.players.find(x=>x.userId===user.id);if(pl&&correct){pl.points+=100;const profile=db.users.find(x=>x.id===user.id);if(profile){profile.points=(profile.points||0)+100;if(!Array.isArray(profile.scoreHistory))profile.scoreHistory=[];profile.scoreHistory.push({points:100,date:new Date().toISOString(),source:"kahoot"});}}save();draw();toast(correct?"Туура! +100 упай":"Бул жооп туура эмес.");if(kahootTimer)clearInterval(kahootTimer);[...$("#kahootQuestion").querySelectorAll("button")].forEach(x=>x.disabled=true);});
    $("#nextKahoot")?.addEventListener("click",()=>{if(user.role!=="admin")return;const session=db.kahootSessions.filter(s=>s.status==="running").slice(-1)[0];if(!session)return;session.index++;if(session.index>=session.questions.length){session.status="finished";if(kahootTimer)clearInterval(kahootTimer);$("#kahootQuestion").innerHTML="<h2>Оюн аяктады!</h2>";}else{renderKahootQuestion(session);}save();draw();});
    const rank=$("#kahootRanking");if(rank){const session=db.kahootSessions.slice(-1)[0];rank.innerHTML=session?session.players.slice().sort((a,b)=>b.points-a.points).map((x,i)=>`<div class="leaderboard-row"><span class="leader-rank">${i+1}</span><span class="leader-name">${esc(x.name)}</span><b>${x.points} упай</b></div>`).join("")||"Катышуучулар PIN аркылуу кошулат.":"Азырынча оюн жок.";}draw();const running=db.kahootSessions.filter(s=>s.status==="running").slice(-1)[0];if(running&&running.questions[running.index])renderKahootQuestion(running);window.addEventListener("storage",e=>{if(e.key!==DB_KEY)return;db=loadDB();draw();const active=db.kahootSessions.filter(s=>s.status==="running").slice(-1)[0];if(active&&active.questions[active.index]&&shownQuestionKey!==active.id+":"+active.index)renderKahootQuestion(active);});
  }

  function init(){if(document.body.dataset.page==="login"){authPage();return;}if(!guard())return;if(document.body.dataset.page==="community"){location.replace("index.html");return;}if(document.body.dataset.page==="kahoot"&&currentUser()?.role!=="admin"){toast("Kahoot оюнун администратор гана башкарат.");location.replace("games.html");return;}if(document.body.dataset.page==="profile"&&currentUser()?.role==="admin"){location.replace("index.html");return;}header();footer();initHome();initAlphabet();initNews();initLibrary();initGames();initAdmin();initProfile();initRating();initCommunity();initKahoot();}
  document.addEventListener("DOMContentLoaded",init);
})();