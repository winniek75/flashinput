import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSpectatorStore = defineStore('spectator', () => {
  // 状態
  const isConnected = ref(false);
  const role = ref(null); // 'teacher' | 'student' | null
  const roomCode = ref('');
  const roomId = ref('');
  const participants = ref({
    teacher: null,
    students: []
  });
  const selectedStudentId = ref(null);
  const gameStates = ref(new Map());
  const connectionError = ref(null);
  const isSpectatorMode = ref(false);

  // 自分の情報
  const myInfo = ref({
    id: null,
    name: '',
    socketId: null
  });

  // ゲッター
  const isTeacher = computed(() => role.value === 'teacher');
  const isStudent = computed(() => role.value === 'student');
  const studentCount = computed(() => participants.value.students.length);
  const selectedStudent = computed(() => {
    return participants.value.students.find(s => s.id === selectedStudentId.value);
  });
  const selectedStudentGameState = computed(() => {
    return gameStates.value.get(selectedStudentId.value);
  });

  // アクション
  function setConnectionStatus(status) {
    isConnected.value = status;
    if (!status) {
      connectionError.value = '接続が切断されました';
    } else {
      connectionError.value = null;
    }
  }

  function setRole(newRole) {
    role.value = newRole;
    isSpectatorMode.value = true;
  }

  function setRoomInfo(code, id) {
    roomCode.value = code;
    roomId.value = id;
  }

  function setMyInfo(info) {
    myInfo.value = {
      id: info.id || myInfo.value.id,
      name: info.name || myInfo.value.name,
      socketId: info.socketId || myInfo.value.socketId
    };
  }

  function updateParticipants(newParticipants) {
    participants.value = newParticipants;
  }

  function addStudent(student) {
    if (!participants.value.students.find(s => s.id === student.id)) {
      participants.value.students.push(student);
    }
  }

  function removeStudent(studentId) {
    participants.value.students = participants.value.students.filter(
      s => s.id !== studentId
    );
    if (selectedStudentId.value === studentId) {
      selectedStudentId.value = null;
    }
    gameStates.value.delete(studentId);
  }

  function updateStudentConnection(studentId, connected) {
    const student = participants.value.students.find(s => s.id === studentId);
    if (student) {
      student.connected = connected;
    }
  }

  function selectStudent(studentId) {
    selectedStudentId.value = studentId;
  }

  function updateGameState(studentId, gameState) {
    gameStates.value.set(studentId, {
      ...gameState,
      lastUpdate: new Date()
    });
  }

  function clearGameStates() {
    gameStates.value.clear();
    selectedStudentId.value = null;
  }

  function reset() {
    isConnected.value = false;
    role.value = null;
    roomCode.value = '';
    roomId.value = '';
    participants.value = {
      teacher: null,
      students: []
    };
    selectedStudentId.value = null;
    gameStates.value.clear();
    connectionError.value = null;
    isSpectatorMode.value = false;
    myInfo.value = {
      id: null,
      name: '',
      socketId: null
    };
  }

  function setError(error) {
    connectionError.value = error;
  }

  function clearError() {
    connectionError.value = null;
  }

  // 観戦モードを終了
  function exitSpectatorMode() {
    isSpectatorMode.value = false;
    reset();
  }

  return {
    // 状態
    isConnected,
    role,
    roomCode,
    roomId,
    participants,
    selectedStudentId,
    gameStates,
    connectionError,
    isSpectatorMode,
    myInfo,

    // ゲッター
    isTeacher,
    isStudent,
    studentCount,
    selectedStudent,
    selectedStudentGameState,

    // アクション
    setConnectionStatus,
    setRole,
    setRoomInfo,
    setMyInfo,
    updateParticipants,
    addStudent,
    removeStudent,
    updateStudentConnection,
    selectStudent,
    updateGameState,
    clearGameStates,
    reset,
    setError,
    clearError,
    exitSpectatorMode
  };
});