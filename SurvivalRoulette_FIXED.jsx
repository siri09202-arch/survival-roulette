import React, { useState, useEffect, useRef } from 'react';
import { Users, Heart, Skull, History, Swords, Trophy, RotateCcw, Play, Sparkles, Zap, Copy, Check, Clock, Settings2, Plus, Trash2, Percent, MessageSquare, Mic, MicOff, Activity, ShieldAlert, UserPlus, Hand, ToggleLeft, ToggleRight, Type, MessageCircle, Edit3, GripVertical, Languages, Scale } from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc } from 'firebase/firestore';

const apiKey = ""; 

// Firebase Initialization Safe Wrapper
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
let app, auth, db;
const hasFirebaseConfig = firebaseConfig && firebaseConfig.apiKey;

if (hasFirebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const App = () => {
  const [user, setUser] = useState(null);
  const [phase, setPhase] = useState('home'); // home, multi_menu, multi_join_id, multi_name, multi_lobby, setup, playing, result
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomHostId, setRoomHostId] = useState(null);
  const [joinRoomIdInput, setJoinRoomIdInput] = useState('');
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [joinError, setJoinError] = useState('');

  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('individual'); 
  const [teamCount, setTeamCount] = useState(2); 
  const [teamNames, setTeamNames] = useState(['チームA', 'チームB', 'チームC', 'チームD', 'チームE', 'チームF']);
  const [playerListText, setPlayerListText] = useState(""); 
  const [players, setPlayers] = useState([]);
  const [eliminated, setEliminated] = useState([]); 
  const [turn, setTurn] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayResult, setDisplayResult] = useState({ player: '？？？', amount: '？' });
  const [lastResult, setLastResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [initialHP, setInitialHP] = useState(1000); 
  const [spinDuration, setSpinDuration] = useState(1.5); 
  const [healInterval, setHealInterval] = useState(10); 

  const [isManualModeEnabled, setIsManualModeEnabled] = useState(false); 
  const [isSpecialEventEnabled, setIsSpecialEventEnabled] = useState(false); 
  const [specialEventProb, setSpecialEventProb] = useState(10);
  const [enabledSpecialEvents, setEnabledSpecialEvents] = useState([
    'reverseMode', 'multiMode', 'numberFormat', 'nameTranslation', 'feint', 'diceMode', 'reverseHealDamage', 'instantDeath', 'trueRandom',
    'russianRoulette', 'timeBomb', 'kanjiQuiz', 'mathQuiz', 'englishQuiz'
  ]);
  const [isHpBalanceEnabled, setIsHpBalanceEnabled] = useState(false); 

  const [numberFormat, setNumberFormat] = useState('default');
  const [nameLanguage, setNameLanguage] = useState('default');
  const [translatedMap, setTranslatedMap] = useState({});
  
  const [activeMinigame, setActiveMinigame] = useState(null);
  const [minigameLocalState, setMinigameLocalState] = useState({});

  const ALL_NUMBER_FORMATS = [
    { id: 'roman', label: 'ローマ数字' }, { id: 'greek', label: 'ギリシャ数字' }, { id: 'kanji', label: '漢数字' }, { id: 'daiji', label: '大字' },
    { id: 'indic', label: 'インド数字' }, { id: 'thai', label: 'タイ数字' }, { id: 'arabic', label: 'アラビア文字数字' }, { id: 'fullwidth', label: '全角数字' },
    { id: 'circled', label: '丸数字' }, { id: 'babylonian', label: 'バビロニア数字' }, { id: 'mayan', label: 'マヤ数字' }, { id: 'egyptian', label: 'エジプト数字' },
    { id: 'devanagari', label: 'デーヴァナーガリー' }, { id: 'bengali', label: 'ベンガル数字' }, { id: 'gujarati', label: 'グジャラート数字' }, { id: 'gurmukhi', label: 'グルムキー数字' },
    { id: 'kannada', label: 'カンナダ数字' }, { id: 'telugu', label: 'テルグ数字' }, { id: 'malayalam', label: 'マラヤーラム数字' }, { id: 'tibetan', label: 'チベット数字' },
    { id: 'myanmar', label: 'ビルマ数字' }, { id: 'khmer', label: 'クメール数字' }, { id: 'lao', label: 'ラーオ数字' }, { id: 'mongolian', label: 'モンゴル数字' },
    { id: 'ethiopic', label: 'ゲエズ数字' }, { id: 'hebrew', label: 'ヘブライ数字' }, { id: 'armenian', label: 'アルメニア数字' }, { id: 'georgian', label: 'ジョージア数字' },
    { id: 'oriya', label: 'オリヤー数字' }, { id: 'tamil', label: 'タミル数字' }, { id: 'tai_tham', label: 'タイ・タム数字' }, { id: 'sundanese', label: 'スンダ数字' },
    { id: 'balinese', label: 'バリ数字' }, { id: 'javanese', label: 'ジャワ数字' }, { id: 'cham', label: 'チャム数字' }
  ];

  const ALL_LANGUAGES = [
    "アラビア語", "イタリア語", "インドネシア語", "ウクライナ語", "オランダ語", 
    "スペイン語(スペイン)", "タイ語", "ドイツ語", "トルコ語", "ヒンディー語", 
    "フランス語", "ベトナム語", "ポーランド語", "ポルトガル語(ブラジル)", "ロシア語", 
    "英語(アメリカ)", "英語(イギリス)", "韓国語", "中国語(国語、簡体字)", "中国語(普通話、簡体字)"
  ];

  const KANJI_QUESTIONS = [
    { q: "薔薇", a: "ばら" }, { q: "憂鬱", a: "ゆううつ" }, { q: "躊躇", a: "ちゅうちょ" }, { q: "挨拶", a: "あいさつ" }, { q: "完璧", a: "かんぺき" },
    { q: "葛藤", a: "かっとう" }, { q: "曖昧", a: "あいまい" }, { q: "醤油", a: "しょうゆ" }, { q: "葡萄", a: "ぶどう" }, { q: "檸檬", a: "れもん" },
    { q: "鬱金香", a: "うこんこう" }, { q: "杜若", a: "ちゅーりっぷ" }, { q: "蒲公英", a: "たんぽぽ" }, { q: "向日葵", a: "たんぽぽ" }, { q: "紫陽花", a: "あじさい" }
  ];
  const ENGLISH_QUESTIONS = [
    { q: "Apple", a: "りんご" }, { q: "Dog", a: "いぬ" }, { q: "Water", a: "みず" }, { q: "Book", a: "ほん" }, { q: "House", a: "いえ" },
    { q: "Car", a: "くるま" }, { q: "Tree", a: "き" }, { q: "Sun", a: "たいよう" }, { q: "Moon", a: "つき" }, { q: "Star", a: "ほし" },
    { q: "Bird", a: "とり" }, { q: "Fish", a: "さかな" }, { q: "Cat", a: "ねこ" }, { q: "Fire", a: "ひ" }, { q: "Earth", a: "ちきゅう" }
  ];

  const [diceConfig, setDiceConfig] = useState({ min: 1, max: 100 });
  const [enabledFormats, setEnabledFormats] = useState(ALL_NUMBER_FORMATS.map(f => f.id));
  const [enabledLangs, setEnabledLangs] = useState(ALL_LANGUAGES);

  const [manualPlayers, setManualPlayers] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [isManualSelectionPhase, setIsManualSelectionPhase] = useState(false);

  const [config, setConfig] = useState({
    rangeMin: 1, rangeMax: 20, rangeProb: 70,
    fixedItems: [{ id: 1, value: 50, prob: 20 }, { id: 2, value: 100, prob: 10 }]
  });

  const [reviveEvents, setReviveEvents] = useState([
    { id: 1, turn: 50, type: 'steal' }, { id: 2, turn: 100, type: 'copy' }   
  ]);

  const [animatingPlayerIds, setAnimatingPlayerIds] = useState([]);
  const [animatingType, setAnimatingType] = useState(null);
  const [isLogsCopied, setIsLogsCopied] = useState(false);
  const [isRankingCopied, setIsRankingCopied] = useState(false);
  const [isDiscordCopied, setIsDiscordCopied] = useState(false);

  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [touchTargetTeam, setTouchTargetTeam] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (!hasFirebaseConfig || !auth) {
        console.warn("Firebase config is missing or incomplete. Offline mode only.");
        return;
      }
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Firebase authentication failed. Continuing in offline mode:", err);
      }
    };
    initAuth();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!user || !currentRoomId || !db) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId);
    const unsub = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoomHostId(data.hostId);
        
        if (data.status === 'joining') {
          syncSettingsFromRoom(data.settings);
          setPlayers(data.players);
          if (phase !== 'multi_lobby' && phase !== 'multi_name') setPhase('multi_lobby');
        }

        if (data.status === 'playing') {
          if (phase !== 'playing') setPhase('playing');
          setPlayers(data.players);
          setTurn(data.gameState.turn);
          setLogs(data.gameState.logs);
          setEliminated(data.gameState.eliminated);
          setIsSpinning(data.gameState.isSpinning);
          setDisplayResult(data.gameState.displayResult);
          setLastResult(data.gameState.lastResult);
          setActiveMinigame(data.gameState.activeMinigame || null);
        }

        if (data.status === 'result') {
          if (phase !== 'result') setPhase('result');
          setPlayers(data.players);
          setLogs(data.gameState.logs);
          setEliminated(data.gameState.eliminated);
        }
      }
    }, (err) => {
      console.error("Firestore onSnapshot error", err);
    });
    return () => unsub();
  }, [user, currentRoomId, phase]);

  useEffect(() => {
    if (lastResult && lastResult.targetIds) {
      setAnimatingPlayerIds(lastResult.targetIds);
      setAnimatingType(lastResult.type);
      const timer = setTimeout(() => {
        setAnimatingPlayerIds([]);
        setAnimatingType(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastResult]);

  useEffect(() => {
    let interval;
    if (isMultiplayer && isSpinning && user?.uid !== roomHostId && phase === 'playing') {
      interval = setInterval(() => {
        const alivePlayers = players.filter(p => p.status === 'alive');
        if (alivePlayers.length > 0) {
           const p = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
           setDisplayResult({ player: p.name, amount: Math.floor(Math.random() * 999) });
        }
      }, 60);
    }
    return () => clearInterval(interval);
  }, [isMultiplayer, isSpinning, user, roomHostId, players, phase]);

  const syncSettingsFromRoom = (s) => {
    setTitle(s.title || ''); setMode(s.mode); setTeamCount(s.teamCount); setTeamNames(s.teamNames);
    setInitialHP(s.initialHP); setSpinDuration(s.spinDuration); setHealInterval(s.healInterval);
    setIsHpBalanceEnabled(s.isHpBalanceEnabled);
    setIsSpecialEventEnabled(s.isSpecialEventEnabled); setSpecialEventProb(s.specialEventProb);
    setEnabledSpecialEvents(s.enabledSpecialEvents); setDiceConfig(s.diceConfig);
    setEnabledFormats(s.enabledFormats); setEnabledLangs(s.enabledLangs); setConfig(s.config); setReviveEvents(s.reviveEvents);
  };

  const toggleSpecialEvent = (type) => {
    setEnabledSpecialEvents(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const totalProb = (parseInt(config.rangeProb) || 0) + config.fixedItems.reduce((sum, item) => sum + (parseInt(item.prob) || 0), 0);
  const isManualTurn = !isMultiplayer && isManualModeEnabled && ((turn >= 41 && turn <= 49) || (turn >= 51 && turn <= 60));
  const isHost = isMultiplayer ? (user?.uid === roomHostId) : true;

  const convertNumber = (num, format) => {
    if (typeof num !== 'number' || format === 'default') return num;
    switch (format) {
      case 'roman': {
        const roman = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
        let res = '', n = num;
        for (let i in roman) { while (n >= roman[i]) { res += i; n -= roman[i]; } }
        return res || '0';
      }
      case 'greek': return num.toString().split('').map(d => ['Α','Β','Γ','Δ','Ｅ','Ϛ','Ｚ','Ｈ','Θ'][parseInt(d)-1] || d).join('');
      case 'kanji': return num.toString().split('').map(d => ['零','一','二','三','四','五','六','七','八','九'][parseInt(d)]).join('');
      case 'daiji': return num.toString().split('').map(d => ['零','壱','弐','参','肆','伍','陸','漆','捌','玖'][parseInt(d)]).join('');
      case 'indic': return num.toString().split('').map(d => ['०','१','२','३','４','５','६','७','८','९'][parseInt(d)]).join('');
      case 'thai': return num.toString().split('').map(d => ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'][parseInt(d)]).join('');
      case 'arabic': return num.toString().split('').map(d => ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][parseInt(d)]).join('');
      case 'fullwidth': return num.toString().split('').map(d => ['０','１','２','３','４','５','６','７','８','９'][parseInt(d)]).join('');
      case 'circled': {
        const circled = ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];
        if (num <= 20) return circled[num];
        return num.toString().split('').map(d => circled[parseInt(d)] || d).join('');
      }
      case 'devanagari': return num.toString().split('').map(d => ['०','१','२','३','४','五','６','７','８','９'][parseInt(d)]).join('');
      default: return num;
    }
  };

  useEffect(() => {
    if (!isMultiplayer) {
      const names = playerListText.split('\n').map(n => n.trim()).filter(n => n !== '');
      const uniqueNames = [...new Set(names)];
      setManualPlayers(prev => uniqueNames.map((name, index) => {
        const existing = prev.find(p => p.name === name);
        if (existing) return existing;
        return { name, teamIndex: mode === 'team' ? (index % teamCount) : 0 };
      }));
    }
  }, [playerListText, teamCount, mode, isMultiplayer]);

  useEffect(() => {
    if (phase === 'playing' && !isSpinning && (!isMultiplayer || user?.uid === roomHostId) && !activeMinigame) {
      if (!isSpecialEventEnabled) {
        setNumberFormat('default'); setNameLanguage('default'); setTranslatedMap({});
        return;
      }
      const randomValue = Math.random();
      if (randomValue >= specialEventProb / 100) {
        setNumberFormat('default'); setNameLanguage('default'); setTranslatedMap({});
      } else {
        const pool = [];
        if (enabledSpecialEvents.includes('numberFormat') && enabledFormats.length > 0) pool.push('format');
        if (enabledSpecialEvents.includes('nameTranslation') && enabledLangs.length > 0) pool.push('lang');

        if (pool.length === 0) {
          setNumberFormat('default'); setNameLanguage('default');
        } else {
          const choice = pool[Math.floor(Math.random() * pool.length)];
          if (choice === 'format') {
            setNumberFormat(enabledFormats[Math.floor(Math.random() * enabledFormats.length)]);
            setNameLanguage('default');
          } else {
            setNameLanguage(enabledLangs[Math.floor(Math.random() * enabledLangs.length)]);
            setNumberFormat('default');
          }
        }
      }
    }
  }, [turn, phase, isSpecialEventEnabled, specialEventProb, enabledSpecialEvents, enabledFormats, enabledLangs, isMultiplayer, user, roomHostId, isSpinning, activeMinigame]);

  const generateTranslatedName = async (name, targetLang) => {
    if (targetLang === 'default' || !isSpecialEventEnabled) return name;
    if (translatedMap[name]) return translatedMap[name];
    
    const delays = [1000, 2000, 4000, 8000, 16000];
    let retries = 0;
    
    while (retries <= 5) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `以下のプレイヤー名を「${targetLang}」に翻訳または音訳してください。余計な説明は省き、名前のみを出力してください。\n名前: ${name}` }] }] })
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || name;
        setTranslatedMap(prev => ({ ...prev, [name]: text }));
        return text;
      } catch (e) {
        if (retries === 5) return name;
        await new Promise(r => setTimeout(r, delays[retries]));
        retries++;
      }
    }
    return name;
  };

  const addFixedItem = () => {
    if (config.fixedItems.length >= 5) return;
    const newId = config.fixedItems.length > 0 ? Math.max(...config.fixedItems.map(i => i.id)) + 1 : 1;
    setConfig({ ...config, fixedItems: [...config.fixedItems, { id: newId, value: 10, prob: 0 }] });
  };
  const removeFixedItem = (id) => setConfig({ ...config, fixedItems: config.fixedItems.filter(item => item.id !== id) });
  const handleSpecialEventProbComplete = (e) => { if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) setSpecialEventProb(Math.min(100, Math.max(1, parseInt(e.target.value) || 1))); };
  const handleConfigComplete = (e, field, min, max = null) => {
    if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
      let val = parseInt(e.target.value); if (isNaN(val)) val = min; if (min !== null) val = Math.max(min, val); if (max !== null) val = Math.min(max, val);
      setConfig(prev => ({ ...prev, [field]: val }));
    }
  };
  const updateFixedItemValue = (id, field, val) => setConfig({ ...config, fixedItems: config.fixedItems.map(item => item.id === id ? { ...item, [field]: val } : item) });
  const handleFixedItemComplete = (e, id, field, min) => {
    if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
      let val = parseInt(e.target.value); if (isNaN(val)) val = min; val = Math.max(min, val);
      setConfig(prev => ({ ...prev, fixedItems: prev.fixedItems.map(item => item.id === id ? { ...item, [field]: val } : item) }));
    }
  };
  const addReviveEvent = () => {
    if (reviveEvents.length >= 5) return;
    const newId = reviveEvents.length > 0 ? Math.max(...reviveEvents.map(r => r.id)) + 1 : 1;
    setReviveEvents([...reviveEvents, { id: newId, turn: 50, type: 'steal' }]);
  };
  const removeReviveEvent = (id) => setReviveEvents(reviveEvents.filter(r => r.id !== id));
  const updateReviveEventState = (id, field, val) => setReviveEvents(reviveEvents.map(r => r.id === id ? { ...r, [field]: field === 'turn' ? (parseInt(val) || 0) : val } : r));
  const autoAssignTeams = () => {
    if (isMultiplayer && user?.uid === roomHostId && db) {
      const updated = [...players].map((p, i) => ({ ...p, teamIndex: i % teamCount, team: teamNames[i % teamCount] }));
      updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), { players: updated }).catch(e => console.error(e));
    } else if (!isMultiplayer) {
      setManualPlayers(prev => prev.map((p, i) => ({ ...p, teamIndex: i % teamCount })));
    }
  };
  const updatePlayerTeam = (name, teamIdx) => {
    setManualPlayers(prev => prev.map(p => p.name === name ? { ...p, teamIndex: parseInt(teamIdx) } : p));
  };
  const updateTeamName = (index, name) => {
    const updated = [...teamNames]; updated[index] = name; setTeamNames(updated);
  };

  const handleDiceConfigComplete = (e, field) => {
    if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
      let val = parseInt(e.target.value);
      if (isNaN(val)) val = 1;
      val = Math.max(1, val);
      setDiceConfig(prev => {
        const next = { ...prev, [field]: val };
        if (field === 'min' && next.min > next.max) {
          next.max = next.min;
        } else if (field === 'max' && next.max < next.min) {
          next.min = next.max;
        }
        return next;
      });
    }
  };

  const handleCreateRoom = async () => {
    if (!user || !db) return;
    try {
      const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
      await setDoc(roomRef, {
        hostId: user.uid,
        status: 'joining',
        roomId: roomId,
        settings: {
          title, mode, teamCount, teamNames, initialHP, spinDuration, healInterval,
          isHpBalanceEnabled, isSpecialEventEnabled, specialEventProb,
          enabledSpecialEvents, diceConfig, enabledFormats, enabledLangs, config, reviveEvents
        },
        players: [],
        gameState: { turn: 1, logs: [], eliminated: [], isSpinning: false, displayResult: { player: '？？？', amount: '？' }, lastResult: null, activeMinigame: null }
      });
      setCurrentRoomId(roomId);
      setRoomHostId(user.uid);
      setPhase('multi_name');
    } catch (e) {
      console.error("Room creation failed", e);
    }
  };

  // ✅ 不具合1修正: ルームID入室の改善
  const handleJoinRoomStep1 = async () => {
    if (!joinRoomIdInput.trim()) {
      setJoinError('ルームIDを入力してください');
      return;
    }
    if (!db) {
       setJoinError('通信環境を確認してください（接続エラー）');
       return;
    }
    setJoinError(''); // 前回のエラーをクリア
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', joinRoomIdInput.toUpperCase());
      const snap = await getDoc(roomRef);
      console.log(`Attempting to join room: ${joinRoomIdInput.toUpperCase()}`, snap.exists() ? snap.data() : 'Not found');
      
      if (snap.exists()) {
        const data = snap.data();
        // statusが'joining'のみ入室可能
        if (data.status === 'joining' && data.settings) {
          setCurrentRoomId(joinRoomIdInput.toUpperCase());
          syncSettingsFromRoom(data.settings);
          setJoinError('');
          setPhase('multi_name');
        } else if (data.status === 'playing') {
          setJoinError('このルームは既にゲーム開始済みです。');
        } else if (data.status === 'result') {
          setJoinError('このゲームは終了しています。');
        } else {
          setJoinError('無効なルーム状態です。');
        }
      } else {
        setJoinError('ルームが見つかりません。IDを確認してください。');
        console.log('Room not found:', joinRoomIdInput.toUpperCase());
      }
    } catch (e) {
      console.error('Room fetch error:', e);
      setJoinError('ルーム情報の取得に失敗しました。(ネットワークエラー)');
    }
  };

  const handleJoinRoomFinal = async () => {
    if (!playerNameInput.trim() || !currentRoomId || !user || !db) return;
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const roomData = snap.data();
        const existing = roomData.players.find(p => p.uid === user.uid);
        if (!existing) {
          const teamIdx = roomData.settings.mode === 'team' ? (roomData.players.length % roomData.settings.teamCount) : 0;
          const teamName = roomData.settings.mode === 'team' ? (roomData.settings.teamNames[teamIdx] || `チーム${String.fromCharCode(65 + teamIdx)}`) : null;
          const newPlayer = {
            id: `p-${Date.now()}-${user.uid}`, uid: user.uid, name: playerNameInput.trim(), hp: roomData.settings.initialHP, status: 'alive', teamIndex: teamIdx, team: teamName
          };
          await updateDoc(roomRef, { players: [...roomData.players, newPlayer] });
        }
        setPhase('multi_lobby');
      }
    } catch (e) {
      console.error("Joining room final step failed", e);
    }
  };

  const startGameSingle = () => {
    if (totalProb !== 100 || manualPlayers.length < 2) return;
    const colors = ['text-red-400', 'text-blue-400', 'text-emerald-400', 'text-amber-400', 'text-purple-400', 'text-cyan-400'];
    const initialPlayers = manualPlayers.map((p, index) => {
      const team = mode === 'team' ? (teamNames[p.teamIndex] || `チーム${String.fromCharCode(65 + p.teamIndex)}`) : null;
      const teamColor = mode === 'team' ? colors[p.teamIndex % colors.length] : null;
      return { id: `p-${Date.now()}-${index}`, name: p.name, hp: initialHP, status: 'alive', team: team, teamColor: teamColor, teamIndex: p.teamIndex };
    });
    setPlayers(initialPlayers);
    setPhase('playing'); setTurn(1); setEliminated([]); setLogs([]); setLastResult(null); setActiveMinigame(null);
    setIsManualSelectionPhase(false); setSelectedPlayerIds([]);
  };

  const startMultiplayerGame = async () => {
    if (!db || !currentRoomId) return;
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId);
      const colors = ['text-red-400', 'text-blue-400', 'text-emerald-400', 'text-amber-400', 'text-purple-400', 'text-cyan-400'];
      const updatedPlayers = players.map(p => ({
        ...p, teamColor: mode === 'team' ? colors[p.teamIndex % colors.length] : null
      }));
      await updateDoc(roomRef, {
        status: 'playing', players: updatedPlayers,
        'gameState.turn': 1, 'gameState.logs': [], 'gameState.eliminated': [], 'gameState.lastResult': null, 'gameState.activeMinigame': null
      });
    } catch (e) {
      console.error("Starting multiplayer game failed", e);
    }
  };

  const generateAmount = () => {
    const r = Math.random() * 100;
    let currentProb = parseFloat(config.rangeProb) || 0;
    const min = parseInt(config.rangeMin) || 1;
    const max = parseInt(config.rangeMax) || 20;
    if (r < currentProb) return Math.floor(Math.random() * (max - min + 1)) + min;
    for (const item of config.fixedItems) {
      currentProb += parseFloat(item.prob) || 0; 
      if (r < currentProb) return parseInt(item.value) || 0;
    }
    return max;
  };

  const copyToClipboard = (text, setFeedback) => {
    const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand('copy'); setFeedback(true); setTimeout(() => setFeedback(false), 2000); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const copyRanking = () => {
    const ranking = getCombinedRanking(); const alive = players.filter(p => p.status === 'alive');
    const winnerTeam = mode === 'team' && alive.length > 0 ? `${alive[0].team}の勝利！\n` : '';
    const rankingText = `${title}\nランキング結果［第${turn}ターンで終了］\n${winnerTeam}` + ranking.map((p, i) => `${i + 1}位:${p.team ? `［${p.team}］` : ''}${p.name}${p.status === 'alive' ? `［ライフ${p.hp}で生存］` : `［第${p.turn}ターンで脱落］`}`).join('\n');
    copyToClipboard(rankingText, setIsRankingCopied);
  };

  const copyDiscordRanking = () => {
    const ranking = getCombinedRanking(); const alive = players.filter(p => p.status === 'alive');
    const winnerTeam = mode === 'team' && alive.length > 0 ? `**${alive[0].team}の勝利！**\n` : '';
    const rankingText = `# ${title}\n## ランキング結果［第${turn}ターンで終了］\n${winnerTeam}` + ranking.map((p, i) => `> ${i + 1}位:${p.team ? `［${p.team}］` : ''}${p.name}${p.status === 'alive' ? `［ライフ${p.hp}で生存］` : `［第${p.turn}ターンで脱落］`}`).join('\n');
    copyToClipboard(rankingText, setIsDiscordCopied);
  };

  const copyLogs = () => {
    const text = logs.map(l => `T${l.turn}: ${l.message}`).join('\n');
    copyToClipboard(text, setIsLogsCopied);
  };

  const isHealTurn = turn % healInterval === 0 && !reviveEvents.some(r => r.turn === turn);
  const currentReviveEvent = reviveEvents.find(r => r.turn === turn);
  const isReviveTurn = !!currentReviveEvent;

  const getPlayerWeights = (alivePlayers) => {
    if (!isHpBalanceEnabled) return alivePlayers.map(p => ({ ...p, weight: 1 }));
    const totalHp = alivePlayers.reduce((sum, p) => sum + p.hp, 0); const avgHp = totalHp / alivePlayers.length;
    return alivePlayers.map(p => ({ ...p, weight: p.hp / avgHp }));
  };

  const selectWeightedPlayer = (weightedPlayers) => {
    const totalWeight = weightedPlayers.reduce((sum, p) => sum + p.weight, 0); let r = Math.random() * totalWeight;
    for (const p of weightedPlayers) { r -= p.weight; if (r <= 0) return p; }
    return weightedPlayers[weightedPlayers.length - 1];
  };

  const updateDisplayResultMulti = async (resultObj) => {
    setDisplayResult(resultObj);
    if (isMultiplayer && user?.uid === roomHostId && db) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), { 'gameState.displayResult': resultObj });
      } catch (e) {
        console.error("Firestore updateDisplayResult failed", e);
      }
    }
  };

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  // ✅ 不具合3と4の修正: ミニゲーム状態管理の完全修正
  useEffect(() => {
    if (activeMinigame && activeMinigame.status === 'playing') {
      const timeLimit = 60000; // 1分
      if (['timeBomb', 'kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(activeMinigame.type)) {
         const timer = setInterval(() => {
            const elapsed = Date.now() - activeMinigame.startTime;
            if (elapsed >= timeLimit) {
               if (isHost) handleMinigameEnd('timeout');
            } else {
               setMinigameLocalState(prev => ({ ...prev, timeLeft: Math.ceil((timeLimit - elapsed) / 1000) }));
            }
         }, 1000);
         return () => clearInterval(timer);
      }
    }
  }, [activeMinigame, isHost]);

  // ✅ 重要: ミニゲーム初期化の完全修正
  useEffect(() => {
     if (activeMinigame && activeMinigame.status === 'playing') {
        // gameIdが異なる = 新しいゲームが開始された
        if (minigameLocalState.gameId !== activeMinigame.id) {
           let initState = { gameId: activeMinigame.id, initialized: true, status: 'playing' }; // statusを初期化！
           
           if (activeMinigame.type === 'kanjiQuiz') {
              const shuffled = [...KANJI_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
              initState = { ...initState, questions: shuffled, currentIndex: 0, input: '', status: 'playing' };
           } else if (activeMinigame.type === 'englishQuiz') {
              const shuffled = [...ENGLISH_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
              initState = { ...initState, questions: shuffled, currentIndex: 0, input: '', status: 'playing' };
           } else if (activeMinigame.type === 'mathQuiz') {
              const questions = Array.from({ length: 5 }).map(() => {
                 const a = Math.floor(Math.random() * 20) + 1; 
                 const b = Math.floor(Math.random() * 20) + 1;
                 return { q: `${a} + ${b}`, a: (a + b).toString() };
              });
              initState = { ...initState, questions, currentIndex: 0, input: '', status: 'playing' };
           } else if (activeMinigame.type === 'timeBomb') {
              const wires = Math.floor(Math.random() * 10) + 1; // 1～10本
              const correctWire = Math.floor(Math.random() * wires); // 0～wires-1
              initState = { ...initState, wires, correctWire, selected: null, status: 'playing', timeLeft: 60 };
              console.log(`TimeBomb initialized: wires=${wires}, correct=${correctWire}`);
           } else if (activeMinigame.type === 'russianRoulette') {
              initState = { ...initState, status: 'playing' };
           }
           
           setMinigameLocalState(initState);
           console.log(`Minigame initialized: ${activeMinigame.type}`, initState);
        }
     } else if (activeMinigame && activeMinigame.status === 'ended') {
        // ゲーム終了状態：何もしない（applyMinigameResultsを待つ）
     } else {
        // ゲーム完全終了：状態クリア
        setMinigameLocalState({});
     }
  }, [activeMinigame?.id, activeMinigame?.status]);

  // ✅ 不具合3修正: クイズ回答送信の改善
  const submitQuizAnswer = (e) => {
     e.preventDefault();
     // statusチェック: 'playing'でない場合は操作を受け付けない
     if (!activeMinigame || minigameLocalState.status !== 'playing') {
        console.log('Quiz not in playing state', minigameLocalState.status);
        return;
     }
     if (!minigameLocalState.questions || minigameLocalState.questions.length === 0) return;
     
     const currentQ = minigameLocalState.questions[minigameLocalState.currentIndex];
     const userAnswer = minigameLocalState.input.trim();
     const isCorrect = userAnswer === currentQ.a;
     
     console.log(`Quiz answer: "${userAnswer}" vs "${currentQ.a}" = ${isCorrect}`);
     
     if (isCorrect) {
        if (minigameLocalState.currentIndex === 4) {
           // 5問全問正解
           setMinigameLocalState(prev => ({ ...prev, status: 'done', result: 'success' }));
           reportMinigameResult(user?.uid || 'local', 'success');
        } else {
           // 次の問題へ
           setMinigameLocalState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1, input: '' }));
        }
     } else {
        // 不正解で失敗
        setMinigameLocalState(prev => ({ ...prev, status: 'done', result: 'fail' }));
        reportMinigameResult(user?.uid || 'local', 'fail');
     }
  };

  // ✅ 不具合4修正: 時限爆弾切る処理
  const cutWire = async (idx) => {
     if (!activeMinigame || minigameLocalState?.status !== 'playing') {
        console.log('Bomb not in playing state', minigameLocalState?.status);
        return;
     }
     if (minigameLocalState.wires === undefined) {
        console.log('Wires not initialized');
        return;
     }
     
     const isCorrect = idx === minigameLocalState.correctWire;
     const result = isCorrect ? 'success' : 'fail';
     
     console.log(`Wire cut: ${idx}, correct: ${minigameLocalState.correctWire}, result: ${result}`);
     
     setMinigameLocalState(prev => ({ 
        ...prev, 
        status: 'done', 
        result: result, 
        selected: idx 
     }));
     
     reportMinigameResult(user?.uid || 'local', result);
  };

  const pullTrigger = async () => {
     // ✅ 不具合2修正: ロシアンルーレット「引き金」の改善
     if (!activeMinigame) return;
     
     const alivePlayers = players.filter(p => p.status === 'alive');
     if (alivePlayers.length === 0) return;
     
     // ターゲットリストを正確に計算
     const targetList = activeMinigame.targetIds && activeMinigame.targetIds[0] !== "SPECIAL" 
         ? activeMinigame.targetIds 
         : alivePlayers.map(p => p.id);
     
     if (targetList.length === 0) return;
     
     const currentTargetId = targetList[activeMinigame.currentPlayerIndex % targetList.length];
     const myPlayerId = players.find(p => p.uid === user?.uid)?.id;
     
     // 権限チェック: ホストか現在のターゲットプレイヤーのみ操作可
     const isMyTurn = currentTargetId === myPlayerId;
     if (!isHost && !isMyTurn) {
        console.log('Not your turn or not host. isHost:', isHost, 'isMyTurn:', isMyTurn);
        return;
     }

     console.log(`Pulling trigger. Index: ${activeMinigame.currentIndex}, BulletIndex: ${activeMinigame.bulletIndex}`);

     const newIndex = activeMinigame.currentIndex + 1;
     const isBullet = (activeMinigame.currentIndex % 6) === activeMinigame.bulletIndex;
     
     if (isBullet) {
        // 銃弾命中：ゲーム終了
        let newResults = { ...activeMinigame.results, [currentTargetId]: 'fail' };
        console.log('BULLET HIT!', currentTargetId);
        if (isMultiplayer && db) {
           try {
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), {
                 'gameState.activeMinigame.status': 'ended',
                 'gameState.activeMinigame.results': newResults
              });
           } catch (e) {
              console.error("Update error:", e);
           }
        } else {
           setActiveMinigame(prev => ({ ...prev, status: 'ended', results: newResults }));
           setTimeout(() => applyMinigameResults({ ...activeMinigame, status: 'ended', results: newResults }), 1500);
        }
     } else {
        // 生き残り：次のプレイヤーへ
        const nextPlayerIdx = (activeMinigame.currentPlayerIndex + 1) % targetList.length;
        console.log(`Safe! Moving to next player. Current: ${activeMinigame.currentPlayerIndex}, Next: ${nextPlayerIdx}`);
        
        if (isMultiplayer && db) {
           try {
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), {
                 'gameState.activeMinigame.currentIndex': newIndex,
                 'gameState.activeMinigame.currentPlayerIndex': nextPlayerIdx
              });
           } catch (e) {
              console.error("Update error:", e);
           }
        } else {
           setActiveMinigame(prev => ({ ...prev, currentIndex: newIndex, currentPlayerIndex: nextPlayerIdx }));
        }
     }
  };

  const reportMinigameResult = async (uid, result) => {
     if (isMultiplayer && db) {
        const playerId = players.find(p => p.uid === uid)?.id;
        if (!playerId) return;
        const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId);
        try {
           const snap = await getDoc(roomRef);
           if (snap.exists()) {
              const mg = snap.data().gameState.activeMinigame;
              if (mg) {
                 const newResults = { ...mg.results, [playerId]: result };
                 await updateDoc(roomRef, { 'gameState.activeMinigame.results': newResults });
              }
           }
        } catch (e) {
           console.error('Report minigame result error:', e);
        }
     } else {
        const targets = activeMinigame.targetIds[0] === "SPECIAL" ? players.filter(p=>p.status==='alive').map(p=>p.id) : activeMinigame.targetIds;
        const newResults = { ...activeMinigame.results };
        targets.forEach(tid => newResults[tid] = result);
        setActiveMinigame(prev => ({ ...prev, results: newResults, status: 'ended' }));
        setTimeout(() => applyMinigameResults({ ...activeMinigame, results: newResults, status: 'ended' }), 1500);
     }
  };

  const handleMinigameEnd = async (reason) => {
     if (!isHost || !activeMinigame) return;
     let mg = activeMinigame;
     if (isMultiplayer && db) {
         try {
            const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId));
            mg = snap.data().gameState.activeMinigame;
         } catch (e) {
            console.error('Get minigame error:', e);
            return;
         }
     }
     
     const targets = mg.targetIds[0] === "SPECIAL" ? players.filter(p=>p.status==='alive').map(p=>p.id) : mg.targetIds;
     const finalResults = { ...mg.results };
     targets.forEach(tid => {
        if (!finalResults[tid]) finalResults[tid] = 'fail';
     });
     
     if (isMultiplayer && db) {
        try {
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), {
              'gameState.activeMinigame.status': 'ended',
              'gameState.activeMinigame.results': finalResults
           });
        } catch (e) {
           console.error('End minigame error:', e);
        }
     } else {
        setActiveMinigame(prev => ({ ...prev, status: 'ended', results: finalResults }));
        setTimeout(() => applyMinigameResults({ ...mg, status: 'ended', results: finalResults }), 1500);
     }
  };

  useEffect(() => {
     if (isHost && isMultiplayer && activeMinigame && activeMinigame.status === 'playing' && activeMinigame.type !== 'russianRoulette') {
        const targets = activeMinigame.targetIds[0] === "SPECIAL" ? players.filter(p=>p.status==='alive').map(p=>p.id) : activeMinigame.targetIds;
        const allDone = targets.length > 0 && targets.every(tid => activeMinigame.results && activeMinigame.results[tid]);
        if (allDone) handleMinigameEnd('all_done');
     }
  }, [activeMinigame, isHost, players, isMultiplayer]);

  useEffect(() => {
     if (activeMinigame && activeMinigame.status === 'ended' && isHost) {
        const timer = setTimeout(() => { applyMinigameResults(activeMinigame); }, 3000);
        return () => clearTimeout(timer);
     }
  }, [activeMinigame?.status, isHost]);

  const applyMinigameResults = async (mg) => {
     let updatedPlayers = [...players];
     const turnLogs = [];
     const finalAmount = mg.amount;
     const targets = mg.targetIds[0] === "SPECIAL" ? players.filter(p=>p.status==='alive').map(p=>p.id) : mg.targetIds;
     
     let failCount = 0;
     targets.forEach(tid => {
        if (mg.results[tid] === 'fail') {
           updatedPlayers = updatedPlayers.map(p => p.id === tid ? { ...p, hp: Math.max(0, p.hp - finalAmount) } : p);
           const pName = players.find(p=>p.id===tid)?.name || "誰か";
           turnLogs.push({ id: Date.now() + Math.random(), turn: turn, type: 'damage', message: `【イベント失敗】${pName}に${finalAmount}ダメージ`, amount: finalAmount, target: pName });
           failCount++;
        } else if (mg.results[tid] === 'success') {
           const pName = players.find(p=>p.id===tid)?.name || "誰か";
           turnLogs.push({ id: Date.now() + Math.random(), turn: turn, type: 'system', message: `【イベント成功】${pName}はダメージ回避！`, target: pName });
        }
     });

     if (failCount === 0 && mg.type === 'russianRoulette') {
         turnLogs.push({ id: Date.now() + Math.random(), turn: turn, type: 'system', message: `誰も当たらなかった...`, target: "全員" });
     }

     const newlyDead = [];
     updatedPlayers = updatedPlayers.map(p => {
        if (p.status === 'alive' && p.hp <= 0) { newlyDead.push({ name: p.name, turn: turn }); return { ...p, hp: 0, status: 'dead' }; }
        return p;
     });
     
     if (newlyDead.length > 0) newlyDead.forEach((d, idx) => turnLogs.push({ id: Date.now() + 100 + idx, turn: turn, type: 'death', message: `${d.name}が脱落...`, target: d.name }));

     if (isMultiplayer && db) {
        const alivePlayersAfter = updatedPlayers.filter(p => p.status === 'alive');
        const isGameFinished = mode === 'team' ? new Set(alivePlayersAfter.map(p => p.team)).size <= 1 : alivePlayersAfter.length <= 1;
        try {
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), {
              players: updatedPlayers,
              'gameState.turn': isGameFinished ? turn : turn + 1,
              'gameState.logs': [...turnLogs, ...logs].slice(0, 100),
              'gameState.eliminated': [...eliminated, ...newlyDead],
              'gameState.activeMinigame': null,
              ...(isGameFinished ? { status: 'result' } : {})
           });
        } catch (e) { console.error("Minigame apply error", e); }
     } else {
        setPlayers(updatedPlayers);
        if (newlyDead.length > 0) setEliminated(prev => [...prev, ...newlyDead]);
        setLogs(prev => [...turnLogs, ...prev]);
        setActiveMinigame(null);
        
        const alivePlayersAfter = updatedPlayers.filter(p => p.status === 'alive');
        const isGameFinished = mode === 'team' ? new Set(alivePlayersAfter.map(p => p.team)).size <= 1 : alivePlayersAfter.length <= 1;
        if (isGameFinished) setPhase('result');
        else setTurn(turn + 1);
     }
  };

  const spinRoulette = async () => {
    if (isSpinning || activeMinigame) return;
    if (isMultiplayer && user?.uid !== roomHostId) return;

    const alivePlayers = players.filter(p => p.status === 'alive');
    const deadPlayers = players.filter(p => p.status === 'dead');
    let isGameOver = mode === 'team' ? new Set(alivePlayers.map(p => p.team)).size <= 1 : alivePlayers.length <= 1;
    if (isGameOver && !isReviveTurn) { 
      if (isMultiplayer && db) { 
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), { status: 'result' }).catch(e => console.error(e)); 
      } else { 
        setPhase('result'); 
      }
      return; 
    }

    setIsSpinning(true);
    if (isMultiplayer && db) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), { 'gameState.isSpinning': true }).catch(e => console.error(e));
    }

    let effectType = isReviveTurn ? 'revive' : (isHealTurn ? 'heal' : 'damage');
    let spins = 0; const intervalMs = 60; const maxSpins = Math.max(10, Math.floor((spinDuration * 1000) / intervalMs));
    
    const isSpecialActive = isSpecialEventEnabled && Math.random() < (specialEventProb / 100) && !isReviveTurn && !isManualTurn;
    let isReverse = false, isMulti = false, isFeint = false, isInstantDeath = false, isReverseHealDamage = false, isTrueRandom = false;
    let minigameType = null;
    
    if (isSpecialActive) {
      const logicPool = [];
      if (enabledSpecialEvents.includes('reverseMode')) logicPool.push('reverse');
      if (enabledSpecialEvents.includes('multiMode')) logicPool.push('multi');
      if (enabledSpecialEvents.includes('feint')) logicPool.push('feint');
      if (enabledSpecialEvents.includes('diceMode')) logicPool.push('dice');
      if (enabledSpecialEvents.includes('reverseHealDamage')) logicPool.push('reverseHealDamage');
      if (enabledSpecialEvents.includes('instantDeath')) logicPool.push('instantDeath');
      if (enabledSpecialEvents.includes('trueRandom')) logicPool.push('trueRandom');
      if (enabledSpecialEvents.includes('russianRoulette')) logicPool.push('russianRoulette');
      if (enabledSpecialEvents.includes('timeBomb')) logicPool.push('timeBomb');
      if (enabledSpecialEvents.includes('kanjiQuiz')) logicPool.push('kanjiQuiz');
      if (enabledSpecialEvents.includes('mathQuiz')) logicPool.push('mathQuiz');
      if (enabledSpecialEvents.includes('englishQuiz')) logicPool.push('englishQuiz');

      if (logicPool.length > 0) {
        const typeChoice = logicPool[Math.floor(Math.random() * logicPool.length)];
        if (typeChoice === 'reverse') isReverse = true; 
        else if (typeChoice === 'multi') isMulti = true; 
        else if (typeChoice === 'feint') isFeint = true;
        else if (typeChoice === 'dice') {} 
        else if (typeChoice === 'reverseHealDamage') { isReverseHealDamage = true; effectType = effectType === 'heal' ? 'damage' : 'heal'; }
        else if (typeChoice === 'instantDeath') { isInstantDeath = true; effectType = 'damage'; } 
        else if (typeChoice === 'trueRandom') isTrueRandom = true;
        else if (['russianRoulette', 'timeBomb', 'kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(typeChoice)) {
           minigameType = typeChoice;
           effectType = 'damage';
           if (['kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(typeChoice)) {
             isReverse = false;
             isMulti = false;
           }
        }
      }
    }

    const weightedPlayers = getPlayerWeights(alivePlayers);
    if (isTrueRandom) weightedPlayers.forEach(p => p.weight = 1);

    const spinInterval = setInterval(() => {
      const randomAlive = selectWeightedPlayer(weightedPlayers);
      if (isManualTurn && !isReviveTurn) {
        setDisplayResult({ player: "対象を選択してください", amount: convertNumber(generateAmount(), numberFormat) });
      } else if (isReviveTurn && currentReviveEvent.type === 'steal') {
        setDisplayResult({ player: `奪う対象: ${randomAlive.name}`, amount: "50%" });
      } else if (isReviveTurn && currentReviveEvent.type === 'copy') {
        setDisplayResult({ player: `コピー元: ${randomAlive.name}`, amount: "COPY" });
      } else if (isInstantDeath) {
        const playerNameDisp = nameLanguage !== 'default' ? (translatedMap[randomAlive.name] || randomAlive.name) : randomAlive.name;
        setDisplayResult({ player: `【即死】${playerNameDisp}`, amount: "DEATH" });
      } else {
        let prefix = isReverse ? "【以外】" : (isMulti ? "【複数】" : "");
        if (['kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(minigameType)) prefix = "【全員】";
        const playerNameDisp = nameLanguage !== 'default' ? (translatedMap[randomAlive.name] || randomAlive.name) : randomAlive.name;
        setDisplayResult({ player: `${prefix}${['kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(minigameType) ? '挑戦' : playerNameDisp}`, amount: convertNumber(generateAmount(), numberFormat) });
      }
      spins++;
      if (spins >= maxSpins) { 
        clearInterval(spinInterval); 
        if (isManualTurn && !isReviveTurn) finalizeSpinManual(effectType);
        else finalizeSpin(effectType, alivePlayers, deadPlayers, isReverse, isMulti, weightedPlayers, isFeint, isInstantDeath, isReverseHealDamage, minigameType); 
      }
    }, intervalMs);
  };

  const finalizeSpinManual = (effectType) => {
    const finalAmount = generateAmount();
    setDisplayResult({ player: "対象を選択してください", amount: convertNumber(finalAmount, numberFormat) });
    setLastResult({ player: "手動選択", amount: finalAmount, type: effectType });
    setIsSpinning(false); setIsManualSelectionPhase(true); setSelectedPlayerIds([]);
  };

  const finalizeSpin = async (effectType, alivePlayers, deadPlayers, isReverse, isMulti, weightedPlayers, isFeint, isInstantDeath, isReverseHealDamage, minigameType) => {
    let chosenPlayer = selectWeightedPlayer(weightedPlayers);
    let reviveTarget = null, finalAmount = 0, updatedPlayers = [...players], customLogData = null, targetIds = [];

    if (isFeint) {
      const fakePlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      const fakeAmount = generateAmount();
      await updateDisplayResultMulti({ player: `【！？】${fakePlayer.name}`, amount: convertNumber(fakeAmount, numberFormat) });
      setAnimatingPlayerIds([fakePlayer.id]); setAnimatingType(effectType);
      await new Promise(r => setTimeout(r, 1200));
    }

    let displayPlayerName = chosenPlayer.name;
    if (['kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(minigameType)) {
        displayPlayerName = "全員";
    } else if (nameLanguage !== 'default') {
        displayPlayerName = await generateTranslatedName(chosenPlayer.name, nameLanguage);
    }

    if (effectType === 'revive') {
      if (deadPlayers.length === 0) {
        await updateDisplayResultMulti({ player: "脱落者なし", amount: "SKIP" });
        customLogData = { type: 'system', message: "復活対象なし、スキップ", target: "なし" };
      } else {
        if (currentReviveEvent.type === 'steal') {
          const lastEliminated = [...eliminated].reverse()[0]; reviveTarget = players.find(p => p.name === lastEliminated.name);
          finalAmount = Math.floor(chosenPlayer.hp / 2);
          updatedPlayers = updatedPlayers.map(p => {
            if (p.id === chosenPlayer.id) return { ...p, hp: p.hp - finalAmount };
            if (p.id === reviveTarget.id) return { ...p, hp: finalAmount, status: 'alive' };
            return p;
          });
          customLogData = { type: 'revive', message: `${chosenPlayer.name}から${finalAmount}奪い${reviveTarget.name}復活`, amount: finalAmount, target: reviveTarget.name };
        } else {
          reviveTarget = deadPlayers[Math.floor(Math.random() * deadPlayers.length)]; finalAmount = chosenPlayer.hp;
          updatedPlayers = updatedPlayers.map(p => p.id === reviveTarget.id ? { ...p, hp: finalAmount, status: 'alive' } : p);
          customLogData = { type: 'revive', message: `${chosenPlayer.name}のHPをコピーし${reviveTarget.name}復活`, amount: finalAmount, target: reviveTarget.name };
        }
        await updateDisplayResultMulti({ player: `${reviveTarget.name} 復活！`, amount: convertNumber(finalAmount, numberFormat) });
        targetIds = [reviveTarget.id];
        setEliminated(prev => prev.filter(e => e.name !== reviveTarget.name));
      }
    } else if (isInstantDeath) {
      targetIds = [chosenPlayer.id];
      updatedPlayers = updatedPlayers.map(p => targetIds.includes(p.id) ? { ...p, hp: 0 } : p);
      await updateDisplayResultMulti({ player: displayPlayerName, amount: "DEATH" });
      customLogData = { type: 'damage', message: `【脱落イベント】${chosenPlayer.name}が即死！`, amount: "DEATH", target: chosenPlayer.name };
      finalAmount = "DEATH";
    } else {
      finalAmount = enabledSpecialEvents.includes('diceMode') && !isReverse && !isMulti && !isFeint && Math.random() < 0.5 ? (Math.floor(Math.random() * (diceConfig.max - diceConfig.min + 1)) + diceConfig.min) : generateAmount();
      const revMsg = isReverseHealDamage ? '(効果反転)' : '';

      if (['kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(minigameType)) {
        targetIds = ["SPECIAL"];
        await updateDisplayResultMulti({ player: `【全員挑戦】`, amount: convertNumber(finalAmount, numberFormat) });
      } else if (isReverse) {
        targetIds = alivePlayers.filter(p => p.id !== chosenPlayer.id).map(p => p.id);
        await updateDisplayResultMulti({ player: `【以外】${displayPlayerName}`, amount: convertNumber(finalAmount, numberFormat) });
        targetIds = ["SPECIAL"]; 
        if (!minigameType) {
           updatedPlayers = updatedPlayers.map(p => targetIds.includes(p.id) || targetIds[0] === "SPECIAL" && p.id !== chosenPlayer.id ? { ...p, hp: Math.max(0, effectType === 'heal' ? p.hp + finalAmount : p.hp - finalAmount) } : p);
           customLogData = { type: effectType, message: `${chosenPlayer.name}「以外」全員に${finalAmount}${effectType === 'heal' ? '回復' : 'ダメージ'}${revMsg}`, amount: finalAmount, target: "複数名" };
        }
      } else if (isMulti) {
        const count = Math.max(2, Math.floor(Math.random() * (alivePlayers.length)) + 1);
        const shuffled = [...alivePlayers].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        
        await updateDisplayResultMulti({ player: `【マルチ発動】${selected.length}名`, amount: convertNumber(finalAmount, numberFormat) });
        await new Promise(r => setTimeout(r, 1000));

        targetIds = [];
        for (let i = 0; i < selected.length; i++) {
          const target = selected[i]; targetIds.push(target.id);
          let targetNameDisp = nameLanguage !== 'default' ? (await generateTranslatedName(target.name, nameLanguage)) : target.name;
          const msg = `${targetNameDisp}に${convertNumber(finalAmount, numberFormat)}${effectType === 'heal' ? '回復' : 'ダメージ'}`;
          await updateDisplayResultMulti({ player: msg, amount: convertNumber(finalAmount, numberFormat) });
          await new Promise(r => setTimeout(r, 800));
        }
        await updateDisplayResultMulti({ player: `【複数】${selected.length}名`, amount: convertNumber(finalAmount, numberFormat) });
        if (!minigameType) {
           updatedPlayers = updatedPlayers.map(p => targetIds.includes(p.id) ? { ...p, hp: Math.max(0, effectType === 'heal' ? p.hp + finalAmount : p.hp - finalAmount) } : p);
           targetIds = ["SPECIAL"];
           customLogData = { type: effectType, message: `ランダムに選ばれた${selected.length}名に${finalAmount}${effectType === 'heal' ? '回復' : 'ダメージ'}${revMsg}`, amount: finalAmount, target: `${selected.length}名` };
        }
      } else {
        targetIds = [chosenPlayer.id];
        await updateDisplayResultMulti({ player: displayPlayerName, amount: convertNumber(finalAmount, numberFormat) });
        if (!minigameType) {
           updatedPlayers = updatedPlayers.map(p => p.id === chosenPlayer.id ? { ...p, hp: Math.max(0, effectType === 'heal' ? p.hp + finalAmount : p.hp - finalAmount) } : p);
           customLogData = { type: effectType, message: `${chosenPlayer.name}に${finalAmount}${effectType === 'heal' ? '回復' : 'ダメージ'}${revMsg}`, amount: finalAmount, target: chosenPlayer.name };
        }
      }
    }

    if (minigameType) {
       const mgData = {
          id: Date.now().toString(),
          type: minigameType,
          targetIds: targetIds,
          amount: finalAmount,
          startTime: Date.now(),
          status: 'playing',
          results: {} 
       };
       if (minigameType === 'russianRoulette') {
          mgData.currentPlayerIndex = 0;
          mgData.bulletIndex = Math.floor(Math.random() * 6);
          mgData.currentIndex = 0;
       }
       if (isMultiplayer && db) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), {
            'gameState.isSpinning': false,
            'gameState.activeMinigame': mgData
          });
       } else {
          setActiveMinigame(mgData);
       }
       setIsSpinning(false);
       setMinigameLocalState({}); // ミニゲーム開始前に状態をクリア
       return; 
    }

    const newlyDead = [];
    updatedPlayers = updatedPlayers.map(p => {
      if (p.status === 'alive' && p.hp <= 0) { newlyDead.push({ name: p.name, turn: turn }); return { ...p, hp: 0, status: 'dead' }; }
      return p;
    });

    const turnLogs = [];
    if (customLogData) turnLogs.push({ id: Date.now(), turn: turn, ...customLogData });
    if (newlyDead.length > 0) newlyDead.forEach((d, idx) => turnLogs.push({ id: Date.now() + idx + 1, turn: turn, type: 'death', message: `${d.name}が脱落...`, target: d.name }));

    if (isMultiplayer && db) {
      try {
        const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId);
        const alivePlayersAfter = updatedPlayers.filter(p => p.status === 'alive');
        const isGameFinished = mode === 'team' ? new Set(alivePlayersAfter.map(p => p.team)).size <= 1 : alivePlayersAfter.length <= 1;
        await updateDoc(roomRef, {
          players: updatedPlayers,
          'gameState.turn': isGameFinished ? turn : turn + 1,
          'gameState.logs': [...turnLogs, ...logs].slice(0, 100),
          'gameState.eliminated': [...eliminated, ...newlyDead],
          'gameState.isSpinning': false,
          'gameState.lastResult': { player: chosenPlayer.name, targetIds: targetIds, amount: finalAmount, type: effectType, isReverse, isMulti },
          ...(isGameFinished ? { status: 'result' } : {})
        });
        setIsSpinning(false);
      } catch (e) {
        console.error("Failed to update multiplayer game state", e);
        setIsSpinning(false);
      }
    } else {
      setPlayers(updatedPlayers);
      if (newlyDead.length > 0) setEliminated(prev => [...prev, ...newlyDead]);
      setLastResult({ player: chosenPlayer.name, targetIds: targetIds, amount: finalAmount, type: effectType, isReverse, isMulti });
      setLogs(prev => [...turnLogs, ...prev]);
      setTimeout(() => {
        setIsSpinning(false);
        const alivePlayersAfter = updatedPlayers.filter(p => p.status === 'alive');
        const isGameFinished = mode === 'team' ? new Set(alivePlayersAfter.map(p => p.team)).size <= 1 : alivePlayersAfter.length <= 1;
        if (isGameFinished) {
          setPhase('result');
        } else {
          setTurn(turn + 1);
        }
      }, 2000);
    }
  };

  const applyManualSelection = () => {
    const effectType = lastResult.type; const finalAmount = lastResult.amount; let updatedPlayers = [...players]; const turnLogs = []; const targetNames = [];
    if (selectedPlayerIds.length > 0) {
      updatedPlayers = updatedPlayers.map(p => {
        if (selectedPlayerIds.includes(p.id)) { targetNames.push(p.name); return { ...p, hp: Math.max(0, effectType === 'heal' ? p.hp + finalAmount : p.hp - finalAmount) }; }
        return p;
      });
      const newlyDead = [];
      updatedPlayers = updatedPlayers.map(p => {
        if (p.status === 'alive' && p.hp <= 0) { newlyDead.push({ name: p.name, turn: turn }); return { ...p, hp: 0, status: 'dead' }; }
        return p;
      });
      setPlayers(updatedPlayers);
      turnLogs.push({ id: Date.now(), turn: turn, type: effectType, message: `【手動選択】${targetNames.join(', ')}に${finalAmount}${effectType === 'heal' ? '回復' : 'ダメージ'}`, amount: finalAmount, target: targetNames.join(', ') });
      if (newlyDead.length > 0) {
        setEliminated(prev => [...prev, ...newlyDead]); newlyDead.forEach((d, idx) => turnLogs.push({ id: Date.now() + idx + 1, turn: turn, type: 'death', message: `${d.name}が脱落...`, target: d.name }));
      }
    } else {
      turnLogs.push({ id: Date.now(), turn: turn, type: 'system', message: `対象なし（${finalAmount}${effectType === 'heal' ? '回復' : 'ダメージ'} スキップ）`, target: "なし" });
    }
    setLogs(prev => [...turnLogs, ...prev]); setIsManualSelectionPhase(false); setSelectedPlayerIds([]);
    
    const alivePlayersAfter = updatedPlayers.filter(p => p.status === 'alive');
    const isGameFinished = mode === 'team' ? new Set(alivePlayersAfter.map(p => p.team)).size <= 1 : alivePlayersAfter.length <= 1;
    if (isGameFinished) {
      setPhase('result');
    } else {
      setTurn(turn + 1);
    }
  };

  const getCombinedRanking = () => {
    const alive = players.filter(p => p.status === 'alive').sort((a, b) => b.hp - a.hp);
    const dead = [...eliminated].reverse().map(e => { const p = players.find(player => player.name === e.name); return { ...p, status: 'dead', turn: e.turn }; });
    return [...alive, ...dead];
  };

  const backToHome = () => {
    setPhase('home');
    setIsMultiplayer(false);
    setCurrentRoomId(null);
    setRoomHostId(null);
    setPlayers([]);
    setEliminated([]);
    setLogs([]);
    setTurn(1);
    setDisplayResult({ player: '？？？', amount: '？' });
    setLastResult(null);
    setActiveMinigame(null);
  };

  const RankingList = ({ ranking }) => (
    <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
      {ranking.map((p, index) => {
        const isAlive = p.status === 'alive'; const isFirst = index === 0 && isAlive; const isLowHp = isAlive && p.hp <= initialHP * 0.3;
        return (
          <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isFirst ? 'bg-indigo-600/30 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.4)] scale-[1.02]' : isAlive ? (isLowHp ? 'bg-red-950/20 border-red-800 animate-pulse' : 'bg-slate-900 border-slate-700') : 'bg-slate-950/60 border-slate-900 opacity-60'}`}>
            <div className="flex items-center gap-4 overflow-hidden">
              <span className={`font-black text-lg w-8 shrink-0 ${isFirst ? 'text-amber-400' : 'text-slate-500'}`}>{index + 1}</span>
              <span className={`font-bold text-base truncate ${isAlive ? (p.teamColor || 'text-white') : 'text-slate-400'}`}>{p.team ? `[${p.team}] ` : ''}{p.name}</span>
            </div>
            <div className="text-right shrink-0 ml-4 flex items-center gap-2">
              {isLowHp && <span className="text-red-500 animate-bounce"><ShieldAlert size={14}/></span>}
              {isAlive ? <span className={`font-black text-sm px-3 py-1.5 rounded-xl border tabular-nums ${isLowHp ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>HP {p.hp}</span> : <span className="text-slate-500 font-bold text-xs px-3 py-1.5 bg-slate-800/40 rounded-xl border border-slate-800/50">T{p.turn}脱落</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const onDragStart = (e, player) => { setDraggedPlayer(player); e.dataTransfer.setData("playerName", player.name); };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, teamIndex) => { e.preventDefault(); if (draggedPlayer && !isMultiplayer) { updatePlayerTeam(draggedPlayer.name, teamIndex); setDraggedPlayer(null); } };
  const onDropLobby = async (e, teamIndex) => {
    e.preventDefault();
    if (draggedPlayer && isMultiplayer && user?.uid === roomHostId && db) {
      try {
        const updated = players.map(p => p.id === draggedPlayer.id ? { ...p, teamIndex, team: teamNames[teamIndex] } : p);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), { players: updated });
      } catch (err) {
        console.error("Lobby onDrop failed", err);
      }
      setDraggedPlayer(null);
    }
  };
  const onTouchStart = (e, player) => setDraggedPlayer(player);
  const onTouchMove = (e) => {
    if (!draggedPlayer) return;
    const touch = e.touches[0]; const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const teamBox = target?.closest('[data-team-index]');
    if (teamBox) setTouchTargetTeam(parseInt(teamBox.getAttribute('data-team-index'))); else setTouchTargetTeam(null);
  };
  const onTouchEnd = () => { if (draggedPlayer && touchTargetTeam !== null && !isMultiplayer) updatePlayerTeam(draggedPlayer.name, touchTargetTeam); setDraggedPlayer(null); setTouchTargetTeam(null); };
  const onTouchEndLobby = async () => {
    if (draggedPlayer && touchTargetTeam !== null && isMultiplayer && user?.uid === roomHostId && db) {
      try {
        const updated = players.map(p => p.id === draggedPlayer.id ? { ...p, teamIndex: touchTargetTeam, team: teamNames[touchTargetTeam] } : p);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId), { players: updated });
      } catch (err) {
        console.error("Lobby touchEnd failed", err);
      }
    }
    setDraggedPlayer(null); setTouchTargetTeam(null);
  };

  const renderMinigame = () => {
    if (!activeMinigame) return null;
    const isTarget = activeMinigame.targetIds[0] === "SPECIAL" || activeMinigame.targetIds.includes(players.find(p=>p.uid===user?.uid)?.id) || (!isMultiplayer);
    
    // ロシアンルーレットの順番判定
    const alivePlayers = players.filter(p => p.status === 'alive');
    const targetList = activeMinigame.targetIds && activeMinigame.targetIds[0] !== "SPECIAL" 
        ? activeMinigame.targetIds 
        : alivePlayers.map(p => p.id);
    const rrCurrentTargetId = activeMinigame.type === 'russianRoulette' 
      ? targetList[activeMinigame.currentPlayerIndex % targetList.length]
      : null;
    const isMyTurnRR = activeMinigame.type === 'russianRoulette' && (!isMultiplayer || players.find(p=>p.uid === user?.uid)?.id === rrCurrentTargetId);

    return (
       <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(99,102,241,0.2)] relative">
             <div className="absolute -top-6 -right-6 bg-indigo-600 text-white w-16 h-16 flex items-center justify-center rounded-full font-black text-2xl border-4 border-slate-900 shadow-xl">
                {minigameLocalState?.timeLeft || '∞'}
             </div>
             <h2 className="text-3xl font-black italic tracking-tighter text-white mb-2 uppercase">
                {activeMinigame.type === 'russianRoulette' && 'ロシアンルーレット'}
                {activeMinigame.type === 'timeBomb' && '時限爆弾解除'}
                {activeMinigame.type === 'kanjiQuiz' && '漢字クイズ'}
                {activeMinigame.type === 'mathQuiz' && '計算クイズ'}
                {activeMinigame.type === 'englishQuiz' && '英単語クイズ'}
             </h2>
             <p className="text-slate-400 font-bold mb-6 bg-slate-950 inline-block px-4 py-1.5 rounded-full border border-slate-800">失敗すると <span className="text-red-500 font-black">{activeMinigame.amount}</span> ダメージ</p>
             
             {activeMinigame.status === 'ended' ? (
                <div className="py-12 text-2xl font-black text-amber-500 animate-pulse tracking-widest">結果反映中...</div>
             ) : isTarget ? (
                <>
                   {activeMinigame.type === 'russianRoulette' && (
                      <div className="space-y-6">
                         <div className="py-4 bg-slate-950 rounded-2xl border border-slate-800">
                           <p className="text-sm font-bold text-slate-500 mb-1">現在の挑戦者</p>
                           <p className="text-3xl font-black text-indigo-400">
                             {players.find(p=>p.id===rrCurrentTargetId)?.name || '？？？'}
                           </p>
                         </div>
                         <button onClick={pullTrigger} disabled={!isMyTurnRR && !isHost} className={`w-full py-6 rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95 ${(isMyTurnRR || isHost) ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20' : 'bg-slate-800 text-slate-500'}`}>
                            引き金を引く ({activeMinigame.currentIndex + 1}回目) {!(isMyTurnRR || isHost) && '(待機中)'}
                         </button>
                      </div>
                   )}
                   
                   {['kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(activeMinigame.type) && minigameLocalState?.initialized && (
                      <div className="space-y-6">
                         {minigameLocalState.status === 'done' ? (
                            <div className={`py-12 text-4xl font-black italic tracking-tighter ${minigameLocalState.result === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                               {minigameLocalState.result === 'success' ? 'CLEAR!' : 'FAILED...'}
                            </div>
                         ) : (
                            <>
                               <div className="flex items-center justify-between px-2">
                                 <div className="text-xs font-black text-indigo-400 tracking-widest uppercase">QUESTION</div>
                                 <div className="text-sm font-bold text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">{minigameLocalState.currentIndex + 1} / 5</div>
                               </div>
                               <div className="text-5xl font-black py-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner tracking-widest text-white break-all">
                                  {minigameLocalState.questions?.[minigameLocalState.currentIndex]?.q || '？'}
                               </div>
                               <form onSubmit={submitQuizAnswer} className="flex gap-2">
                                  <input type="text" autoFocus value={minigameLocalState.input || ''} onChange={e => setMinigameLocalState(prev=>({...prev, input: e.target.value}))} placeholder={activeMinigame.type === 'mathQuiz' ? '数字で入力' : 'ひらがな または カタカナ で入力'} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 font-bold text-xl outline-none focus:border-indigo-500 text-center text-white" />
                                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-xl font-black text-lg transition-all active:scale-95">回答</button>
                               </form>
                            </>
                         )}
                      </div>
                   )}

                   {activeMinigame.type === 'timeBomb' && minigameLocalState?.initialized && minigameLocalState?.wires && (
                      <div className="space-y-6">
                         {minigameLocalState.status === 'done' ? (
                            <div className={`py-12 text-4xl font-black italic tracking-tighter ${minigameLocalState.result === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                               {minigameLocalState.result === 'success' ? 'DEFUSED!' : 'BOOOOM!!!'}
                            </div>
                         ) : (
                            <>
                               <div className="text-xs font-black text-amber-500 tracking-widest bg-amber-500/10 inline-block px-4 py-2 rounded-full border border-amber-500/20 mb-2">どれか1本だけが正解の導線だ...</div>
                               <div className="flex flex-wrap justify-center gap-3 py-6 bg-slate-950 rounded-3xl border border-slate-800 px-4">
                                  {Array.from({length: minigameLocalState.wires}).map((_, idx) => (
                                     <button key={idx} onClick={() => cutWire(idx)} disabled={minigameLocalState.status === 'done'} className="w-14 h-32 bg-slate-800 hover:bg-slate-700 disabled:hover:bg-slate-800 rounded-xl relative overflow-hidden group transition-all hover:-translate-y-2 shadow-lg disabled:opacity-50">
                                        <div className="absolute inset-x-3 top-0 bottom-0 bg-red-500 group-hover:bg-red-400 mx-auto w-2.5 rounded-full shadow-[0_0_15px_red] transition-all"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-xl z-10 group-hover:text-white group-hover:border-slate-500">切る</div>
                                     </button>
                                  ))}
                               </div>
                            </>
                         )}
                      </div>
                   )}
                </>
             ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                   <Activity className="text-indigo-500 animate-pulse" size={48} />
                   <div className="text-xl font-bold text-slate-400">対象者がイベントに挑戦中...</div>
                </div>
             )}
          </div>
       </div>
    );
  };

  if (phase === 'home') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="z-10 text-center max-w-xl w-full">
          <div className="mb-4 inline-block p-4 bg-indigo-900/50 rounded-3xl border border-indigo-500/30"><Swords size={48} className="text-indigo-400"/></div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-2xl mb-12 uppercase leading-none">Survival<br/><span className="text-indigo-400">Roulette</span></h1>
          <div className="flex flex-col gap-4">
            <button onClick={() => { setIsMultiplayer(false); setPhase('setup'); }} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-2xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3"><Users size={24}/> ひとりで遊ぶ</button>
            <button onClick={() => setPhase('multi_menu')} className="w-full py-5 bg-slate-900 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl font-black text-2xl transition-all flex items-center justify-center gap-3"><Activity size={24}/> みんなで遊ぶ</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'multi_menu') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl flex flex-col items-center text-center">
          <h2 className="text-3xl font-black italic tracking-tighter text-indigo-400 mb-8 uppercase">Multiplayer</h2>
          <div className="flex flex-col gap-4 w-full">
            <button onClick={() => { setIsMultiplayer(true); setPhase('setup'); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xl transition-all">マルチプレイルーム作成</button>
            <button onClick={() => { setIsMultiplayer(true); setPhase('multi_join_id'); }} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xl transition-all">ID入室</button>
          </div>
          <button onClick={() => setPhase('home')} className="mt-8 text-slate-500 font-bold hover:text-white transition-colors">← 戻る</button>
        </div>
      </div>
    );
  }

  if (phase === 'multi_join_id') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-black italic tracking-tighter text-white mb-2 uppercase">JOIN ROOM</h2>
          <p className="text-slate-400 text-xs font-bold mb-6">共有されたルームIDを入力してください</p>
          <input type="text" value={joinRoomIdInput} onChange={(e) => setJoinRoomIdInput(e.target.value)} placeholder="ROOM ID" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 font-black text-2xl mb-2 outline-none focus:border-indigo-500 text-center uppercase tracking-widest text-indigo-400" maxLength={6}/>
          {joinError && <div className="text-red-500 text-xs font-bold mb-4">{joinError}</div>}
          <button onClick={handleJoinRoomStep1} disabled={!joinRoomIdInput.trim()} className={`w-full mt-4 py-4 rounded-xl font-black text-xl transition-all ${joinRoomIdInput.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>次へ</button>
          <button onClick={() => setPhase('multi_menu')} className="mt-6 text-slate-500 font-bold hover:text-white transition-colors">キャンセル</button>
        </div>
      </div>
    );
  }

  if (phase === 'multi_name') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-black italic tracking-tighter text-white mb-2 uppercase">YOUR NAME</h2>
          <p className="text-slate-400 text-xs font-bold mb-6">ゲーム内で表示される名前を入力してください</p>
          <input type="text" value={playerNameInput} onChange={(e) => setPlayerNameInput(e.target.value)} placeholder="Player Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 font-bold text-lg mb-6 outline-none focus:border-indigo-500 text-center text-white" maxLength={15}/>
          <button onClick={handleJoinRoomFinal} disabled={!playerNameInput.trim()} className={`w-full py-4 rounded-xl font-black text-xl transition-all ${playerNameInput.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>入室する</button>
        </div>
      </div>
    );
  }

  if (phase === 'multi_lobby') {
    const isHost = user?.uid === roomHostId;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 flex flex-col items-center justify-center">
         <div className="bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 w-full max-w-4xl p-6 md:p-10 flex flex-col h-[85vh]">
            <div className="text-center mb-6 shrink-0 relative">
               <div className="absolute top-0 left-0 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Activity size={12}/> MULTIPLAYER</div>
               <h2 className="text-4xl font-black italic tracking-tighter text-white mt-4 md:mt-0 mb-4 uppercase">WAITING LOBBY</h2>
               <div className="inline-flex items-center gap-4 bg-slate-950 border border-slate-800 px-6 py-3 rounded-2xl mx-auto">
                 <span className="text-slate-500 font-black text-xs uppercase tracking-widest">Room ID</span>
                 <span className="text-3xl font-black text-indigo-400 tracking-widest">{currentRoomId}</span>
                 <button onClick={() => copyToClipboard(currentRoomId, setIsLogsCopied)} className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">{isLogsCopied ? <Check size={18} className="text-emerald-400"/> : <Copy size={18}/>}</button>
               </div>
            </div>
            
            <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3 flex justify-between items-end"><span className="flex items-center gap-2"><Users size={14}/> Participants ({players.length})</span>{isHost && mode === 'team' && <span className="text-amber-500">ドラッグ＆ドロップでチーム変更可能</span>}</div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-800 rounded-3xl p-4 bg-slate-950 mb-6" onTouchMove={onTouchMove} onTouchEnd={onTouchEndLobby}>
               {mode === 'individual' ? (
                 <div className="flex flex-wrap gap-3">
                   {players.map((p) => (
                     <div key={p.id} className={`px-5 py-3 rounded-xl border font-bold text-sm flex items-center gap-3 ${p.uid === roomHostId ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-100' : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
                        {p.uid === roomHostId ? <Trophy size={14} className="text-amber-400"/> : <Users size={14} className="text-slate-500"/>} {p.name}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {Array.from({ length: teamCount }).map((_, teamIdx) => (
                     <div 
                        key={teamIdx} data-team-index={teamIdx} onDragOver={onDragOver} onDrop={(e) => onDropLobby(e, teamIdx)}
                        className={`p-4 rounded-2xl border transition-all ${touchTargetTeam === teamIdx ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30' : 'bg-slate-900 border-slate-800'}`}
                      >
                        <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3">{teamNames[teamIdx] || `チーム${String.fromCharCode(65 + teamIdx)}`}</h4>
                        <div className="min-h-[50px] flex flex-wrap gap-2">
                           {players.filter(p => p.teamIndex === teamIdx).map(p => (
                              <div 
                                key={p.id} draggable={isHost} onDragStart={(e) => onDragStart(e, p)} onTouchStart={(e) => onTouchStart(e, p)}
                                className={`bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 font-bold text-sm flex items-center gap-2 ${isHost ? 'cursor-grab active:cursor-grabbing hover:border-slate-600 shadow-sm' : ''} ${p.uid === roomHostId ? 'text-indigo-300' : 'text-slate-200'}`}
                              >
                                {isHost && <GripVertical size={14} className="text-slate-600" />} {p.uid === roomHostId && <Trophy size={12} className="text-amber-400"/>} {p.name}
                              </div>
                           ))}
                           {players.filter(p => p.teamIndex === teamIdx).length === 0 && <div className="text-[10px] font-black text-slate-700 uppercase italic py-2 w-full text-center">Empty</div>}
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            <div className="shrink-0 text-center">
               {isHost ? (
                 <button onClick={startMultiplayerGame} disabled={players.length < 2} className={`w-full max-w-md mx-auto py-5 rounded-2xl font-black text-2xl transition-all shadow-2xl flex items-center justify-center gap-3 ${players.length >= 2 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
                   {players.length >= 2 ? <><Play fill="currentColor"/> ゲームスタート</> : '参加者を待っています...'}
                 </button>
               ) : (
                 <div className="bg-slate-800 border border-slate-700 w-full max-w-md mx-auto py-5 rounded-2xl font-black text-lg text-slate-400 flex items-center justify-center gap-3 animate-pulse">
                   <Clock size={20}/> ホストの開始を待機中...
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-5xl bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-center relative overflow-hidden shrink-0 flex justify-between items-center">
            {isMultiplayer && <div className="bg-black/20 px-3 py-1 rounded text-[10px] font-black text-indigo-100 uppercase tracking-widest">Multiplayer Mode</div>}
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white drop-shadow-lg uppercase flex-1 text-center">SURVIVAL ROULETTE</h1>
            {isMultiplayer && <div className="w-[100px]"></div>}
          </div>
          
          <div className={`p-6 grid grid-cols-1 ${isMultiplayer ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 lg:h-[78vh] overflow-y-auto lg:overflow-hidden custom-scrollbar`}>
            {/* 左側設定カラム */}
            <div className="space-y-4 flex flex-col min-h-0 lg:h-full overflow-hidden">
              <div className={`space-y-4 overflow-y-auto pr-1 custom-scrollbar shrink-0 ${isMultiplayer ? 'h-full' : 'max-h-[60%] lg:max-h-[65%]'}`}>
                <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase flex items-center gap-2 px-1"><Settings2 size={12}/> 基本設定</label>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                   <label className="text-[8px] font-black text-slate-500 tracking-widest block uppercase flex items-center gap-1"><Type size={8}/> タイトル</label>
                   <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ゲームのタイトルを入力..." className="bg-transparent text-sm font-bold w-full outline-none text-white border-b border-slate-800 focus:border-indigo-500 pb-1" />
                   <div className="flex gap-1 pt-2">
                    {['individual', 'team'].map(m => (
                      <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}>{m === 'individual' ? '個人戦' : 'チーム戦'}</button>
                    ))}
                  </div>
                </div>
                {mode === 'team' && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner space-y-3">
                    <div>
                      <label className="text-[8px] font-black text-slate-500 tracking-widest block mb-1 uppercase">チーム数</label>
                      <input type="number" min="2" max="6" value={teamCount} onChange={(e) => setTeamCount(parseInt(e.target.value) || 2)} className="bg-transparent text-xl font-black w-full outline-none text-indigo-400 tabular-nums" />
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="text-[8px] font-black text-slate-500 tracking-widest block mb-1 uppercase flex items-center gap-1"><Edit3 size={8}/> チーム名設定</label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                        {Array.from({ length: teamCount }).map((_, i) => (
                          <input key={i} type="text" value={teamNames[i] || ''} onChange={(e) => updateTeamName(i, e.target.value)} placeholder={`チーム${String.fromCharCode(65 + i)}`} className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-300 outline-none focus:border-indigo-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800"><label className="text-[8px] font-black text-slate-500 block mb-1 uppercase">初期HP</label><input type="number" value={initialHP} onChange={(e) => setInitialHP(Math.max(1, parseInt(e.target.value) || 1))} className="bg-transparent text-lg font-black w-full outline-none text-indigo-400" /></div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800"><label className="text-[8px] font-black text-slate-500 block mb-1 uppercase">速度</label><input type="number" step="0.1" value={spinDuration} onChange={(e) => setSpinDuration(Math.max(0.1, parseFloat(e.target.value) || 0.1))} className="bg-transparent text-lg font-black w-full outline-none text-amber-500" /></div>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800"><label className="text-[8px] font-black text-slate-500 block mb-1 uppercase">回復頻度 (ターン)</label><input type="number" value={healInterval} onChange={(e) => setHealInterval(Math.max(1, parseInt(e.target.value) || 1))} className="bg-transparent text-lg font-black w-full outline-none text-emerald-500" /></div>
                <div className="space-y-2">
                  <button onClick={() => setIsHpBalanceEnabled(!isHpBalanceEnabled)} className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${isHpBalanceEnabled ? 'bg-emerald-600/10 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Scale size={14}/> HPバランス調整</span>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black ${isHpBalanceEnabled ? 'bg-emerald-600' : 'bg-slate-800'}`}>{isHpBalanceEnabled ? 'ON' : 'OFF'}</div>
                  </button>
                  <button onClick={() => setIsSpecialEventEnabled(!isSpecialEventEnabled)} className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${isSpecialEventEnabled ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">{isSpecialEventEnabled ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>} 特別イベント</span>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black ${isSpecialEventEnabled ? 'bg-purple-600' : 'bg-slate-800'}`}>{isSpecialEventEnabled ? 'ON' : 'OFF'}</div>
                  </button>
                  {isSpecialEventEnabled && (
                    <div className="mt-2 space-y-3 ml-4 border-l-2 border-purple-500/20 pl-4 py-2">
                      <div className="p-3 bg-slate-950/50 rounded-2xl border border-purple-500/30 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase">発生確率</span>
                        <div className="flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-lg">
                          <input type="number" min="1" max="100" value={specialEventProb} onChange={(e) => setSpecialEventProb(e.target.value)} onBlur={handleSpecialEventProbComplete} onKeyDown={handleSpecialEventProbComplete} className="bg-transparent text-[10px] font-black w-8 outline-none text-purple-400 text-right tabular-nums" />
                          <span className="text-[8px] font-black text-purple-400">%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'reverseMode', label: 'リバース (以外全員)', icon: <RotateCcw size={10}/> }, { id: 'multiMode', label: 'マルチ (複数名同時)', icon: <Users size={10}/> },
                          { id: 'feint', label: 'ルーレットフェイント', icon: <Zap size={10}/> }, { id: 'diceMode', label: `ダイスルーレット (${diceConfig.min}d-${diceConfig.max}d)`, icon: <Percent size={10}/> },
                          { id: 'numberFormat', label: '特殊数値形式', icon: <Type size={10}/> }, { id: 'nameTranslation', label: '名前の多言語化', icon: <Languages size={10}/> },
                          { id: 'reverseHealDamage', label: '回復・ダメージ逆転', icon: <RotateCcw size={10}/> }, { id: 'instantDeath', label: '脱落イベント (即死)', icon: <Skull size={10}/> },
                          { id: 'trueRandom', label: '完全ランダム (HPバランス無視)', icon: <Activity size={10}/> },
                          { id: 'russianRoulette', label: 'ロシアンルーレット', icon: <Skull size={10}/> }, { id: 'timeBomb', label: '時限爆弾解除', icon: <Clock size={10}/> },
                          { id: 'kanjiQuiz', label: '漢字クイズ', icon: <Type size={10}/> }, { id: 'mathQuiz', label: '計算クイズ', icon: <Percent size={10}/> },
                          { id: 'englishQuiz', label: '英単語クイズ', icon: <Languages size={10}/> }
                        ].map(ev => (
                          <div key={ev.id} className="flex flex-col">
                            <button onClick={() => toggleSpecialEvent(ev.id)} className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${enabledSpecialEvents.includes(ev.id) ? 'bg-purple-600/20 border-purple-500/50 text-purple-100' : 'bg-slate-900 border-slate-800 text-slate-600'} ${enabledSpecialEvents.includes(ev.id) && ['diceMode', 'numberFormat', 'nameTranslation'].includes(ev.id) ? 'rounded-b-none border-b-0' : ''}`}>
                              <span className="text-[9px] font-bold flex items-center gap-2">{ev.icon} {ev.label}</span>
                              <div className={`w-2 h-2 rounded-full ${enabledSpecialEvents.includes(ev.id) ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-slate-700'}`}></div>
                            </button>
                            {enabledSpecialEvents.includes(ev.id) && ev.id === 'diceMode' && (
                              <div className="pl-4 pr-2 py-2 bg-slate-900/50 rounded-b-xl border border-purple-500/50 border-t-0 flex items-center gap-2">
                                <span className="text-[9px] text-slate-400">範囲:</span>
                                <input 
                                  type="number" 
                                  value={diceConfig.min} 
                                  onChange={e => setDiceConfig({...diceConfig, min: e.target.value})} 
                                  onBlur={e => handleDiceConfigComplete(e, 'min')}
                                  onKeyDown={e => handleDiceConfigComplete(e, 'min')}
                                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1 text-[10px] text-white" 
                                />
                                <span className="text-slate-400 text-[10px]">d ~</span>
                                <input 
                                  type="number" 
                                  value={diceConfig.max} 
                                  onChange={e => setDiceConfig({...diceConfig, max: e.target.value})} 
                                  onBlur={e => handleDiceConfigComplete(e, 'max')}
                                  onKeyDown={e => handleDiceConfigComplete(e, 'max')}
                                  className="w-12 bg-slate-950 border border-slate-800 rounded px-1 text-[10px] text-white" 
                                />
                                <span className="text-slate-400 text-[10px]">d</span>
                              </div>
                            )}
                            {enabledSpecialEvents.includes(ev.id) && ev.id === 'numberFormat' && (
                              <div className="pl-3 pr-2 py-2 bg-slate-900/50 rounded-b-xl border border-purple-500/50 border-t-0 grid grid-cols-2 gap-y-1.5 gap-x-1 max-h-40 overflow-y-auto custom-scrollbar">
                                {ALL_NUMBER_FORMATS.map(fmt => (
                                  <label key={fmt.id} className="flex items-center gap-1.5 text-[9px] text-slate-300 cursor-pointer"><input type="checkbox" checked={enabledFormats.includes(fmt.id)} onChange={() => setEnabledFormats(prev => prev.includes(fmt.id) ? prev.filter(id => id !== fmt.id) : [...prev, fmt.id])} className="accent-purple-500 w-3 h-3 shrink-0" /><span className="truncate">{fmt.label}</span></label>
                                ))}
                              </div>
                            )}
                            {enabledSpecialEvents.includes(ev.id) && ev.id === 'nameTranslation' && (
                              <div className="pl-3 pr-2 py-2 bg-slate-900/50 rounded-b-xl border border-purple-500/50 border-t-0 grid grid-cols-2 gap-y-1.5 gap-x-1 max-h-40 overflow-y-auto custom-scrollbar">
                                {ALL_LANGUAGES.map(lang => (
                                  <label key={lang} className="flex items-center gap-1.5 text-[9px] text-slate-300 cursor-pointer"><input type="checkbox" checked={enabledLangs.includes(lang)} onChange={() => setEnabledLangs(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])} className="accent-purple-500 w-3 h-3 shrink-0" /><span className="truncate">{lang}</span></label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!isMultiplayer && (
                     <button onClick={() => setIsManualModeEnabled(!isManualModeEnabled)} className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${isManualModeEnabled ? 'bg-amber-600/10 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Hand size={14}/> 手動選択 (41-60T)</span>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black ${isManualModeEnabled ? 'bg-amber-600' : 'bg-slate-800'}`}>{isManualModeEnabled ? 'ON' : 'OFF'}</div>
                    </button>
                  )}
                </div>
              </div>
              
              {!isMultiplayer && (
                 <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-black text-slate-500 tracking-widest block mb-2 uppercase flex items-center gap-2 px-1"><Users size={12}/> プレイヤーリスト</label>
                  <textarea value={playerListText} onChange={(e) => setPlayerListText(e.target.value)} placeholder="名前を改行で入力..." className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm custom-scrollbar resize-none" />
                 </div>
              )}
            </div>

            {/* シングル時のチーム分けカラム */}
            {!isMultiplayer && (
               <div className="space-y-4 flex flex-col min-h-[500px] lg:min-h-0 lg:h-full overflow-hidden">
                <div className="flex items-center justify-between px-1">
                 <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase flex items-center gap-2"><UserPlus size={12}/> {mode === 'team' ? 'チーム分け (ドラッグ可能)' : '参加者確認'}</label>
                 {mode === 'team' && <button onClick={autoAssignTeams} className="text-[8px] font-black px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all uppercase">自動振分</button>}
                </div>
                
                <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-y-auto custom-scrollbar space-y-4" onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                 {mode === 'individual' ? (
                   manualPlayers.length === 0 ? <p className="text-[10px] text-slate-600 font-bold text-center mt-10 uppercase italic">名前を入力してください</p> : manualPlayers.map((p, idx) => (<div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800/50"><div className="flex-1 truncate text-xs font-bold px-1">{p.name}</div></div>))
                 ) : (
                   <div className="space-y-4">
                     {Array.from({ length: teamCount }).map((_, teamIdx) => (
                       <div key={teamIdx} data-team-index={teamIdx} onDragOver={onDragOver} onDrop={(e) => onDrop(e, teamIdx)} className={`p-3 rounded-2xl border transition-all ${touchTargetTeam === teamIdx ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
                         <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">{teamNames[teamIdx] || `チーム${String.fromCharCode(65 + teamIdx)}`}</h4>
                         <div className="min-h-[40px] flex flex-wrap gap-2">
                           {manualPlayers.filter(p => p.teamIndex === teamIdx).length === 0 ? <div className="w-full text-center py-2 text-[8px] text-slate-700 font-bold uppercase italic">No Members</div> : manualPlayers.filter(p => p.teamIndex === teamIdx).map((p) => (
                               <div key={p.name} draggable onDragStart={(e) => onDragStart(e, p)} onTouchStart={(e) => onTouchStart(e, p)} className={`flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-colors shadow-sm ${draggedPlayer?.name === p.name ? 'opacity-50 border-indigo-500' : ''}`}><GripVertical size={10} className="text-slate-600" /><span className="text-[10px] font-bold text-slate-300 pointer-events-none">{p.name}</span></div>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
                </div>
               </div>
            )}

            {/* 右側ルール設定カラム */}
            <div className={`space-y-6 flex flex-col min-h-[500px] lg:min-h-0 lg:h-full overflow-hidden ${isMultiplayer ? 'pb-20' : ''}`}>
               <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Percent size={12}/> ルーレット構成</label><button onClick={addFixedItem} className="p-1.5 bg-indigo-600 rounded-lg text-white"><Plus size={14} /></button></div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400">ランダム範囲</span>
                        <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-lg"><input type="number" value={config.rangeProb} onChange={(e) => setConfig({...config, rangeProb: e.target.value})} onBlur={(e) => handleConfigComplete(e, 'rangeProb', 0)} onKeyDown={(e) => handleConfigComplete(e, 'rangeProb', 0)} className="bg-transparent text-[10px] font-black w-6 outline-none text-indigo-400 text-right" /><span className="text-[8px] font-black text-indigo-400">%</span></div>
                      </div>
                      <div className="flex items-center gap-2"><input type="number" value={config.rangeMin} onChange={(e) => setConfig({...config, rangeMin: e.target.value})} onBlur={(e) => handleConfigComplete(e, 'rangeMin', 1)} onKeyDown={(e) => handleConfigComplete(e, 'rangeMin', 1)} className="w-full bg-slate-900 p-2 rounded-xl text-center font-black text-xs border border-slate-800" /><span className="text-slate-700">~</span><input type="number" value={config.rangeMax} onChange={(e) => setConfig({...config, rangeMax: e.target.value})} onBlur={(e) => handleConfigComplete(e, 'rangeMax', 1)} onKeyDown={(e) => handleConfigComplete(e, 'rangeMax', 1)} className="w-full bg-slate-900 p-2 rounded-xl text-center font-black text-xs border border-slate-800" /></div>
                    </div>
                    {config.fixedItems.map(item => (
                      <div key={item.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2">
                        <input type="number" value={item.value} onChange={(e) => updateFixedItemValue(item.id, 'value', e.target.value)} onBlur={(e) => handleFixedItemComplete(e, item.id, 'value', 1)} onKeyDown={(e) => handleFixedItemComplete(e, item.id, 'value', 1)} className="w-16 bg-slate-900 p-2 rounded-xl text-center font-black text-xs border border-slate-800" />
                        <div className="flex-1 flex items-center gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800"><input type="number" value={item.prob} onChange={(e) => updateFixedItemValue(item.id, 'prob', e.target.value)} onBlur={(e) => handleFixedItemComplete(e, item.id, 'prob', 0)} onKeyDown={(e) => handleFixedItemComplete(e, item.id, 'prob', 0)} className="w-full bg-transparent text-[10px] font-black text-right outline-none text-indigo-400" /><span className="text-[8px] text-slate-500">%</span></div>
                        <button onClick={() => removeFixedItem(item.id)} className="p-2 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between"><label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><ShieldAlert size={12}/> 復活設定</label><button onClick={addReviveEvent} className="p-1.5 bg-purple-600 rounded-lg text-white"><Plus size={14}/></button></div>
                    {reviveEvents.map(rev => (
                      <div key={rev.id} className="p-3 bg-slate-950 rounded-2xl border border-purple-900/30 flex items-center gap-2">
                        <input type="number" value={rev.turn} onChange={(e) => updateReviveEventState(rev.id, 'turn', e.target.value)} className="w-14 bg-slate-900 p-2 rounded-xl text-center font-black text-xs border border-slate-800 text-purple-400" />
                        <div className="flex-1 flex gap-1">{['steal', 'copy'].map(t => (<button key={t} onClick={() => updateReviveEventState(rev.id, 'type', t)} className={`flex-1 py-1.5 rounded-lg text-[8px] font-bold ${rev.type === t ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-600'}`}>{t === 'steal' ? '奪う' : 'コピー'}</button>))}</div>
                        <button onClick={() => removeReviveEvent(rev.id)} className="text-slate-600"><Trash2 size={12}/></button>
                      </div>
                    ))}
                  </div>
               </div>
               
               {isMultiplayer ? (
                 <div className="absolute bottom-6 right-6 left-6 lg:left-[51%]">
                   <button onClick={handleCreateRoom} disabled={totalProb !== 100} className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-white ${totalProb === 100 ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>ルーム作成 (次へ)</button>
                 </div>
               ) : (
                 <div className="shrink-0 pt-2">
                   <button onClick={startGameSingle} disabled={totalProb !== 100 || manualPlayers.length < 2} className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95 flex items-center justify-center gap-3 text-white ${totalProb === 100 && manualPlayers.length >= 2 ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}><Play fill="currentColor" size={24} /> BATTLE START</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const combinedRanking = getCombinedRanking();
    const alivePlayers = players.filter(p => p.status === 'alive');
    const hasWinner = alivePlayers.length > 0;
    const isTeamMode = mode === 'team';

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center max-w-[1000px] mx-auto h-screen overflow-hidden">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl flex flex-col gap-6 max-h-full overflow-hidden">
          <div className="text-center relative shrink-0">
            <div className="inline-block p-4 bg-indigo-900/30 rounded-3xl border border-indigo-500/20 mb-3 text-indigo-400">
              <Trophy size={36} className="text-amber-400 animate-bounce" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">RESULT</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">生存競争、決着</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 text-center max-w-lg mx-auto w-full shrink-0">
            <div className="text-[10px] font-black text-indigo-400 tracking-[0.2em] uppercase mb-1">WINNER</div>
            {hasWinner ? (
              <div>
                <div className="text-2xl md:text-3xl font-black text-amber-400 mb-1">
                  {isTeamMode ? `${alivePlayers[0].team}` : `${alivePlayers[0].name}`}
                </div>
                <div className="text-slate-400 text-xs font-bold">
                  第{turn}ターンを耐え抜き、勝利を掴み取った！
                </div>
              </div>
            ) : (
              <div className="text-slate-500 font-bold text-lg">勝者なし (全員脱落)</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
            {/* ランキング */}
            <div className="bg-slate-950 border border-slate-800/60 rounded-3xl p-4 flex flex-col min-h-[250px] md:h-full overflow-hidden">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1 flex items-center gap-2 shrink-0">
                <Trophy size={14} className="text-amber-500"/> 最終順位
              </label>
              <RankingList ranking={combinedRanking} />
            </div>

            {/* コピーツール ＆ ログ */}
            <div className="flex flex-col gap-4 min-h-[350px] md:h-full overflow-hidden">
              <div className="bg-slate-950 border border-slate-800/60 rounded-3xl p-4 flex flex-col justify-center gap-2 shrink-0">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1 shrink-0">結果を出力する</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copyRanking} className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    {isRankingCopied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>} 通常テキスト
                  </button>
                  <button onClick={copyDiscordRanking} className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    {isDiscordCopied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>} Discord形式
                  </button>
                  <button onClick={copyLogs} className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all col-span-2">
                    {isLogsCopied ? <Check size={14} className="text-emerald-400"/> : <History size={14}/>} ターンログをコピー
                  </button>
                </div>
              </div>

              {/* ログビュー */}
              <div className="bg-slate-950 border border-slate-800/60 rounded-3xl p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 shrink-0">ログ一覧</label>
                <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 custom-scrollbar min-h-0">
                  {logs.slice(0, 50).map((log) => (
                    <div key={log.id} className="text-[11px] font-bold text-slate-400 flex items-start gap-2 py-0.5 border-b border-slate-900/40">
                      <span className="text-slate-600 shrink-0">T{log.turn}:</span>
                      <span className="line-clamp-2 text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-2 shrink-0">
            <button onClick={backToHome} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-lg rounded-2xl border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2">
              <RotateCcw size={18} /> ホームに戻る
            </button>
            <button onClick={isMultiplayer ? startMultiplayerGame : startGameSingle} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/10 transition-all flex items-center justify-center gap-2">
              <Play fill="currentColor" size={18} /> もう一度遊ぶ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nextEvent = (() => {
    const nextRevive = reviveEvents.filter(r => r.turn >= turn).sort((a, b) => a.turn - b.turn)[0];
    const nextHeal = Math.ceil(turn / healInterval) * healInterval;
    const list = [];
    if (nextRevive) list.push({ name: `${nextRevive.turn}T:復活`, val: nextRevive.turn });
    if (nextHeal > turn) list.push({ name: `${nextHeal}T:回復`, val: nextHeal });
    if (list.length === 0) return { name: "最終決戦", remaining: "-" };
    const nearest = list.sort((a, b) => a.val - b.val)[0];
    return { name: nearest.name, remaining: nearest.val - turn };
  })();

  const survivorsSorted = players.filter(p => p.status === 'alive').sort((a, b) => b.hp - a.hp);
  const totalSurvivorHp = survivorsSorted.reduce((sum, p) => sum + p.hp, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 flex flex-col md:flex-row gap-6 max-w-[1500px] mx-auto font-sans md:overflow-hidden md:h-screen">
      {renderMinigame()}
      <div className="flex-1 flex flex-col gap-6 md:overflow-hidden md:h-full">
        <div className="bg-slate-900 rounded-3xl p-6 border-b-4 border-indigo-600 flex justify-between items-center shadow-2xl shrink-0">
          <div className="flex items-center gap-5 truncate">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white tabular-nums shrink-0">{turn}</div>
            <div className="truncate">
              <div className="text-indigo-400 font-black text-[11px] tracking-widest uppercase truncate">{title}</div>
              <div className="text-xl font-black italic text-white truncate">{isReviveTurn ? 'SPECIAL EVENT' : isHealTurn ? 'HEALING TIME' : 'BATTLE ROUND'}</div>
            </div>
          </div>
          <div className="text-right px-5 py-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{nextEvent.name}まで</div>
            <div className="text-base font-black text-amber-500 italic">{nextEvent.remaining === "-" ? "CLIMAX" : `${nextEvent.remaining} TURN`}</div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 border border-slate-800 flex flex-col items-center justify-center relative flex-1 shrink-0 overflow-hidden">
          <div className="absolute top-8 right-10 flex flex-col items-end gap-2 z-10">
            {isReviveTurn ? <div className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-black animate-pulse flex items-center gap-2"><Sparkles size={16} /> REVIVE</div> : isHealTurn ? <div className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-black flex items-center gap-2"><Heart size={16} fill="currentColor"/> HEAL</div> : <div className="bg-slate-950 text-red-500 border border-red-900/40 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em]">Battle Phase</div>}
            {(lastResult?.isReverse || lastResult?.isMulti) && <div className="bg-amber-600 text-white px-3 py-1 rounded-lg text-[10px] font-black animate-bounce">SPECIAL EVENT!</div>}
          </div>
          
          <div className="absolute top-8 left-10 flex flex-col gap-2 z-10">
            {isMultiplayer && <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> ONLINE</div>}
            {isHpBalanceEnabled && <div className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Scale size={14}/> BALANCED MODE</div>}
            {isSpecialEventEnabled && numberFormat !== 'default' && <div className="bg-amber-600/20 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2"><RotateCcw size={14}/> {numberFormat.toUpperCase()} MODE</div>}
            {isSpecialEventEnabled && nameLanguage !== 'default' && <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2"><Languages size={14}/> {nameLanguage} MODE</div>}
          </div>

          <div className="text-center w-full px-6 relative z-10 flex flex-col items-center">
            <div className={`text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tighter italic truncate max-w-full ${lastResult?.isReverse || lastResult?.isMulti ? 'text-amber-400' : 'text-white'}`}>{displayResult.player}</div>
            <div className={`text-[5rem] md:text-[8rem] lg:text-[9rem] font-black leading-none transition-all duration-75 tabular-nums break-all ${isSpinning ? 'text-slate-800 scale-95 blur-[2px]' : (lastResult?.type === 'heal' || lastResult?.type === 'revive' ? 'text-emerald-400' : 'text-red-600')}`}>
              {displayResult.amount}
            </div>
          </div>
          
          <div className="mt-10 w-full max-w-[320px] relative z-10">
            {isManualSelectionPhase ? (
              <div className="space-y-4 w-full">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center animate-pulse">対象を選択してください（未選択でスキップ）</div>
                <button onClick={applyManualSelection} className="w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 border-b-[10px] flex items-center justify-center gap-4 bg-indigo-600 border-indigo-900 text-white hover:brightness-110"><Zap size={24} fill="currentColor" /> {selectedPlayerIds.length > 0 ? `APPLY (${selectedPlayerIds.length})` : 'SKIP THIS ROUND'}</button>
              </div>
            ) : (
              <button onClick={spinRoulette} disabled={isSpinning || (isMultiplayer && !isHost)} className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 border-b-[10px] flex items-center justify-center gap-4 ${isSpinning || (isMultiplayer && !isHost) ? 'bg-slate-800 border-slate-950 text-slate-600' : isReviveTurn ? 'bg-purple-600 border-purple-900 text-white' : isHealTurn ? 'bg-emerald-600 border-emerald-900 text-white' : 'bg-red-600 border-red-900 text-white hover:brightness-110'} ${(isMultiplayer && !isHost) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isSpinning ? <RotateCcw className="animate-spin" /> : isMultiplayer && !isHost ? 'WAITING FOR HOST' : 'SPIN'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col overflow-hidden h-[200px] shrink-0">
          <div className="text-slate-500 font-black text-[11px] tracking-[0.3em] uppercase flex items-center gap-2 mb-4"><History size={16}/> ACTIVITY LOGS</div>
          <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${log.type === 'damage' ? 'bg-red-500/5 border-red-500/10' : log.type === 'heal' ? 'bg-emerald-500/5 border-emerald-500/10' : log.type === 'revive' ? 'bg-purple-500/5 border-purple-500/10' : 'bg-slate-950 border-slate-800/60'}`}>
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px] text-slate-500">T{log.turn}</div>
                <span className={`text-sm font-bold truncate flex-1 ${log.type === 'death' ? 'text-red-400' : 'text-slate-200'}`}>{log.message}</span>
                {log.amount && log.type !== 'revive' && <span className={`text-base font-black shrink-0 px-3 py-1 rounded-xl tabular-nums ${log.type === 'damage' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{log.type === 'damage' ? '-' : '+'}{log.amount}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:w-[360px] flex flex-col gap-6 md:overflow-hidden md:h-full">
        <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 flex flex-col h-1/2 min-h-[300px]">
          <div className="text-slate-500 font-black text-[11px] mb-5 uppercase flex items-center justify-between px-2 tracking-[0.2em]"><span className="flex items-center gap-2 text-white"><Users size={16}/> Survivors</span><span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[11px] tabular-nums">{survivorsSorted.length}</span></div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {survivorsSorted.map(p => {
               const isLowHp = p.hp <= initialHP * 0.3;
               const isSelected = selectedPlayerIds.includes(p.id);
               const targetedProb = isHpBalanceEnabled ? Math.round((p.hp / (totalSurvivorHp || 1)) * 100) : Math.round(100 / (survivorsSorted.length || 1));
               const isAnimating = animatingPlayerIds.includes(p.id) || (animatingPlayerIds.includes("SPECIAL") && lastResult?.player !== p.name);
               
               return (
                <div 
                  key={p.id} onClick={() => isManualSelectionPhase && togglePlayerSelection(p.id)}
                  className={`bg-slate-950 p-4 rounded-2xl border flex flex-col gap-2 group relative overflow-hidden transition-all duration-300 ${isManualSelectionPhase ? 'cursor-pointer hover:border-indigo-500' : ''} ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 bg-indigo-500/5' : isAnimating ? (animatingType === 'damage' ? 'border-red-500 ring-4 ring-red-500/20 bg-red-500/5' : 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-500/5') : (isLowHp ? 'border-red-900 animate-pulse bg-red-950/10' : 'border-slate-800 hover:border-slate-700')}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isManualSelectionPhase && (<div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700'}`}>{isSelected && <Check size={10} className="text-white" />}</div>)}
                      {isLowHp && <ShieldAlert size={14} className="text-red-500 shrink-0"/>}
                      <span className={`font-bold text-sm truncate italic ${p.teamColor || 'text-slate-200'}`}>{p.team ? `[${p.team}] ` : ''}{p.name}</span>
                    </div>
                    <span className={`text-lg font-black tabular-nums ${isLowHp ? 'text-red-500' : 'text-emerald-400'}`}>{p.hp}</span>
                  </div>
                  {isHpBalanceEnabled && (
                    <div className="flex items-center gap-2"><div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${targetedProb > 25 ? 'bg-amber-500' : 'bg-slate-700'}`} style={{ width: `${targetedProb}%` }} /></div><span className="text-[9px] font-black text-slate-500 tabular-nums">狙われやすさ: {targetedProb}%</span></div>
                  )}
                  {isAnimating && (
                    <div className={`absolute inset-0 flex items-center justify-center font-black text-2xl animate-out fade-out slide-out-to-top-8 duration-1000 ${animatingType === 'damage' ? 'text-red-500' : 'text-emerald-400'}`}>
                      {animatingType === 'damage' ? `-${lastResult?.amount}` : `+${lastResult?.amount}`}
                    </div>
                  )}
                </div>
               );
            })}
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 flex flex-col h-1/2 min-h-[300px] overflow-hidden">
          <div className="text-slate-500 font-black text-[11px] uppercase flex items-center gap-2 mb-4 tracking-[0.2em] px-2"><Trophy size={16} className="text-amber-500"/> Ranking</div>
          <RankingList ranking={getCombinedRanking()} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        [draggable="true"] { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
      `}} />
    </div>
  );
};

export default App;
