# マルチプレイイベント不具合分析と修正案

## 不具合1: ルームID入室ができない

### 原因
`handleJoinRoomStep1`関数でFirebaseドキュメント取得時のエラーハンドリングが不十分

### 現在のコード（問題あり）
```javascript
const handleJoinRoomStep1 = async () => {
    if (!joinRoomIdInput.trim()) return;
    if (!db) {
       setJoinError('通信環境を確認してください（接続エラー）');
       return;
    }
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', joinRoomIdInput.toUpperCase());
      const snap = await getDoc(roomRef);
      if (snap.exists() && snap.data().status === 'joining') {
        setCurrentRoomId(joinRoomIdInput.toUpperCase());
        syncSettingsFromRoom(snap.data().settings);
        setJoinError('');
        setPhase('multi_name');
      } else {
        setJoinError('無効なルームIDか、すでに開始されています。');
      }
    } catch (e) {
      setJoinError('ルーム情報の取得に失敗しました。');
    }
  };
```

### 修正案
```javascript
const handleJoinRoomStep1 = async () => {
    if (!joinRoomIdInput.trim()) return;
    if (!db) {
       setJoinError('通信環境を確認してください（接続エラー）');
       return;
    }
    setJoinError(''); // 前回のエラーをクリア
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', joinRoomIdInput.toUpperCase());
      const snap = await getDoc(roomRef);
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
```

---

## 不具合2: ロシアンルーレット「引き金を押す」が反応しない

### 原因
1. `currentTargetId`の計算ロジックが複雑で、条件判定が正しく動作していない
2. マルチプレイで対象プレイヤーが正確に計算されていない
3. ゲーム状態の同期タイミングの問題

### 修正案
```javascript
const pullTrigger = async () => {
     if (!activeMinigame) return;
     
     // アクティブなプレイヤーを取得
     const alivePlayers = players.filter(p => p.status === 'alive');
     if (alivePlayers.length === 0) return;
     
     // 現在のターゲットを正確に計算
     const targetList = activeMinigame.targetIds && activeMinigame.targetIds[0] !== "SPECIAL" 
         ? activeMinigame.targetIds 
         : alivePlayers.map(p => p.id);
     
     const currentTargetId = targetList[activeMinigame.currentPlayerIndex % targetList.length];
     const myPlayerId = players.find(p => p.uid === user?.uid)?.id;
     
     // 権限チェック: ホストか現在のターゲットプレイヤーのみ操作可
     const isMyTurn = currentTargetId === myPlayerId;
     if (!isHost && !isMyTurn) {
        console.log('Not your turn or not host');
        return;
     }

     const newIndex = activeMinigame.currentIndex + 1;
     const isBullet = (activeMinigame.currentIndex % 6) === activeMinigame.bulletIndex;
     
     if (isBullet) {
        // 銃弾命中：ゲーム終了
        let newResults = { ...activeMinigame.results, [currentTargetId]: 'fail' };
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
        const targetLen = targetList.length;
        const nextPlayerIdx = (activeMinigame.currentPlayerIndex + 1) % targetLen;
        
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
```

---

## 不具合3: クイズイベントで2回目以降「FAILED...」が邪魔して操作できない

### 原因
クイズ完了後に`minigameLocalState`が正しくリセットされていない。`gameId`が更新されても、前のゲームの`status: 'done'`が残っている。

### 修正案
```javascript
// activeMinigameが変わったときに状態をリセット
useEffect(() => {
   if (activeMinigame && activeMinigame.status === 'playing') {
      if (minigameLocalState.gameId !== activeMinigame.id) {
         let initState = { gameId: activeMinigame.id, initialized: true, status: 'playing' }; // statusも初期化
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
            const wires = Math.floor(Math.random() * 10) + 1;
            const correctWire = Math.floor(Math.random() * wires);
            initState = { ...initState, wires, correctWire, selected: null, status: 'playing' };
         }
         setMinigameLocalState(initState); // statusを含めて完全リセット
      }
   } else if (activeMinigame && activeMinigame.status === 'ended') {
      // ゲーム終了時は何もしない（applyMinigameResultsを待つ）
   } else {
      // ゲーム終了：状態クリア
      setMinigameLocalState({});
   }
}, [activeMinigame?.id, activeMinigame?.status]); // 依存関係を修正
```

また、解答フォーム部分でも確認：
```javascript
const submitQuizAnswer = (e) => {
   e.preventDefault();
   // statusが'done'でないことを確認
   if (!activeMinigame || minigameLocalState.status === 'done') return;
   if (!minigameLocalState.questions || minigameLocalState.questions.length === 0) return;
   
   const currentQ = minigameLocalState.questions[minigameLocalState.currentIndex];
   const userAnswer = minigameLocalState.input.trim();
   const isCorrect = userAnswer === currentQ.a;
   
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
```

---

## 不具合4: 時限爆弾解除イベントの導線が表示されない

### 原因
`minigameLocalState?.wires`が初期化されていない、またはレンダリング時に条件判定が厳しすぎる

