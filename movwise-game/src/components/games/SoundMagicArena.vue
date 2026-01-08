<template>
  <div class="sound-magic-arena min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
    <!-- 魔法のエフェクト背景 -->
    <div class="magic-particles"></div>
    <div class="energy-waves"></div>
    
    <!-- ゲームヘッダー -->
    <header class="relative z-20 p-4 bg-black/50 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="text-white hover:text-yellow-400 transition-colors">
            <i class="fas fa-arrow-left text-2xl"></i>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-yellow-400 flex items-center gap-2">
              <span class="text-4xl">⚔️</span>
              サウンドマジックアリーナ
            </h1>
            <p class="text-yellow-200 text-sm">R音の魔法でバトル！</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-6">
          <!-- HP表示 -->
          <div class="text-center">
            <div class="text-red-400 text-2xl font-bold">❤️ {{ playerHP }}/100</div>
            <div class="text-gray-300 text-xs">PLAYER HP</div>
          </div>
          
          <!-- MP表示 -->
          <div class="text-center">
            <div class="text-blue-400 text-2xl font-bold">💎 {{ playerMP }}/50</div>
            <div class="text-gray-300 text-xs">MAGIC POWER</div>
          </div>
          
          <!-- スコア -->
          <div class="text-center">
            <div class="text-yellow-400 text-2xl font-bold">{{ battleScore }}</div>
            <div class="text-gray-300 text-xs">SCORE</div>
          </div>
        </div>
      </div>
    </header>

    <!-- メインバトルエリア -->
    <main class="relative z-10 p-6">
      <!-- バトル開始前 -->
      <div v-if="battlePhase === 'intro'" class="max-w-2xl mx-auto text-center py-12">
        <div class="bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-yellow-500/30">
          <h2 class="text-4xl font-bold text-yellow-400 mb-6">
            ⚔️ サウンドマジックバトル！
          </h2>
          <div class="text-gray-300 mb-8 space-y-4">
            <p class="text-lg">R音の魔法を使いこなして敵を倒そう！</p>
            
            <div class="bg-purple-900/50 rounded-lg p-4 mt-6">
              <h3 class="text-purple-300 font-bold mb-3">🎮 魔法の種類</h3>
              <div class="grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
                <div class="bg-black/40 rounded p-3">
                  <div class="text-red-400 font-bold">🔥 AR魔法</div>
                  <div class="text-sm">car, star, far</div>
                </div>
                <div class="bg-black/40 rounded p-3">
                  <div class="text-blue-400 font-bold">❄️ OR魔法</div>
                  <div class="text-sm">door, floor, more</div>
                </div>
                <div class="bg-black/40 rounded p-3">
                  <div class="text-yellow-400 font-bold">⚡ ER魔法</div>
                  <div class="text-sm">her, teacher, sister</div>
                </div>
                <div class="bg-black/40 rounded p-3">
                  <div class="text-green-400 font-bold">🌿 IR魔法</div>
                  <div class="text-sm">bird, girl, first</div>
                </div>
                <div class="bg-black/40 rounded p-3">
                  <div class="text-purple-400 font-bold">💜 UR魔法</div>
                  <div class="text-sm">purple, nurse, Thursday</div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            @click="startBattle"
            class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-bold text-xl transition-all transform hover:scale-105"
          >
            ⚔️ バトル開始！
          </button>
        </div>
      </div>

      <!-- バトル中 -->
      <div v-else-if="battlePhase === 'battle'" class="relative">
        <!-- バトルフィールド -->
        <div class="battle-field grid grid-cols-2 gap-8 max-w-6xl mx-auto">
          <!-- プレイヤー側 -->
          <div class="player-side">
            <div class="character-area text-center">
              <div class="character-sprite text-8xl mb-4">🧙‍♂️</div>
              <div class="character-name text-white font-bold">魔法使い</div>
              <div class="hp-bar bg-gray-700 rounded-full h-4 mt-2 overflow-hidden">
                <div 
                  class="hp-fill bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                  :style="{ width: `${(playerHP / 100) * 100}%` }"
                ></div>
              </div>
              <div class="mp-bar bg-gray-700 rounded-full h-3 mt-1 overflow-hidden">
                <div 
                  class="mp-fill bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-500"
                  :style="{ width: `${(playerMP / 50) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 敵側 -->
          <div class="enemy-side">
            <div class="character-area text-center">
              <div class="character-sprite text-8xl mb-4">{{ currentEnemy.sprite }}</div>
              <div class="character-name text-white font-bold">{{ currentEnemy.name }}</div>
              <div class="hp-bar bg-gray-700 rounded-full h-4 mt-2 overflow-hidden">
                <div 
                  class="hp-fill bg-gradient-to-r from-red-500 to-red-400 h-full transition-all duration-500"
                  :style="{ width: `${(enemyHP / currentEnemy.maxHP) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 魔法選択エリア -->
        <div class="magic-selection mt-8 max-w-4xl mx-auto">
          <div class="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30">
            <h3 class="text-xl font-bold text-yellow-400 mb-4 text-center">
              🪄 魔法を選択して詠唱しよう！
            </h3>
            
            <!-- 魔法カード -->
            <div class="grid grid-cols-5 gap-4 mb-6">
              <div 
                v-for="magic in availableMagics" 
                :key="magic.id"
                class="magic-card"
                :class="{ 
                  'selected': selectedMagic?.id === magic.id,
                  'disabled': playerMP < magic.mpCost
                }"
                @click="selectMagic(magic)"
              >
                <div class="magic-icon text-3xl">{{ magic.icon }}</div>
                <div class="magic-name text-xs font-bold">{{ magic.name }}</div>
                <div class="magic-type text-xs text-gray-400">{{ magic.type }}</div>
                <div class="magic-cost text-xs text-blue-400">MP: {{ magic.mpCost }}</div>
              </div>
            </div>

            <!-- 詠唱エリア -->
            <div v-if="selectedMagic" class="chanting-area">
              <div class="bg-purple-900/50 rounded-lg p-4">
                <h4 class="text-purple-300 font-bold mb-3 text-center">
                  🎤 魔法詠唱 - {{ selectedMagic.name }}
                </h4>
                
                <!-- リズムバー -->
                <div class="rhythm-bar mb-4">
                  <div class="rhythm-track bg-gray-700 h-12 rounded-lg relative overflow-hidden">
                    <!-- ビートマーカー -->
                    <div 
                      v-for="beat in rhythmBeats" 
                      :key="beat.id"
                      class="beat-marker absolute h-full w-1 bg-yellow-400"
                      :style="{ left: beat.position + '%' }"
                    ></div>
                    <!-- 移動するライン -->
                    <div 
                      class="rhythm-line absolute h-full w-1 bg-white"
                      :style="{ left: rhythmLinePosition + '%' }"
                    ></div>
                  </div>
                </div>
                
                <!-- 詠唱ワード -->
                <div class="chant-words flex justify-center gap-4 mb-4">
                  <div 
                    v-for="(word, index) in selectedMagic.words" 
                    :key="index"
                    class="chant-word"
                    :class="{ 
                      'completed': completedWords[index],
                      'current': currentWordIndex === index
                    }"
                  >
                    <div class="word-text text-2xl font-bold">{{ word }}</div>
                    <div class="word-pronunciation text-xs text-gray-400">{{ selectedMagic.pronunciations[index] }}</div>
                  </div>
                </div>
                
                <!-- 詠唱ボタン -->
                <div class="flex justify-center gap-4">
                  <button 
                    @click="startChanting"
                    class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-bold transition-all disabled:opacity-50"
                    :disabled="isChanting"
                  >
                    <i class="fas fa-microphone"></i>
                    <span class="ml-2">{{ isChanting ? '詠唱中...' : '詠唱開始' }}</span>
                  </button>
                  
                  <button 
                    @click="playMagicExample"
                    class="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all"
                  >
                    <i class="fas fa-volume-up"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- バトルログ -->
            <div class="battle-log mt-4 max-h-32 overflow-y-auto bg-black/40 rounded-lg p-3">
              <div 
                v-for="(log, index) in battleLogs" 
                :key="index"
                class="log-entry text-sm mb-1"
                :class="{
                  'text-yellow-400': log.type === 'magic',
                  'text-red-400': log.type === 'damage',
                  'text-green-400': log.type === 'heal',
                  'text-gray-400': log.type === 'info'
                }"
              >
                {{ log.message }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- バトル終了 -->
      <div v-else-if="battlePhase === 'victory' || battlePhase === 'defeat'" class="max-w-2xl mx-auto text-center py-12">
        <div class="bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-yellow-500/30">
          <h2 class="text-4xl font-bold mb-6" :class="battlePhase === 'victory' ? 'text-yellow-400' : 'text-red-400'">
            {{ battlePhase === 'victory' ? '🎉 勝利！' : '💀 敗北...' }}
          </h2>
          
          <div class="space-y-4 mb-8">
            <div class="text-3xl font-bold text-yellow-400">
              スコア: {{ battleScore }}
            </div>
            <div class="text-xl text-gray-300">
              使用した魔法: {{ usedMagics.length }}
            </div>
            <div class="text-xl text-orange-400">
              最大ダメージ: {{ maxDamage }}
            </div>
          </div>

          <!-- 習得した魔法 -->
          <div v-if="learnedMagics.length > 0" class="mb-8">
            <h3 class="text-purple-300 font-bold mb-4">📚 習得した魔法</h3>
            <div class="flex justify-center gap-2 flex-wrap">
              <div 
                v-for="magic in learnedMagics" 
                :key="magic.id"
                class="bg-purple-900/50 rounded-lg px-3 py-2 text-sm"
              >
                {{ magic.icon }} {{ magic.name }}
              </div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button 
              @click="resetBattle"
              class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-all"
            >
              もう一度バトル
            </button>
            <button 
              @click="goBack"
              class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all"
            >
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameSounds } from '@/composables/useGameSounds'

