// Explorer (kids) mode content: greetings, "brain superpowers", the guided
// Space Mission, the quiz and badges. Kid text must stay true to the science
// in features.js, just simpler. No shadow side or personality scores here:
// trait scores per language invite stereotypes, which kids shouldn't absorb.

// `speak` = BCP-47 code for the device's speech voice; `sign` = how to sign it.
export const GREETINGS = {
  en:  { text: 'Hello!', speak: 'en-GB' },
  de:  { text: 'Hallo!', speak: 'de-DE' },
  sv:  { text: 'Hej!', speak: 'sv-SE' },
  es:  { text: '¡Hola!', speak: 'es-ES' },
  fr:  { text: 'Bonjour !', speak: 'fr-FR' },
  pt:  { text: 'Olá!', speak: 'pt-PT' },
  it:  { text: 'Ciao!', speak: 'it-IT' },
  el:  { text: 'Γεια σου!', roman: 'Yia sou', speak: 'el-GR' },
  ru:  { text: 'Привет!', roman: 'Privet', speak: 'ru-RU' },
  hi:  { text: 'नमस्ते!', roman: 'Namaste', speak: 'hi-IN' },
  ta:  { text: 'வணக்கம்!', roman: 'Vanakkam', speak: 'ta-IN' },
  ar:  { text: 'السلام عليكم', roman: 'As-salāmu ʿalaykum, "peace be upon you"', speak: 'ar-SA' },
  he:  { text: 'שלום!', roman: 'Shalom', speak: 'he-IL' },
  tr:  { text: 'Merhaba!', speak: 'tr-TR' },
  fi:  { text: 'Hei!', speak: 'fi-FI' },
  sw:  { text: 'Jambo!', speak: 'sw-KE' },
  yo:  { text: 'Báwo ni?', roman: '"How are you?"', speak: 'yo-NG' },
  zh:  { text: '你好！', roman: 'nǐ hǎo', speak: 'zh-CN' },
  yue: { text: '你好！', roman: 'nei5 hou2', speak: 'zh-HK' },
  ko:  { text: '안녕하세요!', roman: 'annyeonghaseyo', speak: 'ko-KR' },
  ja:  { text: 'こんにちは！', roman: 'konnichiwa', speak: 'ja-JP' },
  th:  { text: 'สวัสดี!', roman: 'sawatdee', speak: 'th-TH' },
  vi:  { text: 'Xin chào!', speak: 'vi-VN' },
  ms:  { text: 'Apa khabar?', roman: '"How are you?"', speak: 'ms-MY', fallback: 'id-ID' },
  jhi: { note: 'Jahai is spoken by about 1,000 people in the rainforests of northern Malaysia. It has no writing system: it lives in speech.' },
  gvn: { note: 'Guugu Yimithirr is spoken by a few hundred people in Hope Vale, Australia.' },
  kuuk: { note: 'Kuuk Thaayorre is spoken by about 250 people in Pormpuraaw, Australia.' },
  myp: { note: 'Pirahã is spoken by a few hundred people along the Maici River in the Amazon rainforest.' },
  ase: { sign: 'HELLO: a flat hand moves out from your forehead, like a little salute. 👋' },
  bfi: { sign: 'HELLO: a friendly wave of an open hand. 👋' },
  xml: { sign: 'Many BIM signers greet with a wave of the hand. 👋' },
  csl: { sign: '你好: point to the person (你, "you"), then give a thumbs up (好, "good"). 👉👍' },
};

