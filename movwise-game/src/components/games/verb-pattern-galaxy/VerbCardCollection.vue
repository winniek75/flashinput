<template>
  <div class="verb-card-collection bg-gradient-to-b from-indigo-900 via-purple-900 to-black min-h-screen p-6">
    <!-- Header -->
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-white">Verb Collection</h1>
        <div class="text-right text-white">
          <div class="text-lg">Collected: {{ collectedVerbs.length }}/{{ totalVerbs }}</div>
          <div class="text-sm text-purple-200">{{ Math.round(collectionRate) }}% Complete</div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap gap-4 mb-8">
        <button v-for="filter in filters" :key="filter.key"
                @click="activeFilter = filter.key"
                class="px-4 py-2 rounded-lg transition-all"
                :class="activeFilter === filter.key ?
                  'bg-purple-600 text-white' :
                  'bg-purple-800 bg-opacity-50 text-purple-200 hover:bg-purple-700'">
          {{ filter.label }}
        </button>
      </div>

      <!-- Verb Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="verb in filteredVerbs" :key="verb.id"
             class="verb-card relative transform hover:scale-105 transition-all duration-300"
             :class="getCardClass(verb)">

          <!-- Card Content -->
          <div class="p-6">
            <!-- Rarity Badge -->
            <div class="absolute top-3 right-3">
              <span class="text-xs px-2 py-1 rounded-full font-bold"
                    :class="getRarityClass(verb.rarity)">
                {{ verb.rarity.toUpperCase() }}
              </span>
            </div>

            <!-- Level Badge -->
            <div class="absolute top-3 left-3">
              <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                LV {{ verb.level }}
              </span>
            </div>

            <!-- Verb Title -->
            <div class="text-center mb-4 mt-6">
              <h3 class="text-2xl font-bold text-white mb-1">{{ verb.verb }}</h3>
              <p class="text-purple-200 text-sm">{{ verb.translation }}</p>
            </div>

            <!-- Pattern Display -->
            <div class="text-center mb-4">
              <div class="inline-block px-4 py-2 rounded-lg"
                   :class="getPatternClass(verb.pattern)">
                <span class="font-bold text-sm">
                  {{ getPatternDisplay(verb.pattern) }}
                </span>
              </div>
            </div>

            <!-- Meaning -->
            <p class="text-center text-purple-100 text-sm mb-4">{{ verb.meaning }}</p>

            <!-- Examples -->
            <div class="space-y-2">
              <h4 class="text-white font-semibold text-sm">Examples:</h4>
              <div v-if="verb.pattern === 'both'" class="space-y-3">
                <div v-for="(examples, pattern) in verb.examples" :key="pattern">
                  <div class="text-xs text-purple-300 font-semibold">{{ pattern.toUpperCase() }}:</div>
                  <div class="text-xs text-purple-100 italic">
                    "{{ examples[0] }}"
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="text-xs text-purple-100 italic">
                  "{{ verb.examples[0] }}"
                </div>
              </div>
            </div>

            <!-- Collection Status -->
            <div class="mt-4 pt-4 border-t border-purple-700">
              <div v-if="isCollected(verb.id)" class="text-center">
                <div class="flex items-center justify-center space-x-2 text-green-400">
                  <span class="text-lg">✓</span>
                  <span class="text-sm font-semibold">Collected</span>
                </div>
                <!-- Accuracy Display -->
                <div v-if="getAccuracy(verb.id)" class="mt-2">
                  <div class="text-xs text-purple-200">
                    Accuracy: {{ Math.round(getAccuracy(verb.id)) }}%
                  </div>
                  <div class="w-full bg-purple-800 rounded-full h-2 mt-1">
                    <div class="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
                         :style="{ width: getAccuracy(verb.id) + '%' }">
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="isUnlocked(verb)" class="text-center">
                <span class="text-yellow-400 text-sm">Available to collect</span>
              </div>
              <div v-else class="text-center">
                <span class="text-gray-500 text-sm">🔒 Locked</span>
              </div>
            </div>

            <!-- Mastery Badge -->
            <div v-if="isMastered(verb.id)" class="absolute -top-2 -right-2">
              <div class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 border-2 border-white">
                <span class="text-white text-lg">👑</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredVerbs.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-2xl font-bold text-white mb-2">No verbs found</h3>
        <p class="text-purple-200">Try adjusting your filter or play more games to unlock new verbs!</p>
      </div>

      <!-- Statistics Summary -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white">{{ collectedVerbs.length }}</div>
          <div class="text-green-200">Verbs Collected</div>
        </div>

        <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white">{{ masteredVerbs.length }}</div>
          <div class="text-blue-200">Verbs Mastered</div>
        </div>

        <div class="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white">{{ overallAccuracy }}%</div>
          <div class="text-purple-200">Overall Accuracy</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVerbPatternStore } from '@/stores/verbPatternStore'