const router = useRouter()
const { playSound, speak } = useGameSounds()

// バトル状態
const battlePhase = ref('intro') // intro, battle, victory, defeat
const playerHP = ref(100)
const playerMP = ref(50)
const enemyHP = ref(100)
const battleScore = ref(0)
const maxDamage = ref(0)

// 敵データ
const enemies = [
  { id: 1, name: 'スライム', sprite: '🟢', maxHP: 50, attack: 5, weakness: 'ar' },
  { id: 2, name: 'ゴブリン', sprite: '👺', maxHP: 80, attack: 10, weakness: 'or' },
  { id: 3, name: 'ドラゴン', sprite: '🐉', maxHP: 150, attack: 15, weakness: 'er' },
  { id: 4, name: 'デーモン', sprite: '👹', maxHP: 120, attack: 12, weakness: 'ir' },
  { id: 5, name: 'ゴーレム', sprite: '🗿', maxHP: 200, attack: 8, weakness: 'ur' }
]

const currentEnemy = ref(enemies[0])

// 魔法データ
const magicSpells = [
  // AR魔法
  { id: 'ar1', name: 'ファイアーボール', type: 'ar', icon: '🔥', mpCost: 5, damage: 20, words: ['car', 'star', 'far'], pronunciations: ['カー', 'スター', 'ファー'] },
  { id: 'ar2', name: 'メテオ', type: 'ar', icon: '☄️', mpCost: 10, damage: 40, words: ['park', 'dark', 'shark'], pronunciations: ['パーク', 'ダーク', 'シャーク'] },
  
  // OR魔法
  { id: 'or1', name: 'アイスシールド', type: 'or', icon: '❄️', mpCost: 3, damage: 10, heal: 10, words: ['door', 'floor', 'more'], pronunciations: ['ドア', 'フロア', 'モア'] },
  { id: 'or2', name: 'ブリザード', type: 'or', icon: '🌨️', mpCost: 8, damage: 30, words: ['store', 'before', 'explore'], pronunciations: ['ストア', 'ビフォー', 'エクスプロア'] },
  
  // ER魔法  
  { id: 'er1', name: 'サンダーボルト', type: 'er', icon: '⚡', mpCost: 6, damage: 25, words: ['her', 'teacher', 'sister'], pronunciations: ['ハー', 'ティーチャー', 'シスター'] },
  { id: 'er2', name: 'ライトニング', type: 'er', icon: '🌩️', mpCost: 12, damage: 45, words: ['letter', 'better', 'never'], pronunciations: ['レター', 'ベター', 'ネバー'] },
  
  // IR魔法
  { id: 'ir1', name: 'ヒーリング', type: 'ir', icon: '💚', mpCost: 4, damage: 0, heal: 30, words: ['bird', 'girl', 'first'], pronunciations: ['バード', 'ガール', 'ファースト'] },
  { id: 'ir2', name: 'ネイチャーパワー', type: 'ir', icon: '🌿', mpCost: 7, damage: 20, heal: 15, words: ['third', 'shirt', 'skirt'], pronunciations: ['サード', 'シャート', 'スカート'] },
  
  // UR魔法
  { id: 'ur1', name: 'アースクエイク', type: 'ur', icon: '🌍', mpCost: 9, damage: 35, words: ['purple', 'nurse', 'Thursday'], pronunciations: ['パープル', 'ナース', 'サーズデイ'] },
  { id: 'ur2', name: 'グラビティ', type: 'ur', icon: '🌀', mpCost: 15, damage: 50, words: ['turn', 'burn', 'return'], pronunciations: ['ターン', 'バーン', 'リターン'] }
]

