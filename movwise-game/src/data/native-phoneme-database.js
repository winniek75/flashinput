import logger from '@/utils/logger'

// src/data/native-phoneme-database.js
// MovWISE Native English Pronunciation - Accurate 44 Phonemes Database (General American English)
// Specifically designed for Japanese learners to achieve native-like pronunciation

export const NATIVE_PHONEME_PROGRESSION = {
  // Stage 1A: Foundation Phonemes (Critical for Japanese Learners) - 50 Questions
  stage1A: [
    // Core Foundation Phonemes
    {
      symbol: '/s/',
      ipa: 's',
      description: 'Voiceless alveolar fricative',
      examples: ['sun', 'sit', 'bass', 'class', 'miss', 'across', 'person', 'loose', 'house', 'practice'],
      difficulty: 1,
      group: 'fricatives',
      confusingSounds: ['/z/', '/θ/', '/ʃ/'],
      masteryThreshold: 0.85,
      color: 'from-blue-400 to-blue-600',
      audioFile: 's.m4a',
      nativeTips: 'Keep tongue tip near but not touching alveolar ridge. Continuous airflow.',
      commonErrors: 'Japanese speakers often add vowel sound (su). Practice pure /s/ without vowel.',
      articulationGuide: 'Tongue tip approaches alveolar ridge, but does not touch. Air flows through narrow channel.'
    },
    {
      symbol: '/æ/',
      ipa: 'æ',
      description: 'Near-open front unrounded vowel (Standard American /æ/)',
      examples: ['cat', 'hat', 'bad', 'man', 'back', 'happy', 'apple', 'black', 'track', 'match'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/ʌ/', '/ɑ/', '/ɛ/'],
      masteryThreshold: 0.85,
      color: 'from-red-400 to-red-600',
      audioFile: 'a1.m4a',
      nativeTips: 'Tongue low and front, mouth much wider than Japanese /a/. Very different from Japanese /a/.',
      commonErrors: 'Japanese speakers substitute /a/ sound. Practice extreme mouth width and tongue position.',
      articulationGuide: 'Tongue body low and forward. Mouth opening wide horizontally, not vertically.'
    },
    {
      symbol: '/t/',
      ipa: 't',
      description: 'Voiceless alveolar plosive (with aspiration in initial position)',
      examples: ['top', 'cat', 'better', 'water', 'time', 'little', 'about', 'white', 'night', 'center'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/d/', '/k/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-green-400 to-green-600',
      audioFile: 't.m4a',
      nativeTips: 'Strong aspiration when word-initial. Tongue tip contacts alveolar ridge.',
      commonErrors: 'Insufficient aspiration in initial position. Practice strong puff of air.',
      articulationGuide: 'Complete closure with tongue tip against alveolar ridge. Release with strong burst of air.'
    },
    // Additional phonemes for 50 questions total
    {
      symbol: '/ɪ/',
      ipa: 'ɪ',
      description: 'Near-close near-front unrounded vowel',
      examples: ['sit', 'bit', 'ship', 'this', 'give', 'fish', 'quick', 'with', 'rich', 'pick'],
      difficulty: 2,
      group: 'short_vowels',
      confusingSounds: ['/i/', '/e/', '/ə/'],
      masteryThreshold: 0.85,
      color: 'from-purple-400 to-purple-600',
      audioFile: 'i1.m4a',
      nativeTips: 'Shorter and more relaxed than Japanese /i/. Tongue position slightly lower.',
      commonErrors: 'Making it too tense like Japanese /i/. Practice relaxed tongue position.',
      articulationGuide: 'Tongue slightly lower and more central than for /i/. Lips unrounded.'
    },
    {
      symbol: '/p/',
      ipa: 'p',
      description: 'Voiceless bilabial plosive',
      examples: ['pen', 'cup', 'paper', 'apple', 'happy', 'top', 'stop', 'open', 'upper', 'people'],
      difficulty: 1,
      group: 'plosives',
      confusingSounds: ['/b/', '/f/', '/m/'],
      masteryThreshold: 0.85,
      color: 'from-yellow-400 to-yellow-600',
      audioFile: 'p.m4a',
      nativeTips: 'Strong aspiration in initial position. Complete lip closure.',
      commonErrors: 'Weak aspiration. Practice strong puff of air on release.',
      articulationGuide: 'Complete closure of lips. Build up air pressure and release with aspiration.'
    },
    {
      symbol: '/n/',
      ipa: 'n',
      description: 'Voiced alveolar nasal',
      examples: ['no', 'can', 'name', 'then', 'want', 'nice', 'turn', 'green', 'thank', 'stand'],
      difficulty: 1,
      group: 'nasals',
      confusingSounds: ['/m/', '/ŋ/', '/l/'],
      masteryThreshold: 0.85,
      color: 'from-teal-400 to-teal-600',
      audioFile: 'n.m4a',
      nativeTips: 'Tongue tip touches alveolar ridge. Air flows through nose.',
      commonErrors: 'Confusing with /m/ in final position.',
      articulationGuide: 'Tongue tip contacts alveolar ridge. Velum lowered for nasal airflow.'
    },
    {
      symbol: '/m/',
      ipa: 'm',
      description: 'Voiced bilabial nasal',
      examples: ['my', 'come', 'make', 'time', 'home', 'room', 'summer', 'woman', 'maybe', 'small'],
      difficulty: 1,
      group: 'nasals',
      confusingSounds: ['/n/', '/b/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-indigo-400 to-indigo-600',
      audioFile: 'm.m4a',
      nativeTips: 'Complete lip closure. Air flows through nose.',
      commonErrors: 'Very similar to Japanese /m/. Usually no problems.',
      articulationGuide: 'Lips completely closed. Velum lowered for nasal airflow.'
    },
    {
      symbol: '/k/',
      ipa: 'k',
      description: 'Voiceless velar plosive',
      examples: ['key', 'back', 'make', 'look', 'work', 'book', 'take', 'walk', 'ask', 'like'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/g/', '/t/', '/x/'],
      masteryThreshold: 0.85,
      color: 'from-pink-400 to-pink-600',
      audioFile: 'k.m4a',
      nativeTips: 'Back of tongue contacts soft palate. Strong aspiration initially.',
      commonErrors: 'Insufficient aspiration in initial position.',
      articulationGuide: 'Back of tongue makes complete contact with velum. Strong release.'
    },
    {
      symbol: '/l/',
      ipa: 'l',
      description: 'Voiced alveolar lateral approximant',
      examples: ['love', 'all', 'like', 'will', 'also', 'well', 'call', 'only', 'feel', 'child'],
      difficulty: 4,
      group: 'liquids',
      confusingSounds: ['/r/', '/n/', '/w/'],
      masteryThreshold: 0.80,
      color: 'from-orange-400 to-orange-600',
      audioFile: 'l.m4a',
      nativeTips: 'Tongue tip touches alveolar ridge. Air flows around sides of tongue.',
      commonErrors: 'Japanese speakers often substitute /r/ sound. Practice lateral airflow.',
      articulationGuide: 'Tongue tip contacts alveolar ridge. Air flows around one or both sides.'
    },
    {
      symbol: '/r/',
      ipa: 'r',
      description: 'Voiced postalveolar approximant',
      examples: ['run', 'car', 'red', 'very', 'more', 'here', 'three', 'try', 'bring', 'over'],
      difficulty: 5,
      group: 'liquids',
      confusingSounds: ['/l/', '/w/', '/ɹ/'],
      masteryThreshold: 0.75,
      color: 'from-rose-400 to-rose-600',
      audioFile: 'r.m4a',
      nativeTips: 'Tongue tip curled back or bunched. Do not touch any part of mouth.',
      commonErrors: 'Most difficult for Japanese speakers. Practice retroflex tongue position.',
      articulationGuide: 'Tongue tip curled back or bunched up. No contact with roof of mouth.'
    }
  ],

  // Stage 1B: Critical Distinctions for Japanese Learners
  stage1B: [
    {
      symbol: '/ɪ/',
      ipa: 'ɪ',
      description: 'Near-close near-front unrounded vowel (lax vowel)',
      examples: ['sit', 'hit', 'bit'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/iː/', '/e/', '/ɛ/'],
      masteryThreshold: 0.85,
      color: 'from-purple-400 to-purple-600',
      audioFile: 'i1.m4a',
      nativeTips: 'Shorter and more relaxed than /iː/. Tongue position lower than Japanese /i/.',
      commonErrors: 'Japanese speakers use tense /iː/ sound. Practice relaxed, shorter vowel.',
      articulationGuide: 'Tongue high-front but relaxed. Much shorter duration than /iː/.'
    },
    {
      symbol: '/p/',
      ipa: 'p',
      description: 'Voiceless bilabial plosive (with aspiration)',
      examples: ['pen', 'cap', 'spin'],
      difficulty: 1,
      group: 'plosives',
      confusingSounds: ['/b/', '/f/', '/m/'],
      masteryThreshold: 0.85,
      color: 'from-orange-400 to-orange-600',
      audioFile: 'p.m4a',
      nativeTips: 'Strong aspiration in initial position. Complete lip closure.',
      commonErrors: 'Insufficient aspiration. Practice strong puff of air.',
      articulationGuide: 'Complete closure of both lips. Release with strong burst of air.'
    },
    {
      symbol: '/n/',
      ipa: 'n',
      description: 'Voiced alveolar nasal',
      examples: ['no', 'sun', 'pen'],
      difficulty: 1,
      group: 'nasals',
      confusingSounds: ['/m/', '/ŋ/', '/l/'],
      masteryThreshold: 0.85,
      color: 'from-teal-400 to-teal-600',
      audioFile: 'n.m4a',
      nativeTips: 'Tongue tip contacts alveolar ridge. Air flows through nose.',
      commonErrors: 'Confusion with /m/ in final position.',
      articulationGuide: 'Tongue tip against alveolar ridge. Velum lowered for nasal airflow.'
    }
  ],

  // Stage 1C: L/R Distinction (Critical for Japanese Learners)
  stage1C: [
    {
      symbol: '/l/',
      ipa: 'l',
      description: 'Voiced alveolar lateral approximant',
      examples: ['light', 'play', 'call'],
      difficulty: 4,
      group: 'liquids',
      confusingSounds: ['/r/', '/w/', '/j/'],
      masteryThreshold: 0.90,
      color: 'from-cyan-400 to-cyan-600',
      audioFile: 'l.m4a',
      nativeTips: 'Tongue tip touches alveolar ridge. Air flows around sides of tongue.',
      commonErrors: 'Japanese speakers substitute /r/ sound. Practice lateral airflow.',
      articulationGuide: 'Tongue tip firmly against alveolar ridge. Air flows laterally around tongue sides.',
      practiceWords: ['light/right', 'collect/correct', 'play/pray']
    },
    {
      symbol: '/r/',
      ipa: 'r',
      description: 'Voiced postalveolar approximant (American rhotic)',
      examples: ['red', 'tree', 'car'],
      difficulty: 5,
      group: 'liquids',
      confusingSounds: ['/l/', '/w/', '/ʋ/'],
      masteryThreshold: 0.90,
      color: 'from-rose-400 to-rose-600',
      audioFile: 'r.m4a',
      nativeTips: 'Tongue tip curled back, not touching anything. Strong lip rounding.',
      commonErrors: 'Japanese speakers substitute /l/ sound. Practice retroflexion.',
      articulationGuide: 'Tongue tip curled back (retroflex). No contact with roof of mouth. Slight lip rounding.',
      practiceWords: ['right/light', 'pray/play', 'correct/collect']
    },
    {
      symbol: '/k/',
      ipa: 'k',
      description: 'Voiceless velar plosive (with aspiration)',
      examples: ['cat', 'back', 'school'],
      difficulty: 1,
      group: 'plosives',
      confusingSounds: ['/g/', '/t/', '/p/'],
      masteryThreshold: 0.85,
      color: 'from-emerald-400 to-emerald-600',
      audioFile: 'k.m4a',
      nativeTips: 'Back of tongue contacts soft palate. Strong aspiration in initial position.',
      commonErrors: 'Insufficient aspiration in initial position.',
      articulationGuide: 'Complete closure with back of tongue against velum. Release with strong burst.'
    }
  ],

  // Stage 2A: Voiced/Voiceless Distinctions (Critical for Japanese)
  stage2A: [
    {
      symbol: '/z/',
      ipa: 'z',
      description: 'Voiced alveolar fricative',
      examples: ['zoo', 'buzz', 'maze'],
      difficulty: 2,
      group: 'fricatives',
      confusingSounds: ['/s/', '/ʒ/', '/dʒ/'],
      masteryThreshold: 0.85,
      color: 'from-violet-400 to-violet-600',
      audioFile: 'z.m4a',
      nativeTips: 'Same tongue position as /s/ but with vocal cord vibration.',
      commonErrors: 'Japanese speakers often devoice in final position. Practice maintaining voicing.',
      articulationGuide: 'Identical to /s/ but with vocal cord vibration. Feel throat buzz.',
      voicingPairs: ['/s/ - /z/']
    },
    {
      symbol: '/b/',
      ipa: 'b',
      description: 'Voiced bilabial plosive',
      examples: ['boy', 'cab', 'about'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/p/', '/v/', '/m/'],
      masteryThreshold: 0.85,
      color: 'from-amber-400 to-amber-600',
      audioFile: 'b.m4a',
      nativeTips: 'Same lip position as /p/ but with vocal cord vibration.',
      commonErrors: 'Devoicing in final position. Practice maintaining voicing throughout.',
      articulationGuide: 'Complete lip closure with vocal cord vibration. Less aspiration than /p/.',
      voicingPairs: ['/p/ - /b/']
    },
    {
      symbol: '/d/',
      ipa: 'd',
      description: 'Voiced alveolar plosive',
      examples: ['dog', 'red', 'made'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/t/', '/ð/', '/l/'],
      masteryThreshold: 0.85,
      color: 'from-lime-400 to-lime-600',
      audioFile: 'd.m4a',
      nativeTips: 'Same tongue position as /t/ but with vocal cord vibration.',
      commonErrors: 'Devoicing in final position. Practice maintaining voicing.',
      articulationGuide: 'Tongue tip against alveolar ridge with vocal cord vibration. Less aspiration than /t/.',
      voicingPairs: ['/t/ - /d/']
    }
  ],

  // Stage 2B: TH Sounds (Most Difficult for Japanese Learners)
  stage2B: [
    {
      symbol: '/θ/',
      ipa: 'θ',
      description: 'Voiceless dental fricative',
      examples: ['think', 'math', 'birthday'],
      difficulty: 5,
      group: 'fricatives',
      confusingSounds: ['/s/', '/f/', '/t/'],
      masteryThreshold: 0.90,
      color: 'from-sky-400 to-sky-600',
      audioFile: 'th1.m4a',
      nativeTips: 'Tongue tip between teeth. Air flows over tongue. No vocal cord vibration.',
      commonErrors: 'Japanese speakers substitute /s/ or /f/. Practice tongue placement between teeth.',
      articulationGuide: 'Tongue tip protruding slightly between upper and lower teeth. Voiceless airflow.',
      practiceWords: ['think/sink', 'math/mass', 'thing/sing']
    },
    {
      symbol: '/ð/',
      ipa: 'ð',
      description: 'Voiced dental fricative',
      examples: ['this', 'mother', 'breathe'],
      difficulty: 5,
      group: 'fricatives',
      confusingSounds: ['/z/', '/v/', '/d/'],
      masteryThreshold: 0.90,
      color: 'from-indigo-400 to-indigo-600',
      audioFile: 'th2.m4a',
      nativeTips: 'Same tongue position as /θ/ but with vocal cord vibration.',
      commonErrors: 'Japanese speakers substitute /z/ or /d/. Practice voicing with tongue between teeth.',
      articulationGuide: 'Tongue tip between teeth with vocal cord vibration. Feel throat buzz.',
      practiceWords: ['this/zis', 'breathe/breeze', 'that/zat'],
      voicingPairs: ['/θ/ - /ð/']
    },
    {
      symbol: '/g/',
      ipa: 'g',
      description: 'Voiced velar plosive',
      examples: ['go', 'big', 'egg'],
      difficulty: 2,
      group: 'plosives',
      confusingSounds: ['/k/', '/ɡ/', '/ŋ/'],
      masteryThreshold: 0.85,
      color: 'from-green-500 to-green-700',
      audioFile: 'g.m4a',
      nativeTips: 'Same tongue position as /k/ but with vocal cord vibration.',
      commonErrors: 'Devoicing in final position. Practice maintaining voicing.',
      articulationGuide: 'Back of tongue against velum with vocal cord vibration.',
      voicingPairs: ['/k/ - /g/']
    }
  ],

  // Stage 2C: Additional Vowel Distinctions
  stage2C: [
    {
      symbol: '/ɛ/',
      ipa: 'ɛ',
      description: 'Open-mid front unrounded vowel',
      examples: ['bed', 'said', 'head'],
      difficulty: 2,
      group: 'short_vowels',
      confusingSounds: ['/æ/', '/ɪ/', '/eɪ/'],
      masteryThreshold: 0.85,
      color: 'from-red-500 to-red-700',
      audioFile: 'e1.m4a',
      nativeTips: 'More open than /ɪ/, more closed than /æ/. Mid-front position.',
      commonErrors: 'Confusion with /æ/ and /eɪ/. Practice distinct mid-front position.',
      articulationGuide: 'Tongue mid-front position. More open than /ɪ/, less open than /æ/.'
    },
    {
      symbol: '/ʌ/',
      ipa: 'ʌ',
      description: 'Open-mid back unrounded vowel (stressed schwa)',
      examples: ['but', 'cup', 'love'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/æ/', '/ɑ/', '/ə/'],
      masteryThreshold: 0.85,
      color: 'from-orange-500 to-orange-700',
      audioFile: 'u3.m4a',
      nativeTips: 'Central vowel, more back than /æ/. Unstressed version is schwa /ə/.',
      commonErrors: 'Japanese speakers may substitute /a/. Practice central tongue position.',
      articulationGuide: 'Tongue central-back, mid-height. Mouth moderately open.'
    },
    {
      symbol: '/ʊ/',
      ipa: 'ʊ',
      description: 'Near-close near-back rounded vowel (lax vowel)',
      examples: ['book', 'put', 'could'],
      difficulty: 3,
      group: 'short_vowels',
      confusingSounds: ['/uː/', '/oʊ/', '/ɔ/'],
      masteryThreshold: 0.85,
      color: 'from-purple-500 to-purple-700',
      audioFile: 'u1.m4a',
      nativeTips: 'Shorter and more relaxed than /uː/. Slight lip rounding.',
      commonErrors: 'Japanese speakers use tense /uː/. Practice relaxed, shorter vowel.',
      articulationGuide: 'Tongue high-back but relaxed. Slight lip rounding. Short duration.'
    }
  ]
};

// Accurate IPA to Audio File Mapping for Native Pronunciation
export const NATIVE_AUDIO_MAPPING = {
  // Consonants
  '/p/': 'p.m4a',
  '/b/': 'b.m4a', 
  '/t/': 't.m4a',
  '/d/': 'd.m4a',
  '/k/': 'k.m4a',
  '/g/': 'g.m4a',
  '/f/': 'f.m4a',
  '/v/': 'v.m4a',
  '/θ/': 'th1.m4a',  // voiceless th
  '/ð/': 'th2.m4a',  // voiced th
  '/s/': 's.m4a',
  '/z/': 'z.m4a',
  '/ʃ/': 'sh.m4a',
  '/ʒ/': 'zh.m4a',
  '/h/': 'h.m4a',
  '/m/': 'm.m4a',
  '/n/': 'n.m4a',
  '/ŋ/': 'ng.m4a',
  '/l/': 'l.m4a',
  '/r/': 'r.m4a',
  '/j/': 'y.m4a',
  '/w/': 'w.m4a',
  
  // Short Vowels
  '/ɪ/': 'i1.m4a',    // bit
  '/ɛ/': 'e1.m4a',    // bet
  '/æ/': 'a1.m4a',    // bat
  '/ʌ/': 'u3.m4a',    // but
  '/ʊ/': 'u1.m4a',    // book
  '/ə/': 'schwa.m4a', // about
  
  // Long Vowels
  '/iː/': 'e2.m4a',   // beat  
  '/uː/': 'u2.m4a',   // boot
  '/ɑ/': 'a4.m4a',    // father (American)
  '/ɔ/': 'o4.m4a',    // thought
  
  // Diphthongs  
  '/eɪ/': 'eɪ.m4a',   // day
  '/aɪ/': 'aɪ.m4a',   // my
  '/ɔɪ/': 'oi.m4a',   // boy
  '/aʊ/': 'ow.m4a',   // now
  '/oʊ/': 'o1.m4a',   // go
  
  // R-colored vowels (American English)
  '/ɚ/': 'er.m4a',    // unstressed (water)
  '/ɝ/': 'er.m4a',    // stressed (bird)
  '/ɑr/': 'ar.m4a',   // car
  '/ɔr/': 'or.m4a',   // more
  '/ɪr/': 'ear.m4a',  // near
  '/ɛr/': 'air.m4a',  // care
  '/ʊr/': 'ure.m4a',  // cure
  
  // Jolly Phonics specific sounds
  '/ks/': 'x.m4a',        // 'x' sound
  '/kw/': 'qu.m4a',       // 'qu' sound
  '/tʃ/': 'ch.m4a',       // 'ch' as in chair
  '/dʒ/': 'j.m4a',        // 'j' as in jump
  '/θ/': 'th_voiceless.m4a',  // 'th' voiceless
  '/ð/': 'th_voiced.m4a',     // 'th' voiced
  '/uː/': 'oo_long.m4a',      // 'oo' long as in moon
  '/juː/': 'ue.m4a',          // 'ue' as in blue
  '/ər/': 'er.m4a'            // 'er' as in her
};

// Critical Pronunciation Tips for Japanese Learners
export const JAPANESE_LEARNER_TIPS = {
  commonChallenges: {
    'L_R_distinction': {
      problem: 'Japanese has only one liquid sound /r/',
      solution: 'Focus on tongue tip position: /l/ touches alveolar ridge, /r/ is retroflex',
      practiceWords: ['light/right', 'play/pray', 'collect/correct']
    },
    'voiced_voiceless': {
      problem: 'Japanese devoices consonants in final position',
      solution: 'Practice maintaining voicing to the very end of words',
      practiceWords: ['bad', 'dog', 'buzz', 'save']
    },
    'th_sounds': {
      problem: 'No dental fricatives in Japanese',
      solution: 'Tongue tip between teeth, not /s/ or /f/ substitution',
      practiceWords: ['think/sink', 'this/zis', 'math/mass']
    },
    'vowel_reduction': {
      problem: 'Japanese vowels are always full, never reduced',
      solution: 'Learn schwa /ə/ and vowel reduction in unstressed syllables',
      practiceWords: ['about', 'sofa', 'banana']
    },
    'consonant_clusters': {
      problem: 'Japanese inserts vowels between consonants',
      solution: 'Practice consonant clusters without epenthetic vowels',
      practiceWords: ['stop', 'school', 'spring', 'strong']
    }
  },
  
  masterySequence: [
    'Basic consonants (p, t, k, s)',
    'L/R distinction',
    'Voiced/voiceless pairs',
    'TH sounds',
    'Vowel quality distinctions',
    'Schwa and vowel reduction',
    'Consonant clusters',
    'Connected speech patterns'
  ]
};

// Learning Stage Dependencies - Jolly Phonics Groups Only
export const STAGE_DEPENDENCIES = {
  // Jolly Phonics groups - progressive learning
  group1: [], // No dependencies - starting point
  group2: ['group1'],
  group3: ['group2'],
  group4: ['group3'],
  group5: ['group4'],
  group6: ['group5'],
  group7: ['group6']
};

// Mastery Criteria for Native Pronunciation
export const MASTERY_CRITERIA = {
  singlePhoneme: 0.90,        // Higher standard for native pronunciation
  stageCompletion: 0.85,      // Stage completion threshold
  levelAdvancement: 0.90,     // Level advancement threshold
  consecutiveCorrect: 5,      // More repetitions for native mastery
  minAttempts: 8             // More attempts for reliable assessment
};

// Adaptive Learning Settings for Native Pronunciation
export const ADAPTIVE_SETTINGS = {
  easyMode: {
    choiceCount: 2,           // Fewer choices for easier discrimination
    playSpeed: 0.6,           // Slower for better perception
    repeatAllowed: 5,         // More repetitions allowed
    feedbackDelay: 4000       // Longer feedback for learning
  },
  normalMode: {
    choiceCount: 3,
    playSpeed: 0.8,
    repeatAllowed: 3,
    feedbackDelay: 3000
  },
  hardMode: {
    choiceCount: 4,
    playSpeed: 1.0,
    repeatAllowed: 2,
    feedbackDelay: 2000
  },
  nativeMode: {
    choiceCount: 4,
    playSpeed: 1.2,           // Normal native speed
    repeatAllowed: 1,         // Challenge mode
    feedbackDelay: 1500
  }
};

// Native Pronunciation Confusion Patterns (Critical for Japanese Learners)
export const COMMON_CONFUSION_PATTERNS = {
  voicing: {
    description: 'Voiced vs Voiceless Distinctions',
    pairs: [
      ['/p/', '/b/'],
      ['/t/', '/d/'],
      ['/k/', '/g/'],
      ['/f/', '/v/'],
      ['/s/', '/z/'],
      ['/θ/', '/ð/']
    ],
    difficulty: 'high'
  },
  liquid_distinction: {
    description: 'L/R Distinction (Critical for Japanese)',
    pairs: [
      ['/l/', '/r/']
    ],
    difficulty: 'extreme',
    specialFocus: true
  },
  dental_fricatives: {
    description: 'TH Sounds (No Japanese Equivalent)',
    pairs: [
      ['/θ/', '/s/'],
      ['/ð/', '/z/'],
      ['/θ/', '/f/'],
      ['/ð/', '/d/']
    ],
    difficulty: 'extreme',
    specialFocus: true
  },
  vowel_quality: {
    description: 'Vowel Quality Distinctions',
    pairs: [
      ['/ɪ/', '/iː/'],
      ['/ɛ/', '/æ/'],
      ['/ʊ/', '/uː/'],
      ['/ʌ/', '/ɑ/']
    ],
    difficulty: 'high'
  },
  vowel_reduction: {
    description: 'Schwa vs Full Vowels',
    pairs: [
      ['/ə/', '/ʌ/'],
      ['/ə/', '/ɪ/'],
      ['/ə/', '/ɛ/']
    ],
    difficulty: 'high',
    culturalNote: 'Japanese vowels are never reduced'
  }
};

// Native Phoneme Groups for Pattern Recognition
export const PHONEME_GROUPS = {
  short_vowels: {
    name: 'Short Vowels',
    description: 'Lax vowels - shorter duration',
    members: ['/ɪ/', '/ɛ/', '/æ/', '/ʌ/', '/ʊ/', '/ə/'],
    color: 'from-red-400 to-pink-500'
  },
  long_vowels: {
    name: 'Long Vowels & Diphthongs', 
    description: 'Tense vowels and diphthongs',
    members: ['/iː/', '/uː/', '/ɑ/', '/ɔ/', '/eɪ/', '/aɪ/', '/ɔɪ/', '/aʊ/', '/oʊ/'],
    color: 'from-blue-400 to-purple-500'
  },
  voiceless_plosives: {
    name: 'Voiceless Plosives',
    description: 'Aspirated stops',
    members: ['/p/', '/t/', '/k/'],
    color: 'from-green-400 to-teal-500'
  },
  voiced_plosives: {
    name: 'Voiced Plosives',
    description: 'Unaspirated stops with voicing',
    members: ['/b/', '/d/', '/g/'],
    color: 'from-emerald-400 to-green-600'
  },
  fricatives: {
    name: 'Fricatives',
    description: 'Continuous airflow sounds',
    members: ['/f/', '/v/', '/θ/', '/ð/', '/s/', '/z/', '/ʃ/', '/ʒ/', '/h/'],
    color: 'from-yellow-400 to-orange-500'
  },
  nasals: {
    name: 'Nasals',
    description: 'Nasal airflow sounds',
    members: ['/m/', '/n/', '/ŋ/'],
    color: 'from-purple-400 to-indigo-500'
  },
  liquids: {
    name: 'Liquids (L/R)',
    description: 'Critical distinction for Japanese learners',
    members: ['/l/', '/r/'],
    color: 'from-cyan-400 to-blue-600',
    specialFocus: true
  },
  glides: {
    name: 'Glides/Approximants',
    description: 'Semi-vowel sounds',
    members: ['/w/', '/j/'],
    color: 'from-indigo-400 to-purple-600'
  }
};

// Learning Path for Jolly Phonics Mastery
export const LEARNING_PATH = [
  {
    stage: 'group1',
    name: 'First Sounds',
    description: 'Foundation letters: s, a, t, i, p, n',
    requiredMastery: 0.85,
    estimatedTime: '1-2 weeks',
    focus: 'Basic sound recognition and production'
  },
  {
    stage: 'group2',
    name: 'Building Blocks',
    description: 'Key consonants and vowels: c/k, e, h, r, m, d',
    requiredMastery: 0.85,
    estimatedTime: '1-2 weeks',
    focus: 'Expanding phonetic awareness'
  },
  {
    stage: 'group3',
    name: 'Core Sounds',
    description: 'Essential phonemes: g, o, u, l, f, b',
    requiredMastery: 0.85,
    estimatedTime: '2-3 weeks',
    focus: 'L/R distinction for Japanese learners'
  },
  {
    stage: 'group4',
    name: 'Complex Sounds',
    description: 'Diphthongs and digraphs: ai, j, oa, ie, ee, or',
    requiredMastery: 0.90,
    estimatedTime: '2-3 weeks',
    focus: 'Long vowels and diphthongs'
  },
  {
    stage: 'group5',
    name: 'Advanced Phonemes',
    description: 'Special sounds: z, w, ng, v, oo (short/long)',
    requiredMastery: 0.90,
    estimatedTime: '2-3 weeks',
    focus: 'Challenging consonants and vowel variants'
  },
  {
    stage: 'group6',
    name: 'Difficult Sounds',
    description: 'Complex consonants: y, x, ch, sh, th (both)',
    requiredMastery: 0.95,
    estimatedTime: '3-4 weeks',
    focus: 'Most challenging sounds for Japanese learners'
  },
  {
    stage: 'group7',
    name: 'Mastery Level',
    description: 'Advanced patterns: qu, ou, oi, ue, er, ar',
    requiredMastery: 0.95,
    estimatedTime: '3-4 weeks',
    focus: 'R-controlled vowels and complex clusters'
  }
];

// ジョリーフォニックス準拠のグループ
// Jolly Phonics Groups - progressive phonics learning system
const JOLLY_PHONICS_GROUPS = {
  // Group 1: First letters taught - s, a, t, i, p, n
  group1: [
    {
      symbol: '/s/',
      ipa: 's',
      description: 'Voiceless alveolar fricative',
      examples: ['sun', 'sit', 'snake', 'mouse'],
      difficulty: 1,
      group: 'fricatives',
      audioFile: 's.m4a',
      jollyPhonicsOrder: 1
    },
    {
      symbol: '/æ/', // 'a' as in cat
      ipa: 'æ',
      description: 'Near-open front unrounded vowel',
      examples: ['cat', 'hat', 'apple', 'ant'],
      difficulty: 2,
      group: 'short_vowels',
      audioFile: 'a1.m4a',
      jollyPhonicsOrder: 2
    },
    {
      symbol: '/t/',
      ipa: 't',
      description: 'Voiceless alveolar plosive',
      examples: ['top', 'cat', 'tent', 'hat'],
      difficulty: 1,
      group: 'plosives',
      audioFile: 't.m4a',
      jollyPhonicsOrder: 3
    },
    {
      symbol: '/ɪ/', // 'i' as in sit
      ipa: 'ɪ',
      description: 'Near-close near-front unrounded vowel',
      examples: ['sit', 'bit', 'pig', 'ink'],
      difficulty: 2,
      group: 'short_vowels',
      audioFile: 'i1.m4a',
      jollyPhonicsOrder: 4
    },
    {
      symbol: '/p/',
      ipa: 'p',
      description: 'Voiceless bilabial plosive',
      examples: ['pat', 'cup', 'pen', 'pig'],
      difficulty: 1,
      group: 'plosives',
      audioFile: 'p.m4a',
      jollyPhonicsOrder: 5
    },
    {
      symbol: '/n/',
      ipa: 'n',
      description: 'Voiced alveolar nasal',
      examples: ['net', 'sun', 'pen', 'ant'],
      difficulty: 1,
      group: 'nasals',
      audioFile: 'n.m4a',
      jollyPhonicsOrder: 6
    }
  ],

  // Group 2: c, k, e, h, r, m, d
  group2: [
    {
      symbol: '/k/', // 'c' and 'k' sound
      ipa: 'k',
      description: 'Voiceless velar plosive',
      examples: ['cat', 'back', 'kite', 'duck'],
      difficulty: 1,
      group: 'plosives',
      audioFile: 'k.m4a',
      jollyPhonicsOrder: 7
    },
    {
      symbol: '/ɛ/', // 'e' as in bed
      ipa: 'ɛ',
      description: 'Open-mid front unrounded vowel',
      examples: ['bed', 'red', 'hen', 'egg'],
      difficulty: 2,
      group: 'short_vowels',
      audioFile: 'e1.m4a',
      jollyPhonicsOrder: 8
    },
    {
      symbol: '/h/',
      ipa: 'h',
      description: 'Voiceless glottal fricative',
      examples: ['hat', 'hen', 'house', 'hand'],
      difficulty: 1,
      group: 'fricatives',
      audioFile: 'h.m4a',
      jollyPhonicsOrder: 9
    },
    {
      symbol: '/r/',
      ipa: 'r',
      description: 'Voiced postalveolar approximant',
      examples: ['red', 'run', 'car', 'arm'],
      difficulty: 4,
      group: 'liquids',
      audioFile: 'r.m4a',
      jollyPhonicsOrder: 10
    },
    {
      symbol: '/m/',
      ipa: 'm',
      description: 'Voiced bilabial nasal',
      examples: ['man', 'him', 'mouse', 'arm'],
      difficulty: 1,
      group: 'nasals',
      audioFile: 'm.m4a',
      jollyPhonicsOrder: 11
    },
    {
      symbol: '/d/',
      ipa: 'd',
      description: 'Voiced alveolar plosive',
      examples: ['dog', 'red', 'hand', 'mud'],
      difficulty: 2,
      group: 'plosives',
      audioFile: 'd.m4a',
      jollyPhonicsOrder: 12
    }
  ],

  // Group 3: g, o, u, l, f, b
  group3: [
    {
      symbol: '/g/',
      ipa: 'g',
      description: 'Voiced velar plosive',
      examples: ['go', 'big', 'dog', 'frog'],
      difficulty: 2,
      group: 'plosives',
      audioFile: 'g.m4a',
      jollyPhonicsOrder: 13
    },
    {
      symbol: '/ɒ/', // 'o' as in hot (British) or /ɑ/ in American
      ipa: 'ɑ',
      description: 'Open back unrounded vowel',
      examples: ['hot', 'dog', 'log', 'top'],
      difficulty: 2,
      group: 'short_vowels',
      audioFile: 'o1.m4a',
      jollyPhonicsOrder: 14
    },
    {
      symbol: '/ʌ/', // 'u' as in cup
      ipa: 'ʌ',
      description: 'Open-mid back unrounded vowel',
      examples: ['cup', 'run', 'sun', 'bug'],
      difficulty: 3,
      group: 'short_vowels',
      audioFile: 'u1.m4a',
      jollyPhonicsOrder: 15
    },
    {
      symbol: '/l/',
      ipa: 'l',
      description: 'Voiced alveolar lateral approximant',
      examples: ['leg', 'bell', 'log', 'fall'],
      difficulty: 4,
      group: 'liquids',
      audioFile: 'l.m4a',
      jollyPhonicsOrder: 16
    },
    {
      symbol: '/f/',
      ipa: 'f',
      description: 'Voiceless labiodental fricative',
      examples: ['fish', 'off', 'fun', 'leaf'],
      difficulty: 1,
      group: 'fricatives',
      audioFile: 'f.m4a',
      jollyPhonicsOrder: 17
    },
    {
      symbol: '/b/',
      ipa: 'b',
      description: 'Voiced bilabial plosive',
      examples: ['bat', 'cub', 'big', 'web'],
      difficulty: 1,
      group: 'plosives',
      audioFile: 'b.m4a',
      jollyPhonicsOrder: 18
    }
  ],

  // Group 4: ai, j, oa, ie, ee, or  
  group4: [
    {
      symbol: '/eɪ/', // 'ai' diphthong
      ipa: 'eɪ',
      description: 'Close-mid front to near-close near-front diphthong',
      examples: ['rain', 'play', 'day', 'make'],
      difficulty: 3,
      group: 'diphthongs',
      audioFile: 'ai.m4a',
      jollyPhonicsOrder: 19
    },
    {
      symbol: '/dʒ/',
      ipa: 'dʒ',
      description: 'Voiced postalveolar affricate',
      examples: ['jump', 'bridge', 'cage', 'jam'],
      difficulty: 3,
      group: 'affricates',
      audioFile: 'j.m4a',
      jollyPhonicsOrder: 20
    },
    {
      symbol: '/oʊ/', // 'oa' as in boat
      ipa: 'oʊ',
      description: 'Close-mid back to near-close near-back diphthong',
      examples: ['boat', 'coat', 'road', 'goat'],
      difficulty: 3,
      group: 'diphthongs',
      audioFile: 'oa.m4a',
      jollyPhonicsOrder: 21
    },
    {
      symbol: '/aɪ/', // 'ie' as in pie
      ipa: 'aɪ',
      description: 'Open front to near-close near-front diphthong',
      examples: ['pie', 'tie', 'lie', 'die'],
      difficulty: 3,
      group: 'diphthongs',
      audioFile: 'ie.m4a',
      jollyPhonicsOrder: 22
    },
    {
      symbol: '/iː/', // 'ee' as in see
      ipa: 'iː',
      description: 'Close front unrounded vowel (long)',
      examples: ['see', 'tree', 'bee', 'free'],
      difficulty: 2,
      group: 'long_vowels',
      audioFile: 'ee.m4a',
      jollyPhonicsOrder: 23
    },
    {
      symbol: '/ɔr/', // 'or' as in for
      ipa: 'ɔr',
      description: 'Open-mid back rounded vowel + r',
      examples: ['for', 'door', 'more', 'store'],
      difficulty: 3,
      group: 'r_controlled',
      audioFile: 'or.m4a',
      jollyPhonicsOrder: 24
    }
  ],

  // Group 5: z, w, ng, v, oo (short), oo (long)
  group5: [
    {
      symbol: '/z/',
      ipa: 'z',
      description: 'Voiced alveolar fricative',
      examples: ['zoo', 'buzz', 'zip', 'maze'],
      difficulty: 2,
      group: 'fricatives',
      audioFile: 'z.m4a',
      jollyPhonicsOrder: 25
    },
    {
      symbol: '/w/',
      ipa: 'w',
      description: 'Voiced labial-velar approximant',
      examples: ['win', 'well', 'way', 'snow'],
      difficulty: 2,
      group: 'semivowels',
      audioFile: 'w.m4a',
      jollyPhonicsOrder: 26
    },
    {
      symbol: '/ŋ/', // 'ng' as in sing
      ipa: 'ŋ',
      description: 'Voiced velar nasal',
      examples: ['sing', 'ring', 'long', 'hang'],
      difficulty: 3,
      group: 'nasals',
      audioFile: 'ng.m4a',
      jollyPhonicsOrder: 27
    },
    {
      symbol: '/v/',
      ipa: 'v',
      description: 'Voiced labiodental fricative',
      examples: ['van', 'five', 'love', 'have'],
      difficulty: 2,
      group: 'fricatives',
      audioFile: 'v.m4a',
      jollyPhonicsOrder: 28
    },
    {
      symbol: '/ʊ/', // 'oo' short as in book
      ipa: 'ʊ',
      description: 'Near-close near-back rounded vowel',
      examples: ['book', 'look', 'good', 'foot'],
      difficulty: 3,
      group: 'short_vowels',
      audioFile: 'oo_short.m4a',
      jollyPhonicsOrder: 29
    },
    {
      symbol: '/uː/', // 'oo' long as in moon
      ipa: 'uː',
      description: 'Close back rounded vowel (long)',
      examples: ['moon', 'food', 'blue', 'true'],
      difficulty: 2,
      group: 'long_vowels',
      audioFile: 'oo_long.m4a',
      jollyPhonicsOrder: 30
    }
  ],

  // Group 6: y, x, ch, sh, th (voiced), th (voiceless)
  group6: [
    {
      symbol: '/j/', // 'y' as consonant
      ipa: 'j',
      description: 'Voiced palatal approximant',
      examples: ['yes', 'you', 'yard', 'yet'],
      difficulty: 2,
      group: 'semivowels',
      audioFile: 'y.m4a',
      jollyPhonicsOrder: 31
    },
    {
      symbol: '/ks/', // 'x' sound
      ipa: 'ks',
      description: 'Voiceless velar plosive + voiceless alveolar fricative',
      examples: ['box', 'fox', 'six', 'fix'],
      difficulty: 2,
      group: 'consonant_clusters',
      audioFile: 'x.m4a',
      jollyPhonicsOrder: 32
    },
    {
      symbol: '/tʃ/', // 'ch' as in chair
      ipa: 'tʃ',
      description: 'Voiceless postalveolar affricate',
      examples: ['chair', 'much', 'watch', 'beach'],
      difficulty: 3,
      group: 'affricates',
      audioFile: 'ch.m4a',
      jollyPhonicsOrder: 33
    },
    {
      symbol: '/ʃ/', // 'sh' as in shop
      ipa: 'ʃ',
      description: 'Voiceless postalveolar fricative',
      examples: ['shop', 'fish', 'wish', 'cash'],
      difficulty: 3,
      group: 'fricatives',
      audioFile: 'sh.m4a',
      jollyPhonicsOrder: 34
    },
    {
      symbol: '/θ/', // 'th' voiceless as in think
      ipa: 'θ',
      description: 'Voiceless dental fricative',
      examples: ['think', 'bath', 'three', 'mouth'],
      difficulty: 5,
      group: 'fricatives',
      audioFile: 'th_voiceless.m4a',
      jollyPhonicsOrder: 35
    },
    {
      symbol: '/ð/', // 'th' voiced as in this
      ipa: 'ð',
      description: 'Voiced dental fricative',
      examples: ['this', 'that', 'the', 'mother'],
      difficulty: 5,
      group: 'fricatives',
      audioFile: 'th_voiced.m4a',
      jollyPhonicsOrder: 36
    }
  ],

  // Group 7: qu, ou, oi, ue, er, ar
  group7: [
    {
      symbol: '/kw/', // 'qu' as in queen
      ipa: 'kw',
      description: 'Voiceless velar plosive + voiced labial-velar approximant',
      examples: ['queen', 'quick', 'quiet', 'question'],
      difficulty: 2,
      group: 'consonant_clusters',
      audioFile: 'qu.m4a',
      jollyPhonicsOrder: 37
    },
    {
      symbol: '/aʊ/', // 'ou' as in house
      ipa: 'aʊ',
      description: 'Open front to near-close near-back diphthong',
      examples: ['house', 'mouse', 'about', 'cloud'],
      difficulty: 3,
      group: 'diphthongs',
      audioFile: 'ou.m4a',
      jollyPhonicsOrder: 38
    },
    {
      symbol: '/ɔɪ/', // 'oi' as in boy
      ipa: 'ɔɪ',
      description: 'Open-mid back rounded to near-close near-front diphthong',
      examples: ['boy', 'toy', 'coin', 'voice'],
      difficulty: 3,
      group: 'diphthongs',
      audioFile: 'oi.m4a',
      jollyPhonicsOrder: 39
    },
    {
      symbol: '/juː/', // 'ue' as in blue
      ipa: 'juː',
      description: 'Voiced palatal approximant + close back rounded vowel',
      examples: ['blue', 'clue', 'true', 'glue'],
      difficulty: 3,
      group: 'complex_vowels',
      audioFile: 'ue.m4a',
      jollyPhonicsOrder: 40
    },
    {
      symbol: '/ər/', // 'er' as in her
      ipa: 'ər',
      description: 'Mid-central vowel + r (rhotic)',
      examples: ['her', 'bird', 'word', 'turn'],
      difficulty: 4,
      group: 'r_controlled',
      audioFile: 'er.m4a',
      jollyPhonicsOrder: 41
    },
    {
      symbol: '/ɑr/', // 'ar' as in car
      ipa: 'ɑr',
      description: 'Open back unrounded vowel + r',
      examples: ['car', 'star', 'farm', 'park'],
      difficulty: 3,
      group: 'r_controlled',
      audioFile: 'ar.m4a',
      jollyPhonicsOrder: 42
    }
  ]
};

// ジョリーフォニックスグループをNATIVE_PHONEME_PROGRESSIONに追加
Object.assign(NATIVE_PHONEME_PROGRESSION, JOLLY_PHONICS_GROUPS);

// Export for backwards compatibility
export const PHONEME_PROGRESSION = NATIVE_PHONEME_PROGRESSION;
export const AUDIO_MAPPING = NATIVE_AUDIO_MAPPING;

// =====================================
// WORD-LEVEL PHONEME DETECTION DATA
// =====================================

export const WORD_PHONEME_PRACTICE = {
  // Jolly Phonics Group 1: s, a, t, i, p, n
  group1: {
    '/s/': {
      target: [
        { word: 'sun', japanese: '太陽', hasTarget: true },
        { word: 'sit', japanese: '座る', hasTarget: true },
        { word: 'bus', japanese: 'バス', hasTarget: true },
        { word: 'yes', japanese: 'はい', hasTarget: true }
      ],
      distractor: [
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'hat', japanese: '帽子', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'cup', japanese: 'カップ', hasTarget: false }
      ]
    },
    '/æ/': {
      target: [
        { word: 'cat', japanese: '猫', hasTarget: true },
        { word: 'hat', japanese: '帽子', hasTarget: true },
        { word: 'bag', japanese: 'かばん', hasTarget: true },
        { word: 'man', japanese: '男性', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'cup', japanese: 'カップ', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false }
      ]
    },
    '/t/': {
      target: [
        { word: 'tap', japanese: '叩く', hasTarget: true },
        { word: 'top', japanese: '頂上', hasTarget: true },
        { word: 'cat', japanese: '猫', hasTarget: true },
        { word: 'sit', japanese: '座る', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'cup', japanese: 'カップ', hasTarget: false }
      ]
    },
    '/ɪ/': {
      target: [
        { word: 'sit', japanese: '座る', hasTarget: true },
        { word: 'big', japanese: '大きい', hasTarget: true },
        { word: 'pin', japanese: 'ピン', hasTarget: true },
        { word: 'tin', japanese: '缶', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'cup', japanese: 'カップ', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'hat', japanese: '帽子', hasTarget: false }
      ]
    },
    '/p/': {
      target: [
        { word: 'pen', japanese: 'ペン', hasTarget: true },
        { word: 'pin', japanese: 'ピン', hasTarget: true },
        { word: 'cup', japanese: 'カップ', hasTarget: true },
        { word: 'tap', japanese: '叩く', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false },
        { word: 'hat', japanese: '帽子', hasTarget: false }
      ]
    },
    '/n/': {
      target: [
        { word: 'net', japanese: '網', hasTarget: true },
        { word: 'pin', japanese: 'ピン', hasTarget: true },
        { word: 'sun', japanese: '太陽', hasTarget: true },
        { word: 'tin', japanese: '缶', hasTarget: true }
      ],
      distractor: [
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'cup', japanese: 'カップ', hasTarget: false },
        { word: 'hat', japanese: '帽子', hasTarget: false },
        { word: 'tap', japanese: '叩く', hasTarget: false }
      ]
    }
  },
  
  // Jolly Phonics Group 2: c, k, e, h, r, m, d
  group2: {
    '/k/': {
      target: [
        { word: 'cat', japanese: '猫', hasTarget: true },
        { word: 'cup', japanese: 'カップ', hasTarget: true },
        { word: 'can', japanese: 'できる', hasTarget: true },
        { word: 'cut', japanese: '切る', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false },
        { word: 'hat', japanese: '帽子', hasTarget: false }
      ]
    },
    '/ɛ/': {
      target: [
        { word: 'pen', japanese: 'ペン', hasTarget: true },
        { word: 'net', japanese: '網', hasTarget: true },
        { word: 'red', japanese: '赤', hasTarget: true },
        { word: 'hen', japanese: 'めんどり', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'cup', japanese: 'カップ', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false }
      ]
    },
    '/h/': {
      target: [
        { word: 'hat', japanese: '帽子', hasTarget: true },
        { word: 'hen', japanese: 'めんどり', hasTarget: true },
        { word: 'hit', japanese: '打つ', hasTarget: true },
        { word: 'hop', japanese: '跳ぶ', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false }
      ]
    },
    '/r/': {
      target: [
        { word: 'red', japanese: '赤', hasTarget: true },
        { word: 'run', japanese: '走る', hasTarget: true },
        { word: 'rat', japanese: 'ネズミ', hasTarget: true },
        { word: 'rip', japanese: '破る', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'hat', japanese: '帽子', hasTarget: false }
      ]
    },
    '/m/': {
      target: [
        { word: 'man', japanese: '男性', hasTarget: true },
        { word: 'map', japanese: '地図', hasTarget: true },
        { word: 'mud', japanese: '泥', hasTarget: true },
        { word: 'met', japanese: '会った', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'dog', japanese: '犬', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false }
      ]
    },
    '/d/': {
      target: [
        { word: 'dog', japanese: '犬', hasTarget: true },
        { word: 'dad', japanese: 'お父さん', hasTarget: true },
        { word: 'dig', japanese: '掘る', hasTarget: true },
        { word: 'dim', japanese: '薄暗い', hasTarget: true }
      ],
      distractor: [
        { word: 'sun', japanese: '太陽', hasTarget: false },
        { word: 'cat', japanese: '猫', hasTarget: false },
        { word: 'pen', japanese: 'ペン', hasTarget: false },
        { word: 'big', japanese: '大きい', hasTarget: false },
        { word: 'run', japanese: '走る', hasTarget: false },
        { word: 'hat', japanese: '帽子', hasTarget: false }
      ]
    }
  }
  
  // Additional groups can be added here for group3-7...
};

// Helper function to generate word-level questions
export function generateWordLevelQuestion(phoneme, stage = 'group1', difficulty = 'normal') {
  const stageData = WORD_PHONEME_PRACTICE[stage];
  if (!stageData || !stageData[phoneme]) {
    logger.warn(`No word data found for phoneme ${phoneme} in stage ${stage}`);
    return null;
  }

  const { target, distractor } = stageData[phoneme];
  
  // Select one word with target phoneme
  const targetWord = target[Math.floor(Math.random() * target.length)];
  
  // Select distractor words based on difficulty
  const numDistractors = difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2;
  const selectedDistractors = [];
  
  // Randomly select distractors
  const shuffledDistractors = [...distractor].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numDistractors && i < shuffledDistractors.length; i++) {
    selectedDistractors.push(shuffledDistractors[i]);
  }
  
  // Combine and shuffle choices
  const choices = [targetWord, ...selectedDistractors].sort(() => Math.random() - 0.5);
  const correctIndex = choices.findIndex(choice => choice.hasTarget);
  
  return {
    targetPhoneme: phoneme,
    choices: choices,
    correctAnswer: correctIndex,
    questionType: 'word-detection'
  };
}