import { useState, useEffect, useCallback } from "react";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const RED_SUITS = ["♥", "♦"];

// ── colours ──────────────────────────────────────────────────────────────────
const C = {
  felt:       "#1a5c38",
  feltLight:  "#206b42",
  feltBorder: "#174f31",
  gold:       "#c9a84c",
  goldLight:  "#e8c96a",
  cream:      "#fdf8f0",
  red:        "#c0392b",
  dark:       "#1a1a2e",
  panel:      "rgba(0,0,0,0.35)",
  panelBorder:"rgba(255,255,255,0.12)",
  text:       "#f0e6d0",
  textMuted:  "rgba(240,230,208,0.55)",
  blue:       "#2563eb",
  blueLight:  "#dbeafe",
  selected:   "#f59e0b",
};

// ── translations ─────────────────────────────────────────────────────────────
const T = {
  en: {
    title: "DILOTI", subtitle: "Diloti",
    rules: "📖 Rules", newGame: "New Game", beginner: "BEGINNER", expert: "EXPERT",
    you: "YOU", ai: "AI", target: "TARGET",
    aiHand: "AI HAND", table: "TABLE", yourHand: "YOUR HAND",
    captured: "captured", xeri: "xeri", inStock: "in stock",
    capture: "Capture", layCard: "Lay card", declarePile: "Declare pile",
    declare: "Declare", confirm: "Confirm",
    aiThinking: "AI is thinking…",
    roundOver: "Round over", nextRound: "Next round →",
    playAgain: "Play again",
    selectCard: "Your turn — select a card from your hand.",
    noCards: "No cards", tableEmpty: "Table is empty",
    rulesTitle: "How to play Diloti",
    tabs: ["Overview","Capturing","Declaring","Scoring"],
  },
  gr: {
    title: "ΔΗΛΩΤΗ", subtitle: "Δηλωτή",
    rules: "📖 Κανόνες", newGame: "Νέο Παιχνίδι", beginner: "ΑΡΧΑΡΙΟΣ", expert: "ΕΙΔΙΚΟΣ",
    you: "ΕΣΥΣ", ai: "ΑΙ", target: "ΣΤΟΧΟΣ",
    aiHand: "ΧΑΡΤΙΑ ΑΙ", table: "ΤΡΑΠΕΖΙ", yourHand: "ΤΑ ΧΑΡΤΙΑ ΣΟΥ",
    captured: "πιάστηκαν", xeri: "ξερί", inStock: "στη τράπουλα",
    capture: "Πάρε", layCard: "Άφησε", declarePile: "Δήλωσε",
    declare: "Δήλωσε", confirm: "Επιβεβαίωσε",
    aiThinking: "Το ΑΙ σκέφτεται…",
    roundOver: "Τέλος γύρου", nextRound: "Επόμενος γύρος →",
    playAgain: "Παίξε ξανά",
    selectCard: "Η σειρά σου — διάλεξε χαρτί.",
    noCards: "Κανένα χαρτί", tableEmpty: "Το τραπέζι είναι άδειο",
    rulesTitle: "Πώς να παίξεις Δηλωτή",
    tabs: ["Γενικά","Πάρσιμο","Δηλώσεις","Βαθμολογία"],
  },
};

const RULES_GR = {
  "Γενικά": (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{marginBottom:8}}>Η Δηλωτή είναι κλασικό ελληνικό χαρτοπαίγνιο. Παίζετε εναλλάξ για να πιάνετε χαρτιά από το τραπέζι.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Στήσιμο</p>
    <ul style={{paddingLeft:18,marginBottom:8}}><li>6 χαρτιά σε κάθε παίκτη, 4 ανοιχτά στο τραπέζι</li><li>Εσύ παίζεις πρώτος. Νέα χαρτιά μοιράζονται όταν αδειάσουν τα χέρια.</li></ul>
    <p style={{fontWeight:700,marginBottom:3}}>Η σειρά σου</p>
    <p>Διάλεξε χαρτί από το χέρι σου, μετά <b>Πάρε</b>, <b>Άφησε</b>, ή <b>Δήλωσε</b>.</p>
  </div>),
  "Πάρσιμο": (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{fontWeight:700,marginBottom:3}}>Ίδιο νούμερο</p><p style={{marginBottom:8}}>Παίξε ένα 7 για να πάρεις ένα 7 από το τραπέζι.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Άθροισμα</p><p style={{marginBottom:8}}>Παίξε ένα 9 για να πάρεις 4+5. Μπορείς να πάρεις πολλούς συνδυασμούς ταυτόχρονα.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Φιγούρες (J, Q, K)</p><p style={{marginBottom:8}}>Χωρίς αριθμητική αξία — πιάνουν μόνο μία φιγούρα του ίδιου είδους.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Άφεσε χαρτί</p><p>Αφήνεις χαρτί αν δεν θέλεις να πάρεις. Αλλά αν έχεις δήλωση, πρέπει να πάρεις.</p>
  </div>),
  "Δηλώσεις": (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{fontWeight:700,marginBottom:3}}>Απλή δήλωση</p><p style={{marginBottom:8}}>Παίξε χαρτί μαζί με χαρτιά από το τραπέζι που το άθροισμά τους ισούται με τη δηλωμένη αξία. Πρέπει να έχεις άλλο χαρτί ίδιας αξίας στο χέρι.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Οικογένεια</p><p style={{marginBottom:8}}>Ομαδοποίησε χαρτιά ίδιας αξίας (π.χ. τρία 8άρια). Παίρνονται μόνο ως σύνολο.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Ανέβασμα</p><p style={{marginBottom:8}}>Πρόσθεσε χαρτί στη δήλωση του αντιπάλου για να ανεβάσεις την αξία (μέχρι 10).</p>
    <p style={{fontWeight:700,marginBottom:3}}>Υποχρέωση</p><p>Αν έχεις δήλωση στο τραπέζι, <b>πρέπει</b> να πάρεις ή να προσθέσεις στη δήλωση. Δεν μπορείς να αφήσεις χαρτί ή να κάνεις νέα δήλωση.</p>
  </div>),
  "Βαθμολογία": (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{marginBottom:8}}>11 πόντοι ανά γύρο, συν ξερί:</p>
    <ul style={{paddingLeft:18,marginBottom:8}}>
      <li><b>+4</b> — περισσότερα χαρτιά (ισοπαλία 26-26: κανείς δεν παίρνει)</li>
      <li><b>+1 έκαστο</b> — Άσοι (4 διαθέσιμοι)</li>
      <li><b>+2</b> — το 10♦ ("το καλό δέκα")</li>
      <li><b>+1</b> — το 2♣ ("το καλό δύο")</li>
      <li><b>+10</b> — ανά ξερί</li>
    </ul>
    <p><b>Πρώτος στους 61 πόντους κερδίζει.</b></p>
  </div>),
};

