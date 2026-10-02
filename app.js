const pages=['首页','学习计划','单词','语法','读解','听解','专项练习','模考','错题本','收藏','统计','官方资料'];
const nav=document.querySelector('#nav'), app=document.querySelector('#app');
let state=JSON.parse(localStorage.getItem('n1os')||'{"done":{},"words":0,"grammar":0,"wrong":[],"days":[],"wordSrs":{}}');
if(!state.wordSrs) state.wordSrs={};
if(!state.audio) state.audio={rate:1, autoWord:false, autoExample:false};
if(!state.history) state.history=[];
state.version='3.4';
if(!state.studySession) state.studySession={wordKey:null, deckIndex:0, date:null, newSeenToday:0, reviewsToday:0};
const save=()=>localStorage.setItem('n1os',JSON.stringify(state));
function countdown(){const target=new Date('2027-12-05T09:00:00');const d=Math.max(0,Math.ceil((target-new Date())/86400000));document.querySelector('#countdown').textContent=`あと ${d} 日（暂定）`};countdown();
function render(p,b){[...nav.children].forEach(x=>x.classList.remove('active'));if(b)b.classList.add('active');document.querySelector('#pageTitle').textContent=p==='首页'?'今日の学習':p; app.innerHTML=views[p]();bind(p)}
const taskData=[['単語','新词 20 + 复习 30','20 min'],['文法','N1 核心语法 3 条','15 min'],['読解','中篇阅读 1 篇','15 min'],['聴解','ポイント理解练习','20 min'],['復習','昨日错题','10 min']];
const views={
'首页':()=>{let n=Object.values(state.done).filter(Boolean).length;return `<div class=grid><div class='card span8'><h2>今日の学習 <span class=tag>${n}/5</span></h2>${taskData.map((t,i)=>`<label class=task><input type=checkbox data-task=${i} ${state.done[i]?'checked':''}><span class=grow><b>${t[0]}</b><br><span class=muted>${t[1]}</span></span><span class=pill>${t[2]}</span></label>`).join('')}</div><div class='card span4'><h2>今日の進捗</h2><div class=big>${n*20}%</div><div class=bar><i style='width:${n*20}%'></i></div><p class=muted>每日完成一点，比临考突击更重要。</p></div><div class='card span8'><h2>Road to N1</h2><p><b>Phase 1 · 基础构建</b>　2026.10 — 2027.02</p><div class=bar><i style='width:3%'></i></div><p class=muted>当前重点：建立 N1 词汇/语法基础，并养成持续听力输入。</p></div><div class='card span4'><h2>弱点</h2><p class=notice>数据积累中。完成练习后，这里会自动显示正确率最低的题型。</p></div></div>`},
'学习计划':()=>`<div class=grid>${[['2026.10 — 2027.02','基础构建','词汇、语法第一轮；每天 20 分钟听力'],['2027.03 — 06','系统学习','完成 N1 核心知识；系统加入阅读'],['2027.07 — 09','专项强化','阅读速度、听力题型、弱项训练'],['2027.10 — 11','模考期','完整套题、计时、错题回炉'],['2027.12','冲刺','保持手感、复习高频错题']].map(x=>`<div class='card span6'><span class=tag>${x[0]}</span><h2>${x[1]}</h2><p>${x[2]}</p></div>`).join('')}</div>`,
'单词':()=>wordFlashcards(),
'语法':()=>study('文法','〜にひきかえ','接续：名詞＋にひきかえ','与……相反；相比之下','去年は暖冬だった（　）、今年は非常に寒い。',['にひきかえ','を皮切りに','に至って','をものともせず'],0),
'读解':()=>`<div class=card><span class=tag>読解 · 中篇</span><h2>计时阅读训练</h2><p class=muted>建议 7:00 内完成</p><div class=question>便利さを追求することは、必ずしも生活を豊かにするとは限らない。時間を節約する道具が増えたにもかかわらず、私たちは以前より忙しいと感じている……</div><p><b>作者最想表达什么？</b></p><div class=choices><button>便利的工具应该减少使用</button><button data-correct=1>便利与生活的充实并不必然一致</button><button>现代人没有时间观念</button><button>技术发展让人更加幸福</button></div><p id=feedback></p></div>`,
'听解':()=>`<div class=grid><div class='card span8'><span class=tag>聴解 · ポイント理解</span><h2>音频训练区</h2><p>正式版这里用于播放你导入的合法音频材料；第一次作答时不显示 transcript。</p><div class=question>▶︎　00:00 ━━━━━━━━━ 00:42<br><small>0.8×　1.0×　1.2×</small></div><button class=btn id=transcript>提交后查看 Transcript</button><p id=trans hidden>Transcript / 答案依据会显示在这里。</p></div><div class='card span4'><h2>训练原则</h2><p>① 不看字幕作答<br>② 核对答案<br>③ 精听错误位置<br>④ 最后查看文本</p></div></div>`,
'专项练习':()=>`<div class=grid>${['近义词辨析','助词・接续','文章主旨','信息检索','即時応答','統合理解'].map(x=>`<div class='card span4'><h2>${x}</h2><p class=muted>完成更多练习后自动生成针对性题组。</p><button class='btn secondary'>开始练习</button></div>`).join('')}</div>`,
'模考':()=>`<div class=grid><div class='card span6'><span class=tag>SECTION 1</span><h2>言語知識・読解</h2><div class=big>110:00</div><p>完整计时模拟。建议进入模考阶段后使用。</p></div><div class='card span6'><span class=tag>SECTION 2</span><h2>聴解</h2><div class=big>約 55:00</div><p>连续播放，模拟正式考试节奏。</p></div><div class='card span12'><button class=btn>开始一次模拟考试</button> <span class=muted>当前为框架版；题库会逐步扩充。</span></div></div>`,
'错题本':()=>`<div class=card><h2>自動収集された間違い</h2>${state.wrong.length?state.wrong.map(x=>`<div class=task><span class=pill>${x.type}</span><span>${x.q}</span></div>`).join(''):'<p class=muted>还没有错题。做错的练习会自动出现在这里。</p>'}</div>`,
'收藏':()=>`<div class=card><h2>收藏夹</h2><p class=muted>以后可收藏单词、语法、阅读文章与错题。</p></div>`,
'统计':()=>`<div class=grid><div class='card span12'><div class=metrics>${[['学习天数',state.days.length],['已学习词汇',progressSummary().totalReviewed],['已掌握词汇',progressSummary().mastered],['累计复习',progressSummary().reviews]].map(x=>`<div class=metric><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div></div><div class='card span6'><h2>近 7 日学习量</h2><div class=week>${[25,55,35,80,60,90,45].map(h=>`<i style='height:${h}%'></i>`).join('')}</div></div><div class='card span6'><h2>能力趋势</h2><p>語彙　—　数据积累中</p><p>文法　—　数据积累中</p><p>読解　—　数据积累中</p><p>聴解　—　数据积累中</p></div></div>`,
'官方资料':()=>`<div class=grid><div class='card span6 resource'><h2>JLPT 官方样题</h2><p>使用官方 Sample Questions 熟悉 N1 题型。</p><a href='https://www.jlpt.jp/e/samples/forlearners.html' target=_blank>打开 JLPT 官方页面 ↗</a></div><div class='card span6 resource'><h2>Official Practice Workbook</h2><p>官方练习册、答案与听力材料入口。</p><a href='https://www.jlpt.jp/e/samples/sampleindex.html' target=_blank>打开官方 Practice Workbook ↗</a></div><div class='card span12'><p class=notice>版权材料不直接复制进本站。你合法拥有的教材/PDF/音频后续可以做成个人练习库。</p></div><div class='card span12'><h2>词典数据署名</h2><p class=muted>N1 分级与例句：OpenJLPT（CC BY-SA 4.0）。中文释义：Tomoshi Open Data（Y1Z）及其 JMdict/EDRDG 衍生数据（CC BY-SA 4.0）。本项目仅抽取 N1 词条并按 JMdict ID 合并为学习用 JSON。</p></div></div>`};
const FALLBACK_WORDS=[
{id:'local-1',word:'見合わせる',reading:'みあわせる',meanings:['暂缓；推迟；暂且不做'],pos:['他動詞・一段'],examples:[{ja:'悪天候のため、試合の開催を見合わせることになった。',furigana:'{悪天候|あくてんこう}のため、{試合|しあい}の{開催|かいさい}を{見合|みあ}わせることになった。',en:'因天气恶劣，决定暂缓举行比赛。'}],zh:true},
{id:'local-2',word:'促す',reading:'うながす',meanings:['催促；促使；推动'],pos:['他動詞・五段'],examples:[{ja:'政府は企業に対して、働き方の見直しを促した。',furigana:'{政府|せいふ}は{企業|きぎょう}に{対|たい}して、{働|はたら}き{方|かた}の{見直|みなお}しを{促|うなが}した。',en:'政府敦促企业重新审视工作方式。'}],zh:true},
{id:'local-3',word:'滞る',reading:'とどこおる',meanings:['停滞；拖延；不顺畅'],pos:['自動詞・五段'],examples:[{ja:'大雪の影響で、商品の配送が滞っている。',furigana:'{大雪|おおゆき}の{影響|えいきょう}で、{商品|しょうひん}の{配送|はいそう}が{滞|とどこお}っている。',en:'受大雪影响，商品配送出现了延误。'}],zh:true},
{id:'local-4',word:'免れる',reading:'まぬかれる',meanings:['避免；幸免；摆脱'],pos:['他動詞・一段'],examples:[{ja:'早めに避難したため、大きな被害を免れた。',furigana:'{早|はや}めに{避難|ひなん}したため、{大|おお}きな{被害|ひがい}を{免|まぬか}れた。',en:'因为提前避难，避免了重大损失。'}],zh:true},
{id:'local-5',word:'著しい',reading:'いちじるしい',meanings:['显著的；明显的；惊人的'],pos:['い形容詞'],examples:[{ja:'この地域では人口の減少が著しい。',furigana:'この{地域|ちいき}では{人口|じんこう}の{減少|げんしょう}が{著|いちじる}しい。',en:'这个地区的人口减少十分显著。'}],zh:true}
];
const LOCAL_VOCAB_URL='./n1-vocab-zh.json';
const VOCAB_URL='https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json/vocab/n1.json';
let wordDeck=FALLBACK_WORDS.slice(), wordIndex=Number(state.studySession?.deckIndex||0), wordRevealed=false, vocabLoading=false, vocabLoaded=false, vocabError='';
async function loadVocabulary(){
 if(vocabLoading||vocabLoaded)return; vocabLoading=true;
 try{
  let data=null;
  // V3.4: prefer the repository-local Chinese merged vocabulary generated from Tomoshi + OpenJLPT.
  // Fall back to upstream OpenJLPT only if the generated file has not been built yet.
  try{
    const lr=await fetch(LOCAL_VOCAB_URL+'?v=34',{cache:'no-cache'});
    if(lr.ok){const local=await lr.json();if(Array.isArray(local)&&local.length>3000)data=local;}
  }catch(_e){}
  if(!data){
    if('caches' in window){const c=await caches.open('n1-vocab-v34');let r=await c.match(VOCAB_URL);if(r)data=await r.json();else{r=await fetch(VOCAB_URL,{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);await c.put(VOCAB_URL,r.clone());data=await r.json();}}
    else {const r=await fetch(VOCAB_URL);if(!r.ok)throw new Error('HTTP '+r.status);data=await r.json();}
  }
  if(Array.isArray(data)&&data.length>3000){wordDeck=data;vocabLoaded=true;vocabError='';restoreWordPosition();}
  else throw new Error('词库数据不完整');
 }catch(e){vocabError='完整词库暂时无法载入；当前使用内置示范词。联网后刷新即可重试。';console.error(e)}
 vocabLoading=false;
 if(document.querySelector('#pageTitle')?.textContent==='单词') render('单词',nav.children[pages.indexOf('单词')]);
}

function wordKey(w){return String(w?.id||w?.word||'')}
function restoreWordPosition(){
 const ss=state.studySession||{};
 let i=-1;
 if(ss.wordKey) i=wordDeck.findIndex(w=>wordKey(w)===String(ss.wordKey));
 if(i<0 && Number.isFinite(ss.deckIndex)) i=Math.min(Math.max(0,Number(ss.deckIndex)),Math.max(0,wordDeck.length-1));
 wordIndex=i>=0?i:0;
}
function persistWordPosition(){
 const w=wordDeck[wordIndex%wordDeck.length];
 state.studySession=state.studySession||{};
 state.studySession.wordKey=wordKey(w);
 state.studySession.deckIndex=wordIndex%wordDeck.length;
 state.studySession.date=new Date().toISOString().slice(0,10);
 save();
}
function nextUnseenIndex(start){
 if(!wordDeck.length)return 0;
 for(let step=1;step<=wordDeck.length;step++){
  const i=(start+step)%wordDeck.length, w=wordDeck[i];
  if(!state.wordSrs[wordKey(w)]) return i;
 }
 return (start+1)%wordDeck.length;
}
function sessionStats(){
 const ss=state.studySession||{};
 return {newSeenToday:ss.newSeenToday||0,reviewsToday:ss.reviewsToday||0};
}

function furiganaHTML(s=''){return s.replace(/\{([^|{}]+)\|([^{}]+)\}/g,'<ruby>$1<rt>$2</rt></ruby>')}
function dueWords(){const now=Date.now();return wordDeck.filter(w=>state.wordSrs[w.id||w.word]?.due<=now).length}
function knownWords(){return Object.values(state.wordSrs).filter(v=>['Familiar','Mastered'].includes(v.level)).length}
function wordFlashcards(){
 if(!vocabLoaded&&!vocabLoading)setTimeout(loadVocabulary,0);
 const x=wordDeck[wordIndex%wordDeck.length], key=x.id||x.word, rec=state.wordSrs[key]||{}, ex=x.examples?.[0];
 const zhMeanings=(x.zh_meanings||[]);
 const enMeanings=(x.meanings||[]);
 const hasZh=zhMeanings.length>0 || x.zh===true;
 const meanings=(hasZh?(zhMeanings.length?zhMeanings:enMeanings):enMeanings).join('；');
 const enGloss=enMeanings.join('; ');
 return `<div class=grid><div class='card span8 flashcard'>
 <div class=flash-top><span class=tag>語彙 · Flashcard</span><span class=progress-mini>${wordIndex%wordDeck.length+1} / ${wordDeck.length} · ${rec.level||'New'}</span></div>
 <div class=word-audio-row><h2 class=flash-word>${x.word}</h2><button class='audio-btn' id=speakWord aria-label='播放单词发音'>🔊</button></div><div class=flash-reading>${x.reading||''} ${x.romaji?`<small>· ${x.romaji}</small>`:''}</div>
 ${wordRevealed?`<div class=answer-panel><p class=meaning>${hasZh?meanings:'中文释义暂缺'}</p><p class=muted>${hasZh?'简体中文释义':'该词条尚未成功匹配中文开放词典；英文仅作辅助。'}</p>${enGloss?`<details class=english-gloss><summary>查看英文原释义</summary><p>${enGloss}</p></details>`:''}
 ${ex?`<div class=example><div class=example-head><b>${ex.ja}</b><button class='audio-btn small' id=speakExample aria-label='播放例句'>🔊</button></div>${ex.furigana?`<div class=example-reading>${furiganaHTML(ex.furigana)}</div>`:''}<div>${ex.en||''}</div></div>`:`<div class=notice>该词条的数据源暂无例句；不伪造例句。</div>`}
 <div class=meta-row><b>词性</b><span>${(x.pos||[]).join(' · ')||'—'}</span></div><div class=meta-row><b>JLPT</b><span>${x.level||'N1'}</span></div>
 <div class=srs-actions><button data-rate=again>不会<br><small>10 分钟</small></button><button data-rate=hard>模糊<br><small>1 天</small></button><button data-rate=good>认识<br><small>3 天</small></button></div></div>`:`<div class=reveal><p class=muted>先在脑中回忆词义，再显示答案。</p><button class=btn id=revealWord>显示答案</button></div>`}
 </div><div class='card span4'><h2>N1 Vocabulary</h2><div class=metrics style='grid-template-columns:1fr 1fr'><div class=metric><span>词库</span><b>${wordDeck.length}</b></div><div class=metric><span>已掌握</span><b>${knownWords()}</b></div><div class=metric><span>待复习</span><b>${dueWords()}</b></div><div class=metric><span>状态</span><b style='font-size:15px'>${vocabLoaded?'完整库':'载入中'}</b></div></div>${vocabError?`<p class=notice>${vocabError}</p>`:''}<p class=muted>词表分级来自 OpenJLPT（N1 3,463 词）。V3.4 优先读取仓库内由 Tomoshi 开放中文数据按 JMdict ID 合并生成的中文词库；英文只保留在“查看英文原释义”中。</p><div class=notice><b>中文覆盖</b><br>${vocabLoaded?`${wordDeck.filter(w=>(w.zh_meanings||[]).length||w.zh).length} / ${wordDeck.length}（${(wordDeck.filter(w=>(w.zh_meanings||[]).length||w.zh).length/wordDeck.length*100).toFixed(1)}%）`:'词库载入后显示实际覆盖率'}</div><div class=notice><b>断点续学已开启</b><br>退出或刷新后会恢复到当前词；已经学习过的词不会再次作为 New 从头开始。</div><div class=vocab-tools><button class='btn secondary' id=exportProgress>导出进度备份</button><label class='btn secondary file-btn'>导入进度<input id=importProgress type=file accept='application/json' hidden></label></div><p class=muted>进度保存在当前浏览器，并可用 JSON 备份迁移到新设备。</p><div class=vocab-tools><button class='btn secondary' id=randomWord>随机一词</button><button class='btn secondary' id=dueWord>复习到期</button></div><div class=audio-settings><h3>🔊 发音设置</h3><label>语速 <select id=audioRate><option value='0.75' ${state.audio.rate==0.75?'selected':''}>慢速 0.75×</option><option value='1' ${state.audio.rate==1?'selected':''}>正常 1.0×</option></select></label><label><input type=checkbox id=autoWord ${state.audio.autoWord?'checked':''}> 显示答案时自动朗读单词</label><label><input type=checkbox id=autoExample ${state.audio.autoExample?'checked':''}> 显示答案时自动朗读例句</label><p class=muted id=voiceStatus>使用设备的 ja-JP 日语语音。</p></div></div></div>`}

function exampleSpeechText(ex){
 if(!ex)return '';
 if(ex.furigana){
   // Convert {漢字|かな} markup to kana while preserving kana/punctuation outside the markup.
   return ex.furigana.replace(/\{([^|{}]+)\|([^{}]+)\}/g,'$2');
 }
 return ex.ja||'';
}
function progressSummary(){
 const vals=Object.values(state.wordSrs||{});
 return {totalReviewed:vals.length,learning:vals.filter(v=>v.level==='Learning').length,familiar:vals.filter(v=>v.level==='Familiar').length,mastered:vals.filter(v=>v.level==='Mastered').length,reviews:vals.reduce((a,v)=>a+(v.reviews||0),0),days:(state.days||[]).length};
}
let japaneseVoice=null;
function refreshJapaneseVoice(){
 const voices=window.speechSynthesis?.getVoices?.()||[];
 japaneseVoice=voices.find(v=>/^ja-JP$/i.test(v.lang))||voices.find(v=>/^ja/i.test(v.lang))||null;
 return japaneseVoice;
}
if('speechSynthesis' in window){refreshJapaneseVoice();window.speechSynthesis.onvoiceschanged=refreshJapaneseVoice;}
function speakJapanese(text){
 if(!text)return false;
 if(!('speechSynthesis' in window)){alert('当前浏览器不支持语音朗读。请使用最新版 Safari / Chrome。');return false;}
 refreshJapaneseVoice();
 const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=Number(state.audio?.rate||1);u.pitch=1;
 if(japaneseVoice)u.voice=japaneseVoice;
 window.speechSynthesis.cancel();window.speechSynthesis.speak(u);return true;
}

function rateWord(rate){
 const x=wordDeck[wordIndex%wordDeck.length],key=wordKey(x),now=Date.now(),old=state.wordSrs[key]||{};
 const wasNew=!old.reviews; let days=0,level='Learning';
 if(rate==='again'){days=10/1440}
 else if(rate==='hard'){days=Math.max(1,(old.interval||0)*1.5);level='Learning'}
 else{days=old.interval?Math.min(90,Math.max(3,old.interval*2.3)):3;level=days>=21?'Mastered':'Familiar'}
 state.wordSrs[key]={level,last:now,due:now+days*86400000,reviews:(old.reviews||0)+1,interval:days,word:x.word,reading:x.reading||''};
 state.history.push({ts:now,key,word:x.word,reading:x.reading||'',rating:rate,level});
 if(state.history.length>10000)state.history=state.history.slice(-10000);
 state.studySession=state.studySession||{};
 if(wasNew)state.studySession.newSeenToday=(state.studySession.newSeenToday||0)+1; else state.studySession.reviewsToday=(state.studySession.reviewsToday||0)+1;
 state.words=knownWords(); if(!state.days.includes(new Date().toDateString()))state.days.push(new Date().toDateString());
 wordIndex=nextUnseenIndex(wordIndex); wordRevealed=false; persistWordPosition(); save();
 render('单词',nav.children[pages.indexOf('单词')]);
}
function study(type,title,reading,meaning,q,choices,correct){return `<div class=grid><div class='card span8'><span class=tag>${type}</span><h2>${title}</h2><p>${reading}</p><p class=big style='font-size:24px'>${meaning}</p><div class=question>${q}</div><div class=choices>${choices.map((c,i)=>`<button data-answer=${i} data-correct=${i===correct?1:0}>${String.fromCharCode(65+i)}　${c}</button>`).join('')}</div><p id=feedback></p></div><div class='card span4'><h2>掌握状态</h2><button class='btn secondary mastery'>认识</button> <button class='btn secondary mastery'>模糊</button> <button class='btn secondary mastery'>不会</button><p class=muted>后续版本将按掌握程度安排间隔复习。</p></div></div>`}
function bind(p){let rw=document.querySelector('#revealWord');if(rw)rw.onclick=()=>{wordRevealed=true;render('单词',nav.children[pages.indexOf('单词')]);const x=wordDeck[wordIndex%wordDeck.length];if(state.audio.autoWord)speakJapanese(x.reading||x.word);if(state.audio.autoExample&&x.examples?.[0])setTimeout(()=>speakJapanese(exampleSpeechText(x.examples[0])),900)};let sw=document.querySelector('#speakWord');if(sw)sw.onclick=()=>{const x=wordDeck[wordIndex%wordDeck.length];speakJapanese(x.reading||x.word)};let se=document.querySelector('#speakExample');if(se)se.onclick=()=>{const x=wordDeck[wordIndex%wordDeck.length];speakJapanese(exampleSpeechText(x.examples?.[0]))};let ar=document.querySelector('#audioRate');if(ar)ar.onchange=()=>{state.audio.rate=Number(ar.value);save()};let aw=document.querySelector('#autoWord');if(aw)aw.onchange=()=>{state.audio.autoWord=aw.checked;save()};let ae=document.querySelector('#autoExample');if(ae)ae.onchange=()=>{state.audio.autoExample=ae.checked;save()};let rnd=document.querySelector('#randomWord');if(rnd)rnd.onclick=()=>{wordIndex=Math.floor(Math.random()*wordDeck.length);wordRevealed=false;persistWordPosition();render('单词',nav.children[pages.indexOf('单词')])};let due=document.querySelector('#dueWord');if(due)due.onclick=()=>{const now=Date.now(),i=wordDeck.findIndex(w=>(state.wordSrs[w.id||w.word]?.due||Infinity)<=now);if(i>=0)wordIndex=i;wordRevealed=false;persistWordPosition();render('单词',nav.children[pages.indexOf('单词')])};document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>rateWord(b.dataset.rate));document.querySelectorAll('[data-task]').forEach(x=>x.onchange=()=>{state.done[x.dataset.task]=x.checked;if(x.checked&&!state.days.includes(new Date().toDateString()))state.days.push(new Date().toDateString());save();render('首页',nav.children[0])});document.querySelectorAll('[data-correct]').forEach(x=>x.onclick=()=>{let ok=x.dataset.correct==='1';document.querySelector('#feedback').innerHTML=ok?'<b>✓ 正解</b>':'<b>✕ 不正解</b>　已加入错题本';if(!ok){state.wrong.push({type:p,q:x.closest('.card').querySelector('.question')?.textContent||'练习题'});save()}});document.querySelectorAll('.mastery').forEach(x=>x.onclick=()=>{if(p==='单词')state.words++;if(p==='语法')state.grammar++;save();x.textContent='✓ '+x.textContent});let ep=document.querySelector('#exportProgress');if(ep)ep.onclick=()=>{const blob=new Blob([JSON.stringify({app:'N1 Study OS',version:'3.4',exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='n1-study-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};let ip=document.querySelector('#importProgress');if(ip)ip.onchange=async()=>{const f=ip.files?.[0];if(!f)return;try{const d=JSON.parse(await f.text());const incoming=d.state||d;if(!incoming.wordSrs)throw new Error('invalid');if(confirm('导入会用备份覆盖当前学习进度，继续吗？')){state=incoming;if(!state.audio)state.audio={rate:1,autoWord:false,autoExample:false};if(!state.history)state.history=[];save();render('单词',nav.children[pages.indexOf('单词')])}}catch(e){alert('无法读取这个进度备份文件。')}};let t=document.querySelector('#transcript');if(t)t.onclick=()=>document.querySelector('#trans').hidden=false;document.querySelector('#streak').textContent=state.days.length}

// Mobile-first bottom navigation
const mobileItems=[['首页','⌂','首页'],['学习','学','单词'],['练习','練','专项练习'],['进度','進','统计'],['我的','☰','学习计划']];
const mobileNav=document.querySelector('#mobileNav');
if(mobileNav){mobileItems.forEach(([label,icon,page])=>{const bt=document.createElement('button');bt.innerHTML=`<b>${icon}</b>${label}`;bt.onclick=()=>{const idx=pages.indexOf(page);render(page,nav.children[idx]);[...mobileNav.children].forEach(x=>x.classList.remove('active'));bt.classList.add('active')};mobileNav.appendChild(bt)});mobileNav.children[0]?.classList.add('active')}

// Initialize only after all view functions exist. This avoids Safari/GitHub Pages loading a blank shell.
pages.forEach((p)=>{const b=document.createElement('button');b.textContent=p;b.onclick=()=>render(p,b);nav.appendChild(b)});
restoreWordPosition();
render('首页',nav.children[0]);
