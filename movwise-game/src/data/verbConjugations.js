// Verb Conjugations Database for VerbTimeMachine Game
// 動詞活用データベース - 時制別学習システム

// Be動詞の活用
export const beVerbConjugations = {
  present: {
    'I': 'am',
    'you': 'are',
    'he': 'is',
    'she': 'is',
    'it': 'is',
    'we': 'are',
    'they': 'are'
  },
  past: {
    'I': 'was',
    'you': 'were',
    'he': 'was',
    'she': 'was',
    'it': 'was',
    'we': 'were',
    'they': 'were'
  },
  perfect: {
    'I': 'have been',
    'you': 'have been',
    'he': 'has been',
    'she': 'has been',
    'it': 'has been',
    'we': 'have been',
    'they': 'have been'
  }
}

// 規則動詞の活用パターン
export const regularVerbPatterns = {
  // 基本的な規則動詞
  basic: [
    {
      infinitive: 'play',
      present: 'play/plays',
      past: 'played',
      pastParticiple: 'played',
      presentParticiple: 'playing',
      meaning: '遊ぶ、演奏する',
      examples: {
        present: 'I play soccer every day.',
        past: 'I played soccer yesterday.',
        perfect: 'I have played soccer for 5 years.',
        progressive: 'I am playing soccer now.'
      }
    },
    {
      infinitive: 'study',
      present: 'study/studies',
      past: 'studied',
      pastParticiple: 'studied',
      presentParticiple: 'studying',
      meaning: '勉強する',
      examples: {
        present: 'She studies English.',
        past: 'She studied English last night.',
        perfect: 'She has studied English for 3 years.',
        progressive: 'She is studying English now.'
      }
    },
    {
      infinitive: 'walk',
      present: 'walk/walks',
      past: 'walked',
      pastParticiple: 'walked',
      presentParticiple: 'walking',
      meaning: '歩く',
      examples: {
        present: 'We walk to school.',
        past: 'We walked to school yesterday.',
        perfect: 'We have walked this route many times.',
        progressive: 'We are walking to school now.'
      }
    },
    {
      infinitive: 'talk',
      present: 'talk/talks',
      past: 'talked',
      pastParticiple: 'talked',
      presentParticiple: 'talking',
      meaning: '話す',
      examples: {
        present: 'They talk loudly.',
        past: 'They talked for hours.',
        perfect: 'They have talked about this before.',
        progressive: 'They are talking right now.'
      }
    },
    {
      infinitive: 'work',
      present: 'work/works',
      past: 'worked',
      pastParticiple: 'worked',
      presentParticiple: 'working',
      meaning: '働く',
      examples: {
        present: 'He works hard.',
        past: 'He worked late yesterday.',
        perfect: 'He has worked here for 2 years.',
        progressive: 'He is working on a project.'
      }
    }
  ],
  
  // Y ending verbs (y → ied)
  yEnding: [
    {
      infinitive: 'try',
      present: 'try/tries',
      past: 'tried',
      pastParticiple: 'tried',
      presentParticiple: 'trying',
      meaning: '試す、努力する',
      examples: {
        present: 'I try my best.',
        past: 'I tried to call you.',
        perfect: 'I have tried this before.',
        progressive: 'I am trying to understand.'
      }
    },
    {
      infinitive: 'cry',
      present: 'cry/cries',
      past: 'cried',
      pastParticiple: 'cried',
      presentParticiple: 'crying',
      meaning: '泣く',
      examples: {
        present: 'The baby cries often.',
        past: 'The baby cried all night.',
        perfect: 'The baby has cried for an hour.',
        progressive: 'The baby is crying now.'
      }
    }
  ]
}