// Brain superpowers: kid-friendly names for features. `game` links a mini-game.
export const POWERS = {
  blue_split:            { emoji: '🔵', name: 'Colour Detective', fact: 'Russian has two different words for light blue (goluboy) and dark blue (siniy). Russian speakers spot the difference between those blues a tiny bit faster!', game: 'blue' },
  absolute_frame:        { emoji: '🧭', name: 'Built-in Compass', fact: 'There are no words for "left" and "right" here. People say "the cup is north of the plate", so speakers always know where north is, even indoors!' },
  absolute_time:         { emoji: '🌅', name: 'Sun-Path Time', fact: 'When they put pictures in time order, they lay them out from east to west, the way the sun travels across the sky.' },
  odor_lexicon:          { emoji: '👃', name: 'Super Sniffer', fact: 'Jahai people in Malaysia have special words for smells, like we have "red" and "blue". They name smells as easily as colours!' },
  tonal:                 { emoji: '🎵', name: 'Pitch Power', fact: 'Making your voice go up or down changes the word! Tone-language speakers are extra good at hearing musical notes.', game: 'tone' },
  rtl_timeline:          { emoji: '↔️', name: 'Mirror Timeline', fact: 'Writing goes from right to left, so people imagine time flowing from right to left too!' },
  transparent_numerals:  { emoji: '🔢', name: 'Number Ninja', fact: 'Eleven is "ten-one" and twenty-three is "two-ten-three". The numbers explain themselves, so kids learn to count high sooner!', game: 'number' },
  short_digits:          { emoji: '🧠', name: 'Memory Booster', fact: 'Number words are super short, so you can keep more of them in your head at once, like a phone number.' },
  numeral_inversion:     { emoji: '🔄', name: 'Number Flip', fact: '24 is said "four-and-twenty"! It\'s a little brain-twister, and kids sometimes write 42 by mistake.' },
  logographic:           { emoji: '🈶', name: 'Picture Reader', fact: 'Each character is a little puzzle with meaning inside. Reading them uses extra "seeing" parts of the brain.' },
  honorific_grammar:     { emoji: '🙇', name: 'Polite Pro', fact: 'You change your words depending on who you talk to: a friend, a teacher or a grandma. Korean has 7 levels of politeness!' },
  tv_distinction:        { emoji: '🤝', name: 'Two Kinds of "You"', fact: 'There\'s a friendly "you" for friends and family, and a polite "you" for teachers and strangers.' },
  kinship_lexicon:       { emoji: '👪', name: 'Family Mapper', fact: 'Not just "uncle": there are different words for dad\'s older brother, dad\'s younger brother and mum\'s brother!' },
  evidentiality:         { emoji: '🔍', name: 'Fact Checker', fact: 'When you tell a story, the grammar shows whether you saw it yourself or only heard about it!' },
  motion_satellite:      { emoji: '🏃', name: 'Action Storyteller', fact: 'Lots of verbs for HOW things move: dash, stumble, zoom, wiggle! Stories are full of action.' },
  motion_verb_framed:    { emoji: '🗺️', name: 'Path Finder', fact: 'Verbs tell WHERE things go (enter, exit, climb), so stories paint the path and the scene.' },
  productive_compounding:{ emoji: '🧱', name: 'Word Builder', fact: 'Snap words together like LEGO! German "Handschuh" (hand-shoe) means glove.' },
  agglutination:         { emoji: '🚂', name: 'Word Train', fact: 'Add little pieces to the end of a word like train carriages, until one long word says a whole sentence!' },
  noun_classes:          { emoji: '🗂️', name: 'Sorting Master', fact: 'Every thing belongs to a group (people, trees, objects), and the start of the word shows which group!' },
  duration_volume:       { emoji: '⏳', name: 'Time Bucket', fact: 'Time is "much" or "little", like water in a bucket, so speakers picture time filling up!' },
  genderless_pronouns:   { emoji: '🧑', name: 'One Word for He & She', fact: 'One little word means both "he" and "she"!' },
  pro_drop:              { emoji: '🤫', name: 'Skip the "I"', fact: 'You can leave out "I" and "you", because everyone already knows who you mean!' },
  diglossia:             { emoji: '📚', name: 'Two Languages in One', fact: 'There\'s a fancy way for books and news, and a different everyday way for chatting at home!' },
  spatial_grammar:       { emoji: '🤟', name: '3D Thinker', fact: 'Grammar happens in the air with your hands! Signers are great at imagining shapes turning in space.' },
  facial_grammar:        { emoji: '🙂', name: 'Face Reader', fact: 'Eyebrows are grammar! Raising them can turn a sentence into a question. Signers are face-reading experts.' },
  iconicity:             { emoji: '✋', name: 'Picture Words', fact: 'Many signs look like what they mean: the sign for TREE looks like a tree swaying in the wind!' },
};

// Evidence, in kid words.
export const SURE = {
  strong:        { stars: '★★★', text: 'Scientists are sure' },
  moderate:      { stars: '★★☆', text: 'Scientists are pretty sure' },
  correlational: { stars: '★☆☆', text: 'Scientists are still checking' },
  contested:     { stars: '★☆☆', text: 'Scientists are still arguing' },
  speculative:   { stars: '☆☆☆', text: 'Just an idea so far' },
};

