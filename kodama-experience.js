(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  const t = (es,en) => root.lang === 'en' ? en : es;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const load = (key,fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const store = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const sources = [
    ['Salud mental','Mental health','Bienestar que permite afrontar el estrés, aprender, trabajar y participar en comunidad.','Well-being that supports coping, learning, working and participation.','OMS / WHO','https://www.who.int/es/news-room/fact-sheets/detail/mental-health-strengthening-our-response'],
    ['Ansiedad','Anxiety','Aprensión y tensión ante una amenaza futura o difusa.','Apprehension and tension about future or diffuse threats.','APA','https://www.apa.org/topics/anxiety'],
    ['Resiliencia','Resilience','Proceso de adaptación frente a la adversidad, que puede cultivarse.','The process of adapting to adversity, which can be developed.','APA','https://www.apa.org/topics/resilience/building-your-resilience'],
    ['Estrés psicológico','Psychological stress','Surge al evaluar que una situación importante excede los recursos propios.','Can arise when a meaningful situation seems to exceed one’s resources.','Folkman','https://doi.org/10.1007/978-1-4419-1005-9_215'],
    ['Estigma ante el tratamiento','Treatment stigma','El estigma asociado con recibir apoyo puede reducir la búsqueda de ayuda.','Stigma around receiving support can reduce help-seeking.','Clement et al.','https://doi.org/10.1017/S0033291714000129'],
    ['Barreras para pedir ayuda','Barriers to help-seeking','En un estudio de 24 países, el 63,8 % de las personas con necesidad percibida que no buscaron tratamiento reportó querer manejar el problema por su cuenta.','In a 24-country study, 63.8% of people with perceived need who did not seek treatment reported wanting to handle the problem on their own.','Andrade et al.','https://doi.org/10.1017/S0033291713001943'],
    ['Brecha de tratamiento','Treatment gap','El estudio estimó una brecha del 74,7 % para cuadros moderados o graves en América Latina.','The study estimated a 74.7% treatment gap for moderate or severe conditions in Latin America.','Kohn et al.','https://doi.org/10.26633/RPSP.2018.165'],
    ['Telesalud mental','Telemental health','La atención por videoconferencia mostró resultados en gran medida comparables en una revisión de 57 estudios.','A review of 57 studies found largely comparable results for videoconferencing.','Batastini et al.','https://doi.org/10.1016/j.cpr.2020.101944'],
    ['Acompañamiento subclínico','Subclinical support','Apoyo preventivo para dificultades que afectan el bienestar incluso por debajo del umbral clínico.','Preventive support for difficulties affecting well-being below the clinical threshold.','Arévalo Avalos et al.','https://formative.jmir.org/2025/1/e80026'],
    ['Primera ayuda psicológica','Psychological first aid','Ayuda práctica y humana que respeta la dignidad, cultura y capacidades de las personas afectadas.','Humane, practical support that respects dignity, culture and abilities.','OMS / WHO','https://www.who.int/es/publications/i/item/9789241548205'],
    ['Servicio exportable','Cross-border service','Suministro de un servicio desde el territorio de un país hacia otro.','Supplying a service from the territory of one country into another.','OMC / WTO','https://www.wto.org/English/tratop_e/serv_e/cbt_course_e/c1s3p1_e.htm']
  ];
  const videoTopics = [
    ['Respiración diafragmática guiada','Guided diaphragmatic breathing'],['Mindfulness de 5 minutos','Five-minute mindfulness'],
    ['Qué es la ansiedad','What is anxiety?'],['Manejo del estrés','Managing stress'],['Estigma y salud mental','Mental health stigma'],['Primera ayuda psicológica','Psychological first aid']
  ];
  const moods = [['Confusión','Confused','?','#efc9ee'],['Cansancio','Tired','–','#cfe0f3'],['Enojo','Angry','!','#f5b7ad'],['Cariño','Affectionate','♥','#f2a7b5'],['Tristeza o miedo','Sad or scared','✦','#dbd0f6'],['Molestia','Annoyed','☁','#c9d2ac']];
  const card = (title,body) => '<article class="feature-card"><h3>'+title+'</h3>'+body+'</article>';
  const link = (url,label) => '<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+'</a>';
  const title = text => '<h2>'+text+'</h2>';
  const p = text => '<p>'+text+'</p>';
  const sourceCard = row => card(t(row[0],row[1]),p(t(row[2],row[3]))+link(row[5],row[4])+(row[0]==='Estigma ante el tratamiento'?' · '+link('https://openlibrary.org/books/OL13945902M/Stigma','Goffman (1963)'):''));
  const videos = () => videoTopics.map(row => card(t(...row),p(t('Video pendiente de verificar licencia','Video license verification pending')))).join('');
  const dayKey = date => [date.getFullYear(),date.getMonth()+1,date.getDate()].map(n=>String(n).padStart(2,'0')).join('-');
  const key = suffix => 'kodama.demo.'+suffix+'.'+$('identity').textContent;
  const demoMode = () => !$('mode').hidden;
  const records = () => demoMode() ? load(key('mood'),{}) : {};
  let month = new Date(); month.setDate(1);
  function drawCalendar() {
    $('calendar-month').textContent = new Intl.DateTimeFormat(root.lang,{month:'long',year:'numeric'}).format(month);
    const weekdays = t(['D','L','M','M','J','V','S'],['S','M','T','W','T','F','S']);
    const days = weekdays.map(label=>'<span><strong>'+label+'</strong></span>');
    for(let i=0;i<month.getDay();i++) days.push('<span aria-hidden="true"></span>');
    const year=month.getFullYear(), m=month.getMonth(), entries=records(), today=dayKey(new Date());
    for(let date=1;date<=new Date(year,m+1,0).getDate();date++){
      const id=dayKey(new Date(year,m,date)), entry=entries[id], mood=entry&&moods[entry.mood];
      days.push('<span class="'+(id===today?'today ':'')+(mood?'logged':'')+'"'+(mood?' title="'+escape(t(mood[0],mood[1])+(entry.note?' · '+entry.note:''))+'"':'')+'>'+date+(mood?' '+mood[2]:'')+'</span>');
    }
    $('calendar-days').innerHTML=days.join('');
    const selected=$('mood-form').elements.mood?.value;
    $('mood-options').innerHTML=moods.map((m,i)=>'<label><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="'+m[3]+'"/><path d="M14 47V30a18 18 0 0 1 36 0v17l-6-4-6 4-6-4-6 4-6-4z" fill="#fff" stroke="#665062"/><circle cx="25" cy="33" r="2" fill="#251c29"/><circle cx="39" cy="33" r="2" fill="#251c29"/><text x="46" y="21" font-size="19" fill="#9c3655">'+m[2]+'</text></svg><input type="radio" name="mood" required value="'+i+'" '+(selected===String(i)?'checked':'')+'><span>'+t(m[0],m[1])+'</span></label>').join('');
  }
  $('prev-month').onclick = () => { month.setMonth(month.getMonth()-1); drawCalendar(); };
  $('next-month').onclick = () => { month.setMonth(month.getMonth()+1); drawCalendar(); };
  $('mood-form').onsubmit = event => {
    event.preventDefault();
    if(!demoMode()){ $('mood-status').textContent=t('El guardado de ánimo aún no está habilitado para cuentas reales.','Mood tracking storage is not yet enabled for real accounts.'); return; }
    const form=new FormData(event.currentTarget), all=records(), now=new Date();
    all[dayKey(now)]={mood:Number(form.get('mood')),note:String(form.get('note')).trim()};
    if(!store(key('mood'),all)){ $('mood-status').textContent=t('No se pudo guardar.','Could not save.'); return; }
    $('mood-status').textContent=t('Ánimo guardado en este navegador.','Mood saved in this browser.');
    month=new Date(now.getFullYear(),now.getMonth(),1);
    drawCalendar();
  };
  $('us-state').innerHTML='<option value="">—</option>'+('Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|District of Columbia').split('|').map(x=>'<option>'+x+'</option>').join('');
  $('interest').onsubmit=event=>{
    event.preventDefault();
    const birth=new FormData(event.currentTarget).get('birth');
    const today=new Date();
    today.setFullYear(today.getFullYear()-18);
    if(!birth||birth>dayKey(today)){
      $('registration-status').textContent=t('El registro es para personas mayores de 18 años.','Registration is available to people aged 18 or older.');
      return;
    }
    event.currentTarget.reset();
    $('registration-status').textContent=t('Formulario validado. Solicita tu cuenta a la administradora de Kodama.','Form validated. Ask the Kodama administrator for an account.');
  };
  const dialog=$('feature-dialog'), body=$('feature-body');
  const go=(view,label)=>'<button type="button" data-jump="'+view+'">'+label+'</button>';
  const button=(feature,label)=>'<button type="button" data-dialog="'+feature+'">'+label+'</button>';
  const settings = {
    crisis:()=>title(t('Ayuda en crisis','Crisis help'))+p('<strong>'+t('KODAMA no atiende emergencias.','KODAMA does not handle emergencies.')+'</strong>')+
      card(t('Estados Unidos','United States'),p(t('Ante peligro inmediato, llama al 911.','If there is immediate danger, call 911.'))+link('https://988lifeline.org/es/servicios-de-traduccion/servicios-en-espanol/',t('Servicios oficiales de apoyo en español','Official crisis support services')))+
      card('Ecuador',p(t('Ante peligro inmediato, llama al ECU 911.','If there is immediate danger, call ECU 911.'))+link('https://www.salud.gob.ec/linea-171-opcion-6/',t('Apoyo en salud mental · Ministerio de Salud Pública','Mental health support · Ministry of Public Health'))),
    about:()=>title(t('Sobre Kodama','About Kodama'))+p(t('Kodama nace ante el costo, la distancia, la falta de tiempo e información y el estigma que dificultan pedir apoyo. El nombre evoca a los espíritus protectores del bosque de la tradición japonesa.','Kodama began with a recognition of barriers to support: cost, distance, limited time and information, and stigma. Its name evokes forest guardian spirits in Japanese tradition.'))+p(t('Su misión es facilitar el acompañamiento emocional humano. En el servicio previsto, cada respuesta proviene de un profesional. La demo nunca simula la presencia de un profesional real. Kodama no ofrece diagnóstico ni atención de emergencias.','Its mission is to make human emotional support easier to access. In the intended service, every reply comes from a professional. The demo never simulates live professional availability. Kodama does not diagnose or handle emergencies.')),
    definitions:()=>title(t('Definiciones','Definitions'))+sources.map(sourceCard).join('')+'<h3>Videos</h3>'+videos(),
    quick:()=>title(t('Acciones rápidas','Quick actions'))+go('progress',t('Registrar ánimo','Log mood'))+button('schedule',t('Agendar sesión','Schedule a session'))+go('chat',t('Escribir al psicólogo','Message psychologist'))+button('breathing',t('Ejercicio de respiración','Breathing exercise')),
    search:()=>title(t('Buscar','Search'))+'<input id="feature-search" type="search" aria-label="'+t('Buscar definiciones o profesionales','Search definitions or professionals')+'" placeholder="'+t('Nombre, especialidad, idioma o concepto','Name, specialty, language or concept')+'"><div id="search-results"></div>',
    breathing:()=>title(t('Pausa para respirar','Breathing break'))+p(t('Respira a un ritmo cómodo. Inhala despacio y exhala suavemente. Si te sientes incómodo, vuelve a respirar normalmente.','Breathe at a comfortable pace. Inhale slowly and exhale gently. If you feel uncomfortable, return to normal breathing.')),
    schedule:()=>title(t('Agenda de demostración','Demo calendar'))+p(t('Elige un horario ilustrativo de una hora. La disponibilidad real y la reserva con profesionales quedan pendientes.','Try a sample one-hour time slot. Live availability and professional booking are pending.'))+'<form id="schedule-form"><label>'+t('Fecha','Date')+'<input name="date" type="date" min="'+dayKey(new Date())+'" required></label><label>'+t('Horario local','Local time')+'<select name="slot"><option>09:00–10:00</option><option>14:00–15:00</option></select></label><button>'+t('Probar horario','Try time slot')+'</button><p role="status"></p></form>',
    plans:()=>title(t('Planes de ejemplo','Sample plans'))+card(t('Básico','Basic'),p(t('Chat limitado y una sesión semanal.','Limited chat and one weekly session.')))+card('Premium',p(t('Más chat, llamadas, videollamadas y recursos.','More chat, voice and video calls, and resources.')))+p(t('Planes ilustrativos. La demo no realiza cobros.','Illustrative plans. The demo does not process payments.')),
    privacy:()=>title(t('Privacidad y alcance','Privacy and scope'))+p(t('El formulario de registro no envía tus datos. En la demo, los registros de ánimo y preferencias se guardan en este navegador. Usa datos ficticios. Kodama ofrece acompañamiento no clínico y no atiende emergencias.','The registration form does not transmit your data. Demo mood entries and preferences are saved in this browser. Use sample data. Kodama offers non-clinical support and does not handle emergencies.')),
    intro:()=>title(t('Introducción','Introduction'))+'<form id="profile-form"><label>'+t('Cuéntanos para qué buscas apoyo','Tell us what you are seeking support for')+'<textarea name="value" maxlength="220">'+escape(demoMode()?load(key('intro'),''):'')+'</textarea></label><button>'+t('Guardar','Save')+'</button></form>',
    tags:()=>title(t('Mis etiquetas','My tags'))+'<form id="profile-form">'+[['Ansiedad','Anxiety'],['Estrés','Stress'],['Duelo','Grief'],['Adaptación','Adjustment'],['Soledad','Loneliness']].map(([es,en])=>'<label class="check"><input type="checkbox" name="value" value="'+es+'" '+(demoMode()&&load(key('tags'),[]).includes(es)?'checked':'')+'>'+t(es,en)+'</label>').join('')+'<button>'+t('Guardar','Save')+'</button></form>',
    goals:()=>title(t('Retos y logros','Challenges and achievements'))+card(t('Primera pausa','First pause'),p(t('Prueba una pausa breve para respirar.','Try a brief breathing break.'))+button('breathing',t('Abrir ejercicio','Open exercise')))+card(t('Primer registro','First check-in'),p(Object.keys(records()).length?t('Medalla obtenida','Badge earned'):t('Registra tu estado de ánimo de hoy.','Log your mood today.'))),
    monitor:()=>title(t('Monitoreo emocional','Emotional tracking'))+p(t('Resumen de tus registros. No es una evaluación clínica.','Summary of your entries. This is not a clinical evaluation.'))+moods.map((m,i)=>{const counts=Object.values(records());const count=counts.filter(x=>x.mood===i).length;return '<label>'+t(m[0],m[1])+' · '+count+'<meter min="0" max="'+Math.max(counts.length,1)+'" value="'+count+'"></meter></label>';}).join('')
  };
  function openFeature(feature) {
    if(!settings[feature]) return;
    body.innerHTML=settings[feature]();
    if(!dialog.open) dialog.showModal();
    const search=$('feature-search');
    if(search){
      const draw=()=>{const q=search.value.trim().toLowerCase();$('search-results').innerHTML=p(t('El directorio de profesionales aún no está conectado.','The professional directory is not connected yet.'))+sources.filter(x=>x.slice(0,4).some(y=>y.toLowerCase().includes(q))).map(sourceCard).join('');};
      search.oninput=draw;draw();search.focus();
    }
    const schedule=$('schedule-form');
    if(schedule) schedule.onsubmit=event=>{event.preventDefault();schedule.querySelector('[role=status]').textContent=t('Horario de demostración seleccionado. No se realizó una reserva.','Sample time selected. No appointment was booked.');};
    const profile=$('profile-form');
    if(profile) profile.onsubmit=event=>{
      event.preventDefault();const form=new FormData(profile);
      if(demoMode()&&store(key(feature),feature==='tags'?form.getAll('value'):form.get('value'))) dialog.close();
    };
  }
  $('feature-close').onclick=()=>dialog.close();
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-dialog],[data-jump],[data-view]');
    if(!trigger)return;
    if(trigger.dataset.dialog)openFeature(trigger.dataset.dialog);
    if(trigger.dataset.jump){dialog.close();window.kodamaOpenView(trigger.dataset.jump);}
    if((trigger.dataset.view||trigger.dataset.jump)==='progress'){$('mood-form').reset();$('mood-status').textContent='';drawCalendar();}
  });
  function setLanguage(lang){
    root.lang=lang;
    message.placeholder=t('Escribe tu mensaje…','Write your message…');
    $('language').textContent=t('English','Español');
    $('language').lang=t('en','es');
    for(const item of document.querySelectorAll('[data-es][data-en]')) item.textContent=item.dataset[lang];
    $('licensed-videos').innerHTML=videos();
    drawCalendar();
    const role=$('role');
    if(role)role.textContent=$('identity').textContent=== 'admin@kodama.test'||!$('notices').hidden?t('Panel de administración','Administration panel'):t('Tu espacio seguro','Your safe space');
  }
  $('language').onclick=()=>{const lang=t('en','es');store('kodama.language',lang);setLanguage(lang);};
  new MutationObserver(()=>setLanguage(root.lang)).observe($('identity'),{childList:true});
  $('attach-file').onclick=()=>$('chat-file').click();
  $('chat-file').onchange=event=>{
    if(event.target.files.length)$('chat-status').textContent=t('Archivo seleccionado para la demo. No se enviará.','File selected for this demo. It will not be sent.');
    event.target.value='';
  };
  const intro=$('splash');
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('kodama.intro') === '1'; } catch {}
  if(!introSeen&&!reduce.matches){
    intro.hidden=false; document.querySelector('main').inert=true;document.querySelector('.utilities').inert=true;
    $('skip-intro').focus();
    const finish=()=>{intro.hidden=true;document.querySelector('main').inert=false;document.querySelector('.utilities').inert=false;try { sessionStorage.setItem('kodama.intro','1'); } catch {}document.querySelector('[data-access=login]')?.focus();};
    const timer=setTimeout(finish,4000);
    $('skip-intro').onclick=()=>{clearTimeout(timer);finish();};
    intro.onkeydown=event=>{if(event.key==='Escape')$('skip-intro').click();};
  }
  const stage=document.querySelector('.mascot-stage'), sprite=stage.querySelector('img');
  const ghost=document.createElement('button');ghost.id='ghost';ghost.type='button';ghost.setAttribute('aria-label','Fantasma de Kodama');
  const wrapper=document.createElement('span');wrapper.className='ghost-sprite';wrapper.append(sprite);ghost.append(wrapper);stage.append(ghost);
  const control=$('mascot-motion');
  let actionTimer, nextMove, lastAction=Date.now(), position=0;
  const action=(name)=>{ghost.dataset.action=name;};
  function cycle(){
    clearTimeout(nextMove);clearTimeout(actionTimer);
    if(stage.dataset.motion==='off'){action('still');return;}
    if(reduce.matches){action('slow');return;}
    if(stage.offsetWidth===0){nextMove=setTimeout(cycle,3000);return;}
    if(Date.now()-lastAction>20000){action('sleep');return;}
    const choices=['idle','walk','jump','look','wave'];
    const next=choices[Math.floor(Math.random()*choices.length)];
    if(next==='walk'){
      const limit=Math.max(0,stage.clientWidth/2-50), x=(Math.random()*2-1)*limit;
      ghost.dataset.facing=x<position?'left':'right';position=x;
      ghost.style.left='calc(50% + '+x+'px)';
    }
    action(next);
    if(next==='jump') actionTimer=setTimeout(()=>action('idle'),650);
    nextMove=setTimeout(cycle,3000+Math.random()*5000);
  }
  ghost.onclick=()=>{
    lastAction=Date.now();clearTimeout(nextMove);clearTimeout(actionTimer);
    if(stage.dataset.motion==='off'||reduce.matches)return;
    action('jump');ghost.dataset.heart='true';
    actionTimer=setTimeout(()=>{delete ghost.dataset.heart;action('idle');nextMove=setTimeout(cycle,3000);},750);
  };
  new MutationObserver(()=>{lastAction=Date.now();cycle();}).observe(stage,{attributes:true,attributeFilter:['data-motion']});
  function refreshGhostControl() {
    const stopped = stage.dataset.motion === 'off';
    control.textContent = stopped ? t('Animar fantasma','Animate ghost') : t('Pausar fantasma','Pause ghost');
  }
  control.addEventListener('click', () => {
    stage.dataset.motion = ghost.dataset.action === 'still' ? 'on' : 'off';
    refreshGhostControl();
  });
  const ghostVisibility = new MutationObserver(() => {
    if (!$('home').hidden && !$('panel').hidden) {
      lastAction = Date.now();
      if (stage.dataset.motion !== 'off') {
        clearTimeout(nextMove);
        action(reduce.matches ? 'slow' : 'idle');
        nextMove = setTimeout(cycle, 3500);
      }
    }
  });
  for (const screen of [$('panel'), $('home')]) {
    ghostVisibility.observe(screen, {attributes:true, attributeFilter:['hidden']});
  }
  window.addEventListener('resize',()=>{position=0;ghost.style.left='50%';});
  reduce.addEventListener('change',cycle);
  document.addEventListener('pointerdown',()=>{if(ghost.dataset.action==='sleep'){lastAction=Date.now();cycle();}else lastAction=Date.now();});
  setLanguage(load('kodama.language','es')==='en'?'en':'es');cycle();refreshGhostControl();
})();