function cardVal(r) { if(r==="A")return 1; const n=parseInt(r); return isNaN(n)?null:n; }
function isFace(r) { return ["J","Q","K"].includes(r); }
function makeDeck() { const d=[]; for(const s of SUITS)for(const r of RANKS)d.push({rank:r,suit:s,id:r+s}); return d; }
function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

function newGameState(prev={player:0,ai:0}) {
  const deck=shuffle(makeDeck());
  return {
    deck:deck.slice(16), playerHand:deck.slice(0,6), aiHand:deck.slice(6,12),
    tableCards:deck.slice(12,16).map(c=>({...c,decl:null})),
    playerPile:[], aiPile:[], playerXeri:0, aiXeri:0,
    playerTotal:prev.player, aiTotal:prev.ai,
    lastCapture:null, turn:"player", selectedCard:null, selectedTable:[],
    declValue:"", log:"Your turn — select a card from your hand.",
    gameOver:null, roundOver:null,
  };
}

function deepFlatten(items) {
  const r=[];
  for(const it of items){
    if(it.cards&&it.cards.length>0) r.push(...deepFlatten(it.cards));
    else if(!it.isDecl) r.push(it);
  }
  return r;
}

function findCombos(value, tableCards) {
  const nums=tableCards.filter(tc=>!isFace(tc.rank)&&!tc.isDecl);
  const decls=tableCards.filter(tc=>tc.isDecl&&tc.decl?.value===value);
  const results=[];
  for(let mask=1;mask<(1<<nums.length);mask++){
    const sub=nums.filter((_,i)=>(mask>>i)&1);
    if(sub.reduce((a,c)=>a+cardVal(c.rank),0)===value) results.push(sub);
  }
  return {numericCombos:results,matchingDecls:decls};
}

// ── Card component ────────────────────────────────────────────────────────────
function Card({card, selected, tableSelected, onClick, faceDown}) {
  const isRed = RED_SUITS.includes(card?.suit);
  const W=70, H=100;

  const shadow = selected
    ? `0 0 0 3px ${C.selected}, 0 6px 20px rgba(0,0,0,0.5)`
    : tableSelected
    ? `0 0 0 3px ${C.blue}, 0 4px 12px rgba(0,0,0,0.4)`
    : "0 2px 8px rgba(0,0,0,0.4)";

  const transform = selected ? "translateY(-12px) scale(1.05)"
    : tableSelected ? "translateY(-6px) scale(1.02)"
    : "none";

  const base = {
    width:W, height:H, borderRadius:8, flexShrink:0,
    cursor: onClick?"pointer":"default",
    userSelect:"none", position:"relative",
    transition:"transform 0.15s, box-shadow 0.15s",
    transform, boxShadow:shadow,
  };

  if(faceDown) return (
    <div style={{...base, background:"#1a3a6e", border:"2px solid #c9a84c", borderRadius:8}}>
      <svg width={W} height={H} xmlns="http://www.w3.org/2000/svg" style={{position:"absolute",top:0,left:0}}>
        <rect x="4" y="4" width={W-8} height={H-8} rx="4" fill="none" stroke="#c9a84c" strokeWidth="1.5"/>
        {/* Greek key TL */}
        <path d={`M8,8 h9 v4 h-5 v4 h3 v3 h-7 v-11z M11,11 h2 v4 h-2z`} fill="#c9a84c" opacity="0.85"/>
        {/* Greek key TR */}
        <path d={`M${W-8},8 h-9 v4 h5 v4 h-3 v3 h7 v-11z M${W-11},11 h-2 v4 h2z`} fill="#c9a84c" opacity="0.85"/>
        {/* Greek key BL */}
        <path d={`M8,${H-8} h9 v-4 h-5 v-4 h3 v-3 h-7 v11z M11,${H-11} h2 v-4 h-2z`} fill="#c9a84c" opacity="0.85"/>
        {/* Greek key BR */}
        <path d={`M${W-8},${H-8} h-9 v-4 h5 v-4 h-3 v-3 h7 v11z M${W-11},${H-11} h-2 v-4 h2z`} fill="#c9a84c" opacity="0.85"/>
        {/* 16-point Vergina star */}
        <g transform={`translate(${W/2},${H/2})`}>
          {[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map(a=>(
            <polygon key={a} points="0,-18 2,-6 0,-8 -2,-6" fill="#c9a84c" opacity="0.95" transform={`rotate(${a})`}/>
          ))}
          <circle r="5" fill="#c9a84c" opacity="0.95"/>
        </g>
      </svg>
    </div>
  );

  if(card.isDecl) return (
    <div style={{...base, background:"linear-gradient(135deg,#1e3a8a,#1d4ed8)", border:`2px solid ${C.gold}`, display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}} onClick={onClick}>
      <div style={{fontSize:9,color:C.goldLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Decl</div>
      <div style={{fontSize:26,fontWeight:800,color:C.goldLight,lineHeight:1}}>{card.decl.value}</div>
      <div style={{fontSize:8,color:"rgba(255,255,255,0.6)",marginTop:3,textAlign:"center",padding:"0 4px",lineHeight:1.3}}>
        {card.cards?.map(c=>c.rank+c.suit).join("+")}
      </div>
    </div>
  );

  const faceSymbol = card.rank==="K"?"♚":card.rank==="Q"?"♛":"♞";
  const faceColor = isRed?"#c0392b":"#1a1a6e";
  const faceBg = isRed?"linear-gradient(155deg,#fff0f0,#ffd6d6)":"linear-gradient(155deg,#f0f0ff,#d8d8f5)";

  if(isFace(card.rank)) return (
    <div style={{...base, background:faceBg, border:`2px solid ${faceColor}`, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"5px 6px", overflow:"hidden"}} onClick={onClick}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:52,fontWeight:900,color:faceColor,opacity:0.08,lineHeight:1,pointerEvents:"none",userSelect:"none"}}>{card.rank}</div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",lineHeight:1,position:"relative"}}>
        <span style={{fontSize:16,fontWeight:800,color:faceColor}}>{card.rank}</span>
        <span style={{fontSize:13,color:faceColor}}>{card.suit}</span>
      </div>
      <div style={{textAlign:"center",fontSize:38,lineHeight:1,position:"relative",color:faceColor}}>{faceSymbol}</div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",lineHeight:1,transform:"rotate(180deg)",position:"relative"}}>
        <span style={{fontSize:16,fontWeight:800,color:faceColor}}>{card.rank}</span>
        <span style={{fontSize:13,color:faceColor}}>{card.suit}</span>
      </div>
    </div>
  );

  return (
    <div style={{...base, background:C.cream, border:`1.5px solid #d4c9b0`, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"5px 6px", overflow:"hidden"}} onClick={onClick}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",lineHeight:1,flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:700,color:isRed?C.red:"#1a1a1a"}}>{card.rank}</span>
        <span style={{fontSize:12,color:isRed?C.red:"#1a1a1a"}}>{card.suit}</span>
      </div>
      <div style={{textAlign:"center",fontSize:36,color:isRed?C.red:"#1a1a1a",lineHeight:1,flexShrink:0}}>{card.suit}</div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",lineHeight:1,transform:"rotate(180deg)",flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:700,color:isRed?C.red:"#1a1a1a"}}>{card.rank}</span>
        <span style={{fontSize:12,color:isRed?C.red:"#1a1a1a"}}>{card.suit}</span>
      </div>
    </div>
  );
}

// ── Zone (card row on felt) ───────────────────────────────────────────────────
function Zone({label, info, cards, selectedIds, tableSelectedIds, onCardClick, faceDown, emptyText, accent}) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:12,fontWeight:700,color:accent||C.textMuted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</span>
        {info && <span style={{fontSize:12,color:C.textMuted}}>{info}</span>}
      </div>
      <div style={{
        display:"flex", flexWrap:"wrap", gap:8, minHeight:100, alignItems:"center",
        padding:"10px 12px",
        background:"rgba(0,0,0,0.2)",
        borderRadius:10,
        border:`1px solid ${C.panelBorder}`,
        boxShadow:"inset 0 2px 8px rgba(0,0,0,0.3)",
      }}>
        {cards.length===0
          ? <span style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>{emptyText||""}</span>
          : cards.map(card=>(
            <Card key={card.id} card={card} faceDown={faceDown}
              selected={selectedIds?.includes(card.id)}
              tableSelected={tableSelectedIds?.includes(card.id)}
              onClick={onCardClick?()=>onCardClick(card):undefined}
            />
          ))
        }
      </div>
    </div>
  );
}