const availableMagics = ref(magicSpells)
const selectedMagic = ref(null)
const usedMagics = ref([])
const learnedMagics = ref([])

// 詠唱システム
const isChanting = ref(false)
const currentWordIndex = ref(0)
const completedWords = ref([])
const rhythmLinePosition = ref(0)
const rhythmBeats = ref([])

// バトルログ
const battleLogs = ref([])

// リズムゲーム用タイマー
let rhythmInterval = null

// バトル開始
const startBattle = () => {
  battlePhase.value = 'battle'
  playerHP.value = 100
  playerMP.value = 50
  battleScore.value = 0
  maxDamage.value = 0
  usedMagics.value = []
  learnedMagics.value = []
  battleLogs.value = []
  
  // ランダムな敵を選択
  currentEnemy.value = enemies[Math.floor(Math.random() * enemies.length)]
  enemyHP.value = currentEnemy.value.maxHP
  
  addBattleLog('info', `${currentEnemy.value.name}が現れた！`)
  playSound('battleStart')
  
  // リズムビート生成
  generateRhythmBeats()
}

// リズムビート生成
const generateRhythmBeats = () => {
  rhythmBeats.value = [
    { id: 1, position: 25 },
    { id: 2, position: 50 },
    { id: 3, position: 75 }
  ]
}

