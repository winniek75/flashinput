import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useSpectatorStore } from '@/stores/spectatorStore';
import { spectatorService } from '@/services/spectatorService';

/**
 * 観戦モード統合用コンポーザブル
 * ゲームコンポーネントに観戦モード機能を追加
 */
export function useSpectatorMode(gameName) {
  const spectatorStore = useSpectatorStore();

  // 観戦モードの状態
  const isSpectatorMode = computed(() => spectatorStore.isSpectatorMode);
  const isStudent = computed(() => spectatorStore.isStudent);
  const isTeacher = computed(() => spectatorStore.isTeacher);
  const roomCode = computed(() => spectatorStore.roomCode);
  const studentId = computed(() => spectatorStore.myInfo.id);

  // ゲーム操作を無効化するかどうか
  const isInteractionDisabled = computed(() => {
    return isSpectatorMode.value && isTeacher.value;
  });

  // ゲーム状態を同期
  function syncGameState(gameData) {
    if (!isSpectatorMode.value || !isStudent.value) return;

    const gameState = {
      currentGame: gameName,
      gameData: gameData
    };

    spectatorService.syncGameState(roomCode.value, studentId.value, gameState);
  }

  // ゲームアクションを送信
  function sendGameAction(actionType, actionData = {}) {
    if (!isSpectatorMode.value || !isStudent.value) return;

    const action = {
      type: actionType,
      data: actionData,
      timestamp: Date.now()
    };

    spectatorService.sendGameAction(roomCode.value, studentId.value, action);
  }

  // ゲーム開始を通知
  function notifyGameStart() {
    syncGameState({
      status: 'started',
      startTime: Date.now()
    });
    sendGameAction('game-start');
  }

  // ゲーム終了を通知
  function notifyGameEnd(result) {
    syncGameState({
      status: 'ended',
      endTime: Date.now(),
      result: result
    });
    sendGameAction('game-end', result);
  }

  // 問題変更を通知
  function notifyQuestionChange(questionData) {
    syncGameState({
      currentQuestion: questionData
    });
    sendGameAction('question-change', questionData);
  }

  // 回答を通知
  function notifyAnswer(answerData) {
    syncGameState({
      lastAnswer: answerData
    });
    sendGameAction('answer', answerData);
  }

  // スコア更新を通知
  function notifyScoreUpdate(score) {
    syncGameState({
      score: score
    });
    sendGameAction('score-update', { score });
  }

  // レベル変更を通知
  function notifyLevelChange(level) {
    syncGameState({
      level: level
    });
    sendGameAction('level-change', { level });
  }

  // 進捗更新を通知
  function notifyProgressUpdate(progress) {
    syncGameState({
      progress: progress
    });
    sendGameAction('progress-update', { progress });
  }

  // クリック位置を通知（画面共有用）
  function notifyClick(x, y) {
    sendGameAction('click', { x, y });
  }

  // 選択を通知
  function notifySelection(itemId, itemData = {}) {
    sendGameAction('select', { 
      itemId, 
      itemData,
      timestamp: Date.now()
    });
  }

  // タイマー更新を通知
  function notifyTimerUpdate(timeRemaining) {
    syncGameState({
      timeRemaining: timeRemaining
    });
  }

  // カスタムアクションを送信
  function sendCustomAction(actionName, data = {}) {
    sendGameAction(actionName, data);
  }

  // デバウンスされた状態同期
  let syncDebounceTimer = null;
  function debouncedSyncGameState(gameData) {
    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer);
    }
    syncDebounceTimer = setTimeout(() => {
      syncGameState(gameData);
    }, 100); // 100msのデバウンス
  }

  // コンポーネントマウント時
  onMounted(() => {
    if (isSpectatorMode.value && isStudent.value) {
      // 初期状態を同期
      syncGameState({
        status: 'ready',
        gameName: gameName
      });
    }
  });

  // コンポーネントアンマウント時
  onUnmounted(() => {
    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer);
    }
  });

  // ヘルパー関数：クリックハンドラーをラップ
  function wrapClickHandler(originalHandler) {
    return function(event) {
      // 講師モードでは操作を無効化
      if (isInteractionDisabled.value) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // 生徒モードではクリック位置を送信
      if (isStudent.value && event.clientX !== undefined) {
        notifyClick(event.clientX, event.clientY);
      }

      // 元のハンドラーを実行
      if (originalHandler) {
        originalHandler(event);
      }
    };
  }

  // ヘルパー関数：選択ハンドラーをラップ
  function wrapSelectionHandler(originalHandler, itemId) {
    return function(...args) {
      // 講師モードでは操作を無効化
      if (isInteractionDisabled.value) {
        return;
      }

      // 生徒モードでは選択を送信
      if (isStudent.value) {
        notifySelection(itemId);
      }

      // 元のハンドラーを実行
      if (originalHandler) {
        return originalHandler(...args);
      }
    };
  }

  return {
    // 状態
    isSpectatorMode,
    isStudent,
    isTeacher,
    isInteractionDisabled,
    roomCode,

    // 基本的な通知メソッド
    syncGameState,
    sendGameAction,
    notifyGameStart,
    notifyGameEnd,
    notifyQuestionChange,
    notifyAnswer,
    notifyScoreUpdate,
    notifyLevelChange,
    notifyProgressUpdate,
    notifyClick,
    notifySelection,
    notifyTimerUpdate,
    sendCustomAction,

    // デバウンスされたメソッド
    debouncedSyncGameState,

    // ヘルパー関数
    wrapClickHandler,
    wrapSelectionHandler
  };
}