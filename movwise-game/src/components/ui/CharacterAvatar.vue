<template>
  <div class="character-avatar-container" :class="{ 'is-active': isActive }">
    <div class="avatar-wrapper" @click="$emit('click')">
      <!-- キャラクターアバター -->
      <div class="avatar" :class="[`avatar-${character.id}`, { 'avatar-unlocked': character.unlocked }]">
        <span class="avatar-emoji">{{ character.avatar }}</span>
        <div v-if="!character.unlocked" class="avatar-lock">
          <span>🔒</span>
        </div>
      </div>
      
      <!-- レベル表示 -->
      <div v-if="character.unlocked && showLevel" class="level-badge">
        <span>Lv.{{ character.level }}</span>
      </div>
      
      <!-- キャラクター名 -->
      <div v-if="showName" class="character-name">
        <span class="name">{{ character.name }}</span>
        <span v-if="showTitle" class="title">{{ character.title }}</span>
      </div>
    </div>
    
    <!-- メッセージバブル -->
    <transition name="bubble">
      <div v-if="message && character.unlocked" class="message-bubble">
        <p>{{ message }}</p>
        <div class="bubble-tail"></div>
      </div>
    </transition>
    
    <!-- アビリティリスト -->
    <div v-if="showAbilities && character.unlocked" class="abilities-list">
      <div v-for="ability in character.abilities" :key="ability" class="ability-item">
        <span class="ability-icon">✨</span>
        <span>{{ ability }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterAvatar',
  props: {
    character: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    showLevel: {
      type: Boolean,
      default: true
    },
    showName: {
      type: Boolean,
      default: true
    },
    showTitle: {
      type: Boolean,
      default: false
    },
    showAbilities: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.character-avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover {
  transform: translateY(-2px);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.avatar-echo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid rgba(102, 126, 234, 0.5);
}

.avatar-sonic {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: 3px solid rgba(240, 147, 251, 0.5);
}

.avatar-grammar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: 3px solid rgba(79, 172, 254, 0.5);
}

.avatar-captain {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border: 3px solid rgba(250, 112, 154, 0.5);
}

.avatar:not(.avatar-unlocked) {
  filter: grayscale(100%);
  opacity: 0.7;
}

.avatar-emoji {
  font-size: 40px;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.avatar-lock {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.avatar-lock span {
  font-size: 24px;
}

.level-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
}

.character-name {
  text-align: center;
  margin-top: 8px;
}

.name {
  display: block;
  font-weight: bold;
  color: white;
  font-size: 16px;
}

.title {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.message-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  padding: 12px 16px;
  border-radius: 16px;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.message-bubble p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.bubble-tail {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid rgba(255, 255, 255, 0.95);
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.abilities-list {
  margin-top: 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 8px;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  color: #94a3b8;
  font-size: 12px;
}

.ability-icon {
  color: #fbbf24;
  font-size: 14px;
}

.is-active .avatar {
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>