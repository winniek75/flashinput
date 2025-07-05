// INTERMEDIATE LEVEL - Past/Future Continuous, Present Continuous
// 幅広い日常語彙、やや長い文、副詞や時制を示す語句が入る、3〜4択
export const intermediateQuestions = [
  {
    id: 'i1',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '昨日の8時、私は宿題をしていました。',
    options: [
      { id: 'a', form: 'was doing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'did', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'am doing', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'have done', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の特定時点での進行動作は過去進行形。'
  },
  {
    id: 'i2',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'debris',
    prompt: '明日の今頃、私は飛行機で旅行しているでしょう。',
    options: [
      { id: 'a', form: 'will be traveling', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will travel', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'travel', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作は未来進行形。'
  },
  {
    id: 'i3',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '私が電話したとき、彼女は料理をしていました。',
    options: [
      { id: 'a', form: 'was cooking', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'cooked', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'cooks', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is cooking', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の特定時点での進行動作。'
  },
  {
    id: 'i4',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '私たちは昨日公園で遊びました。',
    options: [
      { id: 'a', form: 'played', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were playing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'play', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i5',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '雨が降っている間、私は家で本を読んでいました。',
    options: [
      { id: 'a', form: 'was reading', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'read', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'am reading', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'have read', speedBoost: 0, isCorrect: false }
    ],
    explanation: '雨が降っている間の継続動作。'
  },
  {
    id: 'i6',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'debris',
    prompt: '来週の月曜日、私は新しいプロジェクトに取り組んでいるでしょう。',
    options: [
      { id: 'a', form: 'will be working on', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will work on', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'work on', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i7',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '私が帰宅したとき、母は夕食を作っていました。',
    options: [
      { id: 'a', form: 'was making', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'made', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'makes', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'has made', speedBoost: 0, isCorrect: false }
    ],
    explanation: '帰宅時点での進行動作。'
  },
  {
    id: 'i8',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '昨日、私たちは博物館を訪れました。',
    options: [
      { id: 'a', form: 'visited', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were visiting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'visit', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i9',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '彼女は一日中本を読んでいました。',
    options: [
      { id: 'a', form: 'was reading', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'read', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'reads', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is reading', speedBoost: 0, isCorrect: false }
    ],
    explanation: '一日中続いた過去の動作。'
  },
  {
    id: 'i10',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'debris',
    prompt: '今夜8時には、彼らはパーティーを楽しんでいるでしょう。',
    options: [
      { id: 'a', form: 'will be enjoying', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will enjoy', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'enjoy', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i11',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '彼らは昨夜遅くまでパーティーをしていました。',
    options: [
      { id: 'a', form: 'were having', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'had', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'are having', speedBoost: 0, isCorrect: false }
    ],
    explanation: '昨夜の継続した動作。'
  },
  {
    id: 'i12',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '私は去年英語の勉強を始めました。',
    options: [
      { id: 'a', form: 'started', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was starting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'start', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の開始点。'
  },
  {
    id: 'i13',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: 'テレビを見ている間、彼は眠ってしまいました。',
    options: [
      { id: 'a', form: 'fell asleep', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was falling asleep', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'falls asleep', speedBoost: 0, isCorrect: false }
    ],
    explanation: '瞬間的な過去の動作（主節）。'
  },
  {
    id: 'i14',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'debris',
    prompt: '明日の午後3時、私たちは会議をしているでしょう。',
    options: [
      { id: 'a', form: 'will be having', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will have', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'are having', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i15',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '昨日の午後、私は買い物をしていました。',
    options: [
      { id: 'a', form: 'was shopping', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'shopped', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'shop', speedBoost: 0, isCorrect: false }
    ],
    explanation: '午後の継続動作。'
  },
  {
    id: 'i16',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '彼女は昨日新しいドレスを買いました。',
    options: [
      { id: 'a', form: 'bought', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was buying', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'buys', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is buying', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i17',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '私がドアを開けたとき、猫が外に走り出していました。',
    options: [
      { id: 'a', form: 'was running out', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'ran out', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'runs out', speedBoost: 0, isCorrect: false }
    ],
    explanation: 'ドアを開けた時点での進行動作。'
  },
  {
    id: 'i18',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'debris',
    prompt: '来月の今頃、私は新しい仕事を始めているでしょう。',
    options: [
      { id: 'a', form: 'will be starting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will start', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'start', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i19',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'asteroid',
    prompt: '彼は3年前にここに引っ越してきました。',
    options: [
      { id: 'a', form: 'moved', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was moving', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'moves', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is moving', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i20',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'debris',
    prompt: '雷が鳴っている間、私たちは家で待機していました。',
    options: [
      { id: 'a', form: 'were waiting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'waited', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'wait', speedBoost: 0, isCorrect: false }
    ],
    explanation: '雷の間の継続状態。'
  },
  {
    id: 'i21',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'asteroid',
    prompt: '明日の朝10時、私は歯医者で治療を受けているでしょう。',
    options: [
      { id: 'a', form: 'will be getting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will get', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'get', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'am getting', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i22',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '昨日、私は古い友人と話しました。',
    options: [
      { id: 'a', form: 'talked', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was talking', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'talk', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i23',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '彼女は朝から晩まで働いていました。',
    options: [
      { id: 'a', form: 'was working', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'worked', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'works', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is working', speedBoost: 0, isCorrect: false }
    ],
    explanation: '朝から晩までの継続動作。'
  },
  {
    id: 'i24',
    level: 'intermediate',
    tenseType: 'present_continuous',
    obstacleType: 'debris',
    prompt: '最近、私は新しいスキルを学んでいます。',
    options: [
      { id: 'a', form: 'am learning', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'learn', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'learned', speedBoost: 0, isCorrect: false }
    ],
    explanation: '最近の継続的な活動。'
  },
  {
    id: 'i25',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'asteroid',
    prompt: '私は昨夜早く寝ました。',
    options: [
      { id: 'a', form: 'went to bed', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was going to bed', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'go to bed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i26',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'debris',
    prompt: '彼が来たとき、私は掃除をしていました。',
    options: [
      { id: 'a', form: 'was cleaning', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'cleaned', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'clean', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'am cleaning', speedBoost: 0, isCorrect: false }
    ],
    explanation: '彼が来た時点での進行動作。'
  },
  {
    id: 'i27',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'asteroid',
    prompt: '来週の今頃、私たちは海で泳いでいるでしょう。',
    options: [
      { id: 'a', form: 'will be swimming', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will swim', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'swim', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i28',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '昨年、私たちは新しい家を建てました。',
    options: [
      { id: 'a', form: 'built', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were building', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'build', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'are building', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i29',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '雨が降っている間、子供たちは家で遊んでいました。',
    options: [
      { id: 'a', form: 'were playing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'played', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'play', speedBoost: 0, isCorrect: false }
    ],
    explanation: '雨の間の継続動作。'
  },
  {
    id: 'i30',
    level: 'intermediate',
    tenseType: 'present_continuous',
    obstacleType: 'debris',
    prompt: '今週、私たちは新しいプロジェクトに取り組んでいます。',
    options: [
      { id: 'a', form: 'are working on', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'work on', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'worked on', speedBoost: 0, isCorrect: false }
    ],
    explanation: '今週の継続的な活動。'
  },
  {
    id: 'i31',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'asteroid',
    prompt: '彼女は昨日医者に行きました。',
    options: [
      { id: 'a', form: 'went', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was going', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'goes', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is going', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i32',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'debris',
    prompt: '私が宿題をしている間、母は夕食を作っていました。',
    options: [
      { id: 'a', form: 'was making', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'made', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'makes', speedBoost: 0, isCorrect: false }
    ],
    explanation: '宿題をしている間の同時動作。'
  },
  {
    id: 'i33',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'asteroid',
    prompt: '明後日の午後、彼らは試験を受けているでしょう。',
    options: [
      { id: 'a', form: 'will be taking', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will take', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'take', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'are taking', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i34',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '昨日、私は新しい車を買いました。',
    options: [
      { id: 'a', form: 'bought', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was buying', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'buy', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i35',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '彼は一日中テレビを見ていました。',
    options: [
      { id: 'a', form: 'was watching', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'watched', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'watches', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is watching', speedBoost: 0, isCorrect: false }
    ],
    explanation: '一日中の継続動作。'
  },
  {
    id: 'i36',
    level: 'intermediate',
    tenseType: 'present_continuous',
    obstacleType: 'debris',
    prompt: '最近、彼女は健康的な食事を心がけています。',
    options: [
      { id: 'a', form: 'is trying to eat', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'tries to eat', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'tried to eat', speedBoost: 0, isCorrect: false }
    ],
    explanation: '最近の継続的な努力。'
  },
  {
    id: 'i37',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'asteroid',
    prompt: '私たちは去年ヨーロッパを旅行しました。',
    options: [
      { id: 'a', form: 'traveled', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were traveling', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'travel', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i38',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'debris',
    prompt: '彼女が歌っている間、私は静かに聞いていました。',
    options: [
      { id: 'a', form: 'was listening', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'listened', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'listen', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'am listening', speedBoost: 0, isCorrect: false }
    ],
    explanation: '歌っている間の継続動作。'
  },
  {
    id: 'i39',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'asteroid',
    prompt: '今晩7時には、私は友達と夕食を食べているでしょう。',
    options: [
      { id: 'a', form: 'will be having', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will have', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i40',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '昨日、私は図書館で勉強しました。',
    options: [
      { id: 'a', form: 'studied', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was studying', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'study', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'am studying', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i41',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '電話が鳴っているとき、私はシャワーを浴びていました。',
    options: [
      { id: 'a', form: 'was taking', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'took', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'take', speedBoost: 0, isCorrect: false }
    ],
    explanation: '電話が鳴った時点での進行動作。'
  },
  {
    id: 'i42',
    level: 'intermediate',
    tenseType: 'present_continuous',
    obstacleType: 'debris',
    prompt: '今月、私たちは新しいシステムを導入しています。',
    options: [
      { id: 'a', form: 'are introducing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'introduce', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'introduced', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'were introducing', speedBoost: 0, isCorrect: false }
    ],
    explanation: '今月の継続的なプロセス。'
  },
  {
    id: 'i43',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'asteroid',
    prompt: '彼は先月新しい仕事を始めました。',
    options: [
      { id: 'a', form: 'started', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was starting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'starts', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i44',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'debris',
    prompt: '私が料理している間、彼は皿を洗っていました。',
    options: [
      { id: 'a', form: 'was washing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'washed', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'washes', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is washing', speedBoost: 0, isCorrect: false }
    ],
    explanation: '料理している間の同時動作。'
  },
  {
    id: 'i45',
    level: 'intermediate',
    tenseType: 'future_continuous',
    obstacleType: 'asteroid',
    prompt: '来年の今頃、私は大学で勉強しているでしょう。',
    options: [
      { id: 'a', form: 'will be studying', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will study', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'study', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来の特定時点での進行動作。'
  },
  {
    id: 'i46',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'debris',
    prompt: '昨日、私たちは映画館に行きました。',
    options: [
      { id: 'a', form: 'went', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were going', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'go', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i47',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'asteroid',
    prompt: '彼女は夜中まで本を読んでいました。',
    options: [
      { id: 'a', form: 'was reading', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'read', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'reads', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'is reading', speedBoost: 0, isCorrect: false }
    ],
    explanation: '夜中までの継続動作。'
  },
  {
    id: 'i48',
    level: 'intermediate',
    tenseType: 'present_continuous',
    obstacleType: 'debris',
    prompt: '今年、彼らは新しいビジネスを立ち上げています。',
    options: [
      { id: 'a', form: 'are launching', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'launch', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'launched', speedBoost: 0, isCorrect: false }
    ],
    explanation: '今年の継続的なプロセス。'
  },
  {
    id: 'i49',
    level: 'intermediate',
    tenseType: 'past_simple',
    obstacleType: 'asteroid',
    prompt: '私は昨日友達と会いました。',
    options: [
      { id: 'a', form: 'met', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was meeting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'meet', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去の完了した動作。'
  },
  {
    id: 'i50',
    level: 'intermediate',
    tenseType: 'past_continuous',
    obstacleType: 'debris',
    prompt: '雪が降っている間、私たちは家でゲームをしていました。',
    options: [
      { id: 'a', form: 'were playing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'played', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'play', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'are playing', speedBoost: 0, isCorrect: false }
    ],
    explanation: '雪の間の継続動作。'
  }
];