// ── Scoreboard pill ───────────────────────────────────────────────────────────
function ScorePill({label, value, highlight}) {
  return (
    <div style={{
      padding:"6px 16px", borderRadius:20,
      background: highlight ? C.gold : "rgba(0,0,0,0.3)",
      border:`1px solid ${highlight?C.goldLight:C.panelBorder}`,
      textAlign:"center", minWidth:64,
    }}>
      <div style={{fontSize:11,color:highlight?"#5a3a00":C.textMuted,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:highlight?"#2a1800":C.text,lineHeight:1.1}}>{value}</div>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
function Btn({children, onClick, primary, danger, small}) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        padding: small?"4px 10px":"9px 20px",
        borderRadius:8, border:"none", cursor:"pointer",
        fontSize: small?12:14, fontWeight:600, letterSpacing:"0.02em",
        transition:"all 0.15s",
        background: primary
          ? (hover?C.goldLight:C.gold)
          : danger
          ? (hover?"#e74c3c":"#c0392b")
          : hover?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.1)",
        color: primary?"#2a1800":C.text,
        boxShadow: primary?"0 2px 8px rgba(201,168,76,0.4)":"none",
      }}>
      {children}
    </button>
  );
}

// ── Rules content ─────────────────────────────────────────────────────────────
const RULES = {
  Overview: (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{marginBottom:8}}>Diloti is a classic Greek fishing card game. Take turns playing cards to capture from the table.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Setup</p>
    <ul style={{paddingLeft:18,marginBottom:8}}><li>6 cards to each player, 4 face-up on the table</li><li>You go first. New hands dealt when both hands empty.</li></ul>
    <p style={{fontWeight:700,marginBottom:3}}>Your turn</p>
    <p>Select a card from your hand, then <b>Capture</b>, <b>Lay</b>, or <b>Declare</b>.</p>
  </div>),
  Capturing: (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{fontWeight:700,marginBottom:3}}>Match by rank</p><p style={{marginBottom:8}}>Play a 7 to take any 7s from the table.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Match by sum</p><p style={{marginBottom:8}}>Play a 9 to take a 4+5. You can capture multiple independent combinations at once.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Face cards (J, Q, K)</p><p style={{marginBottom:8}}>No numeric value — capture exactly one matching face card.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Laying</p><p>Place a card on the table if you can't or don't want to capture. You must capture a matching face card if one is on the table.</p>
  </div>),
  Declaring: (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{fontWeight:700,marginBottom:3}}>Plain pile</p><p style={{marginBottom:8}}>Play a card + select table cards whose total equals your declared value. You must hold another card of that value in hand to back it.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Group / family</p><p style={{marginBottom:8}}>Combine cards that each equal the same value (e.g. three 8s, or 3+5 grouped with an 8). Can only be captured as a whole by that value.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Raising</p><p style={{marginBottom:8}}>You can raise your <b>opponent's</b> declaration by adding a card to increase its value (max 10). You must hold a card of the new value. You <b>cannot</b> raise your own declaration.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Adding to your own</p><p style={{marginBottom:8}}>You can add to your own declaration <b>only</b> if the card keeps the same declared value (forming a group, e.g. adding another 8 to a pile of 8s). You cannot change the value.</p>
    <p style={{fontWeight:700,marginBottom:3}}>Must pick up</p><p>Once you have a declaration on the table you must — on every subsequent turn — capture, add to a pile, raise the opponent's pile, or capture other cards. You cannot lay a card or make a new declaration until yours is picked up.</p>
  </div>),
  Scoring: (<div style={{fontSize:13,lineHeight:1.75,color:"#374151"}}>
    <p style={{marginBottom:8}}>11 points available per round, plus xeri bonuses:</p>
    <ul style={{paddingLeft:18,marginBottom:8}}>
      <li><b>+4</b> — most cards captured (neither scores if 26–26)</li>
      <li><b>+1 each</b> — Aces captured (4 available)</li>
      <li><b>+2</b> — the 10♦ ("the good 10")</li>
      <li><b>+1</b> — the 2♣ ("the good 2")</li>
      <li><b>+10</b> — per xeri (clearing the table in one move)</li>
    </ul>
    <p><b>First to 61 points wins.</b></p>
  </div>),
};

