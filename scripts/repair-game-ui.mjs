import fs from "node:fs";

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

const repairStyle = `<style id="v619-mobile-card-layout-fix">
/* Keep long pet descriptions from overflowing into the next grid row on mobile. */
#gameApp #bag .bag-treasure-grid {
  flex: 0 0 auto !important;
  height: auto !important;
  grid-auto-rows: max-content !important;
  align-content: start !important;
}
#gameApp #bag .bag-treasure-card {
  height: auto !important;
  min-height: max-content !important;
  align-self: stretch !important;
}
#gameApp #bag .bag-pet-card .bag-treasure-description {
  min-height: 0 !important;
  overflow-wrap: anywhere !important;
}
#gameApp #bag .bag-pet-card .bag-pet-odds,
#gameApp #bag .bag-pet-card .bag-source-tag {
  display: block !important;
  flex: 0 0 auto !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  line-height: 1.45 !important;
}
</style>`;

if (!html.includes('id="v619-mobile-card-layout-fix"')) {
  if (!html.includes("</head>")) throw new Error("Cannot find </head> for the mobile layout repair.");
  html = html.replace("</head>", repairStyle + "\n</head>");
}

const oldEquip = `const equipRows=['法器','法寶','符寶','仿製靈寶'].map(function(name){return '<div class="rowitem"><div class="rowicon">器</div><div class="rowbody"><b>'+name+'</b><small>此處記錄器物的原作／物品類型；只有能放入裝備欄或使用欄的物品才歸入裝備類。獨立法寶類則管理遊戲內可啟用、會在戰鬥觸發效果的法寶，兩者用途不同。</small></div></div>';}).join('');`;
const newEquip = `const equipRows=[
  {name:'法器',desc:'低階修士常用的法力器具；具體用途、品階與使用限制依各物件的原作條目分別記錄。'},
  {name:'法寶',desc:'修士以法力操控、祭煉的器物；遊戲內法寶欄的自動觸發規則屬系統玩法，不代表每件原作法寶皆如此。'},
  {name:'符寶',desc:'以符籙封存器物威能、供修士使用的物件；效果與使用限制須依具體原作條目核對。'},
  {name:'仿製靈寶',desc:'仿照高階靈寶特性煉製的器物類別；實際威能、來源與限制需按個別原作條目核對。'}
].map(function(item){return '<div class="rowitem"><div class="rowicon">器</div><div class="rowbody"><b>'+item.name+'</b><small>'+item.desc+'</small></div></div>';}).join('');`;

const currentEquip = `const equipRows=['法器','法寶','符寶','仿製靈寶'].map(function(name){return '<div class="rowitem"><div class="rowicon">器</div><div class="rowbody"><b>'+name+'</b></div></div>';}).join('');`;

if (html.includes(oldEquip)) {
  html = html.replace(oldEquip, newEquip);
} else if (html.includes(currentEquip)) {
  html = html.replace(currentEquip, newEquip);
} else if (!html.includes("仿照高階靈寶特性煉製的器物類別")) {
  throw new Error("Catalog repair target was not found; refusing to silently skip the data fix.");
}

const bagBalanceStyle = `<style id="v647-bag-inventory-height-balance">
/* v6.47: cap the five equipment slots row and give the scrollable inventory the remaining mobile height. */
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout{
  grid-template-rows:82px minmax(0,1fr)!important;
  min-height:0!important;
}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel{
  min-height:0!important;height:82px!important;max-height:82px!important;
  box-sizing:border-box!important;padding:2px 5px!important;overflow:hidden!important;
}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel .secthead{
  min-height:15px!important;height:15px!important;margin:0!important;font-size:10px!important;
}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel .slotgrid{margin-top:1px!important;gap:2px!important;min-height:0!important}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel .slot{min-height:0!important;padding:1px!important;gap:0!important}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel .slot span{font-size:11px!important;line-height:1.05!important}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel .slot small{font-size:7px!important;line-height:1!important;margin-top:0!important}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel .slot b{font-size:7px!important;line-height:1!important;margin-top:0!important}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-slots-panel .gear-unequip{min-height:15px!important;height:auto!important;line-height:1!important;margin-top:1px!important;padding:1px!important;font-size:7px!important}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-list-panel{min-height:0!important;height:100%!important;overflow:hidden!important}
body #gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout>.bag-list-panel #inventory.bag-item-list{min-height:0!important;height:auto!important;max-height:100%!important;overflow-y:auto!important}
@media(max-height:700px){
 #gameApp #bag .bag-gear-layout{grid-template-rows:76px minmax(0,1fr)!important}
 #gameApp #bag .bag-slots-panel{height:76px!important;max-height:76px!important;padding:1px 4px!important}
 #gameApp #bag .bag-slots-panel .slot{padding:1px!important}
}
</style>`
if (!html.includes('id="v635-catalog-tabs-script"')) {
  if (!html.includes("</body>")) throw new Error("Cannot find </body> for catalog category tabs.");
  html = html.replace("</body>", catalogTabs + "\n</body>");
}
html = html.replace(/v6\.\d+ 非破壞性檢查/g, "v6.64 非破壞性檢查");