// The guided Space Mission. `to`: 'overview', 'origin' or a language id.
export const TOUR = [
  { to: 'overview', emoji: '🚀', title: 'Welcome, space explorer!', text: 'Every glowing star is a language that people speak (or sign!). Bigger stars have more words. The branches show the brain superpowers each language trains. Ready? Let\'s fly!' },
  { to: 'origin', emoji: '👶', title: 'It starts before you are born', text: 'This golden centre is your mother tongue, the very first language you hear. Babies in the womb already hear their mum\'s language, and on their birthday they like it better than any other!' },
  { to: 'ru', emoji: '🔵', title: 'Russian: two kinds of blue', text: 'In Russian, light blue and dark blue have completely different names, like "pink" and "red" in English. Scientists found Russian speakers notice the difference a little faster.', game: 'blue' },
  { to: 'zh', emoji: '🎵', title: 'Mandarin: the singing language', text: 'Say "ma" going up, down or wobbly and you get different words: mother, hemp, horse or scold! Careful, or you\'ll call your mum a horse. 🐴', game: 'tone' },
  { to: 'gvn', emoji: '🧭', title: 'Guugu Yimithirr: a compass in your head', text: 'In this Australian language nobody says "left" or "right". They say "there\'s an ant on your south leg!" So speakers always know which way north is.' },
  { to: 'jhi', emoji: '👃', title: 'Jahai: the smell experts of Malaysia', text: 'Deep in the Malaysian rainforest, the Jahai have special words just for smells. They can name a smell as fast as you can say "blue"!' },
  { to: 'ko', emoji: '🙇', title: 'Korean: seven ways to be polite', text: 'Korean changes the end of every sentence depending on who you\'re talking to: a baby brother, a teacher or a grandpa. It keeps everyone thinking about respect.' },
  { to: 'ms', emoji: '🔢', title: 'Malay & Chinese: numbers that explain themselves', text: '"Dua puluh tiga" is "two tens three", 23! Chinese does the same: 二十三, "two-ten-three". English hides it in "twenty-three". Kids learn to count high sooner this way.', game: 'number' },
  { to: 'ase', emoji: '🤟', title: 'Sign languages: talking with hands and faces', text: 'Sign languages are real, complete languages made with hands, faces and space. Signers are super good at imagining shapes turning around in their heads.' },
  { to: 'overview', emoji: '🌉', title: 'Two languages, two of you?', text: 'Those golden bridges link languages that some people speak both of. Scientists found people can feel and act a little differently in each language, like having two outfits for your brain!', quiz: true },
];

export const QUIZ = [
  { q: 'Which language has two different words for blue?', options: ['English', 'Russian', 'Swedish'], answer: 1, why: 'Russian: goluboy (light blue) and siniy (dark blue).' },
  { q: 'In Mandarin, "mǎ" (voice dips down then up) means…', options: ['mother', 'horse 🐴', 'scold'], answer: 1, why: 'mā = mother, má = hemp, mǎ = horse, mà = scold.' },
  { q: 'Instead of "left" and "right", Guugu Yimithirr speakers say…', options: ['north, south, east and west', 'up and down', 'this way and that way'], answer: 0, why: 'They use the compass directions, all day long!' },
  { q: 'When does a baby start learning its first language?', options: ['At school', 'At age 2', 'Before it is born'], answer: 2, why: 'Babies hear their mum\'s language in the womb!' },
  { q: 'In Malay, "dua puluh tiga" means…', options: ['32', '23', '203'], answer: 1, why: '"Two tens three" = 23.' },
  { q: 'Sign languages are made with…', options: ['only fingers', 'hands, faces and space', 'pictures on paper'], answer: 1, why: 'Faces are grammar too: eyebrows can make a question!' },
];

export const BADGES = [
  { id: 'first',    emoji: '⭐', name: 'First Stamp',        desc: 'Visited your first language' },
  { id: 'five',     emoji: '🌟', name: 'Star Hopper',        desc: 'Visited 5 languages' },
  { id: 'fifteen',  emoji: '🌌', name: 'Galaxy Traveller',   desc: 'Visited 15 languages' },
  { id: 'all',      emoji: '🏆', name: 'Master of the Cosmos', desc: 'Visited every language' },
  { id: 'families', emoji: '🗺️', name: 'Family Finder',      desc: 'Visited 8 different language families' },
  { id: 'sign',     emoji: '🤟', name: 'Hand Talker',        desc: 'Visited a sign language' },
  { id: 'tour',     emoji: '🚀', name: 'Mission Complete',   desc: 'Finished the Space Mission' },
  { id: 'quiz',     emoji: '🎓', name: 'Cosmos Graduate',    desc: 'Scored 5+ in the quiz' },
  { id: 'tone',     emoji: '🎵', name: 'Tone Detective',     desc: 'Won Tone Detective' },
  { id: 'number',   emoji: '🔢', name: 'Number Ninja',       desc: 'Won Number Ninja' },
  { id: 'blue',     emoji: '🔵', name: 'Blue Spotter',       desc: 'Finished Blue Spotter' },
];
