(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const titles = {
    trend:'En tendencia · selección de Kodama', emoji:'Emojis', kodama:'Kodama 3D',
    animal:'Animales', meme:'Memes y frases', gif:'GIF y animados',
    favorite:'Favoritos', recent:'Recientes', own:'Mis stickers'
  };
  const catalog = [
    ['smile','emoji','😊','Sonrisa','alegría bien gracias'],
    ['heart','emoji','💜','Corazón','cariño amor apoyo'],
    ['hug','emoji','🫂','Abrazo','acompañar consuelo aquí estoy'],
    ['surprise','emoji','😮','Sorpresa','wow no esperaba'],
    ['tear','emoji','🥲','Me emociona','tristeza alivio emoción'],
    ['calm','emoji','😌','Calma','paz respirar tranquilo'],
    ['ghost','kodama','ghost','Fantasma Kodama','hola ánimo ternura',true],
    ['cloud','kodama','cloud','Nube Kodama','calma respiro descanso'],
    ['squirrel','animal','🐿️','Ardilla cariñosa','mi amor es más grande el cariño'],
    ['dramatic-cat','animal','🐈','Gato dramático','dramático no puede ser caos'],
    ['shocked-dog','animal','🐶','Perrito sorprendido','qué cómo wow'],
    ['monday','meme','☕','Yo un lunes','cansancio café no era mi día'],
    ['plot','meme','😳','Giro inesperado','plot twist sorpresa no me lo esperaba'],
    ['mood','meme','🫠','Mi cara cuando…','lag ayuda qué pena vergüenza'],
    ['tiny-win','gif','✨','Pequeña victoria','celebrar ánimo lo logré gif',true],
    ['cat-bounce','gif','🙀','Gato en shock','gato dramático sorpresa gif',true],
    ['little-heart','gif','💗','Te mando cariño','apoyo cariño corazón gif',true]
  ].map(([id,category,art,label,keywords,animated])=>({id,category,art,label,keywords,animated}));
  const trending = ['squirrel','dramatic-cat','ghost','plot','cat-bounce','tiny-win'];
  const imagePattern = /^data:image\/(?:png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;
  const demoThread = 'kodama.stickers.demo.conversation';
  const empty = () => ({ favorite:[], recent:[], own:[], category:'trend' });
  const read = (key,fallback) => {try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const write = (key,value) => {localStorage.setItem(key,JSON.stringify(value));};
  const el = (tag, className, text) => {
    const element=document.createElement(tag);
    if(className)element.className=className;
    if(text)element.textContent=text;
    return element;
  };
  const dialog = $('sticker-dialog'), threadSelect = $('chat-thread');
  const log = $('messages'), clouds=log.firstElementChild;
  let session, thread, preferences=empty(), subscription, generation=0, refreshTimer;
  let saveQueue = Promise.resolve();
  const prefKey = email => 'kodama.stickers.demo.preferences.'+email;
  function setStatus(text) {
    $('chat-status').textContent=text;
    if(dialog.open) $('sticker-status').textContent=text;
  }
  function savePreferences() {
    const current=session, id=generation;
    const snapshot=structuredClone(preferences);
    saveQueue=saveQueue.catch(()=>{}).then(async()=>{
      if(current.demo){write(prefKey(current.email),snapshot);return;}
      const {error}=await current.client.from('kodama_chat_preferences').upsert({owner_id:current.id,settings:snapshot});
      if(error)throw error;
    }).catch(()=>{if(id===generation)setStatus('No se pudieron guardar las preferencias.');});
  }
  function itemById(id){return catalog.find(x=>x.id===id)||preferences.own.find(x=>x.id===id);}
  function visual(item) {
    const view=el('span','sticker-visual'+(item.animated?' sticker-animated':''));
    view.setAttribute('aria-hidden','true');
    if(item.image && imagePattern.test(item.image)){
      const image=el('img');
      image.src=item.image; image.alt='';
      view.append(image);
    }else if(item.id==='tiny-win'){
      const image=el('img'); image.src='./kodama-victoria.gif'; image.alt=''; view.append(image);
    }else if(item.art==='ghost'){
      view.append($('guardian-art').content.cloneNode(true));
    }else if(item.art==='cloud'){
      view.append(el('span','chat-cloud'));
    }else{
      view.textContent=item.art||'';
    }
    return view;
  }
  function toggleFavorite(id) {
    preferences.favorite=preferences.favorite.includes(id)
      ?preferences.favorite.filter(x=>x!==id):[id,...preferences.favorite].slice(0,80);
    savePreferences();
    drawPicker();
  }
  function drawPicker() {
    const query=$('sticker-search').value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const category=$('sticker-category').value;
    const ids=category==='favorite'?preferences.favorite:category==='recent'?preferences.recent:category==='trend'?trending:null;
    const items=query?[...catalog,...preferences.own]:ids?ids.map(itemById).filter(Boolean):category==='own'?preferences.own:catalog.filter(x=>x.category===category);
    const results=$('sticker-results');
    results.replaceChildren();
    for(const item of items){
      const search=(item.label+' '+(item.keywords||'')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if(query&&!query.split(/\s+/).every(word=>search.includes(word)))continue;
      const card=el('div','sticker-card');
      const send=el('button','sticker-send');send.type='button';send.setAttribute('aria-label','Enviar '+item.label);
      send.append(visual(item),el('span','',item.label));
      send.onclick=async()=>{send.disabled=true;try{await sendMessage({kind:'sticker',sticker:item.id,image:item.image||null,label:item.label});dialog.close();}catch{setStatus('No se pudo enviar este sticker.');}finally{send.disabled=false;}};
      const star=el('button','sticker-favorite',preferences.favorite.includes(item.id)?'★':'☆');
      star.type='button';star.setAttribute('aria-label','Favorito: '+item.label);
      star.setAttribute('aria-pressed',String(preferences.favorite.includes(item.id)));
      star.onclick=()=>toggleFavorite(item.id);
      card.append(send,star);results.append(card);
    }
    if(!results.children.length)results.append(el('p','','No hay resultados.'));
  }
  function appendMessage(row) {
    const entry=el('div','sticker-message'+(row.sender_id===session.id?' mine':''));
    entry.append(el('small','',row.sender_id===session.id?'Tú':session.role==='psychologist'?'Paciente':'Psicóloga'));
    if(row.kind==='text')entry.append(el('span','',row.body));
    else{
      const item=itemById(row.sticker)||{id:row.sticker,label:row.label,image:row.image};
      const picture=visual(item);
      picture.removeAttribute('aria-hidden');picture.setAttribute('role','img');picture.setAttribute('aria-label',item.label||'Sticker');
      entry.append(picture);
      const save=el('button','secondary','Guardar sticker');save.type='button';
      save.onclick=()=>{
        if(!itemById(item.id)&&item.image&&preferences.own.length<6)preferences.own.push(item);
        if(!itemById(item.id)){setStatus('Tu colección de imágenes está llena.');return;}
        if(!preferences.favorite.includes(item.id))toggleFavorite(item.id);
        save.textContent='Guardado';
      };
      entry.append(save);
    }
    log.append(entry);
  }
  function render(rows) {
    const nearEnd=log.scrollHeight-log.scrollTop-log.clientHeight<60;
    log.replaceChildren(clouds);
    clouds.hidden=rows.length>0;
    for(const row of rows)appendMessage(row);
    if(nearEnd)log.scrollTop=log.scrollHeight;
  }
  async function refresh(id=generation,selected=thread) {
    if(!session||!selected)return;
    if(session.demo){render(read(demoThread,[]));return;}
    const {data,error}=await session.client.from('kodama_chat_messages').select('*')
      .eq('thread_id',selected).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(60);
    if(id!==generation||selected!==thread)return;
    if(error){setStatus('No se pudo cargar la conversación.');return;}
    render(data.reverse());
  }
  function stopUpdates() {
    clearInterval(refreshTimer);
    if(subscription){subscription.client.removeChannel(subscription.channel);subscription=null;}
  }
  function openThread(id) {
    stopUpdates();thread=id;
    void refresh();
    if(!session.demo&&id){
      const client=session.client;
      const channel=client.channel('kodama-chat-'+id).on('postgres_changes',
        {event:'INSERT',schema:'public',table:'kodama_chat_messages',filter:'thread_id=eq.'+id},()=>void refresh()).subscribe();
      subscription={client,channel};
      refreshTimer=setInterval(()=>void refresh(),12000);
    }
  }
  function enableComposer(enabled) {
    $('message-form').hidden=!enabled;
    $('open-stickers').disabled=!enabled;
  }
  async function setSession(next){
    generation++;
    const id=generation;
    stopUpdates();
    session=null;thread=null;preferences=empty();
    if(dialog.open)dialog.close();
    log.replaceChildren(clouds);clouds.hidden=false;
    enableComposer(false);
    $('chat-thread-label').hidden=true;
    threadSelect.replaceChildren();
    $('chat-connection').textContent='';
    $('chat-demo-availability').hidden=!next.demo;
    const title=document.querySelector('.chat-head h3');
    title.dataset.es=next.role==='psychologist'?'Paciente':'Psicólogo';
    title.dataset.en=next.role==='psychologist'?'Patient':'Psychologist';
    title.textContent=title.dataset[document.documentElement.lang]||title.dataset.es;
    if(next.role!=='user'&&next.role!=='psychologist')return;
    session={...next,id:next.email};
    if(next.demo){
      preferences=read(prefKey(next.email),empty());
      $('chat-connection').textContent='Conversación de prueba de este navegador. Usa datos ficticios.';
      $('sticker-create').hidden=false;
      enableComposer(true);openThread(demoThread);return;
    }
    $('sticker-create').hidden=true;
    $('chat-connection').textContent='Buscando conversaciones asignadas…';
    const {data:{session:saved}}=await next.client.auth.getSession();
    if(id!==generation||!saved)return;
    session.id=saved.user.id;
    const [threads,result]=await Promise.all([
      next.client.from('kodama_chat_threads').select('id,caption').order('created_at'),
      next.client.from('kodama_chat_preferences').select('settings').maybeSingle()
    ]);
    if(id!==generation)return;
    preferences={...empty(),...result.data?.settings};
    if(threads.error||!threads.data?.length){
      $('chat-connection').textContent=threads.error?'El chat privado no está disponible.':'Todavía no tienes una conversación asignada.';
      return;
    }
    for(const row of threads.data)threadSelect.append(new Option(row.caption,row.id));
    $('chat-thread-label').hidden=threads.data.length<2;
    $('chat-connection').textContent='Conversación privada';
    enableComposer(true);openThread(threads.data[0].id);
  }
  async function sendMessage(payload){
    if(!session||!thread)throw new Error('No conversation');
    const current=session, selected=thread, id=generation;
    const row={...payload,sender_id:current.id,created_at:new Date().toISOString()};
    if(current.demo){
      const rows=read(demoThread,[]);write(demoThread,[...rows,row].slice(-60));
    }else{
      if(payload.image)throw new Error('Only reviewed catalog assets can be sent');
      const {error}=await current.client.from('kodama_chat_messages').insert({...payload,sender_id:current.id,thread_id:selected});
      if(error)throw error;
    }
    if(id!==generation||selected!==thread)return;
    if(row.kind==='sticker'){
      preferences.recent=[row.sticker,...preferences.recent.filter(x=>x!==row.sticker)].slice(0,20);
      savePreferences();
    }
    await refresh(id,selected);
  }
  for(const [value,label] of Object.entries(titles))$('sticker-category').append(new Option(label,value));
  $('open-stickers').onclick=()=>{
    if(!session||!thread)return;
    $('sticker-search').value='';
    $('sticker-category').value=preferences.category;
    $('sticker-status').textContent='';
    drawPicker();dialog.showModal();
  };
  $('sticker-category').onchange=()=>{
    if(!session)return;
    preferences.category=$('sticker-category').value;savePreferences();drawPicker();
  };
  $('sticker-search').oninput=drawPicker;
  threadSelect.onchange=()=>openThread(threadSelect.value);
  $('message-form').addEventListener('submit',async event=>{
    event.preventDefault();const field=$('message'), text=field.value.trim();
    if(!text)return;
    const button=event.currentTarget.querySelector('[type=submit]');
    button.disabled=true;
    try{await sendMessage({kind:'text',body:text});if(field.value.trim()===text)field.value='';}
    catch{setStatus('No se pudo enviar el mensaje.');}
    finally{button.disabled=false;}
  });
  $('sticker-import').onsubmit=async event=>{
    event.preventDefault();
    if(!session?.demo)return;
    const id=generation, form=event.currentTarget, data=new FormData(form), file=data.get('image');
    if(!['image/png','image/webp','image/gif'].includes(file.type)||file.size>524288||preferences.own.length>=6){
      setStatus('Elige un PNG, WebP o GIF de hasta 512 KB. Puedes guardar seis imágenes.');return;
    }
    try{
      const image=await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);
      });
      if(!imagePattern.test(image)||id!==generation)return;
      const preview=new Image();
      preview.src=image;
      await preview.decode();
      if(preview.naturalWidth>1024||preview.naturalHeight>1024)throw new Error('Image too large');
      if(id!==generation)return;
      preferences.own.push({id:'import-'+crypto.randomUUID(),label:String(data.get('label')).trim(),image});
      preferences.category='own';$('sticker-category').value='own';
      savePreferences();drawPicker();form.reset();setStatus('Sticker guardado en este navegador.');
    }catch{setStatus('No se pudo importar la imagen. Usa un archivo válido de hasta 1024 × 1024.');}
  };
  window.addEventListener('storage',event=>{if(session?.demo&&event.key===demoThread)void refresh();});
  window.kodamaChat={setSession};
})();