// 不規則動詞データベース
export const irregularVerbDatabase = {
  // 頻出不規則動詞（初級）
  beginner: [
    {
      infinitive: 'go',
      present: 'go/goes',
      past: 'went',
      pastParticiple: 'gone',
      presentParticiple: 'going',
      meaning: '行く',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I go to school.',
        past: 'I went to the store.',
        perfect: 'I have gone there many times.',
        progressive: 'I am going home now.'
      },
      timeTravel: {
        present: { scene: '現在の教室', action: 'go to school' },
        past: { scene: '昨日の店', action: 'went to the store' },
        perfect: { scene: '経験の蓄積', action: 'have gone there before' }
      }
    },
    {
      infinitive: 'eat',
      present: 'eat/eats',
      past: 'ate',
      pastParticiple: 'eaten',
      presentParticiple: 'eating',
      meaning: '食べる',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I eat breakfast.',
        past: 'I ate dinner.',
        perfect: 'I have eaten sushi.',
        progressive: 'I am eating lunch.'
      },
      timeTravel: {
        present: { scene: '朝の食卓', action: 'eat breakfast' },
        past: { scene: '昨夜の食卓', action: 'ate dinner' },
        perfect: { scene: '寿司の経験', action: 'have eaten sushi' }
      }
    },
    {
      infinitive: 'see',
      present: 'see/sees',
      past: 'saw',
      pastParticiple: 'seen',
      presentParticiple: 'seeing',
      meaning: '見る',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I see the bird.',
        past: 'I saw a movie.',
        perfect: 'I have seen this before.',
        progressive: 'I am seeing a doctor.'
      },
      timeTravel: {
        present: { scene: '窓の外', action: 'see the bird' },
        past: { scene: '映画館', action: 'saw a movie' },
        perfect: { scene: '既視感', action: 'have seen this before' }
      }
    },
    {
      infinitive: 'come',
      present: 'come/comes',
      past: 'came',
      pastParticiple: 'come',
      presentParticiple: 'coming',
      meaning: '来る',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'Please come here.',
        past: 'She came yesterday.',
        perfect: 'They have come early.',
        progressive: 'He is coming now.'
      },
      timeTravel: {
        present: { scene: '招待の瞬間', action: 'come here' },
        past: { scene: '昨日の訪問', action: 'came yesterday' },
        perfect: { scene: '早期到着', action: 'have come early' }
      }
    },
    {
      infinitive: 'take',
      present: 'take/takes',
      past: 'took',
      pastParticiple: 'taken',
      presentParticiple: 'taking',
      meaning: '取る、持っていく',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I take the bus.',
        past: 'I took a photo.',
        perfect: 'I have taken this class.',
        progressive: 'I am taking notes.'
      },
      timeTravel: {
        present: { scene: 'バス停', action: 'take the bus' },
        past: { scene: '写真撮影', action: 'took a photo' },
        perfect: { scene: '授業経験', action: 'have taken this class' }
      }
    },
    // 新規追加 - 初級動詞 6-50
    {
      infinitive: 'get',
      present: 'get/gets',
      past: 'got',
      pastParticiple: 'gotten',
      presentParticiple: 'getting',
      meaning: '得る、もらう',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I get up early.',
        past: 'I got a present.',
        perfect: 'I have gotten better.',
        progressive: 'I am getting ready.'
      }
    },
    {
      infinitive: 'have',
      present: 'have/has',
      past: 'had',
      pastParticiple: 'had',
      presentParticiple: 'having',
      meaning: '持っている',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I have a dog.',
        past: 'I had lunch.',
        perfect: 'I have had this car for years.',
        progressive: 'I am having fun.'
      }
    },
    {
      infinitive: 'do',
      present: 'do/does',
      past: 'did',
      pastParticiple: 'done',
      presentParticiple: 'doing',
      meaning: 'する',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I do homework.',
        past: 'I did my best.',
        perfect: 'I have done this before.',
        progressive: 'I am doing fine.'
      }
    },
    {
      infinitive: 'say',
      present: 'say/says',
      past: 'said',
      pastParticiple: 'said',
      presentParticiple: 'saying',
      meaning: '言う',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I say hello.',
        past: 'I said yes.',
        perfect: 'I have said enough.',
        progressive: 'I am saying goodbye.'
      }
    },
    {
      infinitive: 'make',
      present: 'make/makes',
      past: 'made',
      pastParticiple: 'made',
      presentParticiple: 'making',
      meaning: '作る',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I make coffee.',
        past: 'I made a cake.',
        perfect: 'I have made friends.',
        progressive: 'I am making dinner.'
      }
    },
    {
      infinitive: 'know',
      present: 'know/knows',
      past: 'knew',
      pastParticiple: 'known',
      presentParticiple: 'knowing',
      meaning: '知っている',
      difficulty: 'medium',
      frequency: 'very-high',
      examples: {
        present: 'I know her name.',
        past: 'I knew it was true.',
        perfect: 'I have known him for years.',
        progressive: 'I am knowing more.'
      }
    },
    {
      infinitive: 'think',
      present: 'think/thinks',
      past: 'thought',
      pastParticiple: 'thought',
      presentParticiple: 'thinking',
      meaning: '考える',
      difficulty: 'medium',
      frequency: 'very-high',
      examples: {
        present: 'I think it\'s good.',
        past: 'I thought about it.',
        perfect: 'I have thought carefully.',
        progressive: 'I am thinking now.'
      }
    },
    {
      infinitive: 'give',
      present: 'give/gives',
      past: 'gave',
      pastParticiple: 'given',
      presentParticiple: 'giving',
      meaning: '与える',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I give presents.',
        past: 'I gave him money.',
        perfect: 'I have given my best.',
        progressive: 'I am giving a speech.'
      }
    },
    {
      infinitive: 'find',
      present: 'find/finds',
      past: 'found',
      pastParticiple: 'found',
      presentParticiple: 'finding',
      meaning: '見つける',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I find my keys.',
        past: 'I found a wallet.',
        perfect: 'I have found the answer.',
        progressive: 'I am finding it difficult.'
      }
    },
    {
      infinitive: 'tell',
      present: 'tell/tells',
      past: 'told',
      pastParticiple: 'told',
      presentParticiple: 'telling',
      meaning: '言う、話す',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I tell stories.',
        past: 'I told the truth.',
        perfect: 'I have told you before.',
        progressive: 'I am telling a joke.'
      }
    },
    {
      infinitive: 'put',
      present: 'put/puts',
      past: 'put',
      pastParticiple: 'put',
      presentParticiple: 'putting',
      meaning: '置く',
      difficulty: 'easy',
      frequency: 'high',
      examples: {
        present: 'I put books here.',
        past: 'I put it on the table.',
        perfect: 'I have put it away.',
        progressive: 'I am putting on shoes.'
      }
    },
    {
      infinitive: 'read',
      present: 'read/reads',
      past: 'read',
      pastParticiple: 'read',
      presentParticiple: 'reading',
      meaning: '読む',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I read books.',
        past: 'I read the news.',
        perfect: 'I have read this book.',
        progressive: 'I am reading now.'
      }
    },
    {
      infinitive: 'write',
      present: 'write/writes',
      past: 'wrote',
      pastParticiple: 'written',
      presentParticiple: 'writing',
      meaning: '書く',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I write letters.',
        past: 'I wrote a note.',
        perfect: 'I have written a book.',
        progressive: 'I am writing an email.'
      }
    },
    {
      infinitive: 'run',
      present: 'run/runs',
      past: 'ran',
      pastParticiple: 'run',
      presentParticiple: 'running',
      meaning: '走る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I run every day.',
        past: 'I ran to school.',
        perfect: 'I have run a marathon.',
        progressive: 'I am running late.'
      }
    },
    {
      infinitive: 'sit',
      present: 'sit/sits',
      past: 'sat',
      pastParticiple: 'sat',
      presentParticiple: 'sitting',
      meaning: '座る',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I sit on the chair.',
        past: 'I sat down.',
        perfect: 'I have sat here before.',
        progressive: 'I am sitting quietly.'
      }
    },
    {
      infinitive: 'stand',
      present: 'stand/stands',
      past: 'stood',
      pastParticiple: 'stood',
      presentParticiple: 'standing',
      meaning: '立つ',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I stand up.',
        past: 'I stood by the door.',
        perfect: 'I have stood here before.',
        progressive: 'I am standing in line.'
      }
    },
    {
      infinitive: 'buy',
      present: 'buy/buys',
      past: 'bought',
      pastParticiple: 'bought',
      presentParticiple: 'buying',
      meaning: '買う',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I buy food.',
        past: 'I bought a car.',
        perfect: 'I have bought this before.',
        progressive: 'I am buying groceries.'
      }
    },
    {
      infinitive: 'bring',
      present: 'bring/brings',
      past: 'brought',
      pastParticiple: 'brought',
      presentParticiple: 'bringing',
      meaning: '持ってくる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I bring lunch.',
        past: 'I brought a gift.',
        perfect: 'I have brought everything.',
        progressive: 'I am bringing a friend.'
      }
    },
    {
      infinitive: 'feel',
      present: 'feel/feels',
      past: 'felt',
      pastParticiple: 'felt',
      presentParticiple: 'feeling',
      meaning: '感じる',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I feel happy.',
        past: 'I felt sad.',
        perfect: 'I have felt this before.',
        progressive: 'I am feeling better.'
      }
    },
    {
      infinitive: 'hear',
      present: 'hear/hears',
      past: 'heard',
      pastParticiple: 'heard',
      presentParticiple: 'hearing',
      meaning: '聞く',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I hear music.',
        past: 'I heard the news.',
        perfect: 'I have heard this song.',
        progressive: 'I am hearing voices.'
      }
    },
    {
      infinitive: 'sleep',
      present: 'sleep/sleeps',
      past: 'slept',
      pastParticiple: 'slept',
      presentParticiple: 'sleeping',
      meaning: '眠る',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I sleep early.',
        past: 'I slept well.',
        perfect: 'I have slept 8 hours.',
        progressive: 'I am sleeping now.'
      }
    },
    {
      infinitive: 'meet',
      present: 'meet/meets',
      past: 'met',
      pastParticiple: 'met',
      presentParticiple: 'meeting',
      meaning: '会う',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I meet friends.',
        past: 'I met him yesterday.',
        perfect: 'I have met her before.',
        progressive: 'I am meeting clients.'
      }
    },
    {
      infinitive: 'leave',
      present: 'leave/leaves',
      past: 'left',
      pastParticiple: 'left',
      presentParticiple: 'leaving',
      meaning: '去る、出発する',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I leave at 9.',
        past: 'I left early.',
        perfect: 'I have left already.',
        progressive: 'I am leaving now.'
      }
    },
    {
      infinitive: 'speak',
      present: 'speak/speaks',
      past: 'spoke',
      pastParticiple: 'spoken',
      presentParticiple: 'speaking',
      meaning: '話す',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I speak English.',
        past: 'I spoke to her.',
        perfect: 'I have spoken before.',
        progressive: 'I am speaking now.'
      }
    },
    {
      infinitive: 'keep',
      present: 'keep/keeps',
      past: 'kept',
      pastParticiple: 'kept',
      presentParticiple: 'keeping',
      meaning: '保つ、維持する',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I keep secrets.',
        past: 'I kept the promise.',
        perfect: 'I have kept it safe.',
        progressive: 'I am keeping busy.'
      }
    },
    {
      infinitive: 'hold',
      present: 'hold/holds',
      past: 'held',
      pastParticiple: 'held',
      presentParticiple: 'holding',
      meaning: '持つ、握る',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I hold the baby.',
        past: 'I held his hand.',
        perfect: 'I have held this before.',
        progressive: 'I am holding it now.'
      }
    },
    {
      infinitive: 'send',
      present: 'send/sends',
      past: 'sent',
      pastParticiple: 'sent',
      presentParticiple: 'sending',
      meaning: '送る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I send emails.',
        past: 'I sent a letter.',
        perfect: 'I have sent the package.',
        progressive: 'I am sending it now.'
      }
    },
    {
      infinitive: 'build',
      present: 'build/builds',
      past: 'built',
      pastParticiple: 'built',
      presentParticiple: 'building',
      meaning: '建てる、作る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I build houses.',
        past: 'I built a castle.',
        perfect: 'I have built many things.',
        progressive: 'I am building a tower.'
      }
    },
    {
      infinitive: 'win',
      present: 'win/wins',
      past: 'won',
      pastParticiple: 'won',
      presentParticiple: 'winning',
      meaning: '勝つ',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I win games.',
        past: 'I won the race.',
        perfect: 'I have won before.',
        progressive: 'I am winning now.'
      }
    },
    {
      infinitive: 'lose',
      present: 'lose/loses',
      past: 'lost',
      pastParticiple: 'lost',
      presentParticiple: 'losing',
      meaning: '失う、負ける',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I lose my keys.',
        past: 'I lost the game.',
        perfect: 'I have lost weight.',
        progressive: 'I am losing hope.'
      }
    },
    {
      infinitive: 'break',
      present: 'break/breaks',
      past: 'broke',
      pastParticiple: 'broken',
      presentParticiple: 'breaking',
      meaning: '壊す、破る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I break the rules.',
        past: 'I broke the vase.',
        perfect: 'I have broken my phone.',
        progressive: 'I am breaking up.'
      }
    },
    {
      infinitive: 'cut',
      present: 'cut/cuts',
      past: 'cut',
      pastParticiple: 'cut',
      presentParticiple: 'cutting',
      meaning: '切る',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I cut paper.',
        past: 'I cut my hair.',
        perfect: 'I have cut it short.',
        progressive: 'I am cutting vegetables.'
      }
    },
    {
      infinitive: 'grow',
      present: 'grow/grows',
      past: 'grew',
      pastParticiple: 'grown',
      presentParticiple: 'growing',
      meaning: '成長する、育てる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I grow flowers.',
        past: 'I grew up here.',
        perfect: 'I have grown taller.',
        progressive: 'I am growing plants.'
      }
    },
    {
      infinitive: 'sell',
      present: 'sell/sells',
      past: 'sold',
      pastParticiple: 'sold',
      presentParticiple: 'selling',
      meaning: '売る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I sell books.',
        past: 'I sold my car.',
        perfect: 'I have sold everything.',
        progressive: 'I am selling cookies.'
      }
    },
    {
      infinitive: 'pay',
      present: 'pay/pays',
      past: 'paid',
      pastParticiple: 'paid',
      presentParticiple: 'paying',
      meaning: '支払う',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I pay bills.',
        past: 'I paid for dinner.',
        perfect: 'I have paid already.',
        progressive: 'I am paying now.'
      }
    },
    {
      infinitive: 'catch',
      present: 'catch/catches',
      past: 'caught',
      pastParticiple: 'caught',
      presentParticiple: 'catching',
      meaning: '捕まえる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I catch fish.',
        past: 'I caught a cold.',
        perfect: 'I have caught the ball.',
        progressive: 'I am catching up.'
      }
    },
    {
      infinitive: 'throw',
      present: 'throw/throws',
      past: 'threw',
      pastParticiple: 'thrown',
      presentParticiple: 'throwing',
      meaning: '投げる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I throw the ball.',
        past: 'I threw it away.',
        perfect: 'I have thrown it far.',
        progressive: 'I am throwing a party.'
      }
    },
    {
      infinitive: 'wear',
      present: 'wear/wears',
      past: 'wore',
      pastParticiple: 'worn',
      presentParticiple: 'wearing',
      meaning: '着る',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I wear glasses.',
        past: 'I wore a dress.',
        perfect: 'I have worn this before.',
        progressive: 'I am wearing blue.'
      }
    },
    {
      infinitive: 'drive',
      present: 'drive/drives',
      past: 'drove',
      pastParticiple: 'driven',
      presentParticiple: 'driving',
      meaning: '運転する',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I drive to work.',
        past: 'I drove home.',
        perfect: 'I have driven for hours.',
        progressive: 'I am driving now.'
      }
    },
    {
      infinitive: 'fall',
      present: 'fall/falls',
      past: 'fell',
      pastParticiple: 'fallen',
      presentParticiple: 'falling',
      meaning: '落ちる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'Leaves fall down.',
        past: 'I fell asleep.',
        perfect: 'I have fallen before.',
        progressive: 'I am falling behind.'
      }
    },
    {
      infinitive: 'draw',
      present: 'draw/draws',
      past: 'drew',
      pastParticiple: 'drawn',
      presentParticiple: 'drawing',
      meaning: '描く',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I draw pictures.',
        past: 'I drew a map.',
        perfect: 'I have drawn this before.',
        progressive: 'I am drawing now.'
      }
    },
    {
      infinitive: 'fly',
      present: 'fly/flies',
      past: 'flew',
      pastParticiple: 'flown',
      presentParticiple: 'flying',
      meaning: '飛ぶ',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'Birds fly high.',
        past: 'I flew to Japan.',
        perfect: 'I have flown before.',
        progressive: 'The plane is flying.'
      }
    },
    {
      infinitive: 'swim',
      present: 'swim/swims',
      past: 'swam',
      pastParticiple: 'swum',
      presentParticiple: 'swimming',
      meaning: '泳ぐ',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I swim every day.',
        past: 'I swam in the ocean.',
        perfect: 'I have swum here before.',
        progressive: 'I am swimming now.'
      }
    },
    {
      infinitive: 'sing',
      present: 'sing/sings',
      past: 'sang',
      pastParticiple: 'sung',
      presentParticiple: 'singing',
      meaning: '歌う',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I sing songs.',
        past: 'I sang loudly.',
        perfect: 'I have sung this before.',
        progressive: 'I am singing now.'
      }
    },
    {
      infinitive: 'ride',
      present: 'ride/rides',
      past: 'rode',
      pastParticiple: 'ridden',
      presentParticiple: 'riding',
      meaning: '乗る',
      difficulty: 'easy',
      frequency: 'medium',
      examples: {
        present: 'I ride a bike.',
        past: 'I rode the bus.',
        perfect: 'I have ridden horses.',
        progressive: 'I am riding home.'
      }
    },
    {
      infinitive: 'hide',
      present: 'hide/hides',
      past: 'hid',
      pastParticiple: 'hidden',
      presentParticiple: 'hiding',
      meaning: '隠れる、隠す',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I hide my toys.',
        past: 'I hid behind the tree.',
        perfect: 'I have hidden it well.',
        progressive: 'I am hiding now.'
      }
    },
    {
      infinitive: 'forget',
      present: 'forget/forgets',
      past: 'forgot',
      pastParticiple: 'forgotten',
      presentParticiple: 'forgetting',
      meaning: '忘れる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I forget names.',
        past: 'I forgot my keys.',
        perfect: 'I have forgotten already.',
        progressive: 'I am forgetting things.'
      }
    },
    {
      infinitive: 'understand',
      present: 'understand/understands',
      past: 'understood',
      pastParticiple: 'understood',
      presentParticiple: 'understanding',
      meaning: '理解する',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I understand you.',
        past: 'I understood the lesson.',
        perfect: 'I have understood it now.',
        progressive: 'I am understanding more.'
      }
    }
  ],
  
  // 中級不規則動詞
  intermediate: [
    {
      infinitive: 'make',
      present: 'make/makes',
      past: 'made',
      pastParticiple: 'made',
      presentParticiple: 'making',
      meaning: '作る',
      difficulty: 'easy',
      frequency: 'very-high',
      examples: {
        present: 'I make cookies.',
        past: 'I made a mistake.',
        perfect: 'I have made progress.',
        progressive: 'I am making dinner.'
      }
    },
    {
      infinitive: 'give',
      present: 'give/gives',
      past: 'gave',
      pastParticiple: 'given',
      presentParticiple: 'giving',
      meaning: '与える',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I give presents.',
        past: 'I gave him a book.',
        perfect: 'I have given my best.',
        progressive: 'I am giving a speech.'
      }
    },
    {
      infinitive: 'know',
      present: 'know/knows',
      past: 'knew',
      pastParticiple: 'known',
      presentParticiple: 'knowing',
      meaning: '知っている',
      difficulty: 'hard',
      frequency: 'very-high',
      examples: {
        present: 'I know the answer.',
        past: 'I knew it was true.',
        perfect: 'I have known him for years.',
        progressive: 'I am knowing more each day.' // Note: usually not used in progressive
      }
    },
    // 新規追加 - 中級動詞 4-50
    {
      infinitive: 'think',
      present: 'think/thinks',
      past: 'thought',
      pastParticiple: 'thought',
      presentParticiple: 'thinking',
      meaning: '考える',
      difficulty: 'medium',
      frequency: 'very-high',
      examples: {
        present: 'I think it\'s good.',
        past: 'I thought about it.',
        perfect: 'I have thought this before.',
        progressive: 'I am thinking hard.'
      }
    },
    {
      infinitive: 'find',
      present: 'find/finds',
      past: 'found',
      pastParticiple: 'found',
      presentParticiple: 'finding',
      meaning: '見つける',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I find my keys.',
        past: 'I found a solution.',
        perfect: 'I have found the answer.',
        progressive: 'I am finding it difficult.'
      }
    },
    {
      infinitive: 'tell',
      present: 'tell/tells',
      past: 'told',
      pastParticiple: 'told',
      presentParticiple: 'telling',
      meaning: '言う、教える',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I tell the truth.',
        past: 'I told her a story.',
        perfect: 'I have told you before.',
        progressive: 'I am telling a joke.'
      }
    },
    {
      infinitive: 'keep',
      present: 'keep/keeps',
      past: 'kept',
      pastParticiple: 'kept',
      presentParticiple: 'keeping',
      meaning: '保つ、守る',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I keep my promise.',
        past: 'I kept the secret.',
        perfect: 'I have kept this for years.',
        progressive: 'I am keeping busy.'
      }
    },
    {
      infinitive: 'hold',
      present: 'hold/holds',
      past: 'held',
      pastParticiple: 'held',
      presentParticiple: 'holding',
      meaning: '持つ、開催する',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I hold the door.',
        past: 'I held a meeting.',
        perfect: 'I have held this position.',
        progressive: 'I am holding a book.'
      }
    },
    {
      infinitive: 'send',
      present: 'send/sends',
      past: 'sent',
      pastParticiple: 'sent',
      presentParticiple: 'sending',
      meaning: '送る',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I send emails.',
        past: 'I sent a letter.',
        perfect: 'I have sent the package.',
        progressive: 'I am sending a message.'
      }
    },
    {
      infinitive: 'build',
      present: 'build/builds',
      past: 'built',
      pastParticiple: 'built',
      presentParticiple: 'building',
      meaning: '建てる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I build houses.',
        past: 'I built a model.',
        perfect: 'I have built many projects.',
        progressive: 'I am building a website.'
      }
    },
    {
      infinitive: 'lose',
      present: 'lose/loses',
      past: 'lost',
      pastParticiple: 'lost',
      presentParticiple: 'losing',
      meaning: '失う、負ける',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I lose my keys.',
        past: 'I lost the game.',
        perfect: 'I have lost weight.',
        progressive: 'I am losing patience.'
      }
    },
    {
      infinitive: 'break',
      present: 'break/breaks',
      past: 'broke',
      pastParticiple: 'broken',
      presentParticiple: 'breaking',
      meaning: '壊す',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I break the rules.',
        past: 'I broke the vase.',
        perfect: 'I have broken my promise.',
        progressive: 'I am breaking bad habits.'
      }
    },
    {
      infinitive: 'grow',
      present: 'grow/grows',
      past: 'grew',
      pastParticiple: 'grown',
      presentParticiple: 'growing',
      meaning: '育つ、成長する',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'Plants grow fast.',
        past: 'I grew vegetables.',
        perfect: 'I have grown taller.',
        progressive: 'I am growing older.'
      }
    },
    {
      infinitive: 'sell',
      present: 'sell/sells',
      past: 'sold',
      pastParticiple: 'sold',
      presentParticiple: 'selling',
      meaning: '売る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I sell books.',
        past: 'I sold my car.',
        perfect: 'I have sold everything.',
        progressive: 'I am selling cookies.'
      }
    },
    {
      infinitive: 'pay',
      present: 'pay/pays',
      past: 'paid',
      pastParticiple: 'paid',
      presentParticiple: 'paying',
      meaning: '払う',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I pay the bill.',
        past: 'I paid too much.',
        perfect: 'I have paid my taxes.',
        progressive: 'I am paying attention.'
      }
    },
    {
      infinitive: 'catch',
      present: 'catch/catches',
      past: 'caught',
      pastParticiple: 'caught',
      presentParticiple: 'catching',
      meaning: '捕まえる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I catch the ball.',
        past: 'I caught a fish.',
        perfect: 'I have caught a cold.',
        progressive: 'I am catching up.'
      }
    },
    {
      infinitive: 'throw',
      present: 'throw/throws',
      past: 'threw',
      pastParticiple: 'thrown',
      presentParticiple: 'throwing',
      meaning: '投げる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I throw the ball.',
        past: 'I threw it away.',
        perfect: 'I have thrown many parties.',
        progressive: 'I am throwing a surprise.'
      }
    },
    {
      infinitive: 'wear',
      present: 'wear/wears',
      past: 'wore',
      pastParticiple: 'worn',
      presentParticiple: 'wearing',
      meaning: '着る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I wear glasses.',
        past: 'I wore a suit.',
        perfect: 'I have worn this dress.',
        progressive: 'I am wearing red.'
      }
    },
    {
      infinitive: 'drive',
      present: 'drive/drives',
      past: 'drove',
      pastParticiple: 'driven',
      presentParticiple: 'driving',
      meaning: '運転する',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I drive to work.',
        past: 'I drove all night.',
        perfect: 'I have driven this route.',
        progressive: 'I am driving carefully.'
      }
    },
    {
      infinitive: 'fall',
      present: 'fall/falls',
      past: 'fell',
      pastParticiple: 'fallen',
      presentParticiple: 'falling',
      meaning: '落ちる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'Leaves fall down.',
        past: 'I fell asleep.',
        perfect: 'I have fallen in love.',
        progressive: 'I am falling behind.'
      }
    },
    {
      infinitive: 'draw',
      present: 'draw/draws',
      past: 'drew',
      pastParticiple: 'drawn',
      presentParticiple: 'drawing',
      meaning: '描く、引く',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I draw pictures.',
        past: 'I drew a map.',
        perfect: 'I have drawn conclusions.',
        progressive: 'I am drawing a line.'
      }
    },
    {
      infinitive: 'feel',
      present: 'feel/feels',
      past: 'felt',
      pastParticiple: 'felt',
      presentParticiple: 'feeling',
      meaning: '感じる',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I feel happy.',
        past: 'I felt tired.',
        perfect: 'I have felt this way.',
        progressive: 'I am feeling better.'
      }
    },
    {
      infinitive: 'hear',
      present: 'hear/hears',
      past: 'heard',
      pastParticiple: 'heard',
      presentParticiple: 'hearing',
      meaning: '聞く、聞こえる',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I hear music.',
        past: 'I heard the news.',
        perfect: 'I have heard this song.',
        progressive: 'I am hearing voices.'
      }
    },
    {
      infinitive: 'win',
      present: 'win/wins',
      past: 'won',
      pastParticiple: 'won',
      presentParticiple: 'winning',
      meaning: '勝つ',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I win games.',
        past: 'I won the prize.',
        perfect: 'I have won many times.',
        progressive: 'I am winning the race.'
      }
    },
    {
      infinitive: 'cut',
      present: 'cut/cuts',
      past: 'cut',
      pastParticiple: 'cut',
      presentParticiple: 'cutting',
      meaning: '切る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I cut the paper.',
        past: 'I cut my hair.',
        perfect: 'I have cut the rope.',
        progressive: 'I am cutting vegetables.'
      }
    },
    {
      infinitive: 'understand',
      present: 'understand/understands',
      past: 'understood',
      pastParticiple: 'understood',
      presentParticiple: 'understanding',
      meaning: '理解する',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I understand English.',
        past: 'I understood the lesson.',
        perfect: 'I have understood the problem.',
        progressive: 'I am understanding better.'
      }
    },
    {
      infinitive: 'become',
      present: 'become/becomes',
      past: 'became',
      pastParticiple: 'become',
      presentParticiple: 'becoming',
      meaning: 'になる',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I become tired.',
        past: 'I became a teacher.',
        perfect: 'I have become stronger.',
        progressive: 'I am becoming confident.'
      }
    },
    {
      infinitive: 'set',
      present: 'set/sets',
      past: 'set',
      pastParticiple: 'set',
      presentParticiple: 'setting',
      meaning: '置く、設定する',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I set the table.',
        past: 'I set the alarm.',
        perfect: 'I have set a goal.',
        progressive: 'I am setting up.'
      }
    },
    {
      infinitive: 'let',
      present: 'let/lets',
      past: 'let',
      pastParticiple: 'let',
      presentParticiple: 'letting',
      meaning: 'させる',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I let him go.',
        past: 'I let her help.',
        perfect: 'I have let this happen.',
        progressive: 'I am letting you know.'
      }
    },
    {
      infinitive: 'mean',
      present: 'mean/means',
      past: 'meant',
      pastParticiple: 'meant',
      presentParticiple: 'meaning',
      meaning: '意味する',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'This means a lot.',
        past: 'I meant to call.',
        perfect: 'I have meant what I said.',
        progressive: 'I am meaning to help.'
      }
    },
    {
      infinitive: 'leave',
      present: 'leave/leaves',
      past: 'left',
      pastParticiple: 'left',
      presentParticiple: 'leaving',
      meaning: '去る、残す',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I leave at 5 PM.',
        past: 'I left early.',
        perfect: 'I have left my keys.',
        progressive: 'I am leaving now.'
      }
    },
    {
      infinitive: 'turn',
      present: 'turn/turns',
      past: 'turned',
      pastParticiple: 'turned',
      presentParticiple: 'turning',
      meaning: '回る、向く',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I turn left.',
        past: 'I turned around.',
        perfect: 'I have turned 30.',
        progressive: 'I am turning the page.'
      }
    },
    {
      infinitive: 'begin',
      present: 'begin/begins',
      past: 'began',
      pastParticiple: 'begun',
      presentParticiple: 'beginning',
      meaning: '始める',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'Classes begin at 9.',
        past: 'I began studying.',
        perfect: 'I have begun my project.',
        progressive: 'I am beginning to understand.'
      }
    },
    {
      infinitive: 'show',
      present: 'show/shows',
      past: 'showed',
      pastParticiple: 'shown',
      presentParticiple: 'showing',
      meaning: '見せる',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I show pictures.',
        past: 'I showed him the way.',
        perfect: 'I have shown my work.',
        progressive: 'I am showing off.'
      }
    },
    {
      infinitive: 'put',
      present: 'put/puts',
      past: 'put',
      pastParticiple: 'put',
      presentParticiple: 'putting',
      meaning: '置く',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I put it here.',
        past: 'I put on my coat.',
        perfect: 'I have put effort in.',
        progressive: 'I am putting things away.'
      }
    },
    {
      infinitive: 'bring',
      present: 'bring/brings',
      past: 'brought',
      pastParticiple: 'brought',
      presentParticiple: 'bringing',
      meaning: '持ってくる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I bring lunch.',
        past: 'I brought gifts.',
        perfect: 'I have brought good news.',
        progressive: 'I am bringing friends.'
      }
    },
    {
      infinitive: 'meet',
      present: 'meet/meets',
      past: 'met',
      pastParticiple: 'met',
      presentParticiple: 'meeting',
      meaning: '会う',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I meet friends.',
        past: 'I met her yesterday.',
        perfect: 'I have met many people.',
        progressive: 'I am meeting the boss.'
      }
    },
    {
      infinitive: 'speak',
      present: 'speak/speaks',
      past: 'spoke',
      pastParticiple: 'spoken',
      presentParticiple: 'speaking',
      meaning: '話す',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I speak English.',
        past: 'I spoke to him.',
        perfect: 'I have spoken the truth.',
        progressive: 'I am speaking loudly.'
      }
    },
    {
      infinitive: 'write',
      present: 'write/writes',
      past: 'wrote',
      pastParticiple: 'written',
      presentParticiple: 'writing',
      meaning: '書く',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I write letters.',
        past: 'I wrote a book.',
        perfect: 'I have written many essays.',
        progressive: 'I am writing code.'
      }
    },
    {
      infinitive: 'read',
      present: 'read/reads',
      past: 'read',
      pastParticiple: 'read',
      presentParticiple: 'reading',
      meaning: '読む',
      difficulty: 'medium',
      frequency: 'high',
      examples: {
        present: 'I read books.',
        past: 'I read the news.',
        perfect: 'I have read this story.',
        progressive: 'I am reading now.'
      }
    },
    {
      infinitive: 'run',
      present: 'run/runs',
      past: 'ran',
      pastParticiple: 'run',
      presentParticiple: 'running',
      meaning: '走る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I run every day.',
        past: 'I ran to school.',
        perfect: 'I have run marathons.',
        progressive: 'I am running late.'
      }
    },
    {
      infinitive: 'sit',
      present: 'sit/sits',
      past: 'sat',
      pastParticiple: 'sat',
      presentParticiple: 'sitting',
      meaning: '座る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I sit on a chair.',
        past: 'I sat down.',
        perfect: 'I have sat here before.',
        progressive: 'I am sitting comfortably.'
      }
    },
    {
      infinitive: 'stand',
      present: 'stand/stands',
      past: 'stood',
      pastParticiple: 'stood',
      presentParticiple: 'standing',
      meaning: '立つ',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I stand up.',
        past: 'I stood in line.',
        perfect: 'I have stood here for hours.',
        progressive: 'I am standing by the door.'
      }
    },
    {
      infinitive: 'buy',
      present: 'buy/buys',
      past: 'bought',
      pastParticiple: 'bought',
      presentParticiple: 'buying',
      meaning: '買う',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I buy groceries.',
        past: 'I bought a car.',
        perfect: 'I have bought everything.',
        progressive: 'I am buying a house.'
      }
    },
    {
      infinitive: 'sleep',
      present: 'sleep/sleeps',
      past: 'slept',
      pastParticiple: 'slept',
      presentParticiple: 'sleeping',
      meaning: '眠る',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I sleep well.',
        past: 'I slept late.',
        perfect: 'I have slept enough.',
        progressive: 'I am sleeping now.'
      }
    },
    {
      infinitive: 'fly',
      present: 'fly/flies',
      past: 'flew',
      pastParticiple: 'flown',
      presentParticiple: 'flying',
      meaning: '飛ぶ',
      difficulty: 'medium',
      frequency: 'low',
      examples: {
        present: 'Birds fly high.',
        past: 'I flew to Japan.',
        perfect: 'I have flown many times.',
        progressive: 'I am flying tomorrow.'
      }
    },
    {
      infinitive: 'swim',
      present: 'swim/swims',
      past: 'swam',
      pastParticiple: 'swum',
      presentParticiple: 'swimming',
      meaning: '泳ぐ',
      difficulty: 'medium',
      frequency: 'low',
      examples: {
        present: 'I swim in the pool.',
        past: 'I swam in the ocean.',
        perfect: 'I have swum across the lake.',
        progressive: 'I am swimming now.'
      }
    },
    {
      infinitive: 'sing',
      present: 'sing/sings',
      past: 'sang',
      pastParticiple: 'sung',
      presentParticiple: 'singing',
      meaning: '歌う',
      difficulty: 'medium',
      frequency: 'low',
      examples: {
        present: 'I sing songs.',
        past: 'I sang in the choir.',
        perfect: 'I have sung this before.',
        progressive: 'I am singing loudly.'
      }
    },
    {
      infinitive: 'ride',
      present: 'ride/rides',
      past: 'rode',
      pastParticiple: 'ridden',
      presentParticiple: 'riding',
      meaning: '乗る',
      difficulty: 'medium',
      frequency: 'low',
      examples: {
        present: 'I ride my bike.',
        past: 'I rode a horse.',
        perfect: 'I have ridden the bus.',
        progressive: 'I am riding to work.'
      }
    },
    {
      infinitive: 'hide',
      present: 'hide/hides',
      past: 'hid',
      pastParticiple: 'hidden',
      presentParticiple: 'hiding',
      meaning: '隠す',
      difficulty: 'medium',
      frequency: 'low',
      examples: {
        present: 'I hide the gift.',
        past: 'I hid under the bed.',
        perfect: 'I have hidden the truth.',
        progressive: 'I am hiding my feelings.'
      }
    },
    {
      infinitive: 'forget',
      present: 'forget/forgets',
      past: 'forgot',
      pastParticiple: 'forgotten',
      presentParticiple: 'forgetting',
      meaning: '忘れる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'I forget names.',
        past: 'I forgot my keys.',
        perfect: 'I have forgotten the password.',
        progressive: 'I am forgetting things.'
      }
    }
  ],
  
  // 上級不規則動詞
  advanced: [
    {
      infinitive: 'bring',
      present: 'bring/brings',
      past: 'brought',
      pastParticiple: 'brought',
      presentParticiple: 'bringing',
      meaning: '持ってくる',
      difficulty: 'medium',
      frequency: 'medium',
      examples: {
        present: 'Please bring your book.',
        past: 'I brought lunch.',
        perfect: 'You have brought good news.',
        progressive: 'I am bringing a friend.'
      }
    },
    {
      infinitive: 'choose',
      present: 'choose/chooses',
      past: 'chose',
      pastParticiple: 'chosen',
      presentParticiple: 'choosing',
      meaning: '選ぶ',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'I choose carefully.',
        past: 'I chose the red one.',
        perfect: 'I have chosen my path.',
        progressive: 'I am choosing a career.'
      }
    },
    {
      infinitive: 'begin',
      present: 'begin/begins',
      past: 'began',
      pastParticiple: 'begun',
      presentParticiple: 'beginning',
      meaning: '始める',
      difficulty: 'hard',
      frequency: 'high',
      examples: {
        present: 'Classes begin at 9.',
        past: 'The show began early.',
        perfect: 'We have begun our journey.',
        progressive: 'We are beginning to understand.'
      }
    },
    // 新規追加 - 上級動詞 4-50
    {
      infinitive: 'arise',
      present: 'arise/arises',
      past: 'arose',
      pastParticiple: 'arisen',
      presentParticiple: 'arising',
      meaning: '起こる、生じる',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Problems arise daily.',
        past: 'A conflict arose.',
        perfect: 'Issues have arisen.',
        progressive: 'Problems are arising.'
      }
    },
    {
      infinitive: 'bear',
      present: 'bear/bears',
      past: 'bore',
      pastParticiple: 'borne',
      presentParticiple: 'bearing',
      meaning: '耐える、産む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'I bear responsibility.',
        past: 'She bore children.',
        perfect: 'He has borne witness.',
        progressive: 'She is bearing fruit.'
      }
    },
    {
      infinitive: 'beat',
      present: 'beat/beats',
      past: 'beat',
      pastParticiple: 'beaten',
      presentParticiple: 'beating',
      meaning: '打つ、負かす',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'My heart beats fast.',
        past: 'We beat the team.',
        perfect: 'They have beaten us.',
        progressive: 'He is beating the drum.'
      }
    },
    {
      infinitive: 'bind',
      present: 'bind/binds',
      past: 'bound',
      pastParticiple: 'bound',
      presentParticiple: 'binding',
      meaning: '縛る、結びつける',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'We bind the books.',
        past: 'I bound the wound.',
        perfect: 'They have bound us.',
        progressive: 'She is binding papers.'
      }
    },
    {
      infinitive: 'bite',
      present: 'bite/bites',
      past: 'bit',
      pastParticiple: 'bitten',
      presentParticiple: 'biting',
      meaning: '噛む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Dogs bite strangers.',
        past: 'The snake bit him.',
        perfect: 'I have bitten my tongue.',
        progressive: 'The cold is biting.'
      }
    },
    {
      infinitive: 'blow',
      present: 'blow/blows',
      past: 'blew',
      pastParticiple: 'blown',
      presentParticiple: 'blowing',
      meaning: '吹く',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'The wind blows hard.',
        past: 'She blew the candles.',
        perfect: 'The storm has blown over.',
        progressive: 'The wind is blowing.'
      }
    },
    {
      infinitive: 'burst',
      present: 'burst/bursts',
      past: 'burst',
      pastParticiple: 'burst',
      presentParticiple: 'bursting',
      meaning: '爆発する、破裂する',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Balloons burst easily.',
        past: 'The pipe burst.',
        perfect: 'The bubble has burst.',
        progressive: 'She is bursting with joy.'
      }
    },
    {
      infinitive: 'cast',
      present: 'cast/casts',
      past: 'cast',
      pastParticiple: 'cast',
      presentParticiple: 'casting',
      meaning: '投げる、キャストする',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'We cast our votes.',
        past: 'He cast the line.',
        perfect: 'They have cast doubt.',
        progressive: 'She is casting actors.'
      }
    },
    {
      infinitive: 'cling',
      present: 'cling/clings',
      past: 'clung',
      pastParticiple: 'clung',
      presentParticiple: 'clinging',
      meaning: 'しがみつく',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Children cling to parents.',
        past: 'She clung to hope.',
        perfect: 'He has clung to tradition.',
        progressive: 'She is clinging tightly.'
      }
    },
    {
      infinitive: 'cost',
      present: 'cost/costs',
      past: 'cost',
      pastParticiple: 'cost',
      presentParticiple: 'costing',
      meaning: '費用がかかる',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'This costs too much.',
        past: 'It cost me dearly.',
        perfect: 'It has cost us time.',
        progressive: 'It is costing more.'
      }
    },
    {
      infinitive: 'creep',
      present: 'creep/creeps',
      past: 'crept',
      pastParticiple: 'crept',
      presentParticiple: 'creeping',
      meaning: 'はう、忍び寄る',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Cats creep silently.',
        past: 'Fear crept in.',
        perfect: 'Doubt has crept in.',
        progressive: 'Time is creeping by.'
      }
    },
    {
      infinitive: 'deal',
      present: 'deal/deals',
      past: 'dealt',
      pastParticiple: 'dealt',
      presentParticiple: 'dealing',
      meaning: '扱う、配る',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'I deal with problems.',
        past: 'He dealt the cards.',
        perfect: 'We have dealt with this.',
        progressive: 'She is dealing cards.'
      }
    },
    {
      infinitive: 'dig',
      present: 'dig/digs',
      past: 'dug',
      pastParticiple: 'dug',
      presentParticiple: 'digging',
      meaning: '掘る',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Dogs dig holes.',
        past: 'We dug a well.',
        perfect: 'They have dug deep.',
        progressive: 'He is digging a hole.'
      }
    },
    {
      infinitive: 'dive',
      present: 'dive/dives',
      past: 'dove',
      pastParticiple: 'dived',
      presentParticiple: 'diving',
      meaning: '飛び込む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Birds dive for fish.',
        past: 'She dove into water.',
        perfect: 'He has dived before.',
        progressive: 'They are diving deep.'
      }
    },
    {
      infinitive: 'dwell',
      present: 'dwell/dwells',
      past: 'dwelt',
      pastParticiple: 'dwelt',
      presentParticiple: 'dwelling',
      meaning: '住む、詳述する',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'We dwell in peace.',
        past: 'He dwelt on mistakes.',
        perfect: 'She has dwelt here.',
        progressive: 'He is dwelling on it.'
      }
    },
    {
      infinitive: 'feed',
      present: 'feed/feeds',
      past: 'fed',
      pastParticiple: 'fed',
      presentParticiple: 'feeding',
      meaning: '餌を与える',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'I feed the cat.',
        past: 'She fed the birds.',
        perfect: 'We have fed everyone.',
        progressive: 'They are feeding animals.'
      }
    },
    {
      infinitive: 'flee',
      present: 'flee/flees',
      past: 'fled',
      pastParticiple: 'fled',
      presentParticiple: 'fleeing',
      meaning: '逃げる',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Animals flee danger.',
        past: 'They fled the country.',
        perfect: 'Refugees have fled.',
        progressive: 'People are fleeing.'
      }
    },
    {
      infinitive: 'fling',
      present: 'fling/flings',
      past: 'flung',
      pastParticiple: 'flung',
      presentParticiple: 'flinging',
      meaning: '投げつける',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'She flings her bag.',
        past: 'He flung the door open.',
        perfect: 'They have flung accusations.',
        progressive: 'He is flinging stones.'
      }
    },
    {
      infinitive: 'forbid',
      present: 'forbid/forbids',
      past: 'forbade',
      pastParticiple: 'forbidden',
      presentParticiple: 'forbidding',
      meaning: '禁止する',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Parents forbid smoking.',
        past: 'She forbade him entry.',
        perfect: 'It has been forbidden.',
        progressive: 'He is forbidding it.'
      }
    },
    {
      infinitive: 'freeze',
      present: 'freeze/freezes',
      past: 'froze',
      pastParticiple: 'frozen',
      presentParticiple: 'freezing',
      meaning: '凍る、凍らせる',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Water freezes at 0°C.',
        past: 'The lake froze.',
        perfect: 'The pipes have frozen.',
        progressive: 'It is freezing outside.'
      }
    },
    {
      infinitive: 'grind',
      present: 'grind/grinds',
      past: 'ground',
      pastParticiple: 'ground',
      presentParticiple: 'grinding',
      meaning: '粉にする、研ぐ',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'I grind coffee beans.',
        past: 'She ground the spices.',
        perfect: 'He has ground wheat.',
        progressive: 'The mill is grinding.'
      }
    },
    {
      infinitive: 'hang',
      present: 'hang/hangs',
      past: 'hung',
      pastParticiple: 'hung',
      presentParticiple: 'hanging',
      meaning: 'つるす、ぶら下がる',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Pictures hang on walls.',
        past: 'I hung the clothes.',
        perfect: 'The coat has hung there.',
        progressive: 'Clothes are hanging dry.'
      }
    },
    {
      infinitive: 'hurt',
      present: 'hurt/hurts',
      past: 'hurt',
      pastParticiple: 'hurt',
      presentParticiple: 'hurting',
      meaning: '傷つける',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Needles hurt skin.',
        past: 'He hurt his back.',
        perfect: 'She has hurt feelings.',
        progressive: 'My head is hurting.'
      }
    },
    {
      infinitive: 'kneel',
      present: 'kneel/kneels',
      past: 'knelt',
      pastParticiple: 'knelt',
      presentParticiple: 'kneeling',
      meaning: 'ひざまずく',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'People kneel in prayer.',
        past: 'He knelt before her.',
        perfect: 'She has knelt down.',
        progressive: 'He is kneeling quietly.'
      }
    },
    {
      infinitive: 'lay',
      present: 'lay/lays',
      past: 'laid',
      pastParticiple: 'laid',
      presentParticiple: 'laying',
      meaning: '置く、産む',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Hens lay eggs.',
        past: 'She laid the book down.',
        perfect: 'They have laid foundations.',
        progressive: 'She is laying tiles.'
      }
    },
    {
      infinitive: 'lead',
      present: 'lead/leads',
      past: 'led',
      pastParticiple: 'led',
      presentParticiple: 'leading',
      meaning: '導く、リードする',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Leaders lead nations.',
        past: 'She led the team.',
        perfect: 'He has led well.',
        progressive: 'She is leading the way.'
      }
    },
    {
      infinitive: 'lean',
      present: 'lean/leans',
      past: 'leant',
      pastParticiple: 'leant',
      presentParticiple: 'leaning',
      meaning: 'もたれる、傾く',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Trees lean in wind.',
        past: 'She leant against wall.',
        perfect: 'He has leant forward.',
        progressive: 'She is leaning back.'
      }
    },
    {
      infinitive: 'leap',
      present: 'leap/leaps',
      past: 'leapt',
      pastParticiple: 'leapt',
      presentParticiple: 'leaping',
      meaning: '飛び跳ねる',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Frogs leap high.',
        past: 'He leapt over fence.',
        perfect: 'She has leapt forward.',
        progressive: 'Cats are leaping around.'
      }
    },
    {
      infinitive: 'lend',
      present: 'lend/lends',
      past: 'lent',
      pastParticiple: 'lent',
      presentParticiple: 'lending',
      meaning: '貸す',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Banks lend money.',
        past: 'I lent him books.',
        perfect: 'She has lent support.',
        progressive: 'They are lending aid.'
      }
    },
    {
      infinitive: 'lie',
      present: 'lie/lies',
      past: 'lay',
      pastParticiple: 'lain',
      presentParticiple: 'lying',
      meaning: '横になる、うそをつく',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Dogs lie on grass.',
        past: 'She lay on bed.',
        perfect: 'He has lain there.',
        progressive: 'She is lying down.'
      }
    },
    {
      infinitive: 'light',
      present: 'light/lights',
      past: 'lit',
      pastParticiple: 'lit',
      presentParticiple: 'lighting',
      meaning: '点灯する、照らす',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Candles light rooms.',
        past: 'She lit the fire.',
        perfect: 'Stars have lit sky.',
        progressive: 'He is lighting candles.'
      }
    },
    {
      infinitive: 'plead',
      present: 'plead/pleads',
      past: 'pled',
      pastParticiple: 'pled',
      presentParticiple: 'pleading',
      meaning: '嘆願する',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Lawyers plead cases.',
        past: 'He pled for mercy.',
        perfect: 'She has pled guilty.',
        progressive: 'He is pleading innocence.'
      }
    },
    {
      infinitive: 'prove',
      present: 'prove/proves',
      past: 'proved',
      pastParticiple: 'proven',
      presentParticiple: 'proving',
      meaning: '証明する',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Tests prove theories.',
        past: 'She proved her point.',
        perfect: 'He has proven himself.',
        progressive: 'Time is proving him right.'
      }
    },
    {
      infinitive: 'quit',
      present: 'quit/quits',
      past: 'quit',
      pastParticiple: 'quit',
      presentParticiple: 'quitting',
      meaning: 'やめる',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'People quit smoking.',
        past: 'He quit his job.',
        perfect: 'She has quit trying.',
        progressive: 'He is quitting soon.'
      }
    },
    {
      infinitive: 'rid',
      present: 'rid/rids',
      past: 'rid',
      pastParticiple: 'rid',
      presentParticiple: 'ridding',
      meaning: '取り除く',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'We rid gardens of weeds.',
        past: 'She rid herself of fear.',
        perfect: 'We have rid the area.',
        progressive: 'He is ridding doubts.'
      }
    },
    {
      infinitive: 'ring',
      present: 'ring/rings',
      past: 'rang',
      pastParticiple: 'rung',
      presentParticiple: 'ringing',
      meaning: '鳴る、鳴らす',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Phones ring loudly.',
        past: 'The bell rang.',
        perfect: 'It has rung twice.',
        progressive: 'The alarm is ringing.'
      }
    },
    {
      infinitive: 'rise',
      present: 'rise/rises',
      past: 'rose',
      pastParticiple: 'risen',
      presentParticiple: 'rising',
      meaning: '上がる、起きる',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Sun rises daily.',
        past: 'Prices rose sharply.',
        perfect: 'Temperatures have risen.',
        progressive: 'Water is rising.'
      }
    },
    {
      infinitive: 'seek',
      present: 'seek/seeks',
      past: 'sought',
      pastParticiple: 'sought',
      presentParticiple: 'seeking',
      meaning: '探す、求める',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Scientists seek truth.',
        past: 'She sought advice.',
        perfect: 'He has sought help.',
        progressive: 'They are seeking answers.'
      }
    },
    {
      infinitive: 'shake',
      present: 'shake/shakes',
      past: 'shook',
      pastParticiple: 'shaken',
      presentParticiple: 'shaking',
      meaning: '振る、震える',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Dogs shake when wet.',
        past: 'He shook her hand.',
        perfect: 'The earth has shaken.',
        progressive: 'She is shaking with cold.'
      }
    },
    {
      infinitive: 'shed',
      present: 'shed/sheds',
      past: 'shed',
      pastParticiple: 'shed',
      presentParticiple: 'shedding',
      meaning: '落とす、流す',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Trees shed leaves.',
        past: 'She shed tears.',
        perfect: 'Snakes have shed skin.',
        progressive: 'He is shedding weight.'
      }
    },
    {
      infinitive: 'shine',
      present: 'shine/shines',
      past: 'shone',
      pastParticiple: 'shone',
      presentParticiple: 'shining',
      meaning: '光る、輝く',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Stars shine brightly.',
        past: 'The sun shone.',
        perfect: 'Light has shone through.',
        progressive: 'Her eyes are shining.'
      }
    },
    {
      infinitive: 'shoot',
      present: 'shoot/shoots',
      past: 'shot',
      pastParticiple: 'shot',
      presentParticiple: 'shooting',
      meaning: '撃つ、芽を出す',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Hunters shoot game.',
        past: 'He shot the target.',
        perfect: 'Plants have shot up.',
        progressive: 'Stars are shooting.'
      }
    },
    {
      infinitive: 'shrink',
      present: 'shrink/shrinks',
      past: 'shrank',
      pastParticiple: 'shrunk',
      presentParticiple: 'shrinking',
      meaning: '縮む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Wool shrinks in heat.',
        past: 'The fabric shrank.',
        perfect: 'It has shrunk badly.',
        progressive: 'The ice is shrinking.'
      }
    },
    {
      infinitive: 'shut',
      present: 'shut/shuts',
      past: 'shut',
      pastParticiple: 'shut',
      presentParticiple: 'shutting',
      meaning: '閉める',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Shops shut at six.',
        past: 'She shut the door.',
        perfect: 'Windows have shut tight.',
        progressive: 'He is shutting down.'
      }
    },
    {
      infinitive: 'sink',
      present: 'sink/sinks',
      past: 'sank',
      pastParticiple: 'sunk',
      presentParticiple: 'sinking',
      meaning: '沈む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Ships sink in storms.',
        past: 'The boat sank.',
        perfect: 'It has sunk completely.',
        progressive: 'The ship is sinking.'
      }
    },
    {
      infinitive: 'slide',
      present: 'slide/slides',
      past: 'slid',
      pastParticiple: 'slid',
      presentParticiple: 'sliding',
      meaning: '滑る',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Children slide on ice.',
        past: 'He slid down hill.',
        perfect: 'The door has slid open.',
        progressive: 'She is sliding carefully.'
      }
    },
    {
      infinitive: 'sling',
      present: 'sling/slings',
      past: 'slung',
      pastParticiple: 'slung',
      presentParticiple: 'slinging',
      meaning: '投げる、つる',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'He slings his bag.',
        past: 'She slung mud.',
        perfect: 'They have slung accusations.',
        progressive: 'He is slinging insults.'
      }
    },
    {
      infinitive: 'slit',
      present: 'slit/slits',
      past: 'slit',
      pastParticiple: 'slit',
      presentParticiple: 'slitting',
      meaning: '切れ目を入れる',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Knives slit fabric.',
        past: 'She slit the envelope.',
        perfect: 'He has slit the bag.',
        progressive: 'She is slitting paper.'
      }
    },
    {
      infinitive: 'spin',
      present: 'spin/spins',
      past: 'spun',
      pastParticiple: 'spun',
      presentParticiple: 'spinning',
      meaning: '回転する',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Wheels spin fast.',
        past: 'She spun the wheel.',
        perfect: 'It has spun around.',
        progressive: 'The top is spinning.'
      }
    },
    {
      infinitive: 'spit',
      present: 'spit/spits',
      past: 'spat',
      pastParticiple: 'spat',
      presentParticiple: 'spitting',
      meaning: '吐く',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Camels spit often.',
        past: 'He spat angrily.',
        perfect: 'She has spat it out.',
        progressive: 'The fire is spitting.'
      }
    },
    {
      infinitive: 'split',
      present: 'split/splits',
      past: 'split',
      pastParticiple: 'split',
      presentParticiple: 'splitting',
      meaning: '割る、分ける',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Wood splits easily.',
        past: 'They split the bill.',
        perfect: 'The group has split.',
        progressive: 'My head is splitting.'
      }
    },
    {
      infinitive: 'spread',
      present: 'spread/spreads',
      past: 'spread',
      pastParticiple: 'spread',
      presentParticiple: 'spreading',
      meaning: '広げる、広がる',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Butter spreads easily.',
        past: 'News spread quickly.',
        perfect: 'Disease has spread.',
        progressive: 'Fire is spreading.'
      }
    },
    {
      infinitive: 'spring',
      present: 'spring/springs',
      past: 'sprang',
      pastParticiple: 'sprung',
      presentParticiple: 'springing',
      meaning: '跳ぶ、湧く',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Cats spring quickly.',
        past: 'He sprang into action.',
        perfect: 'Flowers have sprung up.',
        progressive: 'Water is springing forth.'
      }
    },
    {
      infinitive: 'steal',
      present: 'steal/steals',
      past: 'stole',
      pastParticiple: 'stolen',
      presentParticiple: 'stealing',
      meaning: '盗む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Thieves steal goods.',
        past: 'Someone stole my bike.',
        perfect: 'They have stolen cars.',
        progressive: 'He is stealing time.'
      }
    },
    {
      infinitive: 'stick',
      present: 'stick/sticks',
      past: 'stuck',
      pastParticiple: 'stuck',
      presentParticiple: 'sticking',
      meaning: '刺す、くっつく',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Glue sticks things.',
        past: 'The door stuck.',
        perfect: 'It has stuck together.',
        progressive: 'She is sticking labels.'
      }
    },
    {
      infinitive: 'sting',
      present: 'sting/stings',
      past: 'stung',
      pastParticiple: 'stung',
      presentParticiple: 'stinging',
      meaning: '刺す、痛む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Bees sting intruders.',
        past: 'A wasp stung me.',
        perfect: 'She has been stung.',
        progressive: 'My eyes are stinging.'
      }
    },
    {
      infinitive: 'strike',
      present: 'strike/strikes',
      past: 'struck',
      pastParticiple: 'struck',
      presentParticiple: 'striking',
      meaning: '打つ、ストライキ',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Lightning strikes trees.',
        past: 'He struck the ball.',
        perfect: 'Workers have struck.',
        progressive: 'Clock is striking twelve.'
      }
    },
    {
      infinitive: 'string',
      present: 'string/strings',
      past: 'strung',
      pastParticiple: 'strung',
      presentParticiple: 'stringing',
      meaning: 'ひもを通す',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'We string beads.',
        past: 'She strung pearls.',
        perfect: 'Lights have been strung.',
        progressive: 'He is stringing guitar.'
      }
    },
    {
      infinitive: 'strive',
      present: 'strive/strives',
      past: 'strove',
      pastParticiple: 'striven',
      presentParticiple: 'striving',
      meaning: '努力する',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Students strive hard.',
        past: 'She strove for success.',
        perfect: 'He has striven greatly.',
        progressive: 'They are striving together.'
      }
    },
    {
      infinitive: 'swear',
      present: 'swear/swears',
      past: 'swore',
      pastParticiple: 'sworn',
      presentParticiple: 'swearing',
      meaning: '誓う、悪口を言う',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Witnesses swear oaths.',
        past: 'He swore allegiance.',
        perfect: 'She has sworn secrecy.',
        progressive: 'He is swearing angrily.'
      }
    },
    {
      infinitive: 'sweep',
      present: 'sweep/sweeps',
      past: 'swept',
      pastParticiple: 'swept',
      presentParticiple: 'sweeping',
      meaning: '掃く',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Janitors sweep floors.',
        past: 'She swept leaves.',
        perfect: 'Wind has swept debris.',
        progressive: 'He is sweeping stairs.'
      }
    },
    {
      infinitive: 'swing',
      present: 'swing/swings',
      past: 'swung',
      pastParticiple: 'swung',
      presentParticiple: 'swinging',
      meaning: '振る、揺れる',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Children swing on bars.',
        past: 'He swung the bat.',
        perfect: 'The door has swung open.',
        progressive: 'She is swinging gently.'
      }
    },
    {
      infinitive: 'tear',
      present: 'tear/tears',
      past: 'tore',
      pastParticiple: 'torn',
      presentParticiple: 'tearing',
      meaning: '破る、裂く',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Paper tears easily.',
        past: 'She tore the letter.',
        perfect: 'The fabric has torn.',
        progressive: 'He is tearing pages.'
      }
    },
    {
      infinitive: 'thrust',
      present: 'thrust/thrusts',
      past: 'thrust',
      pastParticiple: 'thrust',
      presentParticiple: 'thrusting',
      meaning: '突く、押し込む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Swords thrust forward.',
        past: 'He thrust his hand out.',
        perfect: 'She has thrust it aside.',
        progressive: 'He is thrusting forward.'
      }
    },
    {
      infinitive: 'tread',
      present: 'tread/treads',
      past: 'trod',
      pastParticiple: 'trodden',
      presentParticiple: 'treading',
      meaning: '踏む',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'People tread carefully.',
        past: 'She trod on glass.',
        perfect: 'Path has been trodden.',
        progressive: 'He is treading lightly.'
      }
    },
    {
      infinitive: 'wake',
      present: 'wake/wakes',
      past: 'woke',
      pastParticiple: 'woken',
      presentParticiple: 'waking',
      meaning: '目覚める',
      difficulty: 'hard',
      frequency: 'medium',
      examples: {
        present: 'Alarms wake people.',
        past: 'She woke early.',
        perfect: 'He has woken up.',
        progressive: 'Baby is waking now.'
      }
    },
    {
      infinitive: 'weave',
      present: 'weave/weaves',
      past: 'wove',
      pastParticiple: 'woven',
      presentParticiple: 'weaving',
      meaning: '織る',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Spiders weave webs.',
        past: 'She wove a basket.',
        perfect: 'Cloth has been woven.',
        progressive: 'She is weaving silk.'
      }
    },
    {
      infinitive: 'weep',
      present: 'weep/weeps',
      past: 'wept',
      pastParticiple: 'wept',
      presentParticiple: 'weeping',
      meaning: '泣く',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Children weep loudly.',
        past: 'She wept with joy.',
        perfect: 'He has wept enough.',
        progressive: 'She is weeping softly.'
      }
    },
    {
      infinitive: 'wind',
      present: 'wind/winds',
      past: 'wound',
      pastParticiple: 'wound',
      presentParticiple: 'winding',
      meaning: '巻く、曲がる',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'Rivers wind through valleys.',
        past: 'She wound the clock.',
        perfect: 'The path has wound upward.',
        progressive: 'The road is winding.'
      }
    },
    {
      infinitive: 'wring',
      present: 'wring/wrings',
      past: 'wrung',
      pastParticiple: 'wrung',
      presentParticiple: 'wringing',
      meaning: '絞る',
      difficulty: 'hard',
      frequency: 'low',
      examples: {
        present: 'We wring wet clothes.',
        past: 'She wrung the towel.',
        perfect: 'Water has been wrung out.',
        progressive: 'He is wringing his hands.'
      }
    }
  ]
}

