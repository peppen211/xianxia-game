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

if (html.includes(oldEquip)) {
  html = html.replace(oldEquip, newEquip);
} else if (!html.includes("仿照高階靈寶特性煉製的器物類別")) {
  throw new Error("Catalog repair target was not found; refusing to silently skip the data fix.");
}

const versionLabelPattern = /(<small class="status-version" aria-label="遊戲版本">)v\d+\.\d+(<\/small>)/;
if (versionLabelPattern.test(html)) {
  html = html.replace(versionLabelPattern, '$1v6.21$2');
} else if (!html.includes('class="status-version" aria-label="遊戲版本">v6.21</small>')) {
  throw new Error("Cannot find the game version label.");
}

fs.writeFileSync(file, html, "utf8");
console.log("v6.21 save-safety regression + inventory geometry audit applied.");