const store = useVerbPatternStore()

// Filter state
const activeFilter = ref('all')

// Filter options
const filters = [
  { key: 'all', label: 'All Verbs' },
  { key: 'collected', label: 'Collected' },
  { key: 'unlocked', label: 'Available' },
  { key: 'mastered', label: 'Mastered' },
  { key: 'ing', label: 'ING Pattern' },
  { key: 'to', label: 'TO Pattern' },
  { key: 'both', label: 'Both Patterns' },
  { key: 'weak', label: 'Need Practice' }
]

// Computed properties
const collectedVerbs = computed(() => store.collectedVerbs)
const masteredVerbs = computed(() => store.masteredVerbs)
const totalVerbs = computed(() => store.unlockedVerbs.length)
const collectionRate = computed(() => store.collectionRate)
const overallAccuracy = computed(() => store.overallAccuracy)

const filteredVerbs = computed(() => {
  let verbs = store.unlockedVerbs

  switch (activeFilter.value) {
    case 'collected':
      verbs = verbs.filter(v => isCollected(v.id))
      break
    case 'unlocked':
      verbs = verbs.filter(v => isUnlocked(v) && !isCollected(v.id))
      break
    case 'mastered':
      verbs = verbs.filter(v => isMastered(v.id))
      break
    case 'ing':
      verbs = verbs.filter(v => v.pattern === 'ing')
      break
    case 'to':
      verbs = verbs.filter(v => v.pattern === 'to')
      break
    case 'both':
      verbs = verbs.filter(v => v.pattern === 'both')
      break
    case 'weak':
      const weakVerbIds = store.weakVerbs
      verbs = verbs.filter(v => weakVerbIds.includes(v.id))
      break
    default:
      // 'all' - no additional filtering
      break
  }

  return verbs
})

// Helper methods
function isCollected(verbId) {
  return store.collectedVerbs.includes(verbId)
}

function isUnlocked(verb) {
  return verb.level <= store.currentLevel
}

function isMastered(verbId) {
  return store.masteredVerbs.some(id => id === verbId)
}

function getAccuracy(verbId) {
  const acc = store.accuracy[verbId]
  return acc ? (acc.correct / acc.total) * 100 : 0
}

function getCardClass(verb) {
  if (!isUnlocked(verb)) {
    return 'bg-gray-800 border-2 border-gray-600 opacity-50'
  } else if (isMastered(verb.id)) {
    return 'bg-gradient-to-b from-yellow-600 to-orange-700 border-2 border-yellow-400'
  } else if (isCollected(verb.id)) {
    return 'bg-gradient-to-b from-green-600 to-green-800 border-2 border-green-400'
  } else {
    return 'bg-gradient-to-b from-purple-600 to-purple-800 border-2 border-purple-400'
  }
}

function getRarityClass(rarity) {
  switch (rarity) {
    case 'common':
      return 'bg-gray-600 text-white'
    case 'uncommon':
      return 'bg-blue-600 text-white'
    case 'rare':
      return 'bg-purple-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
}

function getPatternClass(pattern) {
  switch (pattern) {
    case 'ing':
      return 'bg-green-600 text-white'
    case 'to':
      return 'bg-blue-600 text-white'
    case 'both':
      return 'bg-purple-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
}

function getPatternDisplay(pattern) {
  switch (pattern) {
    case 'ing':
      return 'VERB + -ING'
    case 'to':
      return 'VERB + TO'
    case 'both':
      return 'BOTH PATTERNS'
    default:
      return pattern.toUpperCase()
  }
}
</script>

<style scoped>
.verb-card {
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  min-height: 400px;
}

.verb-card:hover {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.verb-card.bg-gradient-to-b.from-yellow-600.to-orange-700 {
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmer 2s infinite;
}
</style>