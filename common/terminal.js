// common/terminal.js

document.addEventListener("DOMContentLoaded", () => {
    const langLog = document.getElementById("lang-log");
    const termLog = document.getElementById("terminal-log");
    const input   = document.getElementById("cmd-input");
    const choiceList = document.getElementById("choice-list");
    const tabList    = document.getElementById("tab-list");
  
    if(!input || !termLog) return;
  
    let state = "init";        // init → yesno → choice or manual
    let choiceIndex = 0;
    const pages = (window.TerminalNav && window.TerminalNav.pages) || [];
  
    function printLine(msg){
      const div = document.createElement("div");
      div.className = "line";
      div.textContent = ">>> " + msg;
      termLog.appendChild(div);
      termLog.scrollTop = termLog.scrollHeight;
    }
  
    function clearChoices(){
      choiceList.innerHTML = "";
    }
  
    function renderChoices(){
      clearChoices();
      choiceIndex = 0;
      pages.forEach((p, idx)=>{
        const div = document.createElement("div");
        div.className = "choice-item";
        div.dataset.page = p;
        div.textContent = `>>> cd ${p}`;
        if(idx === 0) div.classList.add("active");
        div.addEventListener("click", ()=>{
          state = "choice";
          choiceIndex = idx;
          updateChoiceHighlight();
          confirmChoice();
        });
        choiceList.appendChild(div);
      });
    }
  
    function updateChoiceHighlight(){
      const items = choiceList.querySelectorAll(".choice-item");
      items.forEach((item, idx)=>{
        item.classList.toggle("active", idx === choiceIndex);
      });
    }
  
    function confirmChoice(){
      const items = choiceList.querySelectorAll(".choice-item");
      if(!items.length) return;
      const page = items[choiceIndex].dataset.page;
      if(window.TerminalNav){
        window.TerminalNav.go(page);
      }
    }
  
    function showTabList(prefix){
      // 横並び works/ profile/ ...
      if(!pages.length) return;
      const line = pages.map(p => p + "/").join("   ");
      tabList.textContent = line;
    }
  
    function handleYesNoAnswer(raw){
      const v = raw.trim().toLowerCase();
      if(v === "yes" || v === "y"){
        printLine("showing cd shortcuts...");
        state = "choice";
        renderChoices();
      }else if(v === "no" || v === "n"){
        printLine("manual mode: use cd <page>. press Tab to list folders.");
        state = "manual";
      }else{
        printLine("please answer yes or no.");
      }
    }
  
    function handleCommand(raw){
      const cmd = raw.trim();
      if(cmd === ""){
        return;
      }
      if(cmd.startsWith("cd ")){
        const dest = cmd.slice(3).trim();
        const resolved = window.TerminalNav && window.TerminalNav.resolve(dest);
        if(resolved){
          printLine(`changing directory to ${resolved}/`);
          window.TerminalNav.go(resolved);
        }else{
          printLine(`command not found: ${dest}`);
        }
      }else if(cmd === "help"){
        printLine("available: cd <works|profile|research|contact>, help");
      }else{
        printLine(`command not found: ${cmd}`);
      }
    }
  
    function handleEnter(){
      const value = input.value;
      const trimmed = value.trim();
      input.value = "";
  
      if(state === "yesno"){
        handleYesNoAnswer(trimmed);
      }else if(state === "manual"){
        handleCommand(trimmed);
      }else if(state === "choice"){
        if(trimmed === ""){
          // 何も入力していないときはハイライト選択を確定
          confirmChoice();
        }else{
          // 入力があるならそれをコマンドとして扱う
          handleCommand(trimmed);
        }
      }else{
        // 予備：initなど
        handleCommand(trimmed);
      }
    }
  
    function handleArrow(key){
      if(state !== "choice") return;
      const items = choiceList.querySelectorAll(".choice-item");
      if(!items.length) return;
      if(key === "ArrowDown"){
        choiceIndex = (choiceIndex + 1) % items.length;
        updateChoiceHighlight();
      }else if(key === "ArrowUp"){
        choiceIndex = (choiceIndex - 1 + items.length) % items.length;
        updateChoiceHighlight();
      }
    }
  
    function handleTab(e){
      // Tab → 一覧表示＆補完
      if(state !== "manual") return;
      e.preventDefault();
      const v = input.value;
      let afterCd = "";
      if(v.startsWith("cd")){
        afterCd = v.slice(2).trimStart(); // " cd<space>prefix"
      }else{
        // cd 以外のときはヒントだけ出す
        showTabList("");
        return;
      }
      const prefix = afterCd.trim();
      if(prefix.length === 0){
        // プレフィックスなし → 一覧だけ
        showTabList("");
        return;
      }
      const lower = prefix.toLowerCase();
      const matches = pages.filter(p => p.startsWith(lower));
      if(matches.length === 1){
        // 一意に決まるときだけ補完
        input.value = "cd " + matches[0];
      }
      showTabList(prefix);
    }
  
    // 入力イベント
    input.addEventListener("keydown", (e)=>{
      if(e.key === "Enter"){
        handleEnter();
      }else if(e.key === "Tab"){
        handleTab(e);
      }else if(e.key === "ArrowDown" || e.key === "ArrowUp"){
        handleArrow(e.key);
      }
    });
  
    // 初期化：日本語ログ → yes/no プロンプト
    function startYesNoPrompt(){
      state = "yesno";
      printLine("Move to another page? [yes/no]");
      input.focus();
    }
  
    if(langLog){
      // ja.lang ログ表示 → フェードアウト
      setTimeout(()=>{
        langLog.style.opacity = 0;
        setTimeout(()=>{
          langLog.style.display = "none";
          startYesNoPrompt();
        }, 400);
      }, 800);
    }else{
      startYesNoPrompt();
    }
  });
  