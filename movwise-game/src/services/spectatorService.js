import { io } from 'socket.io-client';
import { useSpectatorStore } from '@/stores/spectatorStore';

class SpectatorService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // 接続を初期化
  connect(serverUrl = 'http://localhost:3002') {
    if (this.socket && this.socket.connected) {
      console.log('Already connected to spectator server');
      return Promise.resolve();
    }

    const spectatorStore = useSpectatorStore();

    console.log('Attempting to connect to:', serverUrl);
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.setupEventListeners();
    
    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('Connected to spectator server');
        spectatorStore.setConnectionStatus(true);
        spectatorStore.clearError();
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        console.error('Error type:', error.type);
        console.error('Error details:', error);
        spectatorStore.setConnectionStatus(false);
        
        let errorMessage = 'サーバーへの接続に失敗しました';
        if (error.type === 'TransportError') {
          errorMessage = 'WebSocketサーバーに接続できません。サーバーが起動していることを確認してください。';
        }
        
        spectatorStore.setError(errorMessage);
        reject(error);
      });
    });
  }

  // イベントリスナーの設定
  setupEventListeners() {
    const spectatorStore = useSpectatorStore();

    // 接続・切断イベント
    this.socket.on('disconnect', () => {
      console.log('Disconnected from spectator server');
      spectatorStore.setConnectionStatus(false);
      spectatorStore.setError('サーバーとの接続が切断されました');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      spectatorStore.setConnectionStatus(true);
      spectatorStore.clearError();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      spectatorStore.setError('再接続に失敗しました');
    });

    // ルーム作成・参加イベント
    this.socket.on('spectator:room-created', (data) => {
      console.log('Room created:', data);
      spectatorStore.setRoomInfo(data.roomCode, data.roomCode);
      spectatorStore.updateParticipants(data.participants);
    });

    this.socket.on('spectator:room-exists', (data) => {
      console.log('Room already exists:', data);
      spectatorStore.setRoomInfo(data.roomCode, data.roomCode);
      spectatorStore.updateParticipants(data.participants);
    });

    this.socket.on('spectator:joined-room', (data) => {
      console.log('Joined room:', data);
      spectatorStore.setRoomInfo(data.roomCode, data.roomCode);
      spectatorStore.setMyInfo({ id: data.studentId });
      spectatorStore.updateParticipants(data.participants);
    });

    // 参加者の更新
    this.socket.on('spectator:student-joined', (data) => {
      console.log('Student joined:', data);
      spectatorStore.addStudent(data.student);
    });

    this.socket.on('spectator:student-left', (data) => {
      console.log('Student left:', data);
      spectatorStore.removeStudent(data.studentId);
    });

    this.socket.on('spectator:student-disconnected', (data) => {
      console.log('Student disconnected:', data);
      spectatorStore.updateStudentConnection(data.studentId, false);
    });

    this.socket.on('spectator:teacher-disconnected', (data) => {
      console.log('Teacher disconnected:', data);
      spectatorStore.setError(data.message);
    });

    // ゲーム状態の更新
    this.socket.on('spectator:game-state-updated', (data) => {
      console.log('Game state updated for student:', data.studentId);
      spectatorStore.updateGameState(data.studentId, data.gameState);
    });

    this.socket.on('spectator:student-action', (data) => {
      console.log('Student action:', data);
      // UIでアクションを表示するための処理
      this.handleStudentAction(data);
    });

    // 生徒選択の応答
    this.socket.on('spectator:student-selected', (data) => {
      console.log('Student selected:', data);
      if (data.gameState) {
        spectatorStore.updateGameState(data.studentId, data.gameState);
      }
    });

    // ルーム終了
    this.socket.on('spectator:room-closed', (data) => {
      console.log('Room closed:', data);
      spectatorStore.setError(data.message);
      spectatorStore.reset();
    });

    // エラーハンドリング
    this.socket.on('spectator:error', (data) => {
      console.error('Spectator error:', data);
      spectatorStore.setError(data.message);
    });
  }

  // 講師としてルームを作成
  createRoom(teacherId, teacherName) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('サーバーに接続されていません'));
        return;
      }

      const spectatorStore = useSpectatorStore();
      spectatorStore.setRole('teacher');
      spectatorStore.setMyInfo({ id: teacherId, name: teacherName });

      this.socket.emit('spectator:create-room', { teacherId, teacherName });

      // タイムアウト設定
      const timeout = setTimeout(() => {
        reject(new Error('ルーム作成がタイムアウトしました'));
      }, 10000);

      // 成功時のリスナー
      const successHandler = (data) => {
        clearTimeout(timeout);
        this.socket.off('spectator:room-created', successHandler);
        this.socket.off('spectator:room-exists', successHandler);
        resolve(data);
      };

      this.socket.once('spectator:room-created', successHandler);
      this.socket.once('spectator:room-exists', successHandler);
    });
  }

  // 生徒としてルームに参加
  joinRoom(roomCode, studentId, studentName) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('サーバーに接続されていません'));
        return;
      }

      const spectatorStore = useSpectatorStore();
      spectatorStore.setRole('student');
      spectatorStore.setMyInfo({ id: studentId, name: studentName });

      this.socket.emit('spectator:join-room', { roomCode, studentId, studentName });

      // タイムアウト設定
      const timeout = setTimeout(() => {
        reject(new Error('ルーム参加がタイムアウトしました'));
      }, 10000);

      // 成功時のリスナー
      this.socket.once('spectator:joined-room', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      // エラー時のリスナー
      this.socket.once('spectator:error', (error) => {
        clearTimeout(timeout);
        reject(new Error(error.message));
      });
    });
  }

  // ゲーム状態を同期
  syncGameState(roomCode, studentId, gameState) {
    if (!this.socket || !this.socket.connected) {
      console.error('Not connected to server');
      return;
    }

    // データサイズを最小化
    const optimizedGameState = this.optimizeGameState(gameState);

    this.socket.emit('spectator:sync-game-state', {
      roomCode,
      studentId,
      gameState: optimizedGameState
    });
  }

  // ゲームアクションを送信
  sendGameAction(roomCode, studentId, action) {
    if (!this.socket || !this.socket.connected) {
      console.error('Not connected to server');
      return;
    }

    // デバウンス処理（過度な送信を防ぐ）
    if (this.actionDebounceTimer) {
      clearTimeout(this.actionDebounceTimer);
    }

    this.actionDebounceTimer = setTimeout(() => {
      this.socket.emit('spectator:game-action', {
        roomCode,
        studentId,
        action
      });
    }, 50); // 50msのデバウンス
  }

  // 生徒を選択（講師用）
  selectStudent(roomCode, studentId) {
    if (!this.socket || !this.socket.connected) {
      console.error('Not connected to server');
      return;
    }

    const spectatorStore = useSpectatorStore();
    spectatorStore.selectStudent(studentId);

    this.socket.emit('spectator:select-student', {
      roomCode,
      studentId
    });
  }

  // ルームから退出
  leaveRoom() {
    if (!this.socket || !this.socket.connected) {
      console.error('Not connected to server');
      return;
    }

    const spectatorStore = useSpectatorStore();
    const roomCode = spectatorStore.roomCode;

    this.socket.emit('spectator:leave-room', { roomCode });
    spectatorStore.reset();
  }

  // 接続を切断
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const spectatorStore = useSpectatorStore();
    spectatorStore.reset();
  }

  // ゲーム状態の最適化（データサイズ削減）
  optimizeGameState(gameState) {
    return {
      currentGame: gameState.currentGame,
      gameData: {
        score: gameState.gameData?.score || 0,
        level: gameState.gameData?.level || 1,
        progress: gameState.gameData?.progress || 0,
        currentQuestion: gameState.gameData?.currentQuestion || null,
        selectedAnswer: gameState.gameData?.selectedAnswer || null,
        isCorrect: gameState.gameData?.isCorrect || null,
        timeRemaining: gameState.gameData?.timeRemaining || null,
        // 必要な最小限のデータのみを含める
        ...this.extractEssentialGameData(gameState.gameData)
      }
    };
  }

  // ゲームごとの必要最小限データを抽出
  extractEssentialGameData(gameData) {
    if (!gameData) return {};

    const essentialData = {};

    // ゲーム固有の重要なデータのみを抽出
    if (gameData.currentPhoneme) {
      essentialData.currentPhoneme = gameData.currentPhoneme;
    }
    if (gameData.targetWord) {
      essentialData.targetWord = gameData.targetWord;
    }
    if (gameData.options) {
      essentialData.options = gameData.options;
    }
    if (gameData.userInput) {
      essentialData.userInput = gameData.userInput;
    }

    return essentialData;
  }

  // 生徒のアクションをハンドリング
  handleStudentAction(data) {
    // 必要に応じてUIでアクションを可視化
    const { studentId, action, timestamp } = data;
    
    // カスタムイベントを発行してUIコンポーネントに通知
    window.dispatchEvent(new CustomEvent('spectator:action', {
      detail: { studentId, action, timestamp }
    }));
  }

  // 再接続を試みる
  attemptReconnect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  // 接続状態を確認
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// シングルトンインスタンスをエクスポート
export const spectatorService = new SpectatorService();