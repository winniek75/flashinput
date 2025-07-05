// ADVANCED LEVEL - All Perfect Continuous Tenses + Complex Grammar
// より抽象的・学術的な語彙、長めの文（副詞節や複数の時制が混在）、4択以上
export const advancedQuestions = [
  {
    id: 'a1',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '私は3時間ずっと英語を勉強し続けています。',
    options: [
      { id: 'a', form: 'have been studying', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'am studying', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'studied', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'have studied', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：3時間前から現在まで継続中の動作。'
  },
  {
    id: 'a2',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '私が到着するまでに、彼は2時間待ち続けていました。',
    options: [
      { id: 'a', form: 'had been waiting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'has been waiting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'was waiting', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'waited', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：到着前の2時間の継続動作。'
  },
  {
    id: 'a3',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '来月までに、私はこの会社で10年間働き続けていることになります。',
    options: [
      { id: 'a', form: 'will have been working', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be working', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been working', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will work', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：来月までの10年間の継続。'
  },
  {
    id: 'a4',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '彼女は朝から体調が悪いと訴え続けています。',
    options: [
      { id: 'a', form: 'has been complaining', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is complaining', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'complained', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'has complained', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'was complaining', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：朝から現在までの継続動作。'
  },
  {
    id: 'a5',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '事故が起こる前、彼は3時間運転し続けていました。',
    options: [
      { id: 'a', form: 'had been driving', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was driving', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been driving', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'drove', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：事故前の3時間の継続動作。'
  },
  {
    id: 'a6',
    level: 'advanced',
    tenseType: 'conditional_perfect',
    obstacleType: 'debris',
    prompt: 'もし彼がもっと注意深く運転していたら、事故は起こらなかったでしょう。',
    options: [
      { id: 'a', form: 'would not have happened', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'would not happen', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'had not happened', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will not happen', speedBoost: 0, isCorrect: false }
    ],
    explanation: '第三条件文：過去の仮定の結果。'
  },
  {
    id: 'a7',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '最近、環境問題について多くの議論がなされ続けています。',
    options: [
      { id: 'a', form: 'have been being made', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'are being made', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been made', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'were being made', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'are made', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形の受動態：最近から現在までの継続。'
  },
  {
    id: 'a8',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'debris',
    prompt: '来年の今頃、私たちは新しいプロジェクトに1年間取り組み続けていることになるでしょう。',
    options: [
      { id: 'a', form: 'will have been working on', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be working on', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been working on', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will work on', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：来年までの1年間の継続。'
  },
  {
    id: 'a9',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '彼らが結婚する前、5年間付き合い続けていました。',
    options: [
      { id: 'a', form: 'had been dating', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were dating', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been dating', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'dated', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'had dated', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：結婚前の5年間の継続関係。'
  },
  {
    id: 'a10',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '科学者たちは何十年もこの問題を研究し続けています。',
    options: [
      { id: 'a', form: 'have been researching', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'are researching', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have researched', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'researched', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：何十年前から現在までの継続研究。'
  },
  {
    id: 'a11',
    level: 'advanced',
    tenseType: 'conditional_continuous',
    obstacleType: 'asteroid',
    prompt: 'もし私が鳥だったら、今頃南の島へ飛んでいるでしょう。',
    options: [
      { id: 'a', form: 'would be flying', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be flying', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'would fly', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'am flying', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'flew', speedBoost: 0, isCorrect: false }
    ],
    explanation: '第二条件文の進行形：非現実的な仮定の継続動作。'
  },
  {
    id: 'a12',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '会議が始まるまでに、彼らは3時間議論し続けていました。',
    options: [
      { id: 'a', form: 'had been discussing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were discussing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been discussing', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'discussed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：会議開始前の3時間の継続議論。'
  },
  {
    id: 'a13',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '2030年までに、人類は100年以上宇宙探査を続けていることになります。',
    options: [
      { id: 'a', form: 'will have been exploring', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be exploring', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been exploring', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will explore', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'explored', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：2030年までの100年以上の継続。'
  },
  {
    id: 'a14',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '政府は新しい政策の実施を検討し続けています。',
    options: [
      { id: 'a', form: 'has been considering', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is considering', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has considered', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'considered', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な検討プロセス。'
  },
  {
    id: 'a15',
    level: 'advanced',
    tenseType: 'mixed_conditional',
    obstacleType: 'asteroid',
    prompt: 'もし昨日勉強していたら、今頃試験に合格しているでしょう。',
    options: [
      { id: 'a', form: 'would have passed', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'would pass', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'had passed', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will pass', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'passed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '混合条件文：過去の行動が現在の結果に影響。'
  },
  {
    id: 'a16',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '彼女が引退するまでに、30年間教師として働き続けていました。',
    options: [
      { id: 'a', form: 'had been working', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was working', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been working', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'worked', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：引退前の30年間の継続勤務。'
  },
  {
    id: 'a17',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '技術の進歩により、私たちの生活は急速に変化し続けています。',
    options: [
      { id: 'a', form: 'has been changing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is changing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has changed', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'changes', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'changed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な変化のプロセス。'
  },
  {
    id: 'a18',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'debris',
    prompt: '彼が定年退職する頃には、40年間この分野で研究を続けていることになるでしょう。',
    options: [
      { id: 'a', form: 'will have been researching', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be researching', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been researching', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will research', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：退職までの40年間の継続研究。'
  },
  {
    id: 'a19',
    level: 'advanced',
    tenseType: 'conditional_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: 'もし彼らが協力していたら、今頃プロジェクトは完成に向けて進んでいたでしょう。',
    options: [
      { id: 'a', form: 'would have been progressing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'would be progressing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'had been progressing', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'would progress', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'progressed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '条件文の完了進行形：仮定の継続的な進展。'
  },
  {
    id: 'a20',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '経済状況は過去数ヶ月間改善し続けています。',
    options: [
      { id: 'a', form: 'has been improving', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is improving', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has improved', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'improved', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：数ヶ月間の継続的改善。'
  },
  {
    id: 'a21',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '彼らが解決策を見つける前に、何週間も問題について考え続けていました。',
    options: [
      { id: 'a', form: 'had been thinking', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were thinking', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been thinking', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'thought', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'had thought', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：解決前の継続的思考。'
  },
  {
    id: 'a22',
    level: 'advanced',
    tenseType: 'future_perfect',
    obstacleType: 'debris',
    prompt: '来月までに、新しいシステムの導入が完了しているでしょう。',
    options: [
      { id: 'a', form: 'will have been completed', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be completed', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been completed', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will complete', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了形の受動態：来月までの完了。'
  },
  {
    id: 'a23',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '多くの企業が持続可能な経営方針を採用し続けています。',
    options: [
      { id: 'a', form: 'have been adopting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'are adopting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have adopted', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'adopt', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'adopted', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な採用プロセス。'
  },
  {
    id: 'a24',
    level: 'advanced',
    tenseType: 'mixed_tenses',
    obstacleType: 'debris',
    prompt: '私が到着したとき、彼らはすでに2時間会議をしていて、まだ結論に達していませんでした。',
    options: [
      { id: 'a', form: 'had been having', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were having', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been having', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'had', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：到着時点で2時間継続中の会議。'
  },
  {
    id: 'a25',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '来年の春には、彼女は5年間この研究プロジェクトに携わり続けていることになります。',
    options: [
      { id: 'a', form: 'will have been involved in', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be involved in', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been involved in', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will involve in', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'involved in', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：来春までの5年間の継続関与。'
  },
  {
    id: 'a26',
    level: 'advanced',
    tenseType: 'conditional_mixed',
    obstacleType: 'debris',
    prompt: 'もし私が金持ちだったら、今頃世界中を旅して回っているでしょう。',
    options: [
      { id: 'a', form: 'would be traveling', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be traveling', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'would travel', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'am traveling', speedBoost: 0, isCorrect: false }
    ],
    explanation: '第二条件文の進行形：現在の非現実的な継続動作。'
  },
  {
    id: 'a27',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '気候変動の影響により、極地の氷が急速に溶け続けています。',
    options: [
      { id: 'a', form: 'has been melting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is melting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has melted', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'melts', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'melted', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な融解プロセス。'
  },
  {
    id: 'a28',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '彼が病気になる前、何ヶ月も過度に働き続けていました。',
    options: [
      { id: 'a', form: 'had been working', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was working', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been working', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'worked', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：病気前の過度な労働の継続。'
  },
  {
    id: 'a29',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '2025年末までに、このプロジェクトは3年間実施され続けていることになるでしょう。',
    options: [
      { id: 'a', form: 'will have been being implemented', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be being implemented', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been being implemented', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will be implemented', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'implemented', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形の受動態：2025年末までの3年間の継続実施。'
  },
  {
    id: 'a30',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '研究者たちは新薬の開発に何年も取り組み続けています。',
    options: [
      { id: 'a', form: 'have been working on', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'are working on', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have worked on', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'worked on', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：何年もの継続的な開発作業。'
  },
  {
    id: 'a31',
    level: 'advanced',
    tenseType: 'conditional_perfect',
    obstacleType: 'asteroid',
    prompt: 'もし彼らが早く始めていたら、今頃プロジェクトは完成していたでしょう。',
    options: [
      { id: 'a', form: 'would have been completed', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'would be completed', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'had been completed', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will be completed', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'completed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '第三条件文の受動態：早期開始による完成の可能性。'
  },
  {
    id: 'a32',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '契約が終了するまでに、彼らは10年間協力関係を維持し続けていました。',
    options: [
      { id: 'a', form: 'had been maintaining', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were maintaining', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been maintaining', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'maintained', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：契約終了前の10年間の継続的維持。'
  },
  {
    id: 'a33',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '彼女が博士号を取得する頃には、8年間研究を続けていることになるでしょう。',
    options: [
      { id: 'a', form: 'will have been conducting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be conducting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been conducting', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will conduct', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'conducted', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：博士号取得までの8年間の継続研究。'
  },
  {
    id: 'a34',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: 'テクノロジーの発展により、私たちの働き方は劇的に変化し続けています。',
    options: [
      { id: 'a', form: 'has been changing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is changing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has changed', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'changes', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な変化のプロセス。'
  },
  {
    id: 'a35',
    level: 'advanced',
    tenseType: 'mixed_conditional',
    obstacleType: 'asteroid',
    prompt: 'もし私が早く起きていたら、今頃会議に参加し続けているでしょう。',
    options: [
      { id: 'a', form: 'would be attending', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'would have attended', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'will be attending', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'attended', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'am attending', speedBoost: 0, isCorrect: false }
    ],
    explanation: '混合条件文：過去の行動が現在の継続動作に影響。'
  },
  {
    id: 'a36',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '事故が起こるまで、彼は20年間無事故で運転し続けていました。',
    options: [
      { id: 'a', form: 'had been driving', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'was driving', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been driving', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'drove', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：事故前の20年間の無事故運転。'
  },
  {
    id: 'a37',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '来月で、私たちは新しいオフィスで1年間働き続けていることになります。',
    options: [
      { id: 'a', form: 'will have been working', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be working', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been working', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'work', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'worked', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：来月までの1年間の継続勤務。'
  },
  {
    id: 'a38',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '環境保護団体は政府に対して規制強化を求め続けています。',
    options: [
      { id: 'a', form: 'have been demanding', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'are demanding', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have demanded', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'demanded', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な要求活動。'
  },
  {
    id: 'a39',
    level: 'advanced',
    tenseType: 'conditional_continuous',
    obstacleType: 'asteroid',
    prompt: 'もし天気が良かったら、私たちは今頃ピクニックを楽しんでいるでしょう。',
    options: [
      { id: 'a', form: 'would be enjoying', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be enjoying', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'would enjoy', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'are enjoying', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'enjoyed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '第二条件文の進行形：天気による現在の継続動作。'
  },
  {
    id: 'a40',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '彼らが離婚する前、何年も関係修復の努力を続けていました。',
    options: [
      { id: 'a', form: 'had been trying', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were trying', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been trying', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'tried', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：離婚前の継続的な努力。'
  },
  {
    id: 'a41',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '2050年には、人工知能は30年以上私たちの生活を支援し続けていることになるでしょう。',
    options: [
      { id: 'a', form: 'will have been supporting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be supporting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been supporting', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will support', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'supported', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：2050年までの30年以上の継続支援。'
  },
  {
    id: 'a42',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '多くの国が再生可能エネルギーへの移行を進め続けています。',
    options: [
      { id: 'a', form: 'have been transitioning', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'are transitioning', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have transitioned', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'transition', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な移行プロセス。'
  },
  {
    id: 'a43',
    level: 'advanced',
    tenseType: 'mixed_tenses',
    obstacleType: 'asteroid',
    prompt: '彼が到着したとき、私たちはすでに3時間待ち続けていて、帰ろうとしていました。',
    options: [
      { id: 'a', form: 'had been waiting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were waiting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been waiting', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'waited', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'wait', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：到着時点での3時間の継続待機。'
  },
  {
    id: 'a44',
    level: 'advanced',
    tenseType: 'conditional_perfect_continuous',
    obstacleType: 'debris',
    prompt: 'もし彼らが資金を得ていたら、今頃5年間研究を続けていたでしょう。',
    options: [
      { id: 'a', form: 'would have been conducting', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'would be conducting', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'had been conducting', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'conducted', speedBoost: 0, isCorrect: false }
    ],
    explanation: '条件文の完了進行形：資金による5年間の継続研究の可能性。'
  },
  {
    id: 'a45',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '社会のデジタル化は予想以上の速さで進行し続けています。',
    options: [
      { id: 'a', form: 'has been progressing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is progressing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has progressed', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'progresses', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'progressed', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な進行プロセス。'
  },
  {
    id: 'a46',
    level: 'advanced',
    tenseType: 'past_perfect_continuous',
    obstacleType: 'debris',
    prompt: '会社が倒産する前、経営陣は何ヶ月も解決策を模索し続けていました。',
    options: [
      { id: 'a', form: 'had been seeking', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'were seeking', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been seeking', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'sought', speedBoost: 0, isCorrect: false }
    ],
    explanation: '過去完了進行形：倒産前の継続的な模索。'
  },
  {
    id: 'a47',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'asteroid',
    prompt: '彼が引退する頃には、50年間医療に従事し続けていることになるでしょう。',
    options: [
      { id: 'a', form: 'will have been practicing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be practicing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has been practicing', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will practice', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'practiced', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：引退までの50年間の継続従事。'
  },
  {
    id: 'a48',
    level: 'advanced',
    tenseType: 'present_perfect_continuous',
    obstacleType: 'debris',
    prompt: '国際社会は気候変動対策について議論を重ね続けています。',
    options: [
      { id: 'a', form: 'has been discussing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'is discussing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'has discussed', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'discusses', speedBoost: 0, isCorrect: false }
    ],
    explanation: '現在完了進行形：継続的な議論の積み重ね。'
  },
  {
    id: 'a49',
    level: 'advanced',
    tenseType: 'conditional_mixed',
    obstacleType: 'asteroid',
    prompt: 'もし私が若かったら、今頃新しいキャリアに挑戦し続けているでしょう。',
    options: [
      { id: 'a', form: 'would be challenging', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be challenging', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'would challenge', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'am challenging', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'challenged', speedBoost: 0, isCorrect: false }
    ],
    explanation: '第二条件文の進行形：年齢による現在の継続的挑戦。'
  },
  {
    id: 'a50',
    level: 'advanced',
    tenseType: 'future_perfect_continuous',
    obstacleType: 'debris',
    prompt: '2100年には、人類は200年以上産業革命の影響を受け続けていることになるでしょう。',
    options: [
      { id: 'a', form: 'will have been experiencing', speedBoost: 25, isCorrect: true },
      { id: 'b', form: 'will be experiencing', speedBoost: 0, isCorrect: false },
      { id: 'c', form: 'have been experiencing', speedBoost: 0, isCorrect: false },
      { id: 'd', form: 'will experience', speedBoost: 0, isCorrect: false },
      { id: 'e', form: 'experienced', speedBoost: 0, isCorrect: false }
    ],
    explanation: '未来完了進行形：2100年までの200年以上の継続的影響。'
  }
];