const catalogLocationPatch = `<script id="v647-catalog-location-script">
(function(){
 'use strict';
 function setup(){
  const bag=document.getElementById('bag'),cultivate=document.getElementById('cultivate');
  if(!bag||!cultivate)return;
  const tabs=bag.querySelector('.bag-main-tabs');
  const desiredOrder=['equipment','treasures','magic','pets','materials'];
  if(tabs){
   [['treasures','古寶類'],['magic','法寶類'],['pets','靈寵類']].forEach(function(item){
    if(!tabs.querySelector('[data-bag-main-tab="'+item[0]+'"]')){
     const btn=document.createElement('button');btn.type='button';btn.className='bag-main-tab';
     btn.dataset.bagMainTab=item[0];btn.setAttribute('role','tab');btn.setAttribute('aria-selected','false');btn.textContent=item[1];
     tabs.appendChild(btn);
    }
   });
   const actualOrder=Array.from(tabs.querySelectorAll('[data-bag-main-tab]')).map(function(btn){return btn.dataset.bagMainTab;});
   if(desiredOrder.some(function(key,index){return actualOrder[index]!==key;})){
    desiredOrder.forEach(function(key){const btn=tabs.querySelector('[data-bag-main-tab="'+key+'"]');if(btn)tabs.appendChild(btn);});
   }
  }
  const wrap=bag.querySelector('.bag-main-tabs-wrap');
  let catalogButton=bag.querySelector('.bag-catalog-button');
  if(!catalogButton&&wrap){
   catalogButton=document.createElement('button');catalogButton.type='button';catalogButton.className='btn secondary bag-catalog-button';
   catalogButton.textContent='分類圖鑑';
   catalogButton.addEventListener('click',function(){if(typeof window.openClassificationCatalog==='function')window.openClassificationCatalog();});
   const tabsInWrap=wrap.querySelector('.bag-main-tabs');
   if(tabsInWrap&&tabsInWrap.nextSibling)wrap.insertBefore(catalogButton,tabsInWrap.nextSibling);else wrap.appendChild(catalogButton);
  }
  let open=cultivate.querySelector('#openCultivateCatalog');
  if(!open){
   const panel=document.createElement('div');
   panel.className='panel';
   panel.innerHTML='<div class="secthead"><span>典藏圖鑑</span><small>法寶與生靈</small></div><p class="muted">查看修仙世界中的法寶、古寶、靈寵與特殊生靈。</p><button type="button" class="btn secondary" id="openCultivateCatalog">開啟分類圖鑑</button>';
   cultivate.appendChild(panel);
   open=panel.querySelector('#openCultivateCatalog');
  }
  if(open&&!open.dataset.bound){
   open.dataset.bound='1';
   open.addEventListener('click',function(){if(typeof window.openClassificationCatalog==='function')window.openClassificationCatalog();});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
</script>`;
const locationPattern = /<script id="v(?:637|639|641|642|643|644|645|646|647)-catalog-location-script">[\s\S]*?<\/script>/;
if (locationPattern.test(html)) {
  html = html.replace(locationPattern, catalogLocationPatch);
} else {
  if (!html.includes("</body>")) throw new Error("Cannot find </body> for catalog location patch.");
  html = html.replace("</body>", catalogLocationPatch + "\n</body>");
}

fs.writeFileSync(file, html, "utf8");
console.log("v6.64 catalog-only rendering fixed.");