// 魔法選択
const selectMagic = (magic) => {
  if (playerMP.value < magic.mpCost) {
    addBattleLog('info', 'MPが足りません！')
    playSound('error')
    return
  }
  
  selectedMagic.value = magic
  currentWordIndex.value = 0
  completedWords.value = []
  playSound('select')
}

// 詠唱開始
const startChanting = () => {
  if (!selectedMagic.value || isChanting.value) return
  
  isChanting.value = true
  currentWordIndex.value = 0
  completedWords.value = []
  rhythmLinePosition.value = 0
  
  // リズムライン移動開始
  rhythmInterval = setInterval(() => {
    rhythmLinePosition.value += 2
    
    // ビートポイントチェック
    rhythmBeats.value.forEach(beat => {
      if (Math.abs(rhythmLinePosition.value - beat.position) < 3) {
        // ビートに合わせた入力待ち
        checkPronunciation()
      }
    })
    
    if (rhythmLinePosition.value >= 100) {
      rhythmLinePosition.value = 0
    }
  }, 50)
  
  // 擬似的な音声認識（実際の実装では音声認識APIを使用）
  setTimeout(() => {
    simulateChanting()
  }, 1000)
}

// 発音チェック（擬似実装）
const checkPronunciation = () => {
  if (currentWordIndex.value >= selectedMagic.value.words.length) return
  
  // 成功判定（70%の確率で成功）
  const success = Math.random() > 0.3
  
  if (success) {
    completedWords.value[currentWordIndex.value] = true
    currentWordIndex.value++
    
    if (currentWordIndex.value >= selectedMagic.value.words.length) {
      // 詠唱完了
      castMagic()
    }
  }
}

// 詠唱シミュレーション
const simulateChanting = () => {
  const interval = setInterval(() => {
    if (currentWordIndex.value >= selectedMagic.value.words.length) {
      clearInterval(interval)
      castMagic()
      return
    }
    
    completedWords.value[currentWordIndex.value] = true
    playSound('chant')
    currentWordIndex.value++
  }, 800)
}

