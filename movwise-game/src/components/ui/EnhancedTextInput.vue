<template>
  <div class="enhanced-text-input">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="text-galaxy-text-primary font-bold mb-2 block">
      {{ label }}
      <span v-if="required" class="text-red-400 ml-1">*</span>
    </label>
    
    <!-- Input container -->
    <div class="relative">
      <!-- Main input field -->
      <input
        :id="inputId"
        ref="inputElement"
        v-model="internalValue"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        :autocomplete="autocomplete"
        :spellcheck="spellcheckEnabled"
        class="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium"
        :class="[
          inputClasses,
          sizeClasses,
          validationClasses,
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        @paste="handlePaste"
      />
      
      <!-- Character counter -->
      <div 
        v-if="showCharacterCount && maxLength" 
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs"
        :class="characterCountClasses"
      >
        {{ characterCount }}/{{ maxLength }}
      </div>
      
      <!-- Validation icon -->
      <div v-if="showValidationIcon" class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <span v-if="validationState === 'valid'" class="text-green-400 text-xl">✅</span>
        <span v-else-if="validationState === 'invalid'" class="text-red-400 text-xl">❌</span>
        <span v-else-if="validationState === 'warning'" class="text-yellow-400 text-xl">⚠️</span>
      </div>
      
      <!-- Spell check suggestions -->
      <div 
        v-if="showSuggestions && suggestions.length > 0" 
        class="absolute z-50 w-full mt-1 bg-galaxy-card rounded-xl shadow-2xl border border-galaxy-cosmic-purple/30 max-h-48 overflow-y-auto"
      >
        <div class="p-2">
          <div class="text-xs text-galaxy-moon-silver mb-2 font-bold">💡 スペル提案:</div>
          <button
            v-for="(suggestion, index) in suggestions"
            :key="index"
            @click="applySuggestion(suggestion)"
            class="w-full text-left px-3 py-2 hover:bg-galaxy-cosmic-purple/20 rounded-lg transition-colors duration-150 text-galaxy-text-primary font-medium"
            :class="{ 'bg-galaxy-cosmic-purple/10': index === selectedSuggestionIndex }"
          >
            {{ suggestion.word }}
            <span v-if="suggestion.confidence" class="text-xs text-galaxy-moon-silver ml-2">
              ({{ Math.round(suggestion.confidence * 100) }}%)
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Help text or validation message -->
    <div v-if="helpText || validationMessage" class="mt-2 text-sm">
      <div v-if="validationMessage" :class="validationMessageClasses">
        {{ validationMessage }}
      </div>
      <div v-else-if="helpText" class="text-galaxy-moon-silver">
        {{ helpText }}
      </div>
    </div>
    
    <!-- Real-time feedback -->
    <div v-if="showRealTimeFeedback && realtimeFeedback" class="mt-2">
      <div 
        class="text-sm font-bold px-3 py-2 rounded-lg inline-block"
        :class="realtimeFeedbackClasses"
      >
        {{ realtimeFeedback.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'

export default {
  name: 'EnhancedTextInput',
  props: {
    // Basic input props
    modelValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    
    // Size and styling
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    theme: {
      type: String,
      default: 'galaxy', // 'galaxy', 'minimal', 'colorful'
      validator: value => ['galaxy', 'minimal', 'colorful'].includes(value)
    },
    
    // Validation
    validationRules: {
      type: Array,
      default: () => []
    },
    validateOnInput: {
      type: Boolean,
      default: true
    },
    
    // Spell checking
    spellcheck: {
      type: Boolean,
      default: true
    },
    enableSpellSuggestions: {
      type: Boolean,
      default: true
    },
    customDictionary: {
      type: Array,
      default: () => []
    },
    
    // Advanced features
    maxLength: {
      type: Number,
      default: null
    },
    showCharacterCount: {
      type: Boolean,
      default: false
    },
    showValidationIcon: {
      type: Boolean,
      default: true
    },
    showRealTimeFeedback: {
      type: Boolean,
      default: true
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    helpText: {
      type: String,
      default: ''
    }
  },
  
  emits: [
    'update:modelValue',
    'input',
    'focus',
    'blur',
    'validation-change',
    'spell-check'
  ],
  
  setup(props, { emit }) {
    // Refs
    const inputElement = ref(null)
    const internalValue = ref(props.modelValue)
    const isFocused = ref(false)
    const suggestions = ref([])
    const selectedSuggestionIndex = ref(-1)
    const showSuggestions = ref(false)
    const validationState = ref('') // 'valid', 'invalid', 'warning', ''
    const validationMessage = ref('')
    const realtimeFeedback = ref(null)
    
    // Generate unique ID
    const inputId = computed(() => `enhanced-input-${Math.random().toString(36).substr(2, 9)}`)
    
    // Input type handling
    const inputType = computed(() => {
      return props.type
    })
    
    // Spellcheck configuration
    const spellcheckEnabled = computed(() => {
      return props.spellcheck && props.type === 'text'
    })
    
    // Character count
    const characterCount = computed(() => {
      return internalValue.value.length
    })
    
    // Style classes
    const sizeClasses = computed(() => {
      const sizes = {
        small: 'text-sm py-2',
        medium: 'text-base py-3',
        large: 'text-lg py-4'
      }
      return sizes[props.size] || sizes.medium
    })
    
    const inputClasses = computed(() => {
      const themes = {
        galaxy: 'bg-white/90 text-gray-900 border-galaxy-cosmic-purple focus:border-galaxy-nova-orange focus:outline-none focus:ring-2 focus:ring-galaxy-nova-orange/20 placeholder-gray-400 focus:bg-white',
        minimal: 'bg-white border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder-gray-400',
        colorful: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-purple-900 placeholder-purple-400'
      }
      return themes[props.theme] || themes.galaxy
    })
    
    const validationClasses = computed(() => {
      if (validationState.value === 'valid') {
        return 'border-green-400 focus:border-green-500'
      } else if (validationState.value === 'invalid') {
        return 'border-red-400 focus:border-red-500'
      } else if (validationState.value === 'warning') {
        return 'border-yellow-400 focus:border-yellow-500'
      }
      return ''
    })
    
    const characterCountClasses = computed(() => {
      const ratio = characterCount.value / (props.maxLength || 1)
      if (ratio >= 0.9) return 'text-red-400 font-bold'
      if (ratio >= 0.8) return 'text-yellow-400 font-bold'
      return 'text-galaxy-moon-silver'
    })
    
    const validationMessageClasses = computed(() => {
      if (validationState.value === 'valid') {
        return 'text-green-400 font-medium'
      } else if (validationState.value === 'invalid') {
        return 'text-red-400 font-medium'
      } else if (validationState.value === 'warning') {
        return 'text-yellow-400 font-medium'
      }
      return 'text-galaxy-moon-silver'
    })
    
    const realtimeFeedbackClasses = computed(() => {
      if (!realtimeFeedback.value) return ''
      
      const typeClasses = {
        success: 'bg-green-500/20 text-green-400',
        warning: 'bg-yellow-500/20 text-yellow-400',
        error: 'bg-red-500/20 text-red-400',
        info: 'bg-blue-500/20 text-blue-400'
      }
      
      return typeClasses[realtimeFeedback.value.type] || typeClasses.info
    })
    
    // Built-in spell checker dictionary (basic English words)
    const commonWords = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
      'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go'
    ]
    
    // Spell checking functionality
    const checkSpelling = (word) => {
      if (!word || word.length < 2) return []
      
      const dictionary = [...commonWords, ...props.customDictionary]
      const wordLower = word.toLowerCase()
      
      // Check if word exists in dictionary
      if (dictionary.includes(wordLower)) {
        return []
      }
      
      // Generate suggestions using Levenshtein distance
      const suggestions = []
      for (const dictWord of dictionary) {
        const distance = levenshteinDistance(wordLower, dictWord)
        if (distance <= 2 && Math.abs(word.length - dictWord.length) <= 2) {
          suggestions.push({
            word: dictWord,
            confidence: 1 - (distance / Math.max(word.length, dictWord.length))
          })
        }
      }
      
      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
    }
    
    // Levenshtein distance algorithm for spell checking
    const levenshteinDistance = (str1, str2) => {
      const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
      
      for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
      for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
      
      for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1, // deletion
            matrix[j - 1][i] + 1, // insertion
            matrix[j - 1][i - 1] + indicator // substitution
          )
        }
      }
      
      return matrix[str2.length][str1.length]
    }
    
    // Validation functionality
    const validateInput = (value) => {
      if (!props.validationRules.length) {
        validationState.value = ''
        validationMessage.value = ''
        return true
      }
      
      for (const rule of props.validationRules) {
        const result = rule(value)
        if (result !== true) {
          validationState.value = 'invalid'
          validationMessage.value = result
          emit('validation-change', { valid: false, message: result })
          return false
        }
      }
      
      validationState.value = 'valid'
      validationMessage.value = ''
      emit('validation-change', { valid: true, message: '' })
      return true
    }
    
    // Real-time feedback
    const updateRealtimeFeedback = (value) => {
      if (!props.showRealTimeFeedback) return
      
      if (!value.trim()) {
        realtimeFeedback.value = null
        return
      }
      
      // Character count feedback
      if (props.maxLength) {
        const ratio = value.length / props.maxLength
        if (ratio >= 0.9) {
          realtimeFeedback.value = {
            type: 'warning',
            message: `文字数制限まであと${props.maxLength - value.length}文字`
          }
          return
        }
      }
      
      // Length feedback
      if (value.length < 3) {
        realtimeFeedback.value = {
          type: 'info',
          message: 'もう少し入力してください'
        }
      } else if (value.length >= 3) {
        realtimeFeedback.value = {
          type: 'success',
          message: 'いい感じです！'
        }
      }
    }
    
    // Event handlers
    const handleInput = (event) => {
      const value = event.target.value
      internalValue.value = value
      emit('update:modelValue', value)
      emit('input', value)
      
      if (props.validateOnInput) {
        validateInput(value)
      }
      
      updateRealtimeFeedback(value)
      
      // Spell check on word completion
      if (props.enableSpellSuggestions && spellcheckEnabled.value) {
        const words = value.split(/\s+/)
        const lastWord = words[words.length - 1]
        
        if (lastWord.length >= 3 && /^[a-zA-Z]+$/.test(lastWord)) {
          const spellSuggestions = checkSpelling(lastWord)
          suggestions.value = spellSuggestions
          showSuggestions.value = spellSuggestions.length > 0
          emit('spell-check', { word: lastWord, suggestions: spellSuggestions })
        } else {
          showSuggestions.value = false
        }
      }
    }
    
    const handleFocus = (event) => {
      isFocused.value = true
      emit('focus', event)
    }
    
    const handleBlur = (event) => {
      isFocused.value = false
      showSuggestions.value = false
      
      if (!props.validateOnInput) {
        validateInput(internalValue.value)
      }
      
      emit('blur', event)
    }
    
    const handleKeydown = (event) => {
      if (showSuggestions.value && suggestions.value.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          selectedSuggestionIndex.value = Math.min(
            selectedSuggestionIndex.value + 1,
            suggestions.value.length - 1
          )
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
        } else if (event.key === 'Enter' && selectedSuggestionIndex.value >= 0) {
          event.preventDefault()
          applySuggestion(suggestions.value[selectedSuggestionIndex.value])
        } else if (event.key === 'Escape') {
          showSuggestions.value = false
          selectedSuggestionIndex.value = -1
        }
      }
    }
    
    const handlePaste = (event) => {
      // Allow paste but validate after
      nextTick(() => {
        if (props.validateOnInput) {
          validateInput(internalValue.value)
        }
        updateRealtimeFeedback(internalValue.value)
      })
    }
    
    const applySuggestion = (suggestion) => {
      const words = internalValue.value.split(/(\s+)/)
      if (words.length > 0) {
        words[words.length - 1] = suggestion.word
        const newValue = words.join('')
        internalValue.value = newValue
        emit('update:modelValue', newValue)
      }
      
      showSuggestions.value = false
      selectedSuggestionIndex.value = -1
      
      // Focus back to input
      nextTick(() => {
        if (inputElement.value) {
          inputElement.value.focus()
        }
      })
    }
    
    // Public methods
    const focus = () => {
      if (inputElement.value) {
        inputElement.value.focus()
      }
    }
    
    const blur = () => {
      if (inputElement.value) {
        inputElement.value.blur()
      }
    }
    
    const validate = () => {
      return validateInput(internalValue.value)
    }
    
    const clear = () => {
      internalValue.value = ''
      emit('update:modelValue', '')
      validationState.value = ''
      validationMessage.value = ''
      realtimeFeedback.value = null
    }
    
    // Watch for prop changes
    watch(() => props.modelValue, (newValue) => {
      if (newValue !== internalValue.value) {
        internalValue.value = newValue
      }
    })
    
    return {
      // Refs
      inputElement,
      internalValue,
      isFocused,
      suggestions,
      selectedSuggestionIndex,
      showSuggestions,
      validationState,
      validationMessage,
      realtimeFeedback,
      
      // Computed
      inputId,
      inputType,
      spellcheckEnabled,
      characterCount,
      sizeClasses,
      inputClasses,
      validationClasses,
      characterCountClasses,
      validationMessageClasses,
      realtimeFeedbackClasses,
      
      // Methods
      handleInput,
      handleFocus,
      handleBlur,
      handleKeydown,
      handlePaste,
      applySuggestion,
      focus,
      blur,
      validate,
      clear
    }
  }
}
</script>

<style scoped>
.enhanced-text-input {
  position: relative;
}

/* Galaxy theme specific styles */
.galaxy-text-primary {
  color: #e2e8f0;
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.galaxy-deep-space {
  background-color: rgba(30, 41, 59, 0.5);
}

.galaxy-cosmic-purple {
  color: #8b5cf6;
}

.galaxy-nova-orange {
  color: #f59e0b;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(30, 30, 60, 0.95) 0%, 
    rgba(40, 40, 80, 0.95) 50%, 
    rgba(20, 20, 50, 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* Animation for suggestions */
.enhanced-text-input .suggestions-enter-active,
.enhanced-text-input .suggestions-leave-active {
  transition: all 0.2s ease;
}

.enhanced-text-input .suggestions-enter-from,
.enhanced-text-input .suggestions-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Focus ring enhancement */
.enhanced-text-input input:focus {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Disable browser spell check red underlines */
.enhanced-text-input input {
  text-decoration: none !important;
}

.enhanced-text-input input::-webkit-input-placeholder {
  color: #64748b;
}

.enhanced-text-input input::-moz-placeholder {
  color: #64748b;
}

.enhanced-text-input input:-ms-input-placeholder {
  color: #64748b;
}
</style>