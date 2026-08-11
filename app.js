const defaultLessons = [
  {
    id: 1,
    title: "第一课",
    subtitle: "校园里的小伙伴",
    chars: [
      {
        char: "学",
        pinyin: "xué",
        strokes: [
          "M20 72 L20 22",
          "M20 22 L58 22",
          "M58 22 L58 72",
          "M8 40 L34 40",
          "M34 40 L64 40",
          "M42 72 L42 44",
          "M42 44 L72 44"
        ],
        words: [
          { word: "学校", pinyin: "xué xiào", meaning: "学生上课的地方" },
          { word: "学习", pinyin: "xué xí", meaning: "认真看书、做功课" },
          { word: "学期", pinyin: "xué qī", meaning: "一段学习时间" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="学校插画">
            <rect x="35" y="70" width="150" height="70" rx="8" fill="none" stroke="black" stroke-width="5"/>
            <path d="M25 72 L110 32 L195 72" fill="none" stroke="black" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M80 75 V140 M110 75 V140 M140 75 V140" stroke="black" stroke-width="5"/>
            <path d="M60 90 H160" stroke="black" stroke-width="5"/>
            <path d="M60 110 H160" stroke="black" stroke-width="5"/>
            <circle cx="46" cy="55" r="9" fill="none" stroke="black" stroke-width="4"/>
            <circle cx="174" cy="55" r="9" fill="none" stroke="black" stroke-width="4"/>
            <circle cx="95" cy="120" r="12" fill="none" stroke="black" stroke-width="4"/>
            <circle cx="124" cy="120" r="12" fill="none" stroke="black" stroke-width="4"/>
          </svg>
        `
      },
      {
        char: "校",
        pinyin: "xiào",
        strokes: [
          "M18 75 L18 22",
          "M18 22 L60 22",
          "M60 22 L60 75",
          "M36 22 L36 75",
          "M12 36 L68 36",
          "M5 75 L75 75",
          "M48 75 L48 120",
          "M48 120 L84 120",
          "M84 120 L84 38",
          "M84 38 L120 38",
          "M120 38 L120 120",
          "M84 76 L120 76"
        ],
        words: [
          { word: "校园", pinyin: "xiào yuán", meaning: "学校和操场的地方" },
          { word: "校长", pinyin: "xiào zhǎng", meaning: "管理学校的人" },
          { word: "校服", pinyin: "xiào fú", meaning: "学生穿的统一衣服" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="校园插画">
            <path d="M35 76 L110 32 L185 76" fill="none" stroke="black" stroke-width="5"/>
            <rect x="50" y="76" width="120" height="72" fill="none" stroke="black" stroke-width="5"/>
            <path d="M72 76 V148 M100 76 V148 M128 76 V148 M156 76 V148" stroke="black" stroke-width="5"/>
            <path d="M50 96 H170 M50 116 H170" stroke="black" stroke-width="5"/>
            <circle cx="88" cy="63" r="9" fill="none" stroke="black" stroke-width="4"/>
            <circle cx="132" cy="63" r="9" fill="none" stroke="black" stroke-width="4"/>
            <path d="M80 150 Q110 170 140 150" fill="none" stroke="black" stroke-width="5"/>
          </svg>
        `
      },
      {
        char: "朋",
        pinyin: "péng",
        strokes: [
          "M16 74 L16 22",
          "M16 22 L42 22",
          "M42 22 L42 74",
          "M16 44 L42 44",
          "M56 72 L56 18",
          "M56 18 L82 18",
          "M82 18 L82 72",
          "M56 44 L82 44",
          "M48 82 Q64 92 80 82",
          "M10 82 Q26 92 42 82"
        ],
        words: [
          { word: "朋友", pinyin: "péng you", meaning: "一起玩、一起学的人" },
          { word: "朋友圈", pinyin: "péng you quān", meaning: "朋友联系的圈子" },
          { word: "朋辈", pinyin: "péng bèi", meaning: "同辈的人" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="朋友插画">
            <circle cx="80" cy="65" r="25" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="150" cy="65" r="25" fill="none" stroke="black" stroke-width="5"/>
            <path d="M58 128 C70 108, 90 108, 100 128" fill="none" stroke="black" stroke-width="5"/>
            <path d="M128 128 C140 108, 160 108, 170 128" fill="none" stroke="black" stroke-width="5"/>
            <path d="M52 96 C75 112, 90 124, 110 124" fill="none" stroke="black" stroke-width="5"/>
            <path d="M110 124 C135 122, 150 112, 170 96" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="72" cy="58" r="4" fill="black"/>
            <circle cx="160" cy="58" r="4" fill="black"/>
          </svg>
        `
      },
      {
        char: "友",
        pinyin: "yǒu",
        strokes: [
          "M18 68 L18 22",
          "M18 22 L46 22",
          "M46 22 L46 68",
          "M18 42 L46 42",
          "M60 76 L60 18",
          "M60 18 L88 18",
          "M88 18 L88 76",
          "M60 42 L88 42",
          "M96 66 L96 18",
          "M96 18 L124 18",
          "M124 18 L124 66",
          "M96 42 L124 42"
        ],
        words: [
          { word: "友好", pinyin: "yǒu hǎo", meaning: "和别人关系很好" },
          { word: "友情", pinyin: "yǒu qíng", meaning: "朋友之间的感情" },
          { word: "友谊", pinyin: "yǒu yì", meaning: "深厚的友好关系" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="友情插画">
            <circle cx="78" cy="72" r="20" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="142" cy="72" r="20" fill="none" stroke="black" stroke-width="5"/>
            <path d="M60 120 C78 102, 90 102, 102 120" fill="none" stroke="black" stroke-width="5"/>
            <path d="M120 120 C134 102, 146 102, 160 120" fill="none" stroke="black" stroke-width="5"/>
            <path d="M110 102 L120 82" stroke="black" stroke-width="5" stroke-linecap="round"/>
            <circle cx="72" cy="68" r="3" fill="black"/>
            <circle cx="148" cy="68" r="3" fill="black"/>
          </svg>
        `
      }
    ]
  },
  {
    id: 2,
    title: "第二课",
    subtitle: "大自然小观察",
    chars: [
      {
        char: "山",
        pinyin: "shān",
        strokes: [
          "M12 82 L50 24 L88 82",
          "M58 82 L92 36 L128 82",
          "M97 82 L132 44 L166 82"
        ],
        words: [
          { word: "山峰", pinyin: "shān fēng", meaning: "高高的山顶" },
          { word: "山水", pinyin: "shān shuǐ", meaning: "山和水的组合" },
          { word: "山路", pinyin: "shān lù", meaning: "山里走的路" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="山坡插画">
            <path d="M20 120 L65 70 L105 120 Z" fill="none" stroke="black" stroke-width="5"/>
            <path d="M95 120 L140 60 L175 120 Z" fill="none" stroke="black" stroke-width="5"/>
            <path d="M20 120 H180" stroke="black" stroke-width="5"/>
            <path d="M72 120 V146 M128 120 V146" stroke="black" stroke-width="5"/>
            <circle cx="58" cy="54" r="5" fill="black"/>
            <circle cx="140" cy="46" r="5" fill="black"/>
          </svg>
        `
      },
      {
        char: "水",
        pinyin: "shuǐ",
        strokes: [
          "M18 70 Q32 28 54 36 Q76 42 82 20 Q96 34 108 54 Q118 72 130 68 Q150 62 160 80 Q146 100 118 96 Q92 92 72 100 Q50 108 34 92 Q18 82 18 70",
          "M26 100 Q60 118 92 106 Q128 94 160 110"
        ],
        words: [
          { word: "水杯", pinyin: "shuǐ bēi", meaning: "装水的杯子" },
          { word: "河水", pinyin: "hé shuǐ", meaning: "河里的水" },
          { word: "水草", pinyin: "shuǐ cǎo", meaning: "长在水里的植物" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="流水插画">
            <path d="M20 120 C50 98, 70 98, 90 120 S140 140, 180 110" fill="none" stroke="black" stroke-width="5"/>
            <path d="M20 138 C50 116, 70 116, 90 138 S140 156, 180 128" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="58" cy="68" r="14" fill="none" stroke="black" stroke-width="4"/>
            <circle cx="150" cy="70" r="14" fill="none" stroke="black" stroke-width="4"/>
            <path d="M36 86 C48 92, 52 96, 58 106" fill="none" stroke="black" stroke-width="4"/>
            <path d="M156 82 C168 90, 174 96, 180 106" fill="none" stroke="black" stroke-width="4"/>
          </svg>
        `
      },
      {
        char: "人",
        pinyin: "rén",
        strokes: [
          "M54 24 L54 72",
          "M30 48 L78 48",
          "M54 72 L40 112",
          "M54 72 L68 112"
        ],
        words: [
          { word: "人类", pinyin: "rén lèi", meaning: "我们这些人" },
          { word: "老师", pinyin: "lǎo shī", meaning: "教我们知识的人" },
          { word: "人物", pinyin: "rén wù", meaning: "人物形象" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="人插画">
            <circle cx="110" cy="60" r="26" fill="none" stroke="black" stroke-width="5"/>
            <path d="M82 108 C92 92, 128 92, 138 108" fill="none" stroke="black" stroke-width="5"/>
            <path d="M92 112 L76 146 M128 112 L145 146" fill="none" stroke="black" stroke-width="5"/>
            <path d="M110 86 V118" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="102" cy="60" r="4" fill="black"/>
            <circle cx="118" cy="60" r="4" fill="black"/>
          </svg>
        `
      },
      {
        char: "田",
        pinyin: "tián",
        strokes: [
          "M18 26 L18 86",
          "M18 26 L88 26",
          "M88 26 L88 86",
          "M18 56 L88 56",
          "M50 86 L50 132",
          "M18 132 L88 132"
        ],
        words: [
          { word: "田地", pinyin: "tián dì", meaning: "种庄稼的地方" },
          { word: "田野", pinyin: "tián yě", meaning: "开阔的田野" },
          { word: "田园", pinyin: "tián yuán", meaning: "农田和园地" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="田地插画">
            <rect x="30" y="50" width="160" height="90" fill="none" stroke="black" stroke-width="5"/>
            <path d="M30 82 H190 M30 114 H190" stroke="black" stroke-width="5"/>
            <path d="M92 50 V140 M150 50 V140" stroke="black" stroke-width="5"/>
            <path d="M62 146 C84 128, 98 128, 116 146" fill="none" stroke="black" stroke-width="5"/>
            <path d="M104 146 C126 128, 140 128, 160 146" fill="none" stroke="black" stroke-width="5"/>
          </svg>
        `
      }
    ]
  },
  {
    id: 3,
    title: "第三课",
    subtitle: "时间和书本",
    chars: [
      {
        char: "日",
        pinyin: "rì",
        strokes: [
          "M52 20 L52 100",
          "M30 52 L74 52",
          "M30 76 L74 76",
          "M20 20 Q52 2 84 20",
          "M20 102 Q52 120 84 102"
        ],
        words: [
          { word: "日子", pinyin: "rì zi", meaning: "一天天过去的时间" },
          { word: "太阳", pinyin: "tài yáng", meaning: "天上的大光球" },
          { word: "日记", pinyin: "rì jì", meaning: "记录每天事情的本子" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="太阳插画">
            <circle cx="110" cy="90" r="40" fill="none" stroke="black" stroke-width="5"/>
            <path d="M110 30 V15 M110 150 V165 M52 90 H35 M185 90 H202 M70 50 L56 36 M164 50 L178 36 M70 130 L56 144 M164 130 L178 144" stroke="black" stroke-width="4"/>
            <circle cx="96" cy="82" r="4" fill="black"/>
            <circle cx="124" cy="82" r="4" fill="black"/>
            <path d="M94 108 Q110 118 126 108" fill="none" stroke="black" stroke-width="4"/>
          </svg>
        `
      },
      {
        char: "月",
        pinyin: "yuè",
        strokes: [
          "M52 20 Q84 12 92 40 Q98 70 70 88 Q36 104 28 56 Q24 32 52 20",
          "M82 22 L94 38",
          "M78 62 L104 62"
        ],
        words: [
          { word: "月亮", pinyin: "yuè liàng", meaning: "夜晚照亮天空的亮亮" },
          { word: "月底", pinyin: "yuè dǐ", meaning: "一个月的最后几天" },
          { word: "月光", pinyin: "yuè guāng", meaning: "月亮照出来的光" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="月亮插画">
            <circle cx="110" cy="90" r="42" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="135" cy="76" r="30" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="94" cy="96" r="4" fill="black"/>
            <circle cx="122" cy="98" r="4" fill="black"/>
            <path d="M90 116 Q110 128 130 116" fill="none" stroke="black" stroke-width="4"/>
          </svg>
        `
      },
      {
        char: "早",
        pinyin: "zǎo",
        strokes: [
          "M24 50 L24 98",
          "M24 50 L64 50",
          "M64 50 L64 98",
          "M24 74 L64 74",
          "M84 40 Q106 22 128 40 Q150 58 118 78 Q90 96 84 40",
          "M88 92 L138 92"
        ],
        words: [
          { word: "早上", pinyin: "zǎo shang", meaning: "天亮以后的一段时间" },
          { word: "早晨", pinyin: "zǎo chen", meaning: "天亮不久的早期" },
          { word: "早饭", pinyin: "zǎo fàn", meaning: "早上的第一顿饭" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="早晨插画">
            <circle cx="150" cy="58" r="20" fill="none" stroke="black" stroke-width="5"/>
            <path d="M150 28 V15 M150 100 V112 M118 58 H102 M198 58 H182 M126 38 L114 26 M174 38 L186 26 M126 78 L114 90 M174 78 L186 90" stroke="black" stroke-width="4"/>
            <circle cx="64" cy="120" r="26" fill="none" stroke="black" stroke-width="5"/>
            <path d="M45 120 H83" stroke="black" stroke-width="5"/>
            <path d="M42 88 H86" stroke="black" stroke-width="5"/>
            <path d="M42 152 H86" stroke="black" stroke-width="5"/>
          </svg>
        `
      },
      {
        char: "书",
        pinyin: "shū",
        strokes: [
          "M18 22 L18 104",
          "M18 22 L72 22",
          "M72 22 L72 104",
          "M18 52 L72 52",
          "M18 86 L72 86",
          "M82 18 L82 110",
          "M82 18 L138 18",
          "M138 18 L138 110",
          "M82 60 L138 60"
        ],
        words: [
          { word: "书包", pinyin: "shū bāo", meaning: "装书本的小包" },
          { word: "书桌", pinyin: "shū zhuō", meaning: "写字和读书的桌子" },
          { word: "读书", pinyin: "dú shū", meaning: "拿书来学习" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="书本插画">
            <path d="M28 38 L28 128 C28 140, 42 148, 64 148 C86 148, 100 142, 108 130 L108 38 C100 44, 88 52, 64 52 C42 52, 32 48, 28 38 Z" fill="none" stroke="black" stroke-width="5"/>
            <path d="M108 38 L108 130 C108 144, 120 150, 138 150 C156 150, 170 144, 176 132 L176 38 C168 46, 156 52, 138 52 C120 52, 114 46, 108 38 Z" fill="none" stroke="black" stroke-width="5"/>
            <path d="M58 64 H92 M58 88 H92" stroke="black" stroke-width="4"/>
            <path d="M124 64 H162 M124 88 H162" stroke="black" stroke-width="4"/>
          </svg>
        `
      }
    ]
  },
  {
    id: 4,
    title: "第四课",
    subtitle: "植物和小树",
    chars: [
      {
        char: "木",
        pinyin: "mù",
        strokes: [
          "M56 22 L56 102",
          "M20 58 L56 58",
          "M56 58 L92 58",
          "M36 32 L56 12",
          "M56 12 L76 32",
          "M36 84 L56 102",
          "M56 102 L76 84"
        ],
        words: [
          { word: "木头", pinyin: "mù tou", meaning: "树干做成的材料" },
          { word: "树木", pinyin: "shù mù", meaning: "长在地上的大树" },
          { word: "木马", pinyin: "mù mǎ", meaning: "木制的马" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="树木插画">
            <path d="M108 26 V128" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="108" cy="20" r="16" fill="none" stroke="black" stroke-width="5"/>
            <path d="M72 50 C82 38, 94 34, 108 34 C120 34, 134 38, 144 50" fill="none" stroke="black" stroke-width="5"/>
            <path d="M72 74 C82 64, 94 60, 108 60 C120 60, 134 64, 144 74" fill="none" stroke="black" stroke-width="5"/>
            <path d="M82 100 C92 90, 100 86, 108 86 C118 86, 126 90, 136 100" fill="none" stroke="black" stroke-width="5"/>
          </svg>
        `
      },
      {
        char: "林",
        pinyin: "lín",
        strokes: [
          "M20 100 L20 34",
          "M20 34 L52 34",
          "M52 34 L52 100",
          "M84 100 L84 34",
          "M84 34 L116 34",
          "M116 34 L116 100",
          "M148 100 L148 34",
          "M148 34 L180 34",
          "M180 34 L180 100"
        ],
        words: [
          { word: "森林", pinyin: "sēn lín", meaning: "很多树一起长的地方" },
          { word: "树林", pinyin: "shù lín", meaning: "一排排小树" },
          { word: "林子", pinyin: "lín zi", meaning: "很多树组成的地方" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="森林插画">
            <path d="M36 120 V86 M20 94 H52" stroke="black" stroke-width="5"/>
            <path d="M96 120 V86 M80 94 H112" stroke="black" stroke-width="5"/>
            <path d="M156 120 V86 M140 94 H172" stroke="black" stroke-width="5"/>
            <circle cx="36" cy="64" r="18" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="96" cy="64" r="18" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="156" cy="64" r="18" fill="none" stroke="black" stroke-width="5"/>
            <path d="M22 120 H178" stroke="black" stroke-width="5"/>
          </svg>
        `
      },
      {
        char: "森",
        pinyin: "sēn",
        strokes: [
          "M20 100 L20 36",
          "M20 36 L46 36",
          "M46 36 L46 100",
          "M62 100 L62 36",
          "M62 36 L88 36",
          "M88 36 L88 100",
          "M104 100 L104 36",
          "M104 36 L130 36",
          "M130 36 L130 100",
          "M144 100 L144 36",
          "M144 36 L170 36",
          "M170 36 L170 100"
        ],
        words: [
          { word: "森林", pinyin: "sēn lín", meaning: "很多树在一起" },
          { word: "茂盛", pinyin: "mào shèng", meaning: "长得很旺盛" },
          { word: "参天", pinyin: "cān tiān", meaning: "树高高地长着" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="茂盛森林插画">
            <path d="M30 120 V88 M14 98 H46 M94 120 V88 M78 98 H110 M158 120 V88 M142 98 H174" stroke="black" stroke-width="5"/>
            <circle cx="30" cy="62" r="18" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="94" cy="62" r="18" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="158" cy="62" r="18" fill="none" stroke="black" stroke-width="5"/>
            <path d="M12 120 H188" stroke="black" stroke-width="5"/>
            <path d="M60 120 L40 142 M104 120 L94 146 M170 120 L150 142" stroke="black" stroke-width="5"/>
          </svg>
        `
      },
      {
        char: "花",
        pinyin: "huā",
        strokes: [
          "M52 20 C70 8, 82 8, 92 20",
          "M52 20 L52 60",
          "M92 20 L92 60",
          "M38 36 Q52 28 52 42 Q52 52 38 52",
          "M106 36 Q92 28 92 42 Q92 52 106 52",
          "M72 8 L72 72",
          "M20 48 Q72 78 124 48",
          "M72 78 Q126 56 146 32"
        ],
        words: [
          { word: "花朵", pinyin: "huā duǒ", meaning: "花儿开出来的样子" },
          { word: "花园", pinyin: "huā yuán", meaning: "种花的地方" },
          { word: "花草", pinyin: "huā cǎo", meaning: "花和草" }
        ],
        illustration: `
          <svg viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg" aria-label="花朵插画">
            <circle cx="110" cy="86" r="28" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="70" cy="64" r="20" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="150" cy="64" r="20" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="88" cy="112" r="18" fill="none" stroke="black" stroke-width="5"/>
            <circle cx="132" cy="112" r="18" fill="none" stroke="black" stroke-width="5"/>
            <path d="M110 24 V52 M110 120 V150" stroke="black" stroke-width="5"/>
            <path d="M50 92 L20 120 M170 92 L198 120" stroke="black" stroke-width="5"/>
          </svg>
        `
      }
    ]
  }
];

const lessonNav = document.getElementById("lesson-nav");
const lessonOverview = document.getElementById("lesson-overview");
const charList = document.getElementById("char-list");
const charDetail = document.getElementById("char-detail");

let lessons = defaultLessons;
let currentLessonIndex = 0;
let currentCharIndex = 0;
let writerInstance = null;
let dictationWriter = null;
let dictationLessonIndex = 0;
let dictationCharIndex = 0;
let speechVoices = [];

function loadSpeechVoices() {
  speechVoices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
}

function speakChinese(text, statusElement) {
  if (!("speechSynthesis" in window)) {
    if (statusElement) statusElement.textContent = "当前浏览器不支持语音朗读。";
    return;
  }

  loadSpeechVoices();
  const chineseVoice = speechVoices.find((voice) => /^(zh-CN|zh_CN|zh)/i.test(voice.lang) || /Chinese|中文|普通话/i.test(voice.name));

  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = chineseVoice?.lang || "zh-CN";
  if (chineseVoice) speech.voice = chineseVoice;
  speech.rate = 0.82;
  speech.onstart = () => {
    if (statusElement) statusElement.textContent = "正在朗读…";
  };
  speech.onerror = () => {
    if (statusElement) statusElement.textContent = "朗读没有成功，请确认系统已安装中文语音。";
  };
  if (!chineseVoice && statusElement) statusElement.textContent = "正在尝试使用浏览器默认中文语音…";
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(speech);
}

function parseLessonsText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  const parsedLessons = [];
  let currentLesson = null;

  for (const rawLine of lines) {
    if (rawLine.startsWith("[") && rawLine.endsWith("]")) {
      const title = rawLine.slice(1, -1).trim();
      currentLesson = {
        id: parsedLessons.length + 1,
        title,
        subtitle: "",
        chars: []
      };
      parsedLessons.push(currentLesson);
      continue;
    }

    if (!currentLesson) continue;

    const cells = rawLine.split("|").map((cell) => cell.trim());
    if (cells.length < 3) continue;

    const [char, pinyin, ...rest] = cells;
    const wordGroups = rest.join("|").split(";").map((group) => group.trim()).filter(Boolean);

    const words = wordGroups
      .map((group) => {
        const groupParts = group.split("|").map((item) => item.trim());
        if (groupParts.length < 3) return null;
        return {
          word: groupParts[0],
          pinyin: groupParts[1],
          meaning: groupParts[2]
        };
      })
      .filter(Boolean);

    if (!words.length) continue;

    currentLesson.chars.push({
      char,
      pinyin,
      words
    });
  }

  return parsedLessons.filter((lesson) => lesson.chars.length > 0);
}

async function loadLessonsFromTxt() {
  try {
    const response = await fetch("生字数据.txt", { cache: "no-store" });
    if (!response.ok) throw new Error("txt not found");
    const text = await response.text();
    const parsed = parseLessonsText(text);
    if (parsed.length) return parsed;
  } catch (error) {
    console.warn("Using built-in lesson data fallback:", error);
  }
  return defaultLessons;
}

function renderLessons() {
  lessonNav.innerHTML = lessons
    .map(
      (lesson, index) => `
        <button class="lesson-button ${index === currentLessonIndex ? "active" : ""}" data-index="${index}" type="button">
          ${lesson.title}
        </button>
      `
    )
    .join("");

  lessonNav.querySelectorAll(".lesson-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentLessonIndex = Number(button.dataset.index);
      currentCharIndex = 0;
      render();
    });
  });
}

function renderOverview() {
  const lesson = lessons[currentLessonIndex];
  lessonOverview.innerHTML = `
    <div>
      <h2>${lesson.title}</h2>
      <p>${lesson.subtitle}</p>
    </div>
    <div class="lesson-overview-actions">
      <div class="lesson-badge">${lesson.chars.length} 个生字</div>
      <button class="primary-button start-dictation" type="button">每日听写</button>
    </div>
  `;
  lessonOverview.querySelector(".start-dictation").addEventListener("click", () => renderDictation(currentLessonIndex));
}

function renderCharList() {
  const lesson = lessons[currentLessonIndex];
  charList.innerHTML = lesson.chars
    .map(
      (item, index) => `
        <button class="char-button ${index === currentCharIndex ? "active" : ""}" data-index="${index}" type="button">
          <span class="char-mini">${item.char}</span>
          <span class="char-read">${item.pinyin}</span>
        </button>
      `
    )
    .join("");

  charList.querySelectorAll(".char-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentCharIndex = Number(button.dataset.index);
      renderDetail();
      renderCharList();
    });
  });
}

function getMeaningPinyin(text) {
  if (!window.pinyinPro?.pinyin) return "";
  return window.pinyinPro.pinyin(text, { toneType: "symbol" });
}

function renderDetail() {
  const lesson = lessons[currentLessonIndex];
  const character = lesson.chars[currentCharIndex];

  charDetail.innerHTML = `
    <div class="character-panel">
      <div class="character-box">
        <div class="character-header">
          <div class="big-char">${character.char}</div>
          <span class="pinyin-tag">${character.pinyin}</span>
        </div>
        <div class="stroke-demo" aria-label="笔画演示">
          <div class="writer-target" id="writer-target"></div>
        </div>
        <button class="animate-button" type="button">演示笔画</button>
      </div>

      <div class="info-panel">
        <div>
          <h3 class="words-title">组词</h3>
          <div class="word-list">
            ${character.words
              .map(
                (word) => `
                  <div class="word-card">
                    <div class="word-heading">
                      <h4>${word.word}</h4>
                      <button class="speak-word-button" type="button" data-word="${word.word}" data-meaning="${word.meaning}" aria-label="朗读${word.word}及释义" title="朗读组词和释义">🔊</button>
                    </div>
                    <span class="word-pinyin">${word.pinyin}</span>
                    <span class="meaning-pinyin">${getMeaningPinyin(word.meaning)}</span>
                    <p>${word.meaning}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>

      </div>
    </div>
  `;

  const animateButton = charDetail.querySelector(".animate-button");
  animateButton.addEventListener("click", () => animateStrokes());

  charDetail.querySelectorAll(".speak-word-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) return;
      speakChinese(`${button.dataset.word}。${button.dataset.meaning}`);
    });
  });

  if (window.HanziWriter) {
    const target = document.getElementById("writer-target");
    if (target) {
      writerInstance = HanziWriter.create(target, character.char, {
        width: 160,
        height: 160,
        padding: 0,
        strokeAnimationSpeed: 1.1,
        delayBetweenLoops: 900,
        highlightOnComplete: true,
        showOutline: false,
        showCharacter: true,
        characterColor: "#1d1d1d",
        outlineColor: "#1d1d1d",
        mainColor: "#1d1d1d",
        highlightColor: "#f4b942"
      });
    }
  }

  animateStrokes();
}

function getDictationProgress(lessonIndex) {
  return JSON.parse(localStorage.getItem(`hanzi-dictation-${lessonIndex}`) || "{}");
}

function saveDictationProgress(lessonIndex, charIndex, value) {
  const progress = getDictationProgress(lessonIndex);
  progress[charIndex] = value;
  localStorage.setItem(`hanzi-dictation-${lessonIndex}`, JSON.stringify(progress));
}

function speakDictationWord(word) {
  speakChinese(`${word.word}。请写出这个词语。${word.meaning}`, document.getElementById("dictation-status"));
}

function renderDictation(lessonIndex) {
  dictationLessonIndex = lessonIndex;
  const lesson = lessons[dictationLessonIndex];
  const progress = getDictationProgress(dictationLessonIndex);
  const nextIndex = lesson.chars.findIndex((_, index) => !progress[index]);
  dictationCharIndex = nextIndex === -1 ? 0 : nextIndex;
  const character = lesson.chars[dictationCharIndex];
  const dictationWord = character.words[0];
  const wordCharacters = Array.from(dictationWord.word).filter((item) => /[\u3400-\u9fff]/.test(item));
  const completedCharacters = new Set();
  let hasMistake = false;

  lessonNav.innerHTML = "";
  charList.innerHTML = "";
  charList.hidden = true;
  lessonOverview.innerHTML = `<div><h2>每日听写 · ${lesson.title}</h2><p>看组词拼音，按笔顺在田字格中写出生字。完成：${Object.keys(progress).length}/${lesson.chars.length}</p></div><button class="secondary-button exit-dictation" type="button">返回学习</button>`;
  charDetail.innerHTML = `
    <section class="dictation-card">
      <p class="dictation-step">第 ${dictationCharIndex + 1} 个组词</p>
      <p class="dictation-pinyin">${dictationWord.pinyin}</p>
      <button class="listen-button" type="button">🔊 听写</button>
      <p class="dictation-hint">请在每个田字格中写完这个词语。写错时可以查看讲解。</p>
      <div class="tianzi-grid-list">
        ${wordCharacters.map((item, index) => `<div class="tianzi-grid" data-character="${item}"><div id="dictation-target-${index}" class="dictation-target" aria-label="第 ${index + 1} 个字书写区"></div></div>`).join("")}
      </div>
      <p id="dictation-status" class="dictation-status" aria-live="polite">准备好后开始书写。</p>
      <div class="dictation-actions"><button class="secondary-button retry-dictation" type="button">重新书写</button><button class="primary-button next-dictation" type="button" hidden>下一个</button><button class="secondary-button review-dictation" type="button" hidden>查看讲解</button></div>
    </section>`;

  const checkWordComplete = () => {
    if (completedCharacters.size !== wordCharacters.length) return;
    const status = document.getElementById("dictation-status");
    saveDictationProgress(dictationLessonIndex, dictationCharIndex, true);
    status.textContent = hasMistake ? "✓ 词语已完成并保存，建议再查看讲解巩固笔顺。" : "✓ 这个组词全部写对了，已保存完成！";
    charDetail.querySelector(".next-dictation").hidden = false;
  };

  wordCharacters.forEach((targetCharacter, index) => {
    const writer = HanziWriter.create(`dictation-target-${index}`, targetCharacter, {
      width: 250, height: 250, padding: 12, showCharacter: false, showOutline: false,
      drawingColor: "#1d1d1d", drawingWidth: 5, highlightColor: "#f4b942", highlightOnComplete: true
    });
    writer.quiz({
      leniency: 1.15,
      showHintAfterMisses: 2,
      onMistake: () => {
        hasMistake = true;
        document.getElementById("dictation-status").textContent = "这笔不太对，试试看；需要的话可以查看讲解。";
        charDetail.querySelector(".review-dictation").hidden = false;
      },
      onComplete: (summary) => {
        completedCharacters.add(index);
        charDetail.querySelector(`[data-character="${targetCharacter}"]`).classList.add("is-complete");
        if (summary.totalMistakes > 0) hasMistake = true;
        checkWordComplete();
      }
    });
  });

  charDetail.querySelector(".listen-button").addEventListener("click", () => speakDictationWord(dictationWord));
  charDetail.querySelector(".retry-dictation").addEventListener("click", () => renderDictation(dictationLessonIndex));
  charDetail.querySelector(".next-dictation").addEventListener("click", () => renderDictation(dictationLessonIndex));
  charDetail.querySelector(".review-dictation").addEventListener("click", () => {
    currentLessonIndex = dictationLessonIndex;
    currentCharIndex = dictationCharIndex;
    render();
  });
  lessonOverview.querySelector(".exit-dictation").addEventListener("click", render);
}

function animateStrokes() {
  if (writerInstance && typeof writerInstance.animateCharacter === "function") {
    writerInstance.animateCharacter();
  }
}

function render() {
  charList.hidden = false;
  renderLessons();
  renderOverview();
  renderCharList();
  renderDetail();
}

async function init() {
  loadSpeechVoices();
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = loadSpeechVoices;
  const loadedLessons = await loadLessonsFromTxt();
  if (loadedLessons && loadedLessons.length) {
    lessons = loadedLessons;
  }
  render();
}

init();
