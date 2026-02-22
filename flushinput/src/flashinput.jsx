import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// VOCABULARY DATABASE (from flashinput_vocabulary_db.xlsx)
// Images: local paths are tried first; Unsplash fallbacks on error
// ─────────────────────────────────────────────────────────────
const VOCAB_DB = {
  grade5: {
    label: "英検5級",
    shortLabel: "5級",
    color: "#4ade80",
    description: "中学1年レベル",
    units: {
      Unit01: [
        { word:"apple",     japanese:"りんご",   phonetic:"ǽpl",      sentence:"I eat an apple every day.",         localImg:"英検5級/apple.jpg",     fallbackImg:"https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80" },
        { word:"dog",       japanese:"犬",       phonetic:"dɔːɡ",     sentence:"I have a big dog.",                 localImg:"英検5級/dog.jpg",       fallbackImg:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80" },
        { word:"run",       japanese:"走る",     phonetic:"rʌn",      sentence:"I run in the park every morning.",  localImg:"英検5級/run.jpg",       fallbackImg:"https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80" },
        { word:"happy",     japanese:"幸せな",   phonetic:"hǽpi",     sentence:"I am very happy today.",            localImg:"英検5級/happy.jpg",     fallbackImg:"https://images.unsplash.com/photo-1489659639091-8b687bc4386e?w=800&q=80" },
        { word:"school",    japanese:"学校",     phonetic:"skuːl",    sentence:"I go to school at eight.",          localImg:"英検5級/school.jpg",    fallbackImg:"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80" },
        { word:"mother",    japanese:"母",       phonetic:"mʌ́ðər",   sentence:"My mother is a teacher.",           localImg:"英検5級/mother.jpg",    fallbackImg:"https://images.unsplash.com/photo-1555070188-6c7e78ec45e9?w=800&q=80" },
      ],
      Unit02: [
        { word:"book",      japanese:"本",       phonetic:"bʊk",      sentence:"I read a book every night.",        localImg:"英検5級/book.jpg",      fallbackImg:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80" },
        { word:"swim",      japanese:"泳ぐ",     phonetic:"swɪm",     sentence:"I swim in the summer.",             localImg:"英検5級/swim.jpg",      fallbackImg:"https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80" },
        { word:"rain",      japanese:"雨",       phonetic:"reɪn",     sentence:"We have a lot of rain today.",      localImg:"英検5級/rain.jpg",      fallbackImg:"https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80" },
        { word:"cat",       japanese:"猫",       phonetic:"kǽt",      sentence:"I have a cute cat.",                localImg:"英検5級/cat.jpg",       fallbackImg:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80" },
        { word:"sing",      japanese:"歌う",     phonetic:"sɪŋ",      sentence:"She sings a beautiful song.",       localImg:"英検5級/sing.jpg",      fallbackImg:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80" },
        { word:"bus",       japanese:"バス",     phonetic:"bʌs",      sentence:"I take the bus to school.",         localImg:"英検5級/bus.jpg",       fallbackImg:"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80" },
      ],
      Unit03: [
        { word:"breakfast", japanese:"朝食",     phonetic:"brekfəst", sentence:"I eat breakfast at seven.",         localImg:"英検5級/breakfast.jpg", fallbackImg:"https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80" },
        { word:"write",     japanese:"書く",     phonetic:"raɪt",     sentence:"I write in my notebook.",           localImg:"英検5級/write.jpg",     fallbackImg:"https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80" },
        { word:"cold",      japanese:"寒い",     phonetic:"kould",    sentence:"It is very cold outside.",          localImg:"英検5級/cold.jpg",      fallbackImg:"https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80" },
        { word:"bird",      japanese:"鳥",       phonetic:"bɜːrd",    sentence:"A bird sings in the tree.",         localImg:"英検5級/bird.jpg",      fallbackImg:"https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80" },
        { word:"park",      japanese:"公園",     phonetic:"pɑːrk",    sentence:"We play in the park.",              localImg:"英検5級/park.jpg",      fallbackImg:"https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80" },
        { word:"bed",       japanese:"ベッド",   phonetic:"bed",      sentence:"I go to bed at ten.",               localImg:"英検5級/bed.jpg",       fallbackImg:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80" },
      ],
      Unit04: [
        { word:"soccer",    japanese:"サッカー", phonetic:"sɑ́kər",   sentence:"We play soccer after school.",      localImg:"英検5級/soccer.jpg",    fallbackImg:"https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80" },
        { word:"milk",      japanese:"牛乳",     phonetic:"mɪlk",     sentence:"I drink milk every morning.",       localImg:"英検5級/milk.jpg",      fallbackImg:"https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80" },
        { word:"hospital",  japanese:"病院",     phonetic:"hɑ́spitl", sentence:"My father works at a hospital.",    localImg:"英検5級/hospital.jpg",  fallbackImg:"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80" },
        { word:"cook",      japanese:"料理する", phonetic:"kʊk",      sentence:"My mother cooks dinner.",           localImg:"英検5級/cook.jpg",      fallbackImg:"https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80" },
        { word:"guitar",    japanese:"ギター",   phonetic:"ɡitɑ́ːr",  sentence:"I play the guitar.",               localImg:"英検5級/guitar.jpg",    fallbackImg:"https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80" },
        { word:"train",     japanese:"電車",     phonetic:"treɪn",    sentence:"I go by train every day.",          localImg:"英検5級/train.jpg",     fallbackImg:"https://images.unsplash.com/photo-1474487548417-781cb6d646e7?w=800&q=80" },
      ],
      Unit05: [
        { word:"flower",    japanese:"花",       phonetic:"fláuər",   sentence:"There are flowers in the garden.",  localImg:"英検5級/flower.jpg",    fallbackImg:"https://images.unsplash.com/photo-1490750967868-88df5691cc2e?w=800&q=80" },
        { word:"watch",     japanese:"見る",     phonetic:"wɑ́tʃ",    sentence:"I watch TV at night.",              localImg:"英検5級/watch.jpg",     fallbackImg:"https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80" },
        { word:"shirt",     japanese:"シャツ",   phonetic:"ʃɜːrt",    sentence:"He wears a blue shirt.",            localImg:"英検5級/shirt.jpg",     fallbackImg:"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80" },
        { word:"tired",     japanese:"疲れた",   phonetic:"táiərd",   sentence:"I am tired after school.",          localImg:"英検5級/tired.jpg",     fallbackImg:"https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80" },
        { word:"library",   japanese:"図書館",   phonetic:"láibreri", sentence:"I study in the library.",           localImg:"英検5級/library.jpg",   fallbackImg:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80" },
        { word:"Sunday",    japanese:"日曜日",   phonetic:"sʌ́ndei",  sentence:"I rest on Sunday.",                 localImg:"英検5級/Sunday.jpg",    fallbackImg:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
      ],
    },
  },
  grade4: {
    label: "英検4級",
    shortLabel: "4級",
    color: "#60a5fa",
    description: "中学2年レベル",
    units: {
      Unit01: [
        { word:"borrow",    japanese:"借りる",   phonetic:"bɑ́roʊ",   sentence:"Can I borrow your pen?",            localImg:"英検4級/borrow.jpg",    fallbackImg:"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80" },
        { word:"famous",    japanese:"有名な",   phonetic:"féɪməs",   sentence:"Tokyo Tower is very famous.",       localImg:"英検4級/famous.jpg",    fallbackImg:"https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80" },
        { word:"forget",    japanese:"忘れる",   phonetic:"fərɡét",   sentence:"Don't forget your homework.",       localImg:"英検4級/forget.jpg",    fallbackImg:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" },
        { word:"bridge",    japanese:"橋",       phonetic:"brɪdʒ",    sentence:"We walked across the bridge.",      localImg:"英検4級/bridge.jpg",    fallbackImg:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" },
        { word:"climb",     japanese:"登る",     phonetic:"klaɪm",    sentence:"We climbed the mountain.",          localImg:"英検4級/climb.jpg",     fallbackImg:"https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80" },
        { word:"cousin",    japanese:"いとこ",   phonetic:"kʌ́zn",    sentence:"My cousin lives in Osaka.",         localImg:"英検4級/cousin.jpg",    fallbackImg:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80" },
      ],
      Unit02: [
        { word:"dessert",   japanese:"デザート", phonetic:"dɪzɜ́ːrt", sentence:"I had cake for dessert.",           localImg:"英検4級/dessert.jpg",   fallbackImg:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" },
        { word:"arrive",    japanese:"到着する", phonetic:"əráɪv",    sentence:"The train arrived on time.",        localImg:"英検4級/arrive.jpg",    fallbackImg:"https://images.unsplash.com/photo-1569144157591-c60f3f82f137?w=800&q=80" },
        { word:"prize",     japanese:"賞",       phonetic:"praɪz",    sentence:"She won first prize.",              localImg:"英検4級/prize.jpg",     fallbackImg:"https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80" },
        { word:"foggy",     japanese:"霧の",     phonetic:"fɔ́ːɡi",   sentence:"It is foggy this morning.",         localImg:"英検4級/foggy.jpg",     fallbackImg:"https://images.unsplash.com/photo-1487621167305-5d248087c724?w=800&q=80" },
        { word:"passenger", japanese:"乗客",     phonetic:"pǽsəndʒər",sentence:"The bus was full of passengers.",  localImg:"英検4級/passenger.jpg", fallbackImg:"https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=800&q=80" },
        { word:"stadium",   japanese:"スタジアム",phonetic:"stéidiəm", sentence:"The stadium was very crowded.",     localImg:"英検4級/stadium.jpg",   fallbackImg:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80" },
      ],
      Unit03: [
        { word:"uniform",   japanese:"制服",     phonetic:"júːnifɔːrm",sentence:"Students wear a uniform.",        localImg:"英検4級/uniform.jpg",   fallbackImg:"https://images.unsplash.com/photo-1588776814546-1ffbb083d004?w=800&q=80" },
        { word:"deliver",   japanese:"届ける",   phonetic:"dɪlívər",  sentence:"He delivers mail every day.",       localImg:"英検4級/deliver.jpg",   fallbackImg:"https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80" },
        { word:"midnight",  japanese:"真夜中",   phonetic:"mídnaɪt",  sentence:"The city is quiet at midnight.",    localImg:"英検4級/midnight.jpg",  fallbackImg:"https://images.unsplash.com/photo-1536183922588-166604504d5e?w=800&q=80" },
        { word:"scared",    japanese:"怖い",     phonetic:"skerd",    sentence:"She was scared of the dark.",       localImg:"英検4級/scared.jpg",    fallbackImg:"https://images.unsplash.com/photo-1541943181603-d8fe267a5dcf?w=800&q=80" },
        { word:"island",    japanese:"島",       phonetic:"áɪlənd",   sentence:"There is a small island in the sea.",localImg:"英検4級/island.jpg",   fallbackImg:"https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80" },
        { word:"camera",    japanese:"カメラ",   phonetic:"kǽmərə",   sentence:"She took photos with her camera.",  localImg:"英検4級/camera.jpg",    fallbackImg:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80" },
      ],
      Unit04: [
        { word:"motorcycle",japanese:"オートバイ",phonetic:"móutərsàikl",sentence:"He rides a motorcycle.",        localImg:"英検4級/motorcycle.jpg",fallbackImg:"https://images.unsplash.com/photo-1558981806-ec527fa1bc55?w=800&q=80" },
        { word:"discover",  japanese:"発見する", phonetic:"dɪskʌ́vər", sentence:"They discovered a new island.",    localImg:"英検4級/discover.jpg",  fallbackImg:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" },
        { word:"blanket",   japanese:"毛布",     phonetic:"blǽŋkɪt",  sentence:"She wrapped herself in a blanket.",localImg:"英検4級/blanket.jpg",   fallbackImg:"https://images.unsplash.com/photo-1495704907664-81f74a7efd9b?w=800&q=80" },
        { word:"contest",   japanese:"コンテスト",phonetic:"kɑ́ntest", sentence:"He joined a singing contest.",     localImg:"英検4級/contest.jpg",   fallbackImg:"https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80" },
        { word:"delicious", japanese:"おいしい", phonetic:"dɪlíʃəs",  sentence:"The pizza is really delicious.",   localImg:"英検4級/delicious.jpg", fallbackImg:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
        { word:"castle",    japanese:"城",       phonetic:"kǽsl",     sentence:"We visited an old castle.",         localImg:"英検4級/castle.jpg",    fallbackImg:"https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=800&q=80" },
      ],
      Unit05: [
        { word:"collect",   japanese:"集める",   phonetic:"kəlékt",   sentence:"He collects old coins.",            localImg:"英検4級/collect.jpg",   fallbackImg:"https://images.unsplash.com/photo-1591465153-2d5fe7e0ca1f?w=800&q=80" },
        { word:"century",   japanese:"世紀",     phonetic:"sénʧəri",  sentence:"This castle is from the 17th century.",localImg:"英検4級/century.jpg",fallbackImg:"https://images.unsplash.com/photo-1548407260-da850faa41e3?w=800&q=80" },
        { word:"cheer",     japanese:"応援する", phonetic:"ʧɪr",      sentence:"Everyone cheered for the team.",    localImg:"英検4級/cheer.jpg",     fallbackImg:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80" },
        { word:"courage",   japanese:"勇気",     phonetic:"kɜ́ːrɪdʒ", sentence:"You need courage to try new things.",localImg:"英検4級/courage.jpg",  fallbackImg:"https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&q=80" },
        { word:"drought",   japanese:"干ばつ",   phonetic:"draʊt",    sentence:"The drought killed all the crops.",  localImg:"英検4級/drought.jpg",   fallbackImg:"https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80" },
        { word:"jewelry",   japanese:"宝石類",   phonetic:"dʒúːəlri", sentence:"She wore beautiful jewelry.",       localImg:"英検4級/jewelry.jpg",   fallbackImg:"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80" },
      ],
    },
  },
  grade3: {
    label: "英検3級",
    shortLabel: "3級",
    color: "#f59e0b",
    description: "中学3年レベル",
    units: {
      Unit01: [
        { word:"abroad",      japanese:"海外へ",     phonetic:"əbrɔ́ːd",    sentence:"She studied abroad for a year.",          localImg:"英検3級/abroad.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?travel,abroad" },
        { word:"achieve",     japanese:"達成する",   phonetic:"ətʃíːv",     sentence:"He achieved his dream.",                  localImg:"英検3級/achieve.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?achievement,success" },
        { word:"firefighter", japanese:"消防士",     phonetic:"fáɪərfàɪtər",sentence:"A firefighter saved the child.",          localImg:"英検3級/firefighter.jpg", fallbackImg:"https://source.unsplash.com/800x600/?firefighter" },
        { word:"temperature", japanese:"気温",       phonetic:"témpərəʧər", sentence:"The temperature is 30 degrees today.",    localImg:"英検3級/temperature.jpg", fallbackImg:"https://source.unsplash.com/800x600/?thermometer,temperature" },
        { word:"stomachache", japanese:"腹痛",       phonetic:"stʌ́məkèɪk", sentence:"She had a bad stomachache.",              localImg:"英検3級/stomachache.jpg", fallbackImg:"https://source.unsplash.com/800x600/?stomach,pain,health" },
        { word:"smartphone",  japanese:"スマートフォン",phonetic:"smɑ́rtfoʊn",sentence:"Everyone has a smartphone now.",       localImg:"英検3級/smartphone.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?smartphone,phone" },
      ],
      Unit02: [
        { word:"audience",    japanese:"観客",       phonetic:"ɔ́ːdiəns",   sentence:"The audience clapped loudly.",            localImg:"英検3級/audience.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?audience,crowd" },
        { word:"calculate",   japanese:"計算する",   phonetic:"kǽlkjulèɪt",sentence:"Can you calculate this?",                localImg:"英検3級/calculate.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?calculator,math" },
        { word:"dentist",     japanese:"歯医者",     phonetic:"déntɪst",    sentence:"I went to the dentist.",                  localImg:"英検3級/dentist.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?dentist" },
        { word:"earthquake",  japanese:"地震",       phonetic:"ɜ́ːrθkwèɪk",sentence:"The earthquake was very strong.",         localImg:"英検3級/earthquake.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?earthquake,disaster" },
        { word:"fever",       japanese:"熱",         phonetic:"fíːvər",     sentence:"He had a high fever.",                    localImg:"英検3級/fever.jpg",       fallbackImg:"https://source.unsplash.com/800x600/?fever,sick" },
        { word:"website",     japanese:"ウェブサイト",phonetic:"wébsàɪt",   sentence:"I found it on the website.",              localImg:"英検3級/website.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?website,computer" },
      ],
      Unit03: [
        { word:"tradition",   japanese:"伝統",       phonetic:"trədíʃən",   sentence:"This is an old tradition.",               localImg:"英検3級/tradition.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?tradition,culture" },
        { word:"journalist",  japanese:"記者",       phonetic:"dʒɜ́ːrnəlɪst",sentence:"She became a journalist.",              localImg:"英検3級/journalist.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?journalist,news" },
        { word:"muscle",      japanese:"筋肉",       phonetic:"mʌ́sl",      sentence:"Exercise builds muscle.",                 localImg:"英検3級/muscle.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?muscle,fitness" },
        { word:"download",    japanese:"ダウンロードする",phonetic:"dáʊnloʊd",sentence:"I downloaded the app.",               localImg:"英検3級/download.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?download,technology" },
        { word:"embarrassed", japanese:"恥ずかしい", phonetic:"ɪmbǽrəst",   sentence:"She felt embarrassed.",                  localImg:"英検3級/embarrassed.jpg", fallbackImg:"https://source.unsplash.com/800x600/?embarrassed,shy" },
        { word:"flight",      japanese:"飛行機の便", phonetic:"flaɪt",      sentence:"Our flight was delayed.",                 localImg:"英検3級/flight.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?flight,airplane" },
      ],
      Unit04: [
        { word:"mechanic",    japanese:"整備士",     phonetic:"mɪkǽnɪk",   sentence:"The mechanic fixed my car.",              localImg:"英検3級/mechanic.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?mechanic,car" },
        { word:"landscape",   japanese:"風景",       phonetic:"lǽndskeɪp", sentence:"The landscape was beautiful.",            localImg:"英検3級/landscape.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?landscape,scenery" },
        { word:"ingredient",  japanese:"材料",       phonetic:"ɪnɡríːdiənt",sentence:"Add all the ingredients.",              localImg:"英検3級/ingredient.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?ingredient,cooking" },
        { word:"password",    japanese:"パスワード", phonetic:"pǽswɜːrd",   sentence:"Enter your password.",                    localImg:"英検3級/password.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?password,security" },
        { word:"emergency",   japanese:"緊急",       phonetic:"ɪmɜ́ːrdʒənsi",sentence:"Call 119 in an emergency.",            localImg:"英検3級/emergency.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?emergency,ambulance" },
        { word:"luggage",     japanese:"荷物",       phonetic:"lʌ́ɡɪdʒ",   sentence:"Put your luggage here.",                 localImg:"英検3級/luggage.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?luggage,suitcase" },
      ],
      Unit05: [
        { word:"recycle",     japanese:"リサイクルする",phonetic:"riːsáɪkl", sentence:"We should recycle paper.",              localImg:"英検3級/recycle.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?recycle,environment" },
        { word:"volunteer",   japanese:"ボランティア",phonetic:"vɑ̀ləntíər",sentence:"She volunteers at the hospital.",        localImg:"英検3級/volunteer.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?volunteer,community" },
        { word:"allergy",     japanese:"アレルギー", phonetic:"ǽlərʤi",     sentence:"He has a food allergy.",                 localImg:"英検3級/allergy.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?allergy,medicine" },
        { word:"battery",     japanese:"バッテリー", phonetic:"bǽtəri",     sentence:"My phone battery is low.",               localImg:"英検3級/battery.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?battery,phone" },
        { word:"disappointed",japanese:"がっかりした",phonetic:"dɪsəpɔ́ɪntɪd",sentence:"She was disappointed.",             localImg:"英検3級/disappointed.jpg",fallbackImg:"https://source.unsplash.com/800x600/?disappointed,sad" },
        { word:"souvenir",    japanese:"お土産",     phonetic:"suːvəníər",  sentence:"I bought a souvenir.",                    localImg:"英検3級/souvenir.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?souvenir,gift" },
      ],
    },
  },
  pre2: {
    label: "英検準2級",
    shortLabel: "準2級",
    color: "#e879f9",
    description: "高校1-2年レベル",
    units: {
      Unit01: [
        { word:"accomplish",  japanese:"成し遂げる", phonetic:"əkɑ́mplɪʃ",  sentence:"She accomplished her goal.",              localImg:"英検準2級/accomplish.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?accomplish,success" },
        { word:"atmosphere",  japanese:"大気・雰囲気",phonetic:"ǽtməsfɪər", sentence:"The atmosphere was tense.",               localImg:"英検準2級/atmosphere.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?atmosphere,sky" },
        { word:"candidate",   japanese:"候補者",     phonetic:"kǽndɪdèɪt", sentence:"She is a candidate for president.",        localImg:"英検準2級/candidate.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?candidate,election" },
        { word:"debt",        japanese:"借金",       phonetic:"det",        sentence:"He has a huge debt.",                     localImg:"英検準2級/debt.jpg",        fallbackImg:"https://source.unsplash.com/800x600/?debt,money" },
        { word:"experiment",  japanese:"実験",       phonetic:"ɪkspérɪmənt",sentence:"They did an experiment.",               localImg:"英検準2級/experiment.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?experiment,laboratory" },
        { word:"investment",  japanese:"投資",       phonetic:"ɪnvestmənt", sentence:"It is a good investment.",                localImg:"英検準2級/investment.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?investment,finance" },
        { word:"frustrate",   japanese:"いらだたせる",phonetic:"frʌ́streɪt", sentence:"The problem frustrated me.",             localImg:"英検準2級/frustrate.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?frustrated,stress" },
        { word:"drought",     japanese:"干ばつ",     phonetic:"draʊt",      sentence:"The drought lasted two years.",            localImg:"英検準2級/drought.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?drought,dry,desert" },
      ],
      Unit02: [
        { word:"protest",     japanese:"抗議する",   phonetic:"próʊtest",   sentence:"Citizens protested the law.",             localImg:"英検準2級/protest.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?protest,demonstration" },
        { word:"conflict",    japanese:"対立",       phonetic:"kɑ́nflɪkt",  sentence:"The conflict ended peacefully.",          localImg:"英検準2級/conflict.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?conflict" },
        { word:"budget",      japanese:"予算",       phonetic:"bʌ́dʒɪt",    sentence:"We have a limited budget.",               localImg:"英検準2級/budget.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?budget,finance" },
        { word:"laboratory",  japanese:"研究室",     phonetic:"lǽbrətɔ̀ːri",sentence:"She works in a laboratory.",             localImg:"英検準2級/laboratory.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?laboratory,science" },
        { word:"scholarship", japanese:"奨学金",     phonetic:"skɑ́lərʃɪp", sentence:"She got a scholarship.",                 localImg:"英検準2級/scholarship.jpg", fallbackImg:"https://source.unsplash.com/800x600/?scholarship,education" },
        { word:"anxious",     japanese:"不安な",     phonetic:"ǽŋkʃəs",     sentence:"He felt anxious about the test.",         localImg:"英検準2級/anxious.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?anxious,worry" },
        { word:"negotiate",   japanese:"交渉する",   phonetic:"nɪɡóʊʃiɪt",  sentence:"They negotiated a deal.",                localImg:"英検準2級/negotiate.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?negotiate,meeting" },
        { word:"revolution",  japanese:"革命",       phonetic:"rèvəlúːʃən", sentence:"The revolution changed everything.",      localImg:"英検準2級/revolution.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?revolution,history" },
      ],
      Unit03: [
        { word:"carbon",      japanese:"炭素",       phonetic:"kɑ́ːrbən",   sentence:"Carbon emissions are increasing.",        localImg:"英検準2級/carbon.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?carbon,pollution" },
        { word:"persuade",    japanese:"説得する",   phonetic:"pərswéɪd",   sentence:"She persuaded him to join.",              localImg:"英検準2級/persuade.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?persuade,conversation" },
        { word:"poverty",     japanese:"貧困",       phonetic:"pɑ́vərti",   sentence:"Poverty is a serious problem.",           localImg:"英検準2級/poverty.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?poverty,community" },
        { word:"profit",      japanese:"利益",       phonetic:"prɑ́fɪt",    sentence:"The company made a large profit.",        localImg:"英検準2級/profit.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?profit,business" },
        { word:"curriculum",  japanese:"カリキュラム",phonetic:"kərɪkjuləm",sentence:"The curriculum has changed.",            localImg:"英検準2級/curriculum.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?curriculum,education" },
        { word:"species",     japanese:"種",         phonetic:"spíːʃiːz",   sentence:"Many species are endangered.",            localImg:"英検準2級/species.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?species,wildlife" },
        { word:"election",    japanese:"選挙",       phonetic:"ɪlékʃən",    sentence:"The election is next month.",             localImg:"英検準2級/election.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?election,vote" },
        { word:"overcome",    japanese:"克服する",   phonetic:"oʊvərkʌ́m",  sentence:"She overcame her fear.",                 localImg:"英検準2級/overcome.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?overcome,challenge" },
      ],
      Unit04: [
        { word:"renewable",   japanese:"再生可能な", phonetic:"rɪnjúːəbl",  sentence:"We need renewable energy.",               localImg:"英検準2級/renewable.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?renewable,solar,energy" },
        { word:"consumer",    japanese:"消費者",     phonetic:"kənsúːmər",  sentence:"Consumers have rights.",                  localImg:"英検準2級/consumer.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?consumer,shopping" },
        { word:"semester",    japanese:"学期",       phonetic:"sɪméstər",   sentence:"The semester ends in March.",             localImg:"英検準2級/semester.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?semester,university" },
        { word:"authority",   japanese:"権威・当局", phonetic:"əθɔ́ːrəti",  sentence:"The authority approved the plan.",        localImg:"英検準2級/authority.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?authority,government" },
        { word:"sustainable", japanese:"持続可能な", phonetic:"səstéɪnəbl", sentence:"We need sustainable solutions.",          localImg:"英検準2級/sustainable.jpg", fallbackImg:"https://source.unsplash.com/800x600/?sustainable,green,ecology" },
        { word:"symptom",     japanese:"症状",       phonetic:"sɪ́mptəm",   sentence:"Tell the doctor your symptoms.",          localImg:"英検準2級/symptom.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?symptom,health,doctor" },
      ],
    },
  },
  grade2: {
    label: "英検2級",
    shortLabel: "2級",
    color: "#f87171",
    description: "高校3年レベル",
    units: {
      Unit01: [
        { word:"abolish",     japanese:"廃止する",   phonetic:"əbɑ́lɪʃ",    sentence:"They abolished the old law.",             localImg:"英検2級/abolish.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?law,justice" },
        { word:"commodity",   japanese:"商品",       phonetic:"kəmɑ́dəti",  sentence:"Oil is an important commodity.",          localImg:"英検2級/commodity.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?commodity,trade" },
        { word:"diplomacy",   japanese:"外交",       phonetic:"dɪplóʊməsi", sentence:"Diplomacy prevents war.",                 localImg:"英検2級/diplomacy.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?diplomacy,politics" },
        { word:"ecosystem",   japanese:"生態系",     phonetic:"íːkousɪstəm",sentence:"The ecosystem is fragile.",              localImg:"英検2級/ecosystem.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?ecosystem,nature,wildlife" },
        { word:"hypothesis",  japanese:"仮説",       phonetic:"haɪpɑ́θəsɪs",sentence:"Test the hypothesis carefully.",         localImg:"英検2級/hypothesis.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?hypothesis,science" },
        { word:"legislation", japanese:"法律",       phonetic:"lèdʒɪsléɪʃən",sentence:"New legislation was passed.",          localImg:"英検2級/legislation.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?legislation,parliament" },
        { word:"manufacture", japanese:"製造する",   phonetic:"mænjufǽktʃər",sentence:"They manufacture cars.",              localImg:"英検2級/manufacture.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?manufacture,factory" },
        { word:"prejudice",   japanese:"偏見",       phonetic:"préʤʊdɪs",   sentence:"Prejudice causes division.",             localImg:"英検2級/prejudice.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?diversity,equality" },
      ],
      Unit02: [
        { word:"artificial",  japanese:"人工的な",   phonetic:"ɑːrtɪfíʃəl", sentence:"AI is artificial intelligence.",          localImg:"英検2級/artificial.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?artificial,robot,AI" },
        { word:"bureaucracy", japanese:"官僚制",     phonetic:"bjʊərɑ́krəsi",sentence:"Bureaucracy slows things down.",          localImg:"英検2級/bureaucracy.jpg",  fallbackImg:"https://source.unsplash.com/800x600/?bureaucracy,government,office" },
        { word:"contradict",  japanese:"矛盾する",   phonetic:"kɑ̀ntrədɪ́kt",sentence:"His words contradict his actions.",      localImg:"英検2級/contradict.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?contradict,argument" },
        { word:"deficit",     japanese:"赤字",       phonetic:"défɪsɪt",    sentence:"The budget has a deficit.",               localImg:"英検2級/deficit.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?deficit,economy" },
        { word:"elaborate",   japanese:"精巧な",     phonetic:"ɪlǽbərɪt",   sentence:"She made an elaborate plan.",            localImg:"英検2級/elaborate.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?elaborate,design" },
        { word:"fluctuate",   japanese:"変動する",   phonetic:"flʌ́ktʃuɪt",  sentence:"Prices fluctuate daily.",                localImg:"英検2級/fluctuate.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?stock,market,chart" },
        { word:"genetic",     japanese:"遺伝の",     phonetic:"dʒənétɪk",   sentence:"Genetic research is growing.",            localImg:"英検2級/genetic.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?genetic,DNA,science" },
        { word:"inhabitant",  japanese:"住民",       phonetic:"ɪnhǽbɪtənt", sentence:"The inhabitants left the city.",          localImg:"英検2級/inhabitant.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?city,community,people" },
      ],
      Unit03: [
        { word:"juvenile",    japanese:"少年の",     phonetic:"dʒúːvənaɪl", sentence:"Juvenile crime has increased.",            localImg:"英検2級/juvenile.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?youth,teen" },
        { word:"monopoly",    japanese:"独占",       phonetic:"mənɑ́pəli",  sentence:"The company has a monopoly.",             localImg:"英検2級/monopoly.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?monopoly,business,power" },
        { word:"phenomenon",  japanese:"現象",       phonetic:"fɪnɑ́mɪnɑ̀n",sentence:"It is a natural phenomenon.",           localImg:"英検2級/phenomenon.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?phenomenon,nature,sky" },
        { word:"recession",   japanese:"景気後退",   phonetic:"rɪséʃən",    sentence:"The recession hit many people.",          localImg:"英検2級/recession.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?recession,economy,crisis" },
        { word:"stereotype",  japanese:"固定観念",   phonetic:"stériətàɪp",  sentence:"Don't judge by stereotypes.",            localImg:"英検2級/stereotype.jpg",   fallbackImg:"https://source.unsplash.com/800x600/?diversity,stereotype" },
        { word:"undermine",   japanese:"弱体化させる",phonetic:"ʌ̀ndərmaɪn", sentence:"Doubt can undermine confidence.",        localImg:"英検2級/undermine.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?undermine,challenge" },
        { word:"negotiate",   japanese:"交渉する",   phonetic:"nɪɡóʊʃiɪt",  sentence:"They negotiated a new contract.",         localImg:"英検2級/negotiate.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?negotiate,business" },
        { word:"theology",    japanese:"神学",       phonetic:"θiɑ́lədʒi",  sentence:"She studies theology.",                  localImg:"英検2級/theology.jpg",     fallbackImg:"https://source.unsplash.com/800x600/?theology,religion,church" },
      ],
      Unit04: [
        { word:"vulnerability",japanese:"脆弱性",   phonetic:"vʌ̀lnərəbíləti",sentence:"The system has a vulnerability.",    localImg:"英検2級/vulnerability.jpg",fallbackImg:"https://source.unsplash.com/800x600/?vulnerability,security" },
        { word:"welfare",     japanese:"福祉",       phonetic:"wélfɛr",     sentence:"Social welfare is important.",            localImg:"英検2級/welfare.jpg",      fallbackImg:"https://source.unsplash.com/800x600/?welfare,social,community" },
        { word:"yield",       japanese:"産出する",   phonetic:"jiːld",      sentence:"The farm yields good crops.",             localImg:"英検2級/yield.jpg",        fallbackImg:"https://source.unsplash.com/800x600/?yield,harvest,farm" },
        { word:"cognitive",   japanese:"認知の",     phonetic:"kɑ́ɡnɪtɪv",  sentence:"Cognitive skills are important.",         localImg:"英検2級/cognitive.jpg",    fallbackImg:"https://source.unsplash.com/800x600/?cognitive,brain,mind" },
        { word:"infrastructure",japanese:"インフラ", phonetic:"ɪ́nfrəstrʌ̀ktʃər",sentence:"The infrastructure is old.",       localImg:"英検2級/infrastructure.jpg",fallbackImg:"https://source.unsplash.com/800x600/?infrastructure,bridge,city" },
        { word:"biodiversity",japanese:"生物多様性", phonetic:"bàɪoʊdɪvɜ́ːrsɪti",sentence:"Biodiversity is decreasing.",    localImg:"英検2級/biodiversity.jpg", fallbackImg:"https://source.unsplash.com/800x600/?biodiversity,wildlife,nature" },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────
// PHASE CONFIG
// ─────────────────────────────────────────────────────────────
const PHASES = [
  { id: "photo",    duration: 2800, label: "IMAGE" },
  { id: "word",     duration: 3200, label: "WORD" },
  { id: "meaning",  duration: 2800, label: "MEANING" },
  { id: "sentence", duration: 3500, label: "CONTEXT" },
  { id: "recall",   duration: 4500, label: "RECALL" },
];

// ─────────────────────────────────────────────────────────────
// GRADE METADATA
// ─────────────────────────────────────────────────────────────
const GRADES = [
  { key: "grade5", ...VOCAB_DB.grade5 },
  { key: "grade4", ...VOCAB_DB.grade4 },
  { key: "grade3", ...VOCAB_DB.grade3 },
  { key: "pre2",   ...VOCAB_DB.pre2   },
  { key: "grade2", ...VOCAB_DB.grade2 },
];

// ─────────────────────────────────────────────────────────────
// HELPERS — Web Speech API（正しく実装）
// ─────────────────────────────────────────────────────────────

// アプリ起動時に1回だけ最良の英語音声を選んでキャッシュする
// voices はブラウザが非同期で読み込むため、モジュールレベルで管理する
let cachedVoice = null;  // 選択済みの音声
let voiceReady  = false; // 音声が選択できたかどうか

// 優先順位でベストな英語音声を選択する
// Chrome: "Google US English" が圧倒的に自然
// Mac Safari: "Samantha"（アメリカ英語）
// Windows: "Microsoft Zira" / "Microsoft David"
const VOICE_PRIORITY = [
  "Google US English",        // Chrome — 最高品質
  "Google UK English Female", // Chrome — 次点
  "Samantha",                 // Mac Safari — 自然
  "Karen",                    // Mac — オーストラリア英語
  "Alex",                     // Mac — 男性
  "Microsoft Zira Desktop",   // Windows
  "Microsoft David Desktop",  // Windows
  "Microsoft Mark Desktop",   // Windows
];

function pickBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. 名前で完全一致（優先リスト順）
  for (const name of VOICE_PRIORITY) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  // 2. en-US のオンライン音声（Google等のクラウド音声）
  const onlineUS = voices.find((v) => v.lang === "en-US" && !v.localService);
  if (onlineUS) return onlineUS;
  // 3. en-US なら何でも
  const anyUS = voices.find((v) => v.lang === "en-US");
  if (anyUS) return anyUS;
  // 4. 英語なら何でも
  return voices.find((v) => v.lang.startsWith("en")) || null;
}

// アプリ起動時に呼ぶ — 音声が準備できたらキャッシュする
function initVoice() {
  if (!("speechSynthesis" in window)) return;

  const tryPick = () => {
    const v = pickBestVoice();
    if (v) { cachedVoice = v; voiceReady = true; }
  };

  // Chrome: voiceschanged イベントで通知される
  window.speechSynthesis.onvoiceschanged = tryPick;
  // Safari / Firefox: すでにリストがある場合もある
  tryPick();
}

// メインの speak 関数
function speak(text, rate = 0.88) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang  = "en-US";
  u.rate  = rate;
  u.pitch = 1.0;

  // キャッシュ済み音声を使う（なければブラウザデフォルト）
  if (cachedVoice) u.voice = cachedVoice;

  window.speechSynthesis.speak(u);
}

function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function SmartImage({ word, style, ...props }) {
  const [src, setSrc] = useState(word.localImg);
  return (
    <img
      src={src}
      onError={() => { if (src !== word.fallbackImg) setSrc(word.fallbackImg); }}
      style={{ ...style }}
      alt={word.word}
      {...props}
    />
  );
}

function SmartBg({ word, style }) {
  const [src, setSrc] = useState(word.localImg);
  useEffect(() => {
    const img = new Image();
    img.src = word.localImg;
    img.onerror = () => setSrc(word.fallbackImg);
    setSrc(word.localImg);
  }, [word]);
  return (
    <div style={{
      ...style,
      backgroundImage: `url(${src})`,
    }} />
  );
}

function usePreloadImages(words) {
  useEffect(() => {
    words.forEach((w) => {
      const img = new Image();
      img.src = w.localImg;
      img.onerror = () => { const fb = new Image(); fb.src = w.fallbackImg; };
    });
  }, [words]);
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function FlashcardApp() {
  // Navigation state
  const [screen, setScreen] = useState("levelSelect"); // levelSelect | unitSelect | start | play | done
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentWords, setCurrentWords] = useState([]);

  // Play state
  const [wordIdx, setWordIdx]       = useState(0);
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [paused, setPaused]         = useState(false);
  const [reveal, setReveal]         = useState(false);
  const [progress, setProgress]     = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [round, setRound]           = useState(1);
  const [speed, setSpeed]           = useState(1);
  const [imgSrcs, setImgSrcs]       = useState({});

  const timerRef     = useRef(null);
  const progressRef  = useRef(null);
  const startTimeRef = useRef(null);

  const word  = currentWords[wordIdx] || null;
  const phase = PHASES[phaseIdx];

  // Web Speech API — アプリ起動時に最良の英語音声をキャッシュ
  useEffect(() => {
    initVoice();
    return () => stopSpeech();
  }, []);

  usePreloadImages(currentWords);

  // Precompute image src per word (with fallback)
  useEffect(() => {
    const srcs = {};
    currentWords.forEach((w) => { srcs[w.word] = w.localImg; });
    setImgSrcs(srcs);
  }, [currentWords]);

  const handleImgError = (wordKey, fallback) => {
    setImgSrcs((prev) => ({ ...prev, [wordKey]: fallback }));
  };

  // ── ADVANCE (phase/word/round) ──────────────────────────────
  const advance = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setReveal(false);
      setTransitioning(false);
      if (phaseIdx < PHASES.length - 1) {
        setPhaseIdx((p) => p + 1);
      } else if (wordIdx < currentWords.length - 1) {
        setWordIdx((w) => w + 1);
        setPhaseIdx(0);
      } else {
        if (round < 2) {
          setRound(2);
          setWordIdx(0);
          setPhaseIdx(0);
        } else {
          setScreen("done");
        }
      }
    }, 250);
  }, [phaseIdx, wordIdx, round, currentWords]);

  // ── PLAY TIMER EFFECT ──────────────────────────────────────
  useEffect(() => {
    if (screen !== "play" || paused || !word) return;

    const dur = phase.duration / speed;
    startTimeRef.current = Date.now();

    if (phase.id === "word")     setTimeout(() => speak(word.word, 0.8), 300);
    if (phase.id === "sentence") setTimeout(() => speak(word.sentence, 0.92), 300);
    if (phase.id === "recall") {
      setTimeout(() => { setReveal(true); speak(word.word, 0.82); }, dur * 0.55);
    }

    setProgress(0);
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / dur, 1));
    }, 30);
    timerRef.current = setTimeout(advance, dur);

    return () => { clearTimeout(timerRef.current); clearInterval(progressRef.current); };
  }, [screen, wordIdx, phaseIdx, paused, speed, round]);

  const togglePause = () => {
    if (paused) {
      setPaused(false);
    } else {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
      stopSpeech();
      setPaused(true);
    }
  };

  const handleStart = () => {
    setWordIdx(0); setPhaseIdx(0); setRound(1);
    setReveal(false); setPaused(false);
    setScreen("play");
  };

  const selectGradeUnit = (grade, unitKey) => {
    setSelectedGrade(grade);
    setSelectedUnit(unitKey);
    setCurrentWords(grade.units[unitKey]);
    setScreen("start");
  };

  // ── FONT LINK ────────────────────────────────────────────
  const fontLink = (
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
  );

  const base = {
    minHeight: "100vh",
    background: "#0a0a0a",
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    color: "#fff",
  };

  // ══════════════════════════════════════════════════════════
  // SCREEN: LEVEL SELECT
  // ══════════════════════════════════════════════════════════
  if (screen === "levelSelect") {
    return (
      <div style={{ ...base, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        {fontLink}
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            VOCABULARY INPUT SYSTEM
          </div>
          <h1 style={{ fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 900, margin: 0, letterSpacing: -1 }}>
            Flash<span style={{ color: "#00d4aa" }}>Input</span>
          </h1>
          <p style={{ color: "#555", fontSize: 14, marginTop: 8 }}>レベルを選択してください</p>
        </div>

        {/* Grade Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 480 }}>
          {GRADES.map((grade) => {
            const unitKeys = Object.keys(grade.units);
            const totalWords = unitKeys.reduce((sum, k) => sum + grade.units[k].length, 0);
            // First word image for preview
            const previewWord = grade.units[unitKeys[0]][0];
            return (
              <button
                key={grade.key}
                onClick={() => { setSelectedGrade(grade); setScreen("unitSelect"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px 20px",
                  background: "#111",
                  border: `1px solid #222`,
                  borderRadius: 16,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = grade.color; e.currentTarget.style.background = "#161616"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.background = "#111"; }}
              >
                {/* Left accent bar */}
                <div style={{ width: 4, height: 56, borderRadius: 2, background: grade.color, flexShrink: 0 }} />
                {/* Preview thumbnail */}
                <div style={{
                  width: 52, height: 52, borderRadius: 10, overflow: "hidden",
                  flexShrink: 0, background: "#222",
                }}>
                  <img
                    src={previewWord.localImg}
                    onError={(e) => { e.target.src = previewWord.fallbackImg; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
                    alt=""
                  />
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{grade.shortLabel}</span>
                    <span style={{ fontSize: 12, color: grade.color, fontFamily: "'Space Mono', monospace" }}>{grade.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{grade.description}</div>
                  <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
                    {unitKeys.length} UNITS · {totalWords} WORDS
                  </div>
                </div>
                <div style={{ color: "#444", fontSize: 18 }}>›</div>
              </button>
            );
          })}
        </div>

        <p style={{ marginTop: 40, fontSize: 12, color: "#333", fontFamily: "'Space Mono', monospace", textAlign: "center" }}>
          5-PHASE MEMORY ENCODING · 2-ROUND SYSTEM
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: UNIT SELECT
  // ══════════════════════════════════════════════════════════
  if (screen === "unitSelect" && selectedGrade) {
    const unitKeys = Object.keys(selectedGrade.units);
    return (
      <div style={{ ...base, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        {fontLink}
        {/* Back + Title */}
        <div style={{ width: "100%", maxWidth: 480, marginBottom: 32 }}>
          <button
            onClick={() => setScreen("levelSelect")}
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13, fontFamily: "'Space Mono', monospace", letterSpacing: 2, padding: 0, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}
          >
            ‹ BACK
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: selectedGrade.color, borderRadius: 2 }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{selectedGrade.label}</h2>
              <p style={{ margin: 0, color: "#555", fontSize: 13 }}>ユニットを選択してください</p>
            </div>
          </div>
        </div>

        {/* Unit Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 480 }}>
          {unitKeys.map((unitKey, i) => {
            const words = selectedGrade.units[unitKey];
            return (
              <button
                key={unitKey}
                onClick={() => selectGradeUnit(selectedGrade, unitKey)}
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 14,
                  padding: "14px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = selectedGrade.color; e.currentTarget.style.background = "#161616"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.background = "#111"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Unit number badge */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${selectedGrade.color}18`,
                    border: `1px solid ${selectedGrade.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: selectedGrade.color,
                    fontFamily: "'Space Mono', monospace", flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                      Unit {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                      {words.length} WORDS · {(words.length * PHASES.length * 2 * 3.36 / 60).toFixed(1)} MIN
                    </div>
                  </div>
                  {/* Word thumbnails */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {words.slice(0, 4).map((w, j) => (
                      <div key={j} style={{ width: 28, height: 28, borderRadius: 6, overflow: "hidden", background: "#222" }}>
                        <img
                          src={w.localImg}
                          onError={(e) => { e.target.src = w.fallbackImg; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
                          alt=""
                        />
                      </div>
                    ))}
                    {words.length > 4 && (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#555" }}>
                        +{words.length - 4}
                      </div>
                    )}
                  </div>
                  <div style={{ color: "#444", fontSize: 16 }}>›</div>
                </div>
                {/* Word list preview */}
                <div style={{ marginTop: 10, marginLeft: 52, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {words.map((w) => (
                    <span key={w.word} style={{
                      fontSize: 11, color: "#555",
                      fontFamily: "'Space Mono', monospace",
                      background: "#1a1a1a",
                      padding: "2px 7px", borderRadius: 4,
                    }}>
                      {w.word}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: START
  // ══════════════════════════════════════════════════════════
  if (screen === "start") {
    const firstWord = currentWords[0];
    return (
      <div style={{
        ...base,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, overflow: "hidden", position: "relative",
      }}>
        {fontLink}
        {/* Blurred background */}
        {firstWord && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${imgSrcs[firstWord.word] || firstWord.localImg})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.12, filter: "blur(20px)",
          }} />
        )}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 520 }}>
          {/* Back button */}
          <button
            onClick={() => setScreen("unitSelect")}
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 2, marginBottom: 24, display: "block", marginLeft: "auto", marginRight: "auto" }}
          >
            ‹ BACK
          </button>

          <div style={{ fontSize: 10, letterSpacing: 6, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            {selectedGrade?.label} · {selectedUnit}
          </div>
          <h1 style={{ fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 900, margin: "0 0 8px 0", letterSpacing: -1 }}>
            Flash<span style={{ color: "#00d4aa" }}>Input</span>
          </h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 36px 0", lineHeight: 1.7 }}>
            {currentWords.length} words · 5-phase memory encoding<br />
            Round 1: Full input · Round 2: Speed review
          </p>

          {/* Thumbnail grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
            {currentWords.map((w, i) => (
              <div key={i} style={{
                width: 56, height: 56, borderRadius: 10,
                overflow: "hidden", border: "2px solid #222", background: "#1a1a1a",
              }}>
                <img
                  src={w.localImg}
                  onError={(e) => { e.target.src = w.fallbackImg; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
                  alt={w.word}
                />
              </div>
            ))}
          </div>

          {/* Speed selector */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace" }}>SPEED</span>
            {[{ label: "×0.8", val: 0.8 }, { label: "×1.0", val: 1 }, { label: "×1.5", val: 1.5 }].map((s) => (
              <button key={s.val} onClick={() => setSpeed(s.val)} style={{
                padding: "6px 14px", borderRadius: 8,
                border: speed === s.val ? "1px solid #00d4aa" : "1px solid #333",
                background: speed === s.val ? "#00d4aa15" : "transparent",
                color: speed === s.val ? "#00d4aa" : "#555",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
              }}>
                {s.label}
              </button>
            ))}
          </div>

          <button onClick={handleStart} style={{
            padding: "16px 56px", fontSize: 16, fontWeight: 800,
            border: "none", borderRadius: 14,
            background: "linear-gradient(135deg, #00d4aa, #00b894)",
            color: "#0a0a0a", cursor: "pointer", letterSpacing: 2,
          }}>
            START ▶
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: DONE
  // ══════════════════════════════════════════════════════════
  if (screen === "done") {
    return (
      <div style={{ ...base, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {fontLink}
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 52, marginBottom: 12, color: "#00d4aa" }}>✦</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 6px 0" }}>Complete</h2>
          <p style={{ fontSize: 12, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 32 }}>
            {currentWords.length} WORDS × 2 ROUNDS — ENCODED
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 36 }}>
            {currentWords.map((w, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: "hidden", position: "relative", aspectRatio: "4/3", background: "#1a1a1a" }}>
                <img
                  src={w.localImg}
                  onError={(e) => { e.target.src = w.fallbackImg; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt=""
                />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "20px 8px 8px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                  fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1,
                }}>
                  {w.word}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={handleStart} style={{
              padding: "12px 32px", fontSize: 14, fontWeight: 700,
              border: "1px solid #333", borderRadius: 10,
              background: "transparent", color: "#fff", cursor: "pointer", letterSpacing: 1,
            }}>
              ↻ RESTART
            </button>
            <button onClick={() => setScreen("unitSelect")} style={{
              padding: "12px 32px", fontSize: 14, fontWeight: 700,
              border: "1px solid #00d4aa44", borderRadius: 10,
              background: "#00d4aa12", color: "#00d4aa", cursor: "pointer", letterSpacing: 1,
            }}>
              NEXT UNIT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: PLAY
  // ══════════════════════════════════════════════════════════
  if (!word) return null;
  const isRecall = phase.id === "recall";
  const bgOpacity = phase.id === "photo" ? 0.55 : isRecall && !reveal ? 0.6 : 0.18;
  const bgFilter  = isRecall && !reveal ? "blur(30px) brightness(0.7)" : phase.id === "photo" ? "none" : "blur(6px) brightness(0.6)";
  const wordImgSrc = imgSrcs[word.word] || word.localImg;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
      cursor: "pointer", userSelect: "none",
    }} onClick={togglePause}>
      {fontLink}

      {/* BACKGROUND IMAGE */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${wordImgSrc})`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: bgOpacity, filter: bgFilter,
        transition: "all 0.6s ease",
        transform: transitioning ? "scale(1.05)" : "scale(1.01)",
      }} />

      {/* TOP BAR */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#00d4aa", letterSpacing: 3 }}>
          {round === 1 ? "ROUND 1" : "ROUND 2 — SPEED"}
        </span>
        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#444", letterSpacing: 2 }}>
          {wordIdx + 1}/{currentWords.length}
        </span>
      </div>

      {/* WORD PROGRESS BARS */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: 5, padding: "0 20px 10px", justifyContent: "center" }}>
        {currentWords.map((_, i) => (
          <div key={i} style={{
            height: 3, flex: 1, maxWidth: 48, borderRadius: 2,
            background: i < wordIdx ? "#00d4aa" : i === wordIdx ? "#333" : "#1a1a1a",
            overflow: "hidden", position: "relative",
          }}>
            {i === wordIdx && (
              <div style={{
                position: "absolute", top: 0, left: 0, bottom: 0,
                width: `${((phaseIdx + progress) / PHASES.length) * 100}%`,
                background: "#00d4aa", borderRadius: 2, transition: "width 0.1s linear",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* PHASE INDICATOR */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: 4, padding: "0 20px 14px", justifyContent: "center" }}>
        {PHASES.map((p, i) => (
          <div key={i} style={{
            fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: 2,
            color: i === phaseIdx ? "#00d4aa" : i < phaseIdx ? "#334" : "#222",
            padding: "3px 8px", borderRadius: 4,
            background: i === phaseIdx ? "#00d4aa12" : "transparent",
            border: i === phaseIdx ? "1px solid #00d4aa33" : "1px solid transparent",
            transition: "all 0.3s",
          }}>
            {p.label}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1, position: "relative", zIndex: 5,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 24px 40px",
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "translateY(12px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}>

        {/* ── PHASE: PHOTO ── */}
        {phase.id === "photo" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "min(85vw, 400px)", aspectRatio: "16/10", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", marginBottom: 24, background: "#1a1a1a" }}>
              <img src={wordImgSrc} onError={() => handleImgError(word.word, word.fallbackImg)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            </div>
            <div style={{ fontSize: 12, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 4 }}>
              WHAT IS THIS IN ENGLISH?
            </div>
          </div>
        )}

        {/* ── PHASE: WORD ── */}
        {phase.id === "word" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(48px, 14vw, 88px)", fontWeight: 900, color: "#fff", letterSpacing: -2, lineHeight: 1, marginBottom: 12 }}>
              {word.word}
            </div>
            <div style={{ fontSize: 16, color: "#00d4aa", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>
              /{word.phonetic}/
            </div>
            <div style={{ width: 40, height: 2, background: "#333", margin: "16px auto", borderRadius: 1 }} />
            <div style={{ fontSize: 22, color: "#888", fontWeight: 600 }}>{word.japanese}</div>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", letterSpacing: 3, marginTop: 14 }}>
              🔊 LISTEN
            </div>
          </div>
        )}

        {/* ── PHASE: MEANING ── */}
        {phase.id === "meaning" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "min(70vw, 320px)", aspectRatio: "4/3", borderRadius: 14, overflow: "hidden", marginBottom: 20, position: "relative", boxShadow: "0 12px 40px rgba(0,0,0,0.4)", background: "#1a1a1a" }}>
              <img src={wordImgSrc} onError={() => handleImgError(word.word, word.fallbackImg)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 16px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
                <div style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
                  {word.word}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#555", letterSpacing: 4 }}>
              IMAGE + WORD = MEMORY
            </div>
          </div>
        )}

        {/* ── PHASE: SENTENCE ── */}
        {phase.id === "sentence" && (
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div style={{ fontSize: "clamp(22px, 5.5vw, 32px)", color: "#ccc", fontWeight: 300, lineHeight: 1.6, letterSpacing: 0.5, marginBottom: 20 }}>
              {word.sentence.split(new RegExp(`(${word.word})`, "gi")).map((part, i) =>
                part.toLowerCase() === word.word.toLowerCase()
                  ? <span key={i} style={{ color: "#00d4aa", fontWeight: 800 }}>{part}</span>
                  : <span key={i}>{part}</span>
              )}
            </div>
            <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: "#444", letterSpacing: 3 }}>
              LISTEN & REPEAT
            </div>
          </div>
        )}

        {/* ── PHASE: RECALL ── */}
        {phase.id === "recall" && (
          <div style={{ textAlign: "center" }}>
            {!reveal ? (
              <>
                <div style={{ fontSize: "clamp(40px, 10vw, 72px)", fontWeight: 900, color: "#2a2a2a", letterSpacing: 8, marginBottom: 16, fontFamily: "'Space Mono', monospace" }}>
                  {"?".repeat(word.word.length)}
                </div>
                <div style={{ fontSize: 22, color: "#666", fontWeight: 600 }}>{word.japanese}</div>
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#444", letterSpacing: 4, marginTop: 16 }}>
                  RECALL THE WORD...
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "clamp(52px, 14vw, 88px)", fontWeight: 900, color: "#00d4aa", letterSpacing: -2, lineHeight: 1 }}>
                  {word.word}
                </div>
                <div style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", color: "#555", letterSpacing: 3, marginTop: 12 }}>
                  ✓ SAY IT ALOUD
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* TIMER BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 3, background: "#111", zIndex: 20 }}>
        <div style={{
          height: "100%", width: `${progress * 100}%`,
          background: "#00d4aa", transition: "width 0.1s linear", borderRadius: "0 2px 2px 0",
        }} />
      </div>

      {/* PAUSE OVERLAY */}
      {paused && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.88)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#555", letterSpacing: 4, marginBottom: 16 }}>PAUSED</div>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>▶</div>
          <div style={{ fontSize: 12, color: "#444", marginTop: 16 }}>Tap anywhere to resume</div>
          <div style={{ fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace", marginTop: 6 }}>
            {word.word} — {word.japanese}
          </div>
        </div>
      )}
    </div>
  );
}
