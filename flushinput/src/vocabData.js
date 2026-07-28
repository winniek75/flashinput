// ─────────────────────────────────────────────────────────────
// VOCABULARY DATABASE v2 — 実在画像のある60語のみ収録
// 5級30語 + 4級30語 / 各級 5ユニット × 6語
// localImg: webp優先 / fallbackImg: 同フォルダのjpg
// ─────────────────────────────────────────────────────────────

export const VOCAB_DB = {
  grade5: {
    label: "英検5級",
    shortLabel: "5級",
    color: "#4ade80",
    description: "中学1年レベル",
    unitTitles: {
      Unit01: "どうぶつと たべもの",
      Unit02: "まいにちの アクション",
      Unit03: "がっこうと まち",
      Unit04: "いえの なか",
      Unit05: "きもちと てんき",
    },
    units: {
      Unit01: [
        { word:"apple", japanese:"りんご", phonetic:"ǽpl", sentence:"I eat an apple every day.", localImg:"英検5級/apple.webp", fallbackImg:"英検5級/apple.jpg" },
        { word:"dog", japanese:"犬", phonetic:"dɔːɡ", sentence:"I have a big dog.", localImg:"英検5級/dog.webp", fallbackImg:"英検5級/dog.jpg" },
        { word:"cat", japanese:"猫", phonetic:"kǽt", sentence:"I have a cute cat.", localImg:"英検5級/cat.webp", fallbackImg:"英検5級/cat.jpg" },
        { word:"bird", japanese:"鳥", phonetic:"bɜːrd", sentence:"A bird sings in the tree.", localImg:"英検5級/bird.webp", fallbackImg:"英検5級/bird.jpg" },
        { word:"milk", japanese:"牛乳", phonetic:"mɪlk", sentence:"I drink milk every morning.", localImg:"英検5級/milk.webp", fallbackImg:"英検5級/milk.jpg" },
        { word:"breakfast", japanese:"朝食", phonetic:"brékfəst", sentence:"I eat breakfast at seven.", localImg:"英検5級/breakfast.webp", fallbackImg:"英検5級/breakfast.jpg" },
      ],
      Unit02: [
        { word:"run", japanese:"走る", phonetic:"rʌn", sentence:"I run in the park every morning.", localImg:"英検5級/run.webp", fallbackImg:"英検5級/run.jpg" },
        { word:"swim", japanese:"泳ぐ", phonetic:"swɪm", sentence:"I swim in the summer.", localImg:"英検5級/swim.webp", fallbackImg:"英検5級/swim.jpg" },
        { word:"sing", japanese:"歌う", phonetic:"sɪŋ", sentence:"She sings a beautiful song.", localImg:"英検5級/sing.webp", fallbackImg:"英検5級/sing.jpg" },
        { word:"cook", japanese:"料理する", phonetic:"kʊk", sentence:"My mother cooks dinner.", localImg:"英検5級/cook.webp", fallbackImg:"英検5級/cook.jpg" },
        { word:"write", japanese:"書く", phonetic:"raɪt", sentence:"I write in my notebook.", localImg:"英検5級/write.webp", fallbackImg:"英検5級/write.jpg" },
        { word:"watch", japanese:"見る", phonetic:"wɑ́tʃ", sentence:"I watch TV at night.", localImg:"英検5級/watch.webp", fallbackImg:"英検5級/watch.jpg" },
      ],
      Unit03: [
        { word:"school", japanese:"学校", phonetic:"skuːl", sentence:"I go to school at eight.", localImg:"英検5級/school.webp", fallbackImg:"英検5級/school.jpg" },
        { word:"library", japanese:"図書館", phonetic:"láɪbreri", sentence:"I study in the library.", localImg:"英検5級/library.webp", fallbackImg:"英検5級/library.jpg" },
        { word:"hospital", japanese:"病院", phonetic:"hɑ́spɪtl", sentence:"My father works at a hospital.", localImg:"英検5級/hospital.webp", fallbackImg:"英検5級/hospital.jpg" },
        { word:"park", japanese:"公園", phonetic:"pɑːrk", sentence:"We play in the park.", localImg:"英検5級/park.webp", fallbackImg:"英検5級/park.jpg" },
        { word:"bus", japanese:"バス", phonetic:"bʌs", sentence:"I take the bus to school.", localImg:"英検5級/bus.webp", fallbackImg:"英検5級/bus.jpg" },
        { word:"train", japanese:"電車", phonetic:"treɪn", sentence:"I go by train every day.", localImg:"英検5級/train.webp", fallbackImg:"英検5級/train.jpg" },
      ],
      Unit04: [
        { word:"bed", japanese:"ベッド", phonetic:"bed", sentence:"I go to bed at ten.", localImg:"英検5級/bed.webp", fallbackImg:"英検5級/bed.jpg" },
        { word:"book", japanese:"本", phonetic:"bʊk", sentence:"I read a book every night.", localImg:"英検5級/book.webp", fallbackImg:"英検5級/book.jpg" },
        { word:"shirt", japanese:"シャツ", phonetic:"ʃɜːrt", sentence:"He wears a blue shirt.", localImg:"英検5級/shirt.webp", fallbackImg:"英検5級/shirt.jpg" },
        { word:"flower", japanese:"花", phonetic:"fláʊər", sentence:"There are flowers in the garden.", localImg:"英検5級/flower.webp", fallbackImg:"英検5級/flower.jpg" },
        { word:"guitar", japanese:"ギター", phonetic:"ɡɪtɑ́ːr", sentence:"I play the guitar.", localImg:"英検5級/guitar.webp", fallbackImg:"英検5級/guitar.jpg" },
        { word:"mother", japanese:"母", phonetic:"mʌ́ðər", sentence:"My mother is a teacher.", localImg:"英検5級/mother.webp", fallbackImg:"英検5級/mother.jpg" },
      ],
      Unit05: [
        { word:"happy", japanese:"幸せな", phonetic:"hǽpi", sentence:"I am very happy today.", localImg:"英検5級/happy.webp", fallbackImg:"英検5級/happy.jpg" },
        { word:"tired", japanese:"疲れた", phonetic:"táɪərd", sentence:"I am tired after school.", localImg:"英検5級/tired.webp", fallbackImg:"英検5級/tired.jpg" },
        { word:"cold", japanese:"寒い", phonetic:"koʊld", sentence:"It is very cold outside.", localImg:"英検5級/cold.webp", fallbackImg:"英検5級/cold.jpg" },
        { word:"rain", japanese:"雨", phonetic:"reɪn", sentence:"We have a lot of rain today.", localImg:"英検5級/rain.webp", fallbackImg:"英検5級/rain.jpg" },
        { word:"Sunday", japanese:"日曜日", phonetic:"sʌ́ndeɪ", sentence:"I rest on Sunday.", localImg:"英検5級/Sunday.webp", fallbackImg:"英検5級/Sunday.jpg" },
        { word:"soccer", japanese:"サッカー", phonetic:"sɑ́kər", sentence:"We play soccer after school.", localImg:"英検5級/soccer.webp", fallbackImg:"英検5級/soccer.jpg" },
      ],
    },
  },
  grade4: {
    label: "英検4級",
    shortLabel: "4級",
    color: "#60a5fa",
    description: "中学2年レベル",
    unitTitles: {
      Unit01: "まちと もの",
      Unit02: "チャレンジ",
      Unit03: "たべものと はっけん",
      Unit04: "ふしぎな よる",
      Unit05: "スタジアムへ",
    },
    units: {
      Unit01: [
        { word:"arrive", japanese:"到着する", phonetic:"əráɪv", sentence:"The train arrived on time.", localImg:"英検4級/arrive.webp", fallbackImg:"英検4級/arrive.jpg" },
        { word:"borrow", japanese:"借りる", phonetic:"bɑ́roʊ", sentence:"Can I borrow your pen?", localImg:"英検4級/borrow.webp", fallbackImg:"英検4級/borrow.jpg" },
        { word:"bridge", japanese:"橋", phonetic:"brɪdʒ", sentence:"We walked across the bridge.", localImg:"英検4級/bridge.webp", fallbackImg:"英検4級/bridge.jpg" },
        { word:"camera", japanese:"カメラ", phonetic:"kǽmərə", sentence:"She took photos with her camera.", localImg:"英検4級/camera.webp", fallbackImg:"英検4級/camera.jpg" },
        { word:"blanket", japanese:"毛布", phonetic:"blǽŋkɪt", sentence:"She wrapped herself in a blanket.", localImg:"英検4級/blanket.webp", fallbackImg:"英検4級/blanket.jpg" },
        { word:"castle", japanese:"城", phonetic:"kǽsl", sentence:"We visited an old castle.", localImg:"英検4級/castle.webp", fallbackImg:"英検4級/castle.jpg" },
      ],
      Unit02: [
        { word:"century", japanese:"世紀", phonetic:"séntʃəri", sentence:"This is from the 17th century.", localImg:"英検4級/century.webp", fallbackImg:"英検4級/century.jpg" },
        { word:"cheer", japanese:"応援する", phonetic:"tʃɪr", sentence:"Everyone cheered for the team.", localImg:"英検4級/cheer.webp", fallbackImg:"英検4級/cheer.jpg" },
        { word:"climb", japanese:"登る", phonetic:"klaɪm", sentence:"We climbed the mountain.", localImg:"英検4級/climb.webp", fallbackImg:"英検4級/climb.jpg" },
        { word:"collect", japanese:"集める", phonetic:"kəlékt", sentence:"He collects old coins.", localImg:"英検4級/collect.webp", fallbackImg:"英検4級/collect.jpg" },
        { word:"contest", japanese:"コンテスト", phonetic:"kɑ́ntest", sentence:"He joined a singing contest.", localImg:"英検4級/contest.webp", fallbackImg:"英検4級/contest.jpg" },
        { word:"courage", japanese:"勇気", phonetic:"kɜ́ːrɪdʒ", sentence:"You need courage to try new things.", localImg:"英検4級/courage.webp", fallbackImg:"英検4級/courage.jpg" },
      ],
      Unit03: [
        { word:"cousin", japanese:"いとこ", phonetic:"kʌ́zn", sentence:"My cousin lives in Osaka.", localImg:"英検4級/cousin.webp", fallbackImg:"英検4級/cousin.jpg" },
        { word:"delicious", japanese:"おいしい", phonetic:"dɪlíʃəs", sentence:"The pizza is really delicious.", localImg:"英検4級/delicious.webp", fallbackImg:"英検4級/delicious.jpg" },
        { word:"deliver", japanese:"届ける", phonetic:"dɪlívər", sentence:"He delivers mail every day.", localImg:"英検4級/deliver.webp", fallbackImg:"英検4級/deliver.jpg" },
        { word:"dessert", japanese:"デザート", phonetic:"dɪzɜ́ːrt", sentence:"I had cake for dessert.", localImg:"英検4級/dessert.webp", fallbackImg:"英検4級/dessert.jpg" },
        { word:"discover", japanese:"発見する", phonetic:"dɪskʌ́vər", sentence:"They discovered a new island.", localImg:"英検4級/discover.webp", fallbackImg:"英検4級/discover.jpg" },
        { word:"drought", japanese:"干ばつ", phonetic:"draʊt", sentence:"The drought killed all the crops.", localImg:"英検4級/drought.webp", fallbackImg:"英検4級/drought.jpg" },
      ],
      Unit04: [
        { word:"famous", japanese:"有名な", phonetic:"féɪməs", sentence:"Tokyo Tower is very famous.", localImg:"英検4級/famous.webp", fallbackImg:"英検4級/famous.jpg" },
        { word:"foggy", japanese:"霧の", phonetic:"fɔ́ːɡi", sentence:"It is foggy this morning.", localImg:"英検4級/foggy.webp", fallbackImg:"英検4級/foggy.jpg" },
        { word:"forget", japanese:"忘れる", phonetic:"fərɡét", sentence:"Don't forget your homework.", localImg:"英検4級/forget.webp", fallbackImg:"英検4級/forget.jpg" },
        { word:"island", japanese:"島", phonetic:"áɪlənd", sentence:"There is a small island in the sea.", localImg:"英検4級/island.webp", fallbackImg:"英検4級/island.jpg" },
        { word:"jewelry", japanese:"宝石類", phonetic:"dʒúːəlri", sentence:"She wore beautiful jewelry.", localImg:"英検4級/jewelry.webp", fallbackImg:"英検4級/jewelry.jpg" },
        { word:"midnight", japanese:"真夜中", phonetic:"mídnaɪt", sentence:"The city is quiet at midnight.", localImg:"英検4級/midnight.webp", fallbackImg:"英検4級/midnight.jpg" },
      ],
      Unit05: [
        { word:"motorcycle", japanese:"オートバイ", phonetic:"móʊtərsàɪkl", sentence:"He rides a motorcycle.", localImg:"英検4級/motorcycle.webp", fallbackImg:"英検4級/motorcycle.jpg" },
        { word:"passenger", japanese:"乗客", phonetic:"pǽsəndʒər", sentence:"The bus was full of passengers.", localImg:"英検4級/passenger.webp", fallbackImg:"英検4級/passenger.jpg" },
        { word:"prize", japanese:"賞", phonetic:"praɪz", sentence:"She won first prize.", localImg:"英検4級/prize.webp", fallbackImg:"英検4級/prize.jpg" },
        { word:"scared", japanese:"怖い", phonetic:"skerd", sentence:"She was scared of the dark.", localImg:"英検4級/scared.webp", fallbackImg:"英検4級/scared.jpg" },
        { word:"stadium", japanese:"スタジアム", phonetic:"stéɪdiəm", sentence:"The stadium was very crowded.", localImg:"英検4級/stadium.webp", fallbackImg:"英検4級/stadium.jpg" },
        { word:"uniform", japanese:"制服", phonetic:"júːnɪfɔːrm", sentence:"Students wear a uniform.", localImg:"英検4級/uniform.webp", fallbackImg:"英検4級/uniform.jpg" },
      ],
    },
  },
};
