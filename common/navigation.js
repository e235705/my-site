// common/navigation.js

// 管理する「フォルダ名」たち
const TERMINAL_PAGES = ["works","profile","research","contact"];

const TERMINAL_PAGE_MAP = {
  works:   "works.html",
  profile: "profile.html",
  research:"research.html",
  contact: "contact.html"
};

function resolvePageName(name){
  if(!name) return null;
  const lower = name.toLowerCase();
  if(TERMINAL_PAGES.includes(lower)) return lower;
  return null;
}

function navigateToPage(name){
  const key = resolvePageName(name);
  if(!key) return;
  const url = TERMINAL_PAGE_MAP[key];
  if(url){
    location.href = url;
  }
}

// 他のスクリプトから使えるようにグローバルに出す
window.TerminalNav = {
  pages: TERMINAL_PAGES,
  resolve: resolvePageName,
  go: navigateToPage
};