// 魔法発動
const castMagic = () => {
  if (rhythmInterval) {
    clearInterval(rhythmInterval)
    rhythmInterval = null
  }
  
  isChanting.value = false
  
  const magic = selectedMagic.value
  
  // MP消費
  playerMP.value -= magic.mpCost
  
  // ダメージ計算
  let damage = magic.damage
  
  // 弱点属性ボーナス
  if (currentEnemy.value.weakness === magic.type) {
    damage *= 1.5
    addBattleLog('magic', `弱点を突いた！`)
  }
  
  // ダメージ適用
  if (damage > 0) {
    enemyHP.value -= damage
    if (damage > maxDamage.value) {
      maxDamage.value = damage
    }
    addBattleLog('damage', `${currentEnemy.value.name}に${damage}のダメージ！`)
    playSound('magicHit')
  }
  
  // 回復効果
  if (magic.heal) {
    playerHP.value = Math.min(100, playerHP.value + magic.heal)
    addBattleLog('heal', `HPが${magic.heal}回復した！`)
    playSound('heal')
  }
  
  // スコア加算
  battleScore.value += damage * 10
  
  // 使用魔法記録
  usedMagics.value.push(magic)
  if (!learnedMagics.value.find(m => m.id === magic.id)) {
    learnedMagics.value.push(magic)
  }
  
  // 勝利判定
  if (enemyHP.value <= 0) {
    victory()
    return
  }
  
  // 敵の攻撃
  setTimeout(() => {
    enemyAttack()
  }, 1000)
  
  selectedMagic.value = null
}

// 敵の攻撃
const enemyAttack = () => {
  const damage = currentEnemy.value.attack + Math.floor(Math.random() * 10)
  playerHP.value -= damage
  addBattleLog('damage', `${currentEnemy.value.name}の攻撃！${damage}のダメージを受けた！`)
  playSound('damage')
  
  // 敗北判定
  if (playerHP.value <= 0) {
    defeat()
  }
  
  // MP回復
  playerMP.value = Math.min(50, playerMP.value + 5)
}

// お手本再生
const playMagicExample = () => {
  if (!selectedMagic.value) return
  selectedMagic.value.pronunciations.forEach((pronunciation, index) => {
    setTimeout(() => {
      speak(pronunciation)
    }, index * 1000)
  })
}

// バトルログ追加
const addBattleLog = (type, message) => {
  battleLogs.value.unshift({ type, message })
  if (battleLogs.value.length > 10) {
    battleLogs.value.pop()
  }
}

// 勝利
const victory = () => {
  battlePhase.value = 'victory'
  battleScore.value += 1000
  playSound('victory')
  addBattleLog('info', '勝利！')
}

// 敗北
const defeat = () => {
  battlePhase.value = 'defeat'
  playSound('defeat')
  addBattleLog('info', '敗北...')
}

// リセット
const resetBattle = () => {
  battlePhase.value = 'intro'
}

// 戻る
const goBack = () => {
  router.push('/sound-adventure')
}

// クリーンアップ
onUnmounted(() => {
  if (rhythmInterval) {
    clearInterval(rhythmInterval)
  }
})
</script>

<style scoped>
/* 魔法エフェクト背景 */
.magic-particles {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 40%);
  animation: particleFloat 15s ease-in-out infinite;
}

.energy-waves {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.03) 10px,
    rgba(255, 255, 255, 0.03) 20px
  );
  animation: waveMove 10s linear infinite;
}

@keyframes particleFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes waveMove {
  from { transform: translateX(0); }
  to { transform: translateX(20px); }
}

/* キャラクターアニメーション */
.character-sprite {
  filter: drop-shadow(0 0 20px currentColor);
  animation: characterBob 2s ease-in-out infinite;
}

@keyframes characterBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 魔法カード */
.magic-card {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2));
  border: 2px solid rgba(147, 51, 234, 0.4);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.magic-card:hover:not(.disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(147, 51, 234, 0.4);
  border-color: rgba(255, 215, 0, 0.6);
}

.magic-card.selected {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.3));
  border-color: rgb(255, 215, 0);
  animation: cardPulse 1s infinite;
}

.magic-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes cardPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 詠唱ワード */
.chant-word {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(147, 51, 234, 0.4);
  border-radius: 12px;
  padding: 12px 20px;
  transition: all 0.3s;
}

.chant-word.current {
  background: rgba(251, 146, 60, 0.3);
  border-color: rgb(251, 146, 60);
  animation: wordPulse 1s infinite;
}

.chant-word.completed {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgb(34, 197, 94);
}

@keyframes wordPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* リズムライン */
.rhythm-line {
  box-shadow: 0 0 10px white, 0 0 20px white;
  animation: linePulse 0.5s infinite;
}

@keyframes linePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>