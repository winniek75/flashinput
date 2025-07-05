/**
 * Spectator Mode Socket Handler
 * 講師が生徒のゲーム画面をリアルタイムで観戦できる機能
 */

const spectatorRooms = new Map();
const userToRoom = new Map();

class SpectatorRoom {
  constructor(teacherId, teacherSocketId) {
    this.roomCode = this.generateRoomCode();
    this.teacherId = teacherId;
    this.teacherSocketId = teacherSocketId;
    this.students = new Map();
    this.gameStates = new Map();
    this.createdAt = new Date();
    this.maxStudents = 10;
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  addStudent(studentId, studentName, socketId) {
    if (this.students.size >= this.maxStudents) {
      throw new Error('ルームが満員です（最大10名）');
    }

    this.students.set(studentId, {
      id: studentId,
      name: studentName,
      socketId: socketId,
      joinedAt: new Date(),
      connected: true
    });

    this.gameStates.set(studentId, {
      currentGame: null,
      gameData: {},
      lastUpdate: new Date()
    });

    return true;
  }

  removeStudent(studentId) {
    this.students.delete(studentId);
    this.gameStates.delete(studentId);
  }

  updateStudentConnection(studentId, connected) {
    const student = this.students.get(studentId);
    if (student) {
      student.connected = connected;
    }
  }

  updateGameState(studentId, gameState) {
    const state = this.gameStates.get(studentId);
    if (state) {
      state.currentGame = gameState.currentGame;
      state.gameData = gameState.gameData;
      state.lastUpdate = new Date();
    }
  }

  getParticipants() {
    return {
      teacher: {
        id: this.teacherId,
        socketId: this.teacherSocketId
      },
      students: Array.from(this.students.values())
    };
  }

  getStudentGameState(studentId) {
    return this.gameStates.get(studentId);
  }

  getAllGameStates() {
    const states = {};
    for (const [studentId, state] of this.gameStates) {
      states[studentId] = state;
    }
    return states;
  }
}

function setupSpectatorSocket(io) {
  console.log('🔧 Setting up spectator socket handlers');
  
  io.on('connection', (socket) => {
    console.log(`👁️ Spectator mode connection: ${socket.id}`);
    console.log(`   Client address: ${socket.handshake.address}`);
    console.log(`   Headers:`, socket.handshake.headers.origin);

    // 講師がルームを作成
    socket.on('spectator:create-room', (data) => {
      try {
        console.log('📝 Create room request:', data);
        const { teacherId, teacherName } = data;
        
        // 既存のルームがあるか確認
        const existingRoom = Array.from(spectatorRooms.values())
          .find(room => room.teacherId === teacherId);
        
        if (existingRoom) {
          socket.emit('spectator:room-exists', {
            roomCode: existingRoom.roomCode,
            participants: existingRoom.getParticipants()
          });
          return;
        }

        // 新しいルームを作成
        const room = new SpectatorRoom(teacherId, socket.id);
        spectatorRooms.set(room.roomCode, room);
        userToRoom.set(socket.id, room.roomCode);

        // Socket.ioルームに参加
        socket.join(`spectator-${room.roomCode}`);

        console.log(`👨‍🏫 Spectator room created: ${room.roomCode}`);

        socket.emit('spectator:room-created', {
          roomCode: room.roomCode,
          participants: room.getParticipants()
        });

      } catch (error) {
        console.error('❌ Error creating spectator room:', error);
        socket.emit('spectator:error', {
          message: 'ルームの作成に失敗しました',
          error: error.message
        });
      }
    });

    // 生徒がルームに参加
    socket.on('spectator:join-room', (data) => {
      try {
        console.log('🎓 Join room request:', data);
        const { roomCode, studentId, studentName } = data;
        
        const room = spectatorRooms.get(roomCode);
        if (!room) {
          console.log('❌ Room not found:', roomCode);
          console.log('   Available rooms:', Array.from(spectatorRooms.keys()));
          throw new Error(`ルームが見つかりません: ${roomCode}`);
        }

        // 生徒を追加
        room.addStudent(studentId, studentName, socket.id);
        userToRoom.set(socket.id, roomCode);

        // Socket.ioルームに参加
        socket.join(`spectator-${roomCode}`);

        console.log(`🎓 Student joined spectator room: ${studentName} -> ${roomCode}`);

        // 生徒に参加成功を通知
        socket.emit('spectator:joined-room', {
          roomCode: roomCode,
          studentId: studentId,
          participants: room.getParticipants()
        });

        // 講師と他の参加者に通知
        socket.to(`spectator-${roomCode}`).emit('spectator:student-joined', {
          student: {
            id: studentId,
            name: studentName,
            joinedAt: new Date()
          }
        });

      } catch (error) {
        console.error('❌ Error joining spectator room:', error);
        socket.emit('spectator:error', {
          message: 'ルームへの参加に失敗しました',
          error: error.message
        });
      }
    });

    // ゲーム状態の同期
    socket.on('spectator:sync-game-state', (data) => {
      try {
        const { roomCode, studentId, gameState } = data;
        
        const room = spectatorRooms.get(roomCode);
        if (!room) {
          throw new Error('ルームが見つかりません');
        }

        // ゲーム状態を更新
        room.updateGameState(studentId, gameState);

        // 講師にのみ送信（生徒間では共有しない）
        io.to(room.teacherSocketId).emit('spectator:game-state-updated', {
          studentId: studentId,
          gameState: gameState,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('❌ Error syncing game state:', error);
      }
    });

    // リアルタイムアクション（クリック、選択など）
    socket.on('spectator:game-action', (data) => {
      try {
        const { roomCode, studentId, action } = data;
        
        const room = spectatorRooms.get(roomCode);
        if (!room) return;

        // 講師にアクションを送信
        io.to(room.teacherSocketId).emit('spectator:student-action', {
          studentId: studentId,
          action: action,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('❌ Error forwarding game action:', error);
      }
    });

    // 講師が特定の生徒の画面を選択
    socket.on('spectator:select-student', (data) => {
      try {
        const { roomCode, studentId } = data;
        
        const room = spectatorRooms.get(roomCode);
        if (!room) return;

        const gameState = room.getStudentGameState(studentId);
        
        socket.emit('spectator:student-selected', {
          studentId: studentId,
          gameState: gameState
        });

      } catch (error) {
        console.error('❌ Error selecting student:', error);
      }
    });

    // ルームから退出
    socket.on('spectator:leave-room', (data) => {
      try {
        const roomCode = userToRoom.get(socket.id);
        if (!roomCode) return;

        const room = spectatorRooms.get(roomCode);
        if (!room) return;

        // 講師が退出した場合
        if (room.teacherSocketId === socket.id) {
          // 全生徒に通知
          socket.to(`spectator-${roomCode}`).emit('spectator:room-closed', {
            message: '講師がルームを終了しました'
          });
          
          // ルームを削除
          spectatorRooms.delete(roomCode);
          console.log(`🚪 Spectator room closed: ${roomCode}`);
        } else {
          // 生徒が退出した場合
          const student = Array.from(room.students.values())
            .find(s => s.socketId === socket.id);
          
          if (student) {
            room.removeStudent(student.id);
            
            // 他の参加者に通知
            socket.to(`spectator-${roomCode}`).emit('spectator:student-left', {
              studentId: student.id,
              studentName: student.name
            });
            
            console.log(`🚪 Student left spectator room: ${student.name}`);
          }
        }

        socket.leave(`spectator-${roomCode}`);
        userToRoom.delete(socket.id);

      } catch (error) {
        console.error('❌ Error leaving room:', error);
      }
    });

    // 接続切断時の処理
    socket.on('disconnect', () => {
      const roomCode = userToRoom.get(socket.id);
      if (!roomCode) return;

      const room = spectatorRooms.get(roomCode);
      if (!room) return;

      // 講師が切断した場合
      if (room.teacherSocketId === socket.id) {
        socket.to(`spectator-${roomCode}`).emit('spectator:teacher-disconnected', {
          message: '講師が切断されました'
        });
      } else {
        // 生徒が切断した場合
        const student = Array.from(room.students.values())
          .find(s => s.socketId === socket.id);
        
        if (student) {
          room.updateStudentConnection(student.id, false);
          
          socket.to(`spectator-${roomCode}`).emit('spectator:student-disconnected', {
            studentId: student.id,
            studentName: student.name
          });
        }
      }

      userToRoom.delete(socket.id);
    });
  });

  // 定期的なクリーンアップ（24時間以上古いルーム）
  setInterval(() => {
    const now = new Date();
    const expiredRooms = [];

    for (const [roomCode, room] of spectatorRooms) {
      const age = now - room.createdAt;
      if (age > 24 * 60 * 60 * 1000) {
        expiredRooms.push(roomCode);
      }
    }

    expiredRooms.forEach(roomCode => {
      spectatorRooms.delete(roomCode);
      console.log(`🧹 Cleaned up expired spectator room: ${roomCode}`);
    });

  }, 60 * 60 * 1000); // 1時間ごと
}

export { setupSpectatorSocket };