// Modal Verb Challenge Database - Progressive Learning System
// 初級: can, must, may, will, should を基本的な文で
// 中級: 言い換え、より複雑な用法、丁寧表現
// 上級: 複雑な文構造、助動詞+完了形、推量・推論の高度な表現

export const modalVerbProblems = [
  // ===== 初級レベル (BEGINNER LEVEL) - 基本的な助動詞の単純な文 =====
  
  // CAN - 能力・可能性 (基本)
  {
    id: 'beg_can_1',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🏊‍♂️',
    enemyName: 'Swimming Coach',
    prompt: '私は泳ぐことができます。',
    context: '能力を表現する最も基本的な文',
    options: [
      { id: 'a', modal: 'can', isCorrect: true },
      { id: 'b', modal: 'may', isCorrect: false },
      { id: 'c', modal: 'must', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'can は「〜できる」という能力を表す最も基本的な助動詞です。'
  },
  {
    id: 'beg_can_2',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🚗',
    enemyName: 'Driver Bot',
    prompt: '彼は車を運転できます。',
    context: '技能・能力の表現',
    options: [
      { id: 'a', modal: 'can', isCorrect: true },
      { id: 'b', modal: 'should', isCorrect: false },
      { id: 'c', modal: 'must', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'can は習得した技能や能力を表します。'
  },
  {
    id: 'beg_can_3',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🐶',
    enemyName: 'Smart Dog',
    prompt: '犬は走ることができます。',
    context: '動物の自然な能力',
    options: [
      { id: 'a', modal: 'can', isCorrect: true },
      { id: 'b', modal: 'will', isCorrect: false },
      { id: 'c', modal: 'must', isCorrect: false },
      { id: 'd', modal: 'should', isCorrect: false }
    ],
    explanation: 'can は動物の持つ自然な能力も表します。'
  },
  {
    id: 'beg_can_4',
    level: 'beginner',
    modalType: 'negative_ability',
    enemy: '🐧',
    enemyName: 'Penguin',
    prompt: 'ペンギンは飛ぶことができません。',
    context: '能力の否定形',
    options: [
      { id: 'a', modal: 'cannot', isCorrect: true },
      { id: 'b', modal: 'will not', isCorrect: false },
      { id: 'c', modal: 'must not', isCorrect: false },
      { id: 'd', modal: 'should not', isCorrect: false }
    ],
    explanation: 'cannot (can not) は「〜できない」という意味で、能力がないことを表します。'
  },
  {
    id: 'beg_can_5',
    level: 'beginner',
    modalType: 'question',
    enemy: '🎵',
    enemyName: 'Song Bird',
    prompt: 'あなたは歌うことができますか？',
    context: '能力についての疑問文',
    options: [
      { id: 'a', modal: 'Can you', isCorrect: true },
      { id: 'b', modal: 'Will you', isCorrect: false },
      { id: 'c', modal: 'Must you', isCorrect: false },
      { id: 'd', modal: 'Should you', isCorrect: false }
    ],
    explanation: 'Can you は相手の能力について尋ねる基本的な疑問文です。'
  },

  // MUST - 義務・必要性 (基本)
  {
    id: 'beg_must_1',
    level: 'beginner',
    modalType: 'obligation',
    enemy: '🏫',
    enemyName: 'School Rules',
    prompt: '学生は宿題をしなければなりません。',
    context: '基本的な義務',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'can', isCorrect: false },
      { id: 'c', modal: 'may', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'must は「〜しなければならない」という強い義務を表します。'
  },
  {
    id: 'beg_must_2',
    level: 'beginner',
    modalType: 'obligation',
    enemy: '🚦',
    enemyName: 'Traffic Light',
    prompt: '私たちは信号を守らなければなりません。',
    context: 'ルール・規則の遵守',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'can', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'must は法的・社会的な規則を守る義務を表します。'
  },
  {
    id: 'beg_must_3',
    level: 'beginner',
    modalType: 'necessity',
    enemy: '💧',
    enemyName: 'Water Drop',
    prompt: '人間は水を飲まなければなりません。',
    context: '生命に関わる必要性',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'should', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'must は生命に関わる基本的な必要性も表します。'
  },
  {
    id: 'beg_must_4',
    level: 'beginner',
    modalType: 'prohibition',
    enemy: '🚭',
    enemyName: 'No Smoking',
    prompt: 'ここでタバコを吸ってはいけません。',
    context: '禁止の表現',
    options: [
      { id: 'a', modal: 'must not', isCorrect: true },
      { id: 'b', modal: 'cannot', isCorrect: false },
      { id: 'c', modal: 'will not', isCorrect: false },
      { id: 'd', modal: 'should not', isCorrect: false }
    ],
    explanation: 'must not は「〜してはいけない」という強い禁止を表します。'
  },

  // MAY - 許可・可能性 (基本)
  {
    id: 'beg_may_1',
    level: 'beginner',
    modalType: 'permission',
    enemy: '🚪',
    enemyName: 'Door Guardian',
    prompt: '入ってもいいですか？',
    context: '基本的な許可の依頼',
    options: [
      { id: 'a', modal: 'May I', isCorrect: true },
      { id: 'b', modal: 'Must I', isCorrect: false },
      { id: 'c', modal: 'Will I', isCorrect: false },
      { id: 'd', modal: 'Can I', isCorrect: false }
    ],
    explanation: 'May I は丁寧な許可の依頼を表します。'
  },
  {
    id: 'beg_may_2',
    level: 'beginner',
    modalType: 'possibility',
    enemy: '🌧️',
    enemyName: 'Rain Cloud',
    prompt: '明日は雨が降るかもしれません。',
    context: '可能性の表現',
    options: [
      { id: 'a', modal: 'may', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'will', isCorrect: false },
      { id: 'd', modal: 'can', isCorrect: false }
    ],
    explanation: 'may は「〜かもしれない」という可能性を表します。'
  },

  // WILL - 未来・意志 (基本)
  {
    id: 'beg_will_1',
    level: 'beginner',
    modalType: 'future',
    enemy: '🌅',
    enemyName: 'Tomorrow Sun',
    prompt: '明日は晴れるでしょう。',
    context: '未来の予測',
    options: [
      { id: 'a', modal: 'will', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'will は未来の出来事や予測を表します。'
  },
  {
    id: 'beg_will_2',
    level: 'beginner',
    modalType: 'intention',
    enemy: '📚',
    enemyName: 'Study Book',
    prompt: '私は明日勉強します。',
    context: '意志・予定の表現',
    options: [
      { id: 'a', modal: 'will', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'can', isCorrect: false }
    ],
    explanation: 'will は話し手の意志や予定を表します。'
  },

  // SHOULD - 助言・推奨 (基本)
  {
    id: 'beg_should_1',
    level: 'beginner',
    modalType: 'advice',
    enemy: '🥗',
    enemyName: 'Healthy Food',
    prompt: 'もっと野菜を食べるべきです。',
    context: '健康に関する基本的なアドバイス',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'should は「〜すべきです」というアドバイスや推奨を表します。'
  },
  {
    id: 'beg_should_2',
    level: 'beginner',
    modalType: 'advice',
    enemy: '😴',
    enemyName: 'Sleep Guardian',
    prompt: '早く寝るべきです。',
    context: '生活習慣のアドバイス',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'will', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'should は良い習慣についての助言を表します。'
  },

  // 初級レベルの追加問題 (基本的な文のバリエーション)
  {
    id: 'beg_mixed_1',
    level: 'beginner',
    modalType: 'permission',
    enemy: '🍎',
    enemyName: 'Apple Tree',
    prompt: 'このリンゴを食べてもいいですか？',
    context: '物の使用許可',
    options: [
      { id: 'a', modal: 'Can I', isCorrect: true },
      { id: 'b', modal: 'Must I', isCorrect: false },
      { id: 'c', modal: 'Will I', isCorrect: false },
      { id: 'd', modal: 'Should I', isCorrect: false }
    ],
    explanation: 'Can I は日常的な許可の依頼に使います（May I より一般的）。'
  },
  {
    id: 'beg_mixed_2',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🎹',
    enemyName: 'Piano Master',
    prompt: '彼女はピアノを弾けません。',
    context: '能力の否定',
    options: [
      { id: 'a', modal: 'cannot', isCorrect: true },
      { id: 'b', modal: 'will not', isCorrect: false },
      { id: 'c', modal: 'must not', isCorrect: false },
      { id: 'd', modal: 'should not', isCorrect: false }
    ],
    explanation: 'cannot は「〜できない」という能力の欠如を表します。'
  },

  // ===== 中級レベル (INTERMEDIATE LEVEL) - 言い換え、複雑な用法、丁寧表現 =====

  // より複雑な文構造とニュアンスの違い
  {
    id: 'int_nuance_1',
    level: 'intermediate',
    modalType: 'polite_permission',
    enemy: '👔',
    enemyName: 'Business Manager',
    prompt: 'お聞きしたいことがあるのですが、よろしいでしょうか？',
    context: 'ビジネスシーンでの丁寧な許可依頼',
    options: [
      { id: 'a', modal: 'May I', isCorrect: true },
      { id: 'b', modal: 'Can I', isCorrect: false },
      { id: 'c', modal: 'Will I', isCorrect: false },
      { id: 'd', modal: 'Should I', isCorrect: false }
    ],
    explanation: 'May I は Can I より丁寧で、フォーマルな場面で使われます。'
  },
  {
    id: 'int_nuance_2',
    level: 'intermediate',
    modalType: 'strong_advice',
    enemy: '🏥',
    enemyName: 'Doctor',
    prompt: '体調が悪いなら、医者に診てもらうべきです。',
    context: '強い推奨・忠告',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'may', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'should は must ほど強くない推奨を表し、助言に適しています。'
  },
  {
    id: 'int_nuance_3',
    level: 'intermediate',
    modalType: 'deduction',
    enemy: '🕵️‍♂️',
    enemyName: 'Detective',
    prompt: '彼は遅刻したに違いない（電車が止まっていたから）。',
    context: '証拠に基づく強い推論',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'should', isCorrect: false },
      { id: 'c', modal: 'may', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'must は証拠に基づく強い確信「〜に違いない」を表します。'
  },
  {
    id: 'int_nuance_4',
    level: 'intermediate',
    modalType: 'expectation',
    enemy: '📫',
    enemyName: 'Mailbox',
    prompt: '手紙は明日届くはずです。',
    context: '期待・予想の表現',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'will', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'should は「〜するはずだ」という期待や予想を表すことができます。'
  },
  {
    id: 'int_nuance_5',
    level: 'intermediate',
    modalType: 'polite_request',
    enemy: '🎭',
    enemyName: 'Theater Manager',
    prompt: 'どちらの席がお気に入りでしょうか？',
    context: '丁寧な申し出・提案',
    options: [
      { id: 'a', modal: 'Would you like', isCorrect: true },
      { id: 'b', modal: 'Will you', isCorrect: false },
      { id: 'c', modal: 'Can you', isCorrect: false },
      { id: 'd', modal: 'Should you', isCorrect: false }
    ],
    explanation: 'Would you like は非常に丁寧な申し出や提案に使います。'
  },

  // 言い換えパターンの学習
  {
    id: 'int_paraphrase_1',
    level: 'intermediate',
    modalType: 'ability_paraphrase',
    enemy: '🏃‍♀️',
    enemyName: 'Runner',
    prompt: '彼女は昔、とても速く走ることができました。',
    context: '過去の能力（言い換え学習）',
    options: [
      { id: 'a', modal: 'could', isCorrect: true },
      { id: 'b', modal: 'can', isCorrect: false },
      { id: 'c', modal: 'would', isCorrect: false },
      { id: 'd', modal: 'should', isCorrect: false }
    ],
    explanation: 'could は can の過去形で、過去の能力を表します。'
  },
  {
    id: 'int_paraphrase_2',
    level: 'intermediate',
    modalType: 'weak_possibility',
    enemy: '🌙',
    enemyName: 'Moon Goddess',
    prompt: '彼は会議に来ないかもしれません（may より弱い可能性）。',
    context: 'より弱い推量の表現',
    options: [
      { id: 'a', modal: 'might', isCorrect: true },
      { id: 'b', modal: 'may', isCorrect: false },
      { id: 'c', modal: 'must', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'might は may より弱い可能性を表し、より不確実な推測に使います。'
  },
  {
    id: 'int_paraphrase_3',
    level: 'intermediate',
    modalType: 'conditional_politeness',
    enemy: '🎪',
    enemyName: 'Circus Master',
    prompt: 'もしよろしければ、手伝っていただけませんか？',
    context: '条件付きの丁寧な依頼',
    options: [
      { id: 'a', modal: 'Would you', isCorrect: true },
      { id: 'b', modal: 'Will you', isCorrect: false },
      { id: 'c', modal: 'Can you', isCorrect: false },
      { id: 'd', modal: 'Should you', isCorrect: false }
    ],
    explanation: 'Would you は Will you より丁寧で、条件付きの依頼に適しています。'
  },

  // より複雑な文脈での使い分け
  {
    id: 'int_context_1',
    level: 'intermediate',
    modalType: 'necessity_vs_obligation',
    enemy: '⏰',
    enemyName: 'Time Master',
    prompt: '明日のプレゼンの準備をしなくてはならない（個人的必要性）。',
    context: '個人的必要性 vs 外的義務',
    options: [
      { id: 'a', modal: 'have to', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'have to は個人的な必要性を表し、must は外的な義務を表します。'
  },
  {
    id: 'int_context_2',
    level: 'intermediate',
    modalType: 'permission_degrees',
    enemy: '🏛️',
    enemyName: 'Temple Guardian',
    prompt: '恐れ入りますが、こちらに座らせていただいてもよろしいでしょうか？',
    context: '最高レベルの丁寧さ',
    options: [
      { id: 'a', modal: 'May I', isCorrect: true },
      { id: 'b', modal: 'Can I', isCorrect: false },
      { id: 'c', modal: 'Could I', isCorrect: false },
      { id: 'd', modal: 'Will I', isCorrect: false }
    ],
    explanation: 'May I は最も丁寧な許可の依頼で、フォーマルな場面で使います。'
  },

  // ===== 上級レベル (ADVANCED LEVEL) - 複雑な文構造、助動詞+完了形、高度な推量・推論 =====

  // 助動詞 + 完了形
  {
    id: 'adv_perfect_1',
    level: 'advanced',
    modalType: 'past_deduction',
    enemy: '🔍',
    enemyName: 'Sherlock Holmes',
    prompt: '彼は昨日の会議に出席していたに違いない（証拠がある）。',
    context: '過去の出来事への強い推論',
    options: [
      { id: 'a', modal: 'must have attended', isCorrect: true },
      { id: 'b', modal: 'should have attended', isCorrect: false },
      { id: 'c', modal: 'could have attended', isCorrect: false },
      { id: 'd', modal: 'would have attended', isCorrect: false }
    ],
    explanation: 'must have + 過去分詞は過去の出来事への強い確信を表します。'
  },
  {
    id: 'adv_perfect_2',
    level: 'advanced',
    modalType: 'past_possibility',
    enemy: '👻',
    enemyName: 'Mystery Ghost',
    prompt: '彼女はその時すでに帰宅していたかもしれません。',
    context: '過去の可能性の推測',
    options: [
      { id: 'a', modal: 'may have gone', isCorrect: true },
      { id: 'b', modal: 'must have gone', isCorrect: false },
      { id: 'c', modal: 'will have gone', isCorrect: false },
      { id: 'd', modal: 'should have gone', isCorrect: false }
    ],
    explanation: 'may have + 過去分詞は過去の出来事への可能性を表します。'
  },
  {
    id: 'adv_perfect_3',
    level: 'advanced',
    modalType: 'past_regret',
    enemy: '😞',
    enemyName: 'Regret Demon',
    prompt: 'もっと勉強しておくべきでした（後悔）。',
    context: '過去への後悔・反省',
    options: [
      { id: 'a', modal: 'should have studied', isCorrect: true },
      { id: 'b', modal: 'must have studied', isCorrect: false },
      { id: 'c', modal: 'could have studied', isCorrect: false },
      { id: 'd', modal: 'would have studied', isCorrect: false }
    ],
    explanation: 'should have + 過去分詞は過去への後悔や「〜すべきだった」を表します。'
  },
  {
    id: 'adv_perfect_4',
    level: 'advanced',
    modalType: 'unrealized_ability',
    enemy: '🎯',
    enemyName: 'Missed Target',
    prompt: '彼はその仕事を完成させることができたはずです（能力はあったが実現しなかった）。',
    context: '実現しなかった過去の可能性',
    options: [
      { id: 'a', modal: 'could have finished', isCorrect: true },
      { id: 'b', modal: 'should have finished', isCorrect: false },
      { id: 'c', modal: 'must have finished', isCorrect: false },
      { id: 'd', modal: 'would have finished', isCorrect: false }
    ],
    explanation: 'could have + 過去分詞は過去の実現しなかった可能性や能力を表します。'
  },
  {
    id: 'adv_perfect_5',
    level: 'advanced',
    modalType: 'conditional_past',
    enemy: '🔄',
    enemyName: 'Time Traveler',
    prompt: 'もし彼が来ていたら、パーティーはもっと楽しかったでしょう。',
    context: '仮定法過去完了',
    options: [
      { id: 'a', modal: 'would have been', isCorrect: true },
      { id: 'b', modal: 'could have been', isCorrect: false },
      { id: 'c', modal: 'should have been', isCorrect: false },
      { id: 'd', modal: 'must have been', isCorrect: false }
    ],
    explanation: 'would have + 過去分詞は仮定法過去完了で、実現しなかった過去の結果を表します。'
  },

  // 複雑な推量・推論
  {
    id: 'adv_inference_1',
    level: 'advanced',
    modalType: 'logical_deduction',
    enemy: '🧮',
    enemyName: 'Logic Master',
    prompt: '電気が付いているということは、誰かが家にいるということです。',
    context: '論理的推論の確信',
    options: [
      { id: 'a', modal: 'must mean', isCorrect: true },
      { id: 'b', modal: 'may mean', isCorrect: false },
      { id: 'c', modal: 'should mean', isCorrect: false },
      { id: 'd', modal: 'could mean', isCorrect: false }
    ],
    explanation: 'must は論理的な根拠に基づく強い推論を表します。'
  },
  {
    id: 'adv_inference_2',
    level: 'advanced',
    modalType: 'graduated_certainty',
    enemy: '📊',
    enemyName: 'Probability Calculator',
    prompt: '彼の表情から判断すると、試験に合格した可能性が高いです。',
    context: '段階的確信度の表現',
    options: [
      { id: 'a', modal: 'is likely to have passed', isCorrect: true },
      { id: 'b', modal: 'must have passed', isCorrect: false },
      { id: 'c', modal: 'should have passed', isCorrect: false },
      { id: 'd', modal: 'could have passed', isCorrect: false }
    ],
    explanation: 'be likely to have + 過去分詞は高い可能性を表す洗練された表現です。'
  },

  // 高度な文脈での使い分け
  {
    id: 'adv_sophisticated_1',
    level: 'advanced',
    modalType: 'subtle_criticism',
    enemy: '💼',
    enemyName: 'Diplomatic Critic',
    prompt: 'このレポートはもう少し詳細であってもよかったかもしれません。',
    context: '間接的な批判・改善提案',
    options: [
      { id: 'a', modal: 'could have been', isCorrect: true },
      { id: 'b', modal: 'should have been', isCorrect: false },
      { id: 'c', modal: 'must have been', isCorrect: false },
      { id: 'd', modal: 'would have been', isCorrect: false }
    ],
    explanation: 'could have been は間接的で丁寧な改善提案を表します。'
  },
  {
    id: 'adv_sophisticated_2',
    level: 'advanced',
    modalType: 'hypothetical_reasoning',
    enemy: '🎲',
    enemyName: 'Scenario Master',
    prompt: 'もし当時の技術があれば、この問題は解決できていたでしょう。',
    context: '仮定的推論',
    options: [
      { id: 'a', modal: 'could have been solved', isCorrect: true },
      { id: 'b', modal: 'should have been solved', isCorrect: false },
      { id: 'c', modal: 'must have been solved', isCorrect: false },
      { id: 'd', modal: 'would be solved', isCorrect: false }
    ],
    explanation: 'could have been + 過去分詞は仮定的な可能性を表します。'
  },
  {
    id: 'adv_sophisticated_3',
    level: 'advanced',
    modalType: 'complex_expectation',
    enemy: '⚡',
    enemyName: 'Expectation Wizard',
    prompt: 'この時間までには、彼らは既に到着しているはずです。',
    context: '時間的な期待・予想',
    options: [
      { id: 'a', modal: 'should have arrived', isCorrect: true },
      { id: 'b', modal: 'must have arrived', isCorrect: false },
      { id: 'c', modal: 'could have arrived', isCorrect: false },
      { id: 'd', modal: 'would have arrived', isCorrect: false }
    ],
    explanation: 'should have + 過去分詞は期待される状況が実現しているはずという意味です。'
  },

  // ===== 初級レベル追加問題 (ADDITIONAL BEGINNER PROBLEMS) =====
  
  {
    id: 'beg_extra_1',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🏃‍♂️',
    enemyName: 'Speedster',
    prompt: '私は速く走ることができます。',
    context: '運動能力の表現',
    options: [
      { id: 'a', modal: 'can', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'can は身体的な能力を表す基本的な助動詞です。'
  },
  {
    id: 'beg_extra_2',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🎨',
    enemyName: 'Artist',
    prompt: '彼女は絵を描くことができます。',
    context: '芸術的能力',
    options: [
      { id: 'a', modal: 'can', isCorrect: true },
      { id: 'b', modal: 'may', isCorrect: false },
      { id: 'c', modal: 'must', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'can は芸術的スキルや才能も表現できます。'
  },
  {
    id: 'beg_extra_3',
    level: 'beginner',
    modalType: 'obligation',
    enemy: '📝',
    enemyName: 'Test Paper',
    prompt: '明日までにレポートを提出しなければなりません。',
    context: '期限のある義務',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'can', isCorrect: false },
      { id: 'c', modal: 'may', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'must は期限のある義務や責任を表します。'
  },
  {
    id: 'beg_extra_4',
    level: 'beginner',
    modalType: 'prohibition',
    enemy: '📱',
    enemyName: 'Phone Guard',
    prompt: '授業中は携帯電話を使ってはいけません。',
    context: '学校のルール',
    options: [
      { id: 'a', modal: 'must not', isCorrect: true },
      { id: 'b', modal: 'cannot', isCorrect: false },
      { id: 'c', modal: 'will not', isCorrect: false },
      { id: 'd', modal: 'should not', isCorrect: false }
    ],
    explanation: 'must not は規則による強い禁止を表します。'
  },
  {
    id: 'beg_extra_5',
    level: 'beginner',
    modalType: 'permission',
    enemy: '🚽',
    enemyName: 'Bathroom Monitor',
    prompt: 'トイレに行ってもいいですか？',
    context: '基本的な許可の依頼',
    options: [
      { id: 'a', modal: 'Can I', isCorrect: true },
      { id: 'b', modal: 'Must I', isCorrect: false },
      { id: 'c', modal: 'Will I', isCorrect: false },
      { id: 'd', modal: 'Should I', isCorrect: false }
    ],
    explanation: 'Can I は日常的な許可を求める一般的な表現です。'
  },
  {
    id: 'beg_extra_6',
    level: 'beginner',
    modalType: 'future',
    enemy: '☔',
    enemyName: 'Rain Master',
    prompt: '明日は雨が降るでしょう。',
    context: '天気の予測',
    options: [
      { id: 'a', modal: 'will', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'should', isCorrect: false }
    ],
    explanation: 'will は未来の出来事や天気の予測を表します。'
  },
  {
    id: 'beg_extra_7',
    level: 'beginner',
    modalType: 'advice',
    enemy: '🥛',
    enemyName: 'Milk Guardian',
    prompt: 'もっと牛乳を飲むべきです。',
    context: '健康アドバイス',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'should は健康に関する優しいアドバイスに使います。'
  },
  {
    id: 'beg_extra_8',
    level: 'beginner',
    modalType: 'possibility',
    enemy: '🎁',
    enemyName: 'Gift Box',
    prompt: '彼は来るかもしれません。',
    context: '人の行動の可能性',
    options: [
      { id: 'a', modal: 'may', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'will', isCorrect: false },
      { id: 'd', modal: 'can', isCorrect: false }
    ],
    explanation: 'may は「〜かもしれない」という可能性を表します。'
  },
  {
    id: 'beg_extra_9',
    level: 'beginner',
    modalType: 'negative_ability',
    enemy: '🐘',
    enemyName: 'Elephant',
    prompt: '象は跳ぶことができません。',
    context: '動物の能力の制限',
    options: [
      { id: 'a', modal: 'cannot', isCorrect: true },
      { id: 'b', modal: 'must not', isCorrect: false },
      { id: 'c', modal: 'will not', isCorrect: false },
      { id: 'd', modal: 'should not', isCorrect: false }
    ],
    explanation: 'cannot は物理的な能力の欠如を表します。'
  },
  {
    id: 'beg_extra_10',
    level: 'beginner',
    modalType: 'intention',
    enemy: '🎂',
    enemyName: 'Birthday Cake',
    prompt: '私は明日ケーキを作ります。',
    context: '意志・計画',
    options: [
      { id: 'a', modal: 'will', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'can', isCorrect: false }
    ],
    explanation: 'will は個人的な意志や計画を表します。'
  },
  {
    id: 'beg_extra_11',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🍳',
    enemyName: 'Chef',
    prompt: '母は料理ができます。',
    context: '家事スキル',
    options: [
      { id: 'a', modal: 'can', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'can は料理などの生活スキルを表現します。'
  },
  {
    id: 'beg_extra_12',
    level: 'beginner',
    modalType: 'obligation',
    enemy: '🚌',
    enemyName: 'School Bus',
    prompt: '学生は制服を着なければなりません。',
    context: '学校規則',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'should', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'must は学校の規則による義務を表します。'
  },
  {
    id: 'beg_extra_13',
    level: 'beginner',
    modalType: 'permission',
    enemy: '🖥️',
    enemyName: 'Computer',
    prompt: 'コンピューターを使ってもいいですか？',
    context: '機器の使用許可',
    options: [
      { id: 'a', modal: 'Can I', isCorrect: true },
      { id: 'b', modal: 'Must I', isCorrect: false },
      { id: 'c', modal: 'Will I', isCorrect: false },
      { id: 'd', modal: 'Should I', isCorrect: false }
    ],
    explanation: 'Can I は機器や物の使用許可を求める表現です。'
  },
  {
    id: 'beg_extra_14',
    level: 'beginner',
    modalType: 'advice',
    enemy: '💤',
    enemyName: 'Sleep Fairy',
    prompt: '疲れているなら休むべきです。',
    context: '体調管理のアドバイス',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'should は体調を気遣う優しいアドバイスに使います。'
  },
  {
    id: 'beg_extra_15',
    level: 'beginner',
    modalType: 'negative_ability',
    enemy: '🐱',
    enemyName: 'Cat',
    prompt: '猫は話すことができません。',
    context: '動物の能力限界',
    options: [
      { id: 'a', modal: 'cannot', isCorrect: true },
      { id: 'b', modal: 'must not', isCorrect: false },
      { id: 'c', modal: 'will not', isCorrect: false },
      { id: 'd', modal: 'should not', isCorrect: false }
    ],
    explanation: 'cannot は動物が持たない能力を表します。'
  },
  {
    id: 'beg_extra_16',
    level: 'beginner',
    modalType: 'possibility',
    enemy: '📞',
    enemyName: 'Phone Ring',
    prompt: 'それは田中さんからの電話かもしれません。',
    context: '推測・可能性',
    options: [
      { id: 'a', modal: 'may', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'will', isCorrect: false },
      { id: 'd', modal: 'can', isCorrect: false }
    ],
    explanation: 'may は不確実な推測を表します。'
  },
  {
    id: 'beg_extra_17',
    level: 'beginner',
    modalType: 'future',
    enemy: '✈️',
    enemyName: 'Airplane',
    prompt: '来月、東京に行きます。',
    context: '旅行計画',
    options: [
      { id: 'a', modal: 'will', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'can', isCorrect: false }
    ],
    explanation: 'will は確定した未来の計画を表します。'
  },
  {
    id: 'beg_extra_18',
    level: 'beginner',
    modalType: 'obligation',
    enemy: '💊',
    enemyName: 'Medicine',
    prompt: '薬を飲まなければなりません。',
    context: '医療指示',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'should', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'must は医師の指示による重要な義務を表します。'
  },
  {
    id: 'beg_extra_19',
    level: 'beginner',
    modalType: 'ability',
    enemy: '🚴‍♀️',
    enemyName: 'Cyclist',
    prompt: '弟は自転車に乗ることができます。',
    context: '交通手段のスキル',
    options: [
      { id: 'a', modal: 'can', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'can は乗り物の操作能力を表します。'
  },
  {
    id: 'beg_extra_20',
    level: 'beginner',
    modalType: 'prohibition',
    enemy: '🚫',
    enemyName: 'No Entry',
    prompt: 'ここに入ってはいけません。',
    context: '立入禁止',
    options: [
      { id: 'a', modal: 'must not', isCorrect: true },
      { id: 'b', modal: 'cannot', isCorrect: false },
      { id: 'c', modal: 'will not', isCorrect: false },
      { id: 'd', modal: 'should not', isCorrect: false }
    ],
    explanation: 'must not は場所への立入禁止を表します。'
  },

  // ===== 中級レベル追加問題 (ADDITIONAL INTERMEDIATE PROBLEMS) =====
  
  {
    id: 'int_extra_1',
    level: 'intermediate',
    modalType: 'polite_request',
    enemy: '🎪',
    enemyName: 'Circus Director',
    prompt: 'お忙しいところ恐縮ですが、お手伝いいただけますでしょうか？',
    context: 'ビジネスでの丁寧な依頼',
    options: [
      { id: 'a', modal: 'Could you', isCorrect: true },
      { id: 'b', modal: 'Can you', isCorrect: false },
      { id: 'c', modal: 'Will you', isCorrect: false },
      { id: 'd', modal: 'Should you', isCorrect: false }
    ],
    explanation: 'Could you は Can you より丁寧で、ビジネスシーンに適しています。'
  },
  {
    id: 'int_extra_2',
    level: 'intermediate',
    modalType: 'deduction',
    enemy: '🏠',
    enemyName: 'House Detective',
    prompt: '電気が消えているので、誰も家にいないに違いない。',
    context: '状況証拠による推論',
    options: [
      { id: 'a', modal: 'must', isCorrect: true },
      { id: 'b', modal: 'should', isCorrect: false },
      { id: 'c', modal: 'may', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'must は明確な証拠に基づく強い推論を表します。'
  },
  {
    id: 'int_extra_3',
    level: 'intermediate',
    modalType: 'weak_possibility',
    enemy: '🌟',
    enemyName: 'Shooting Star',
    prompt: '彼女は忙しくて来られないかもしれません。',
    context: 'より弱い可能性',
    options: [
      { id: 'a', modal: 'might', isCorrect: true },
      { id: 'b', modal: 'may', isCorrect: false },
      { id: 'c', modal: 'must', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'might は may より弱い可能性を表します。'
  },
  {
    id: 'int_extra_4',
    level: 'intermediate',
    modalType: 'past_ability',
    enemy: '🏊‍♀️',
    enemyName: 'Former Swimmer',
    prompt: '子供の頃、彼女は泳ぐことができました。',
    context: '過去の能力',
    options: [
      { id: 'a', modal: 'could', isCorrect: true },
      { id: 'b', modal: 'can', isCorrect: false },
      { id: 'c', modal: 'would', isCorrect: false },
      { id: 'd', modal: 'should', isCorrect: false }
    ],
    explanation: 'could は can の過去形で、過去の能力を表します。'
  },
  {
    id: 'int_extra_5',
    level: 'intermediate',
    modalType: 'expectation',
    enemy: '🚛',
    enemyName: 'Delivery Truck',
    prompt: '荷物は今日届くはずです。',
    context: '予定・期待',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'will', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'should は「〜するはずだ」という期待を表します。'
  },
  {
    id: 'int_extra_6',
    level: 'intermediate',
    modalType: 'necessity_vs_obligation',
    enemy: '🧹',
    enemyName: 'Cleaning Robot',
    prompt: '部屋が汚いので掃除しなくてはならない。',
    context: '個人的必要性',
    options: [
      { id: 'a', modal: 'have to', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'have to は個人的な必要性を表し、must より主観的です。'
  },
  {
    id: 'int_extra_7',
    level: 'intermediate',
    modalType: 'conditional_politeness',
    enemy: '🎭',
    enemyName: 'Theater Usher',
    prompt: 'もしお時間があるときに、お話しいただけませんか？',
    context: '条件付きの丁寧な依頼',
    options: [
      { id: 'a', modal: 'Would you', isCorrect: true },
      { id: 'b', modal: 'Will you', isCorrect: false },
      { id: 'c', modal: 'Can you', isCorrect: false },
      { id: 'd', modal: 'Should you', isCorrect: false }
    ],
    explanation: 'Would you は条件付きの非常に丁寧な依頼に使います。'
  },
  {
    id: 'int_extra_8',
    level: 'intermediate',
    modalType: 'polite_permission',
    enemy: '🏛️',
    enemyName: 'Museum Guard',
    prompt: '写真を撮らせていただいてもよろしいでしょうか？',
    context: '最高レベルの丁寧さ',
    options: [
      { id: 'a', modal: 'May I', isCorrect: true },
      { id: 'b', modal: 'Can I', isCorrect: false },
      { id: 'c', modal: 'Could I', isCorrect: false },
      { id: 'd', modal: 'Will I', isCorrect: false }
    ],
    explanation: 'May I は最も丁寧な許可の依頼で、フォーマルな場面で使います。'
  },
  {
    id: 'int_extra_9',
    level: 'intermediate',
    modalType: 'strong_advice',
    enemy: '⛑️',
    enemyName: 'Safety Officer',
    prompt: '危険なので、ヘルメットをかぶるべきです。',
    context: '安全に関する強い推奨',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'may', isCorrect: false },
      { id: 'c', modal: 'can', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'should は安全に関する重要な助言を表します。'
  },
  {
    id: 'int_extra_10',
    level: 'intermediate',
    modalType: 'general',
    enemy: '🌍',
    enemyName: 'Earth Guardian',
    prompt: '猫は一般的に魚を好むものです。',
    context: '一般的傾向',
    options: [
      { id: 'a', modal: 'will', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'should', isCorrect: false },
      { id: 'd', modal: 'can', isCorrect: false }
    ],
    explanation: 'will は一般的傾向や習性を表すことができます。'
  },
  {
    id: 'int_extra_11',
    level: 'intermediate',
    modalType: 'deduction',
    enemy: '🔑',
    enemyName: 'Key Master',
    prompt: '鍵がかかっているので、誰かが出かけたに違いない。',
    context: '状況からの論理的推論',
    options: [
      { id: 'a', modal: 'must have gone out', isCorrect: true },
      { id: 'b', modal: 'should have gone out', isCorrect: false },
      { id: 'c', modal: 'may have gone out', isCorrect: false },
      { id: 'd', modal: 'could have gone out', isCorrect: false }
    ],
    explanation: 'must have + 過去分詞は証拠に基づく過去への強い推論です。'
  },
  {
    id: 'int_extra_12',
    level: 'intermediate',
    modalType: 'politeness',
    enemy: '👑',
    enemyName: 'Royal Butler',
    prompt: 'お茶をお持ちしましょうか？',
    context: '丁寧な申し出',
    options: [
      { id: 'a', modal: 'Shall I', isCorrect: true },
      { id: 'b', modal: 'Will I', isCorrect: false },
      { id: 'c', modal: 'Can I', isCorrect: false },
      { id: 'd', modal: 'Should I', isCorrect: false }
    ],
    explanation: 'Shall I は非常に丁寧な申し出に使う特別な表現です。'
  },
  {
    id: 'int_extra_13',
    level: 'intermediate',
    modalType: 'past_ability',
    enemy: '🎸',
    enemyName: 'Guitar Hero',
    prompt: '彼は昔ギターを弾くことができました。',
    context: '過去の音楽的才能',
    options: [
      { id: 'a', modal: 'could', isCorrect: true },
      { id: 'b', modal: 'can', isCorrect: false },
      { id: 'c', modal: 'would', isCorrect: false },
      { id: 'd', modal: 'should', isCorrect: false }
    ],
    explanation: 'could は過去に持っていた技能や才能を表します。'
  },
  {
    id: 'int_extra_14',
    level: 'intermediate',
    modalType: 'weak_possibility',
    enemy: '🎰',
    enemyName: 'Luck Machine',
    prompt: '宝くじが当たるかもしれませんが、可能性は低いです。',
    context: '非常に低い可能性',
    options: [
      { id: 'a', modal: 'might', isCorrect: true },
      { id: 'b', modal: 'may', isCorrect: false },
      { id: 'c', modal: 'must', isCorrect: false },
      { id: 'd', modal: 'will', isCorrect: false }
    ],
    explanation: 'might は非常に低い可能性を表現する際に使います。'
  },
  {
    id: 'int_extra_15',
    level: 'intermediate',
    modalType: 'expectation',
    enemy: '📊',
    enemyName: 'Report Generator',
    prompt: '結果は明日発表されるはずです。',
    context: '公式な予定・期待',
    options: [
      { id: 'a', modal: 'should', isCorrect: true },
      { id: 'b', modal: 'must', isCorrect: false },
      { id: 'c', modal: 'will', isCorrect: false },
      { id: 'd', modal: 'may', isCorrect: false }
    ],
    explanation: 'should は公式なスケジュールへの期待を表します。'
  },

  // ===== 上級レベル追加問題 (ADDITIONAL ADVANCED PROBLEMS) =====
  
  {
    id: 'adv_extra_1',
    level: 'advanced',
    modalType: 'past_regret',
    enemy: '📖',
    enemyName: 'Study Ghost',
    prompt: 'もっと注意深く読むべきでした。',
    context: '読書への後悔',
    options: [
      { id: 'a', modal: 'should have read', isCorrect: true },
      { id: 'b', modal: 'must have read', isCorrect: false },
      { id: 'c', modal: 'could have read', isCorrect: false },
      { id: 'd', modal: 'would have read', isCorrect: false }
    ],
    explanation: 'should have + 過去分詞は過去の行動への後悔を表します。'
  },
  {
    id: 'adv_extra_2',
    level: 'advanced',
    modalType: 'unrealized_ability',
    enemy: '🥇',
    enemyName: 'Missed Champion',
    prompt: '彼は勝つことができたはずです（能力はあったが負けた）。',
    context: '実現しなかった可能性',
    options: [
      { id: 'a', modal: 'could have won', isCorrect: true },
      { id: 'b', modal: 'should have won', isCorrect: false },
      { id: 'c', modal: 'must have won', isCorrect: false },
      { id: 'd', modal: 'would have won', isCorrect: false }
    ],
    explanation: 'could have + 過去分詞は実現しなかった過去の可能性を表します。'
  },
  {
    id: 'adv_extra_3',
    level: 'advanced',
    modalType: 'conditional_past',
    enemy: '🌧️',
    enemyName: 'Rain Regret',
    prompt: 'もし雨が降らなかったら、ピクニックに行けたでしょう。',
    context: '仮定法過去完了',
    options: [
      { id: 'a', modal: 'could have gone', isCorrect: true },
      { id: 'b', modal: 'should have gone', isCorrect: false },
      { id: 'c', modal: 'must have gone', isCorrect: false },
      { id: 'd', modal: 'will have gone', isCorrect: false }
    ],
    explanation: 'could have + 過去分詞は仮定法で実現しなかった可能性を表します。'
  },
  {
    id: 'adv_extra_4',
    level: 'advanced',
    modalType: 'past_deduction',
    enemy: '🕰️',
    enemyName: 'Time Detective',
    prompt: '彼女は先週そのニュースを聞いていたに違いない。',
    context: '過去の情報への推論',
    options: [
      { id: 'a', modal: 'must have heard', isCorrect: true },
      { id: 'b', modal: 'should have heard', isCorrect: false },
      { id: 'c', modal: 'could have heard', isCorrect: false },
      { id: 'd', modal: 'would have heard', isCorrect: false }
    ],
    explanation: 'must have + 過去分詞は過去の出来事への強い確信です。'
  },
  {
    id: 'adv_extra_5',
    level: 'advanced',
    modalType: 'subtle_criticism',
    enemy: '💻',
    enemyName: 'Tech Reviewer',
    prompt: 'このシステムはもう少し使いやすくできたかもしれません。',
    context: '間接的な改善提案',
    options: [
      { id: 'a', modal: 'could have been', isCorrect: true },
      { id: 'b', modal: 'should have been', isCorrect: false },
      { id: 'c', modal: 'must have been', isCorrect: false },
      { id: 'd', modal: 'would have been', isCorrect: false }
    ],
    explanation: 'could have been は丁寧で間接的な批判や改善提案を表します。'
  },
  {
    id: 'adv_extra_6',
    level: 'advanced',
    modalType: 'past_possibility',
    enemy: '🚗',
    enemyName: 'Traffic Mystery',
    prompt: '彼は渋滞に巻き込まれたかもしれません。',
    context: '過去の状況への推測',
    options: [
      { id: 'a', modal: 'may have been caught', isCorrect: true },
      { id: 'b', modal: 'must have been caught', isCorrect: false },
      { id: 'c', modal: 'should have been caught', isCorrect: false },
      { id: 'd', modal: 'would have been caught', isCorrect: false }
    ],
    explanation: 'may have been + 過去分詞は過去への推測を表します。'
  },
  {
    id: 'adv_extra_7',
    level: 'advanced',
    modalType: 'hypothetical_reasoning',
    enemy: '⚗️',
    enemyName: 'Science Wizard',
    prompt: 'もし実験が成功していたら、歴史が変わっていたでしょう。',
    context: '仮定的歴史推論',
    options: [
      { id: 'a', modal: 'would have changed', isCorrect: true },
      { id: 'b', modal: 'could have changed', isCorrect: false },
      { id: 'c', modal: 'should have changed', isCorrect: false },
      { id: 'd', modal: 'must have changed', isCorrect: false }
    ],
    explanation: 'would have + 過去分詞は仮定法で起こらなかった結果を表します。'
  },
  {
    id: 'adv_extra_8',
    level: 'advanced',
    modalType: 'logical_deduction',
    enemy: '🔬',
    enemyName: 'Logic Professor',
    prompt: '証拠から判断して、犯人は内部の人間でなければならない。',
    context: '論理的必然性',
    options: [
      { id: 'a', modal: 'must be', isCorrect: true },
      { id: 'b', modal: 'should be', isCorrect: false },
      { id: 'c', modal: 'could be', isCorrect: false },
      { id: 'd', modal: 'would be', isCorrect: false }
    ],
    explanation: 'must は論理的推論による必然的結論を表します。'
  },
  {
    id: 'adv_extra_9',
    level: 'advanced',
    modalType: 'graduated_certainty',
    enemy: '📈',
    enemyName: 'Probability Master',
    prompt: '彼の表情から判断すると、合格した可能性が高い。',
    context: '高い確率の推測',
    options: [
      { id: 'a', modal: 'is likely to have passed', isCorrect: true },
      { id: 'b', modal: 'must have passed', isCorrect: false },
      { id: 'c', modal: 'should have passed', isCorrect: false },
      { id: 'd', modal: 'could have passed', isCorrect: false }
    ],
    explanation: 'be likely to have + 過去分詞は高い確率の推測を表す洗練された表現です。'
  },
  {
    id: 'adv_extra_10',
    level: 'advanced',
    modalType: 'complex_expectation',
    enemy: '🏗️',
    enemyName: 'Construction Manager',
    prompt: 'この時間なら、工事は既に完了しているはずです。',
    context: '時間的期待の複雑表現',
    options: [
      { id: 'a', modal: 'should have been completed', isCorrect: true },
      { id: 'b', modal: 'must have been completed', isCorrect: false },
      { id: 'c', modal: 'could have been completed', isCorrect: false },
      { id: 'd', modal: 'would have been completed', isCorrect: false }
    ],
    explanation: 'should have been + 過去分詞は期待される完了状態を表します。'
  },
  {
    id: 'adv_extra_11',
    level: 'advanced',
    modalType: 'past_regret',
    enemy: '💔',
    enemyName: 'Heartbreak Helper',
    prompt: 'もっと早く言うべきでした。',
    context: 'コミュニケーションへの後悔',
    options: [
      { id: 'a', modal: 'should have said', isCorrect: true },
      { id: 'b', modal: 'must have said', isCorrect: false },
      { id: 'c', modal: 'could have said', isCorrect: false },
      { id: 'd', modal: 'would have said', isCorrect: false }
    ],
    explanation: 'should have + 過去分詞は過去の行動への後悔を表します。'
  },
  {
    id: 'adv_extra_12',
    level: 'advanced',
    modalType: 'unrealized_ability',
    enemy: '🎯',
    enemyName: 'Perfect Shot',
    prompt: '彼はその機会を逃さずに済んだはずです。',
    context: '逃した機会への言及',
    options: [
      { id: 'a', modal: 'could have taken', isCorrect: true },
      { id: 'b', modal: 'should have taken', isCorrect: false },
      { id: 'c', modal: 'must have taken', isCorrect: false },
      { id: 'd', modal: 'would have taken', isCorrect: false }
    ],
    explanation: 'could have + 過去分詞は逃した機会や可能性を表します。'
  },
  {
    id: 'adv_extra_13',
    level: 'advanced',
    modalType: 'conditional_past',
    enemy: '🎬',
    enemyName: 'Movie Director',
    prompt: 'もしあの俳優が出演していたら、映画はもっと成功していたでしょう。',
    context: '仮定的成功',
    options: [
      { id: 'a', modal: 'would have been', isCorrect: true },
      { id: 'b', modal: 'could have been', isCorrect: false },
      { id: 'c', modal: 'should have been', isCorrect: false },
      { id: 'd', modal: 'must have been', isCorrect: false }
    ],
    explanation: 'would have been は仮定法で実現しなかった結果を表します。'
  },
  {
    id: 'adv_extra_14',
    level: 'advanced',
    modalType: 'past_deduction',
    enemy: '📚',
    enemyName: 'Knowledge Keeper',
    prompt: '彼女はその本を読んでいたに違いない（詳しく知っているから）。',
    context: '知識に基づく推論',
    options: [
      { id: 'a', modal: 'must have read', isCorrect: true },
      { id: 'b', modal: 'should have read', isCorrect: false },
      { id: 'c', modal: 'could have read', isCorrect: false },
      { id: 'd', modal: 'would have read', isCorrect: false }
    ],
    explanation: 'must have + 過去分詞は証拠に基づく強い推論を表します。'
  },
  {
    id: 'adv_extra_15',
    level: 'advanced',
    modalType: 'subtle_criticism',
    enemy: '🎨',
    enemyName: 'Art Critic',
    prompt: 'この作品はもう少し色彩豊かであってもよかったかもしれません。',
    context: '芸術への婉曲な批評',
    options: [
      { id: 'a', modal: 'could have been', isCorrect: true },
      { id: 'b', modal: 'should have been', isCorrect: false },
      { id: 'c', modal: 'must have been', isCorrect: false },
      { id: 'd', modal: 'would have been', isCorrect: false }
    ],
    explanation: 'could have been は芸術作品への丁寧で間接的な批評に使います。'
  }
];