### 修正案
```javascript
// timeBombの初期化をより明確に
useEffect(() => {
   if (activeMinigame && activeMinigame.status === 'playing') {
      if (minigameLocalState.gameId !== activeMinigame.id) {
         if (activeMinigame.type === 'timeBomb') {
            const wires = Math.floor(Math.random() * 10) + 1; // 1～10本
            const correctWire = Math.floor(Math.random() * wires); // 0～wires-1
            const initState = { 
               gameId: activeMinigame.id, 
               initialized: true, 
               wires: wires, 
               correctWire: correctWire, 
               selected: null,
               status: 'playing',
               timeLeft: 60
            };
            setMinigameLocalState(initState);
            console.log(`TimeBomb initialized: wires=${wires}, correct=${correctWire}`); // デバッグ用
         }
         // 他のイベントの初期化...
      }
   }
}, [activeMinigame?.id, activeMinigame?.status]);

// レンダリング部分を修正
{activeMinigame.type === 'timeBomb' && minigameLocalState?.initialized && (
   <div className="space-y-6">
      {minigameLocalState.status === 'done' ? (
         <div className={`py-12 text-4xl font-black italic tracking-tighter ${minigameLocalState.result === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
            {minigameLocalState.result === 'success' ? 'DEFUSED!' : 'BOOOOM!!!'}
         </div>
      ) : minigameLocalState.wires ? (
         <>
            <div className="text-xs font-black text-amber-500 tracking-widest bg-amber-500/10 inline-block px-4 py-2 rounded-full border border-amber-500/20 mb-2">どれか1本だけが正解の導線だ...</div>
            <div className="flex flex-wrap justify-center gap-3 py-6 bg-slate-950 rounded-3xl border border-slate-800 px-4">
               {Array.from({ length: minigameLocalState.wires }).map((_, idx) => (
                  <button 
                     key={idx} 
                     onClick={() => cutWire(idx)} 
                     disabled={minigameLocalState.status === 'done'}
                     className="w-14 h-32 bg-slate-800 hover:bg-slate-700 disabled:hover:bg-slate-800 rounded-xl relative overflow-hidden group transition-all hover:-translate-y-2 shadow-lg disabled:opacity-50"
                  >
                     <div className="absolute inset-x-3 top-0 bottom-0 bg-red-500 group-hover:bg-red-400 mx-auto w-2.5 rounded-full shadow-[0_0_15px_red] transition-all"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-xl z-10 group-hover:text-white group-hover:border-slate-500">切る</div>
                  </button>
               ))}
            </div>
         </>
      ) : (
         <div className="py-12 text-red-500 font-black">初期化エラー</div>
      )}
   </div>
)}
```

### cutWire関数の修正
```javascript
const cutWire = async (idx) => {
   if (!activeMinigame || minigameLocalState?.status === 'done') return;
   
   const isCorrect = idx === minigameLocalState.correctWire;
   const result = isCorrect ? 'success' : 'fail';
   
   setMinigameLocalState(prev => ({ 
      ...prev, 
      status: 'done', 
      result: result, 
      selected: idx 
   }));
   
   // マルチプレイの場合は結果を報告
   reportMinigameResult(user?.uid || 'local', result);
};
```

---

## 全体的な改善点

### 1. コンソールログの追加（デバッグ用）
各不具合の箇所に`console.log`でデバッグ情報を出力するようにしてください。

### 2. タイムアウト処理の強化
```javascript
// minigameタイムアウト時に強制的に全員をfailに
useEffect(() => {
   if (activeMinigame && activeMinigame.status === 'playing') {
      const timeLimit = 60000; // 1分
      if (['timeBomb', 'kanjiQuiz', 'mathQuiz', 'englishQuiz'].includes(activeMinigame.type)) {
         const timer = setTimeout(() => {
            if (isHost) handleMinigameEnd('timeout');
         }, timeLimit);
         return () => clearTimeout(timer);
      }
   }
}, [activeMinigame?.type, activeMinigame?.status, isHost]);
```

### 3. ロシアンルーレット結果の自動終了
```javascript
// すべてのターゲットが結果を出したら自動終了
useEffect(() => {
   if (isHost && activeMinigame && activeMinigame.status === 'playing' && activeMinigame.type === 'russianRoulette') {
      const targetList = activeMinigame.targetIds && activeMinigame.targetIds[0] !== "SPECIAL" 
         ? activeMinigame.targetIds 
         : players.filter(p => p.status === 'alive').map(p => p.id);
      
      // 全ターゲットが終了するか、6回全部回ったかで自動終了
      if (activeMinigame.currentIndex >= 6) {
         handleMinigameEnd('rounds_complete');
      }
   }
}, [activeMinigame?.currentIndex, activeMinigame?.type, isHost, players]);
```

---

## テスト手順

1. **ルームID入室テスト**
   - ホストが「ルーム作成」でルームIDを取得
   - 別のクライアントで正確なIDを入力して入室

2. **ロシアンルーレットテスト**
   - イベント発動後、各プレイヤーが順番に「引き金を引く」
   - コンソールで現在のターゲットと権限を確認

3. **クイズテスト**
   - 1回目のクイズで全問正解または失敗
   - 2回目のクイズが正常に表示されるか確認
   - 「FAILED...」が表示されずに次問題へ進むか

4. **時限爆弾テスト**
   - イベント発動後、導線が正常に表示されるか
   - 導線をクリックして反応するか
   - 時間内に完了できるか