// ゲーム用のチャレンジセット
export const verbChallenges = {
  timeTravel: {
    easy: {
      name: 'タイムトラベル初級',
      verbs: ['go', 'eat', 'see', 'come', 'take'],
      timeLimit: 60,
      targetAccuracy: 80,
      energyReduction: 10
    },
    medium: {
      name: 'タイムトラベル中級', 
      verbs: ['make', 'give', 'know', 'think', 'get'],
      timeLimit: 90,
      targetAccuracy: 75,
      energyReduction: 15
    },
    hard: {
      name: 'タイムトラベル上級',
      verbs: ['bring', 'choose', 'begin', 'break', 'build'],
      timeLimit: 120,
      targetAccuracy: 70,
      energyReduction: 20
    }
  },
  
  rapidFire: {
    beVerbs: {
      name: 'Be動詞ラピッドファイア',
      forms: ['am', 'is', 'are', 'was', 'were', 'been'],
      timeLimit: 30,
      targetScore: 20
    },
    irregular: {
      name: '不規則動詞ラピッドファイア',
      verbs: ['go/went/gone', 'eat/ate/eaten', 'see/saw/seen'],
      timeLimit: 45,
      targetScore: 15
    }
  }
}

// 時制変換ルール
export const tenseTransformRules = {
  presentToPast: {
    regular: verb => verb.endsWith('e') ? verb + 'd' : verb + 'ed',
    irregular: verb => {
      const found = Object.values(irregularVerbDatabase)
        .flat()
        .find(v => v.infinitive === verb)
      return found ? found.past : null
    }
  },
  
  presentToPerfect: {
    regular: verb => 'have ' + (verb.endsWith('e') ? verb + 'd' : verb + 'ed'),
    irregular: verb => {
      const found = Object.values(irregularVerbDatabase)
        .flat()
        .find(v => v.infinitive === verb)
      return found ? 'have ' + found.pastParticiple : null
    }
  }
}

// スコアリングシステム
export const verbGameScoring = {
  correct: {
    easy: 10,
    medium: 15,
    hard: 20
  },
  bonus: {
    perfectTime: 50,     // 制限時間内完了
    noMistakes: 100,     // ミスなし
    comboMultiplier: 1.5 // 連続正解ボーナス
  },
  penalty: {
    incorrect: -5,
    timeout: -10
  }
}

// エネルギーシステム（宇宙船のエネルギー管理）
export const spaceshipEnergy = {
  maxEnergy: 100,
  startingEnergy: 100,
  consumption: {
    timeTravel: 20,      // 時代移動時
    wrongAnswer: 15,     // 不正解時
    timeout: 25          // タイムアウト時
  },
  restoration: {
    correctAnswer: 10,   // 正解時
    perfectRound: 30,    // パーフェクトラウンド
    levelComplete: 50    // レベル完了時
  }
}