// ── Main component ────────────────────────────────────────────────────────────
export default function Diloti() {
  const [G, setG] = useState(()=>newGameState());
  const [lang, setLang] = useState("en");
  const [difficulty, setDifficulty] = useState("beginner");
  const L = T[lang];
  const [showRules, setShowRules] = useState(false);
  const [rulesTab, setRulesTab] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);

  const update = fn => setG(prev=>{const next={...prev};fn(next);return next;});

  const scoreAndEndRound = useCallback(state=>{
    const pp=state.playerPile, ap=state.aiPile;
    let ps=0,as_=0;
    if(pp.length>ap.length) ps+=4; else if(ap.length>pp.length) as_+=4;
    ps+=pp.filter(c=>c.rank==="A").length;
    as_+=ap.filter(c=>c.rank==="A").length;
    if(pp.find(c=>c.rank==="10"&&c.suit==="♦")) ps+=2; else if(ap.find(c=>c.rank==="10"&&c.suit==="♦")) as_+=2;
    if(pp.find(c=>c.rank==="2"&&c.suit==="♣")) ps+=1; else if(ap.find(c=>c.rank==="2"&&c.suit==="♣")) as_+=1;
    ps+=state.playerXeri*10; as_+=state.aiXeri*10;
    const nP=state.playerTotal+ps, nA=state.aiTotal+as_;
    const summary=`You +${ps} → ${nP} pts  |  AI +${as_} → ${nA} pts`;
    if(nP>=61||nA>=61){
      const winner=nP>=nA?"🏆 You win the game!":"AI wins the game.";
      return{...state,playerTotal:nP,aiTotal:nA,gameOver:{summary,winner},log:summary};
    }
    return{...state,playerTotal:nP,aiTotal:nA,roundOver:summary,log:summary};
  },[]);

  const doCapture=(state,who,played,targets)=>{
    const flat=deepFlatten(targets);
    flat.push(played);
    state[who+"Pile"]=[...state[who+"Pile"],...flat];
    state.tableCards=state.tableCards.filter(tc=>!targets.some(t=>t.id===tc.id));
    const isXeri=state.tableCards.length===0&&(state.playerPile.length+state.aiPile.length)>flat.length;
    if(isXeri){state[who+"Xeri"]+=1;state.log=(who==="player"?"You":"AI")+" scored a Xeri! (+10)";}
    state.lastCapture=who;
  };

  const dealNewHands=useCallback(state=>{
    if(state.deck.length===0){
      if(state.lastCapture&&state.tableCards.length>0){
        state[state.lastCapture+"Pile"]=[...state[state.lastCapture+"Pile"],...deepFlatten(state.tableCards)];
        state.tableCards=[];
      }
      return scoreAndEndRound(state);
    }
    const cards=state.deck.slice(0,12);
    return{...state,deck:state.deck.slice(12),playerHand:cards.slice(0,6),aiHand:cards.slice(6,12),turn:"player",selectedCard:null,selectedTable:[],log:"New cards dealt — your turn!"};
  },[scoreAndEndRound]);

  // ── Beginner AI (simple greedy) ─────────────────────────────────────────────
  const runBeginnerAi=(state)=>{
    let best=null;
    const getVal=tc=>tc.isDecl?tc.decl.value:cardVal(tc.rank);
    for(const card of state.aiHand){
      const cv=cardVal(card.rank);
      if(isFace(card.rank)){
        const m=state.tableCards.find(tc=>tc.rank===card.rank&&!tc.isDecl);
        if(m&&(!best||1>best.score)) best={type:"capture",card,targets:[m],score:1};
      } else {
        const{numericCombos,matchingDecls}=findCombos(cv,state.tableCards);
        const combos=numericCombos.map(c=>matchingDecls.length>0?[...c,...matchingDecls]:c);
        if(matchingDecls.length>0&&numericCombos.length===0) combos.push(matchingDecls);
        for(const combo of combos){
          const rem=state.tableCards.filter(tc=>!combo.some(c=>c.id===tc.id));
          const xeri=rem.length===0&&(state.playerPile.length+state.aiPile.length)>0;
          let score=combo.reduce((a,tc)=>a+(tc.isDecl?5:1),0)+(xeri?100:0);
          if(combo.some(c=>c.rank==="10"&&c.suit==="♦")) score+=5;
          if(combo.some(c=>c.rank==="2"&&c.suit==="♣")) score+=3;
          if(combo.some(c=>c.rank==="A")) score+=2;
          if(!best||score>best.score) best={type:"capture",card,targets:combo,score};
        }
        if(!best&&state.tableCards.length>0){
          const loose=state.tableCards.filter(tc=>!tc.isDecl&&!isFace(tc.rank));
          for(const tc of loose){
            const sum=cv+cardVal(tc.rank);
            if(sum<=10&&state.aiHand.some(c=>c.id!==card.id&&cardVal(c.rank)===sum)&&(!best||2>best.score))
              best={type:"declare",card,targets:[tc],declVal:sum,score:2};
          }
        }
      }
    }
    let logMsg="";
    if(!best){
      const toPlay=state.aiHand.find(c=>!isFace(c.rank))||state.aiHand[0];
      state.tableCards=[...state.tableCards,{...toPlay,decl:null}];
      state.aiHand=state.aiHand.filter(c=>c.id!==toPlay.id);
      logMsg=`AI lays the ${toPlay.rank}${toPlay.suit}.`;
    } else if(best.type==="capture"){
      doCapture(state,"ai",best.card,best.targets);
      state.aiHand=state.aiHand.filter(c=>c.id!==best.card.id);
      logMsg=state.log.includes("Xeri")?state.log:`AI captures with ${best.card.rank}${best.card.suit}.`;
    } else {
      const dc=[...best.targets.flatMap(tc=>tc.cards||[tc]),best.card];
      const nd={id:"decl_"+Date.now(),rank:"D",suit:"",isDecl:true,decl:{type:"plain",value:best.declVal,owner:"ai"},cards:dc};
      state.tableCards=[...state.tableCards.filter(tc=>!best.targets.some(t=>t.id===tc.id)),nd];
      state.aiHand=state.aiHand.filter(c=>c.id!==best.card.id);
      logMsg=`AI declares a pile of ${best.declVal}.`;
    }
    return {state, logMsg};
  };

  const runAiTurn=useCallback(prev=>{
    const state={...prev,aiHand:[...prev.aiHand],tableCards:[...prev.tableCards],aiPile:[...prev.aiPile]};

    // Delegate to beginner AI if difficulty is set to beginner
    if(difficulty==="beginner"){
      const{state:bs,logMsg:bLog}=runBeginnerAi(state);
      bs.turn="player";
      if(!bs.log.includes("Xeri")) bs.log=bLog+" Your turn.";
      else bs.log=bs.log+" Your turn.";
      if(bs.playerHand.length===0&&bs.aiHand.length===0) return dealNewHands(bs);
      return bs;
    }

    // ── helpers ──────────────────────────────────────────────────────────────
    const getVal=tc=>tc.isDecl?tc.decl.value:cardVal(tc.rank);
    const isValuable=c=>( (c.rank==="10"&&c.suit==="♦") || (c.rank==="2"&&c.suit==="♣") || c.rank==="A" );
    const cardScore=c=>{
      if(c.rank==="10"&&c.suit==="♦") return 8;
      if(c.rank==="2"&&c.suit==="♣") return 4;
      if(c.rank==="A") return 3;
      if(c.suit==="♣") return 1.5; // clubs count for most-clubs point
      return 1;
    };
    const comboScore=combo=>{
      const flat=deepFlatten(combo);
      return flat.reduce((a,c)=>a+cardScore(c),0);
    };
    const wouldXeri=(targets)=>{
      const rem=state.tableCards.filter(tc=>!targets.some(t=>t.id===tc.id));
      return rem.length===0&&(state.playerPile.length+state.aiPile.length)>0;
    };
    // Would leaving this card on the table let player score a xeri?
    const givesPlayerXeri=(playedCard)=>{
      if(state.tableCards.length===0) return true; // table empty → xeri for player
      return false;
    };
    // Is table currently a single card? (classic xeri trap — don't lay into it)
    const tableIsSingle=state.tableCards.length===1;
    // Does player have an active declaration?
    const playerHasDecl=state.tableCards.some(tc=>tc.isDecl&&tc.decl?.owner==="player");

    // ── enumerate all capture moves ──────────────────────────────────────────
    let moves=[];

    for(const card of state.aiHand){
      const cv=cardVal(card.rank);
      if(isFace(card.rank)){
        const m=state.tableCards.find(tc=>tc.rank===card.rank&&!tc.isDecl);
        if(m) moves.push({type:"capture",card,targets:[m],score:cardScore(m)+2});
      } else {
        const{numericCombos,matchingDecls}=findCombos(cv,state.tableCards);
        // Build all valid capture combos (numeric sets + any matching decl)
        const allCombos=[];
        if(numericCombos.length>0){
          numericCombos.forEach(c=>{
            // Include matching decls too if they exist
            allCombos.push(matchingDecls.length>0?[...c,...matchingDecls]:c);
          });
        }
        if(matchingDecls.length>0&&numericCombos.length===0) allCombos.push(matchingDecls);

        for(const combo of allCombos){
          const xeri=wouldXeri(combo);
          let sc=comboScore(combo)+(xeri?200:0); // xeri is top priority always
          moves.push({type:"capture",card,targets:combo,score:sc,xeri});
        }
      }
    }

    // ── enumerate declare moves ───────────────────────────────────────────────
    // Only declare if no existing AI declaration on table
    const aiHasDecl=state.tableCards.some(tc=>tc.isDecl&&tc.decl?.owner==="ai");
    if(!aiHasDecl){
      for(const card of state.aiHand){
        const cv=cardVal(card.rank);
        if(isFace(card.rank)||!cv) continue;
        const loose=state.tableCards.filter(tc=>!tc.isDecl&&!isFace(tc.rank));
        for(const tc of loose){
          const sum=cv+getVal(tc);
          if(sum>=2&&sum<=10&&state.aiHand.some(c=>c.id!==card.id&&cardVal(c.rank)===sum)){
            // Score the declaration: prefer high-value sums, prefer protecting valuable cards
            const declScore=sum*0.8+(isValuable(card)||isValuable(tc)?3:0);
            moves.push({type:"declare",card,targets:[tc],declVal:sum,score:declScore});
          }
        }
      }
    }

    // ── pick best move ────────────────────────────────────────────────────────
    // Sort: xeri first, then by score
    moves.sort((a,b)=>b.score-a.score);
    let best=moves[0]||null;

    // ── if must pick up own declaration, prioritise capturing it ─────────────
    if(aiHasDecl){
      const myDecl=state.tableCards.find(tc=>tc.isDecl&&tc.decl?.owner==="ai");
      // Only consider moves that include capturing the decl
      const declMoves=moves.filter(m=>m.type==="capture"&&m.targets.some(t=>t.id===myDecl.id));
      if(declMoves.length>0) best=declMoves[0];
      else {
        // Can't capture own decl this turn — capture something else valuable
        const otherCaptures=moves.filter(m=>m.type==="capture"&&!m.targets.some(t=>t.id===myDecl.id));
        best=otherCaptures[0]||null;
      }
    }

    // ── if no capture, lay a card carefully ──────────────────────────────────
    let logMsg="";
    if(!best){
      // Don't lay a card that gives the player a free xeri
      // Prefer laying: low-value numerals, avoid giving away 10♦, 2♣, Aces
      // Avoid laying onto empty table or single-card table unless no choice
      const hand=state.aiHand;
      // Score each card for "safeness" of laying (lower = safer to lay)
      const layCandidates=hand.map(c=>{
        let danger=0;
        if(isValuable(c)) danger+=10; // don't lay valuable cards
        if(isFace(c.rank)) danger+=3;  // face cards are somewhat risky to lay
        // If laying this card would complete a pair with something on the table → risky (player captures)
        const cv=cardVal(c.rank);
        if(cv&&state.tableCards.some(tc=>getVal(tc)===cv)) danger+=4;
        // Don't give xeri
        if(state.tableCards.length===0) danger+=20;
        return{card:c,danger};
      }).sort((a,b)=>a.danger-b.danger);

      const toPlay=layCandidates[0]?.card||hand[0];
      state.tableCards=[...state.tableCards,{...toPlay,decl:null}];
      state.aiHand=state.aiHand.filter(c=>c.id!==toPlay.id);
      logMsg=`AI lays the ${toPlay.rank}${toPlay.suit}.`;
    } else if(best.type==="capture"){
      doCapture(state,"ai",best.card,best.targets);
      state.aiHand=state.aiHand.filter(c=>c.id!==best.card.id);
      logMsg=state.log.includes("Xeri")?state.log:`AI captures with ${best.card.rank}${best.card.suit}.`;
    } else {
      const dc=[...best.targets.flatMap(tc=>tc.cards||[tc]),best.card];
      const nd={id:"decl_"+Date.now(),rank:"D",suit:"",isDecl:true,decl:{type:"plain",value:best.declVal,owner:"ai"},cards:dc};
      state.tableCards=[...state.tableCards.filter(tc=>!best.targets.some(t=>t.id===tc.id)),nd];
      state.aiHand=state.aiHand.filter(c=>c.id!==best.card.id);
      logMsg=`AI declares a pile of ${best.declVal}.`;
    }
    state.turn="player";
    if(!state.log.includes("Xeri")) state.log=logMsg+" Your turn.";
    else state.log=state.log+" Your turn.";
    if(state.playerHand.length===0&&state.aiHand.length===0) return dealNewHands(state);
    return state;
  },[dealNewHands]);

  useEffect(()=>{
    if(G.turn==="ai"&&!G.gameOver&&!G.roundOver){
      setAiThinking(true);
      const t=setTimeout(()=>{ setG(prev=>runAiTurn(prev)); setAiThinking(false); },2500);
      return()=>clearTimeout(t);
    }
  },[G.turn,G.gameOver,G.roundOver,runAiTurn]);

  const handleSelectHand=card=>{
    if(G.turn!=="player"||G.gameOver||G.roundOver) return;
    setG(prev=>({...prev,selectedCard:prev.selectedCard?.id===card.id?null:card,selectedTable:[]}));
  };
  const handleSelectTable=card=>{
    if(G.turn!=="player"||G.gameOver||G.roundOver) return;
    setG(prev=>{
      const already=prev.selectedTable.some(tc=>tc.id===card.id);
      return{...prev,selectedTable:already?prev.selectedTable.filter(tc=>tc.id!==card.id):[...prev.selectedTable,card]};
    });
  };

  const handleCapture=()=>{
    const{selectedCard:card,selectedTable:sel}=G;
    if(!card){update(s=>{s.log="Select a card from your hand first.";}); return;}
    if(sel.length===0){update(s=>{s.log="Select table cards to capture.";}); return;}
    const cv=cardVal(card.rank);
    if(isFace(card.rank)){
      if(sel.length!==1||sel[0].rank!==card.rank){update(s=>{s.log="Face cards capture exactly one matching face card.";}); return;}
    } else {
      const getValue=tc=>tc.isDecl?tc.decl.value:cardVal(tc.rank);

      // Own declaration can only be captured by a card matching its declared value,
      // not bundled with unrelated cards to make a different sum
      const ownDecls=sel.filter(tc=>tc.isDecl&&tc.decl?.owner==="player");
      if(ownDecls.length>0){
        const dv=ownDecls[0].decl.value;
        if(dv!==cv){update(s=>{s.log=`Your declared pile (${dv}) can only be captured with a ${dv}, not a ${cv}.`;}); return;}
        const otherSel=sel.filter(tc=>!ownDecls.includes(tc));
        const allOtherMatchDv=otherSel.every(tc=>getValue(tc)===cv);
        if(!allOtherMatchDv){update(s=>{s.log=`You can't bundle your declared pile with unrelated cards. Only cards of the same value (${cv}) can be captured together.`;}); return;}
      }

      const allSame=sel.every(tc=>!tc.isDecl&&cardVal(tc.rank)===cv);
      function canPartition(items,target){
        if(items.length===0)return true;
        const n=items.length;
        for(let mask=1;mask<(1<<n);mask++){
          const sub=items.filter((_,i)=>(mask>>i)&1);
          const rem=items.filter((_,i)=>!((mask>>i)&1));
          if(sub.reduce((a,c)=>a+getValue(c),0)===target&&canPartition(rem,target))return true;
        }
        return false;
      }
      const simple=sel.reduce((a,tc)=>a+getValue(tc),0)===cv;
      const partition=canPartition(sel,cv);
      if(!allSame&&!simple&&!partition){update(s=>{s.log=`Invalid capture — selected cards don't resolve to ${cv}.`;}); return;}
    }
    setG(prev=>{
      const next={...prev,playerHand:prev.playerHand.filter(c=>c.id!==card.id),tableCards:[...prev.tableCards],playerPile:[...prev.playerPile],selectedCard:null,selectedTable:[],log:`You captured ${sel.length} card(s).`};
      doCapture(next,"player",card,sel);
      next.turn="ai";
      if(next.playerHand.length===0&&next.aiHand.length===0) return dealNewHands(next);
      return next;
    });
  };

  const handleLay=()=>{
    const card=G.selectedCard;
    if(!card){update(s=>{s.log="Select a card from your hand first.";}); return;}
    const myDecl=G.tableCards.find(tc=>tc.isDecl&&tc.decl?.owner==="player");
    if(myDecl){update(s=>{s.log="You have a declaration on the table — you must capture or add to a pile, not lay a card.";}); return;}
    if(isFace(card.rank)&&G.tableCards.some(tc=>tc.rank===card.rank)){update(s=>{s.log="You must capture the matching face card.";}); return;}
    setG(prev=>{
      const next={...prev,playerHand:prev.playerHand.filter(c=>c.id!==card.id),tableCards:[...prev.tableCards,{...card,decl:null}],selectedCard:null,selectedTable:[],turn:"ai",log:`You laid the ${card.rank}${card.suit} on the table.`};
      if(next.playerHand.length===0&&next.aiHand.length===0) return dealNewHands(next);
      return next;
    });
  };

  const handleDeclareWithValue = (v) => {
    handleDeclareCore(v);
  };

  const handleDeclare=()=>{
    handleDeclareCore(parseInt(G.declValue));
  };

  const handleDeclareCore=(dvIn)=>{
    const card=G.selectedCard;
    if(!card){update(s=>{s.log="Select a card from your hand first.";}); return;}
    if(isFace(card.rank)){update(s=>{s.log="Face cards can't be part of declarations.";}); return;}
    const dv=dvIn;
    if(!dv||dv<1||dv>10){update(s=>{s.log="Enter a valid declaration value (1–10).";}); return;}
    const sel=G.selectedTable;
    const cv=cardVal(card.rank);
    const getValue=tc=>tc.isDecl?tc.decl.value:cardVal(tc.rank);

    const selDecls=sel.filter(tc=>tc.isDecl);
    const selLoose=sel.filter(tc=>!tc.isDecl);

    // Block making a brand-new declaration if player already has one on the table
    // (adding to existing own decl via selDecls is still allowed)
    const myExistingDecl=G.tableCards.find(tc=>tc.isDecl&&tc.decl?.owner==="player");
    const isAddingToOwn=selDecls.length===1&&selDecls[0].decl?.owner==="player";
    const isRaisingOpponent=selDecls.length===1&&selDecls[0].decl?.owner==="ai";
    if(myExistingDecl&&!isAddingToOwn&&!isRaisingOpponent){
      update(s=>{s.log="You already have a declaration on the table — pick it up before making a new one.";}); return;
    }

    if(selDecls.length===1){
      const ed=selDecls[0];
      const addTotal=cv+selLoose.reduce((a,tc)=>a+cardVal(tc.rank),0);
      const isAddOwn=ed.decl.owner==="player"&&addTotal===ed.decl.value&&dv===ed.decl.value;
      if(ed.decl.owner==="player"&&!isAddOwn){update(s=>{s.log=`You cannot raise your own declaration. You can only add cards that keep the same value (${ed.decl.value}) to form a group. Only your opponent can raise it to a new value.`;}); return;}
      if(ed.decl.owner==="ai"){
        const raiseTotal=ed.decl.value+cv+selLoose.reduce((a,tc)=>a+cardVal(tc.rank),0);
        if(raiseTotal!==dv){update(s=>{s.log=`To raise this declaration, the new value must equal ${ed.decl.value} (existing) + your card${selLoose.length?" + loose cards":""} = ${raiseTotal}. Enter ${raiseTotal} as the declared value.`;}); return;}
        if(dv>10){update(s=>{s.log="Declarations can't exceed 10.";}); return;}
      }
    } else if(selDecls.length>1){
      update(s=>{s.log="You can only include one existing declaration at a time.";}); return;
    } else {
      const total=sel.reduce((a,tc)=>a+getValue(tc),0)+cv;
      const isPlain=total===dv;
      function canPart(items,target){
        if(items.length===0)return true;
        const n=items.length;
        for(let mask=1;mask<(1<<n);mask++){
          const sub=items.filter((_,i)=>(mask>>i)&1);
          const rem=items.filter((_,i)=>!((mask>>i)&1));
          if(sub.reduce((a,tc)=>a+getValue(tc),0)===target&&canPart(rem,target))return true;
        }
        return false;
      }
      let isGroup=false;
      for(let mask=0;mask<(1<<sel.length);mask++){
        const wp=sel.filter((_,i)=>(mask>>i)&1);
        const rest=sel.filter((_,i)=>!((mask>>i)&1));
        const pSum=wp.reduce((a,tc)=>a+getValue(tc),0)+cv;
        if(pSum===dv&&rest.length>0&&canPart(rest,dv)){isGroup=true;break;}
      }
      if(!isPlain&&!isGroup){update(s=>{s.log=`Invalid declaration of ${dv}. Cards must sum to ${dv}, or form groups each equalling ${dv}.`;}); return;}
    }

    const hasCapCard=G.playerHand.some(c=>c.id!==card.id&&cardVal(c.rank)===dv);
    if(!hasCapCard){update(s=>{s.log=`You need another ${dv} in hand to hold this declaration.`;}); return;}

    setG(prev=>{
      const s2=prev.selectedTable;
      // Owner is always the player making this declaration (even if raising opponent's)
      const dc=[...s2.flatMap(tc=>tc.cards||[tc]),card];
      const nd={id:"decl_"+Date.now(),rank:"D",suit:"",isDecl:true,decl:{type:"plain",value:dv,owner:"player"},cards:dc};
      const next={...prev,playerHand:prev.playerHand.filter(c=>c.id!==card.id),tableCards:[...prev.tableCards.filter(tc=>!s2.some(s=>s.id===tc.id)),nd],selectedCard:null,selectedTable:[],declValue:"",turn:"ai",log:`You declared a pile of ${dv}.`};
      if(next.playerHand.length===0&&next.aiHand.length===0) return dealNewHands(next);
      return next;
    });
  };

  const startNewRound=()=>setG(prev=>newGameState({player:prev.playerTotal,ai:prev.aiTotal}));
  const startNewGame=()=>setG(newGameState());

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:600, background:`radial-gradient(ellipse at 50% 30%,${C.feltLight},${C.felt} 60%,#0f3d24)`,
      borderRadius:16, padding:"14px 14px 18px", fontFamily:"'Georgia',serif",
      position:"relative", userSelect:"none",
    }}>

      {/* Header */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {/* Row 1: title + buttons */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:22,fontWeight:800,color:C.gold,letterSpacing:"0.04em",textShadow:`0 1px 6px rgba(0,0,0,0.4)`}}>{L.title}</span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setLang(l=>l==="en"?"gr":"en")} style={{padding:"5px 8px",borderRadius:8,border:`1px solid ${C.panelBorder}`,background:"rgba(255,255,255,0.1)",color:C.text,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
              {lang==="en"?"🇬🇷 GR":"🇬🇧 EN"}
            </button>
            <Btn onClick={()=>setShowRules(true)}>{L.rules}</Btn>
            <Btn onClick={startNewGame} primary>{L.newGame}</Btn>
          </div>
        </div>
        {/* Row 2: difficulty toggle, right-aligned */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
          <button onClick={()=>setDifficulty("beginner")} style={{padding:"3px 10px",borderRadius:6,border:`1px solid ${difficulty==="beginner"?C.gold:C.panelBorder}`,fontSize:10,fontWeight:700,cursor:"pointer",background:difficulty==="beginner"?"rgba(201,168,76,0.25)":"rgba(255,255,255,0.08)",color:difficulty==="beginner"?C.gold:C.textMuted,letterSpacing:"0.06em"}}>
            {L.beginner}
          </button>
          <button onClick={()=>setDifficulty("expert")} style={{padding:"3px 10px",borderRadius:6,border:`1px solid ${difficulty==="expert"?C.gold:C.panelBorder}`,fontSize:10,fontWeight:700,cursor:"pointer",background:difficulty==="expert"?"rgba(201,168,76,0.25)":"rgba(255,255,255,0.08)",color:difficulty==="expert"?C.gold:C.textMuted,letterSpacing:"0.06em"}}>
            {L.expert}
          </button>
        </div>
      </div>

      {/* Scores */}
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
        <ScorePill label={L.you} value={G.playerTotal} />
        <ScorePill label={L.target} value={61} highlight />
        <ScorePill label={L.ai} value={G.aiTotal} />
      </div>

      {/* AI hand */}
      <Zone label={`${L.aiHand} (${difficulty==="expert"?L.expert:L.beginner})`} info={`${G.aiPile.length} ${L.captured} · ${G.aiXeri} ${L.xeri} · ${G.deck.length} ${L.inStock}`}
        cards={G.aiHand} faceDown emptyText={L.noCards} accent={C.textMuted} />

      {/* Table */}
      <Zone label={L.table} cards={G.tableCards}
        tableSelectedIds={G.selectedTable.map(c=>c.id)}
        onCardClick={handleSelectTable}
        emptyText={L.tableEmpty} accent={C.goldLight} />

      {/* Player hand */}
      <Zone label={L.yourHand} info={`${G.playerPile.length} ${L.captured} · ${G.playerXeri} ${L.xeri}`}
        cards={G.playerHand}
        selectedIds={G.selectedCard?[G.selectedCard.id]:[]}
        onCardClick={handleSelectHand}
        emptyText={L.noCards} accent={C.gold} />

      {/* Actions */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginTop:10,minHeight:38}}>
        {G.turn==="player"&&!G.gameOver&&!G.roundOver&&(<>
          <Btn onClick={handleCapture} primary>{L.capture}</Btn>
          <Btn onClick={handleLay}>{L.layCard}</Btn>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {(()=>{
              const cv = G.selectedCard ? cardVal(G.selectedCard.rank) : null;
              const sel = G.selectedTable;
              const selSum = sel.reduce((a,tc)=>a+(tc.isDecl?tc.decl.value:cardVal(tc.rank)||0),0);
              const suggestions = new Set();
              if(cv && !isFace(G.selectedCard?.rank)) {
                const getValue = tc => tc.isDecl ? tc.decl.value : cardVal(tc.rank);
                // Plain: all selected + played card sum to dv
                const plain = cv + selSum;
                if(plain>=1&&plain<=10) suggestions.add(plain);
                // Raise: one selected decl owned by AI, new value = decl.value + cv
                const selDecl = sel.find(tc=>tc.isDecl&&tc.decl?.owner==="ai");
                if(selDecl) { const raised=selDecl.decl.value+cv; if(raised<=10) suggestions.add(raised); }
                // Group: played card (+ some table cards) = dv, remaining table cards partition into dv
                // Only suggest dv if it's actually achievable as a group (at least 2 components)
                if(sel.length>0 && cv>=1 && cv<=10) {
                  const n=sel.length;
                  for(let dv=1;dv<=10;dv++) {
                    if(suggestions.has(dv)) continue; // already added as plain
                    // Try all subsets of sel to combine with played card
                    for(let mask=0;mask<(1<<n);mask++) {
                      const wp=sel.filter((_,i)=>(mask>>i)&1);
                      const rest=sel.filter((_,i)=>!((mask>>i)&1));
                      const pSum=wp.reduce((a,tc)=>a+getValue(tc),0)+cv;
                      if(pSum===dv && rest.length>0) {
                        // Check rest partitions into dv-groups
                        function canPart(items,target){
                          if(items.length===0)return true;
                          const m=items.length;
                          for(let m2=1;m2<(1<<m);m2++){
                            const sub=items.filter((_,i)=>(m2>>i)&1);
                            const rem=items.filter((_,i)=>!((m2>>i)&1));
                            if(sub.reduce((a,tc)=>a+getValue(tc),0)===target&&canPart(rem,target))return true;
                          }
                          return false;
                        }
                        if(canPart(rest,dv)){suggestions.add(dv);break;}
                      }
                    }
                  }
                }
              }
              const opts = [...suggestions];
              // Auto-select if only one option
              if(opts.length===1 && G.declValue!==String(opts[0])) {
                setTimeout(()=>setG(prev=>({...prev,declValue:String(opts[0])})),0);
              }
              if(opts.length===0) return (
                <Btn onClick={handleDeclare}>{L.declarePile}</Btn>
              );
              return (<>
                {opts.map(v=>(
                  <button key={v} onClick={()=>handleDeclareWithValue(v)}
                    style={{padding:"6px 14px",borderRadius:8,border:`2px solid ${C.gold}`,background:"rgba(201,168,76,0.15)",color:C.gold,cursor:"pointer",fontSize:13,fontWeight:700}}>
                    {L.declare} {v}
                  </button>
                ))}
              </>);
            })()}
          </div>
        </>)}
        {aiThinking&&<span style={{fontSize:12,color:C.textMuted,fontStyle:"italic"}}>{L.aiThinking}</span>}
      </div>

      {/* Log */}
      <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:"rgba(0,0,0,0.25)",border:`1px solid ${C.panelBorder}`,fontSize:14,color:C.text,minHeight:38,lineHeight:1.6}}>
        {G.log}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showRules&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,borderRadius:16}}>
          <div style={{background:"white",borderRadius:14,padding:22,maxWidth:440,width:"92%",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{margin:0,fontSize:17,fontWeight:700}}>{L.rulesTitle}</h2>
              <button onClick={()=>setShowRules(false)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#666"}}>✕</button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {L.tabs.map((tab,i)=>(
                <button key={tab} onClick={()=>setRulesTab(i)} style={{padding:"4px 12px",borderRadius:6,fontSize:12,cursor:"pointer",fontWeight:600,border:"none",background:rulesTab===i?C.gold:"#f3f4f6",color:rulesTab===i?"#2a1800":"#374151"}}>
                  {tab}
                </button>
              ))}
            </div>
            {lang==="en" ? Object.values(RULES)[rulesTab] : Object.values(RULES_GR)[rulesTab]}
          </div>
        </div>
      )}

      {G.roundOver&&!G.gameOver&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,borderRadius:16}}>
          <div style={{background:"white",borderRadius:14,padding:28,maxWidth:360,width:"90%",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🃏</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>{L.roundOver}</div>
            <div style={{fontSize:13,color:"#6b7280",marginBottom:20,lineHeight:1.6}}>{G.roundOver}</div>
            <button onClick={startNewRound} style={{padding:"10px 24px",borderRadius:8,border:"none",background:C.gold,color:"#2a1800",cursor:"pointer",fontSize:14,fontWeight:700}}>{L.nextRound}</button>
          </div>
        </div>
      )}

      {G.gameOver&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,borderRadius:16}}>
          <div style={{background:"white",borderRadius:14,padding:32,maxWidth:360,width:"90%",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:10}}>{G.gameOver.winner.includes("You")?"🏆":"🤖"}</div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>{G.gameOver.winner}</div>
            <div style={{fontSize:13,color:"#6b7280",marginBottom:22,lineHeight:1.6}}>{G.gameOver.summary}</div>
            <button onClick={startNewGame} style={{padding:"10px 24px",borderRadius:8,border:"none",background:C.gold,color:"#2a1800",cursor:"pointer",fontSize:14,fontWeight:700}}>{L.playAgain}</button>
          </div>
        </div>
      )}
    </div>
  );
}
