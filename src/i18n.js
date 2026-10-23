/* Luminary Kids — strings. Every Amharic string here is a DRAFT awaiting
   review by an Ethiopian Grade 1 teacher (see docs: Amharic review log).
   House rule: address the child with gender-neutral "let's" forms
   (እንቁጠር, እንሞክር) instead of masculine/feminine imperatives. */
(function (G) {
  const LK = (G.LK = G.LK || {});

  // Number words 0–20. Spelling choice (አስር vs አሥር, ሶስት vs ሦስት) is flagged for educator decision.
  LK.numWords = {
    am: ['ዜሮ', 'አንድ', 'ሁለት', 'ሶስት', 'አራት', 'አምስት', 'ስድስት', 'ሰባት', 'ስምንት', 'ዘጠኝ', 'አስር',
      'አስራ አንድ', 'አስራ ሁለት', 'አስራ ሶስት', 'አስራ አራት', 'አስራ አምስት', 'አስራ ስድስት', 'አስራ ሰባት', 'አስራ ስምንት', 'አስራ ዘጠኝ', 'ሃያ'],
    en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
  };

  // Countable things: singular / plural in each language.
  LK.things = {
    orange: { am: ['ብርቱካን', 'ብርቱካኖች'], en: ['orange', 'oranges'] },
    mango: { am: ['ማንጎ', 'ማንጎዎች'], en: ['mango', 'mangoes'] },
    cup: { am: ['ስኒ', 'ስኒዎች'], en: ['coffee cup', 'coffee cups'] },
    chicken: { am: ['ዶሮ', 'ዶሮዎች'], en: ['chicken', 'chickens'] },
    flower: { am: ['አበባ', 'አበቦች'], en: ['flower', 'flowers'] },
    child: { am: ['ልጅ', 'ልጆች'], en: ['child', 'children'] },
    counter: { am: ['ጠጠር', 'ጠጠሮች'], en: ['counter', 'counters'] }
  };

  // Mathematical vocabulary — one term per idea, used everywhere (glossary in docs).
  LK.glossary = [
    ['count', 'መቁጠር'], ['number', 'ቁጥር'], ['add / addition', 'መደመር'], ['subtract / subtraction', 'መቀነስ'],
    ['plus (+)', 'ሲደመር'], ['minus (−)', 'ሲቀነስ'], ['equals (=)', 'እኩል ነው'], ['sum / total', 'ድምር'],
    ['difference', 'ልዩነት'], ['more', 'ብዙ'], ['fewer', 'ጥቂት'], ['greater than', 'ይበልጣል'], ['less than', 'ያንሳል'],
    ['ten', 'አስር'], ['ones', 'አንዶች'], ['tens', 'አስሮች'], ['ten frame', 'የአስር ሳጥን'], ['number line', 'የቁጥር መስመር'],
    ['left (remaining)', 'ቀሩ'], ['how many?', 'ስንት?'], ['empty space', 'ባዶ ቦታ'], ['hint', 'ፍንጭ']
  ];

  LK.ui = {
    am: {
      appName: 'የሂሳብ ጀብዱ', start: 'እንጀምር', next: 'ቀጣይ', hint: 'ፍንጭ', listen: 'ድምፅ', home: 'መነሻ',
      lessons: 'ትምህርቶች', parents: 'ለወላጆች', stars: 'ኮከቦች', check: 'እንፈትሽ', review: 'ክለሳ',
      diagnostic: 'የመነሻ ጨዋታ', diagnosticIntro: 'ሰላም! እኔ ዋሊ ነኝ። ስድስት አጭር ጥያቄዎችን አብረን እንጫወት።',
      welcome: 'እንኳን ደህና መጣችሁ!', chooseLesson: 'የዛሬው ጀብዱ', recommended: 'ዋሊ የሚመክረው',
      correct: ['ጎበዝ!', 'በጣም ጥሩ!', 'ልክ ነው!'], tryAgain: 'እንደገና እንሞክር። ሥዕሉን በደንብ እንመልከት።',
      reveal: 'መልሱ {ans} ነው። አብረን እንየው።', example: 'ምሳሌ', practice: 'ልምምድ', game: 'ጨዋታ',
      lessonDone: 'ትምህርቱ ተጠናቀቀ!', badgeEarned: 'አዲስ ሽልማት!', keepGoing: 'ልምምዱን እንቀጥል።',
      left: 'ግራ', right: 'ቀኝ', tapToCount: 'እያንዳንዱን ነካ አድርገን እንቁጠር።', counted: 'ተቆጥሯል',
      buildN: '{n} ጠጠሮችን በአስር ሳጥኑ ላይ እናስቀምጥ።', tapLine: 'በቁጥር መስመሩ ላይ መልሱን እንንካ።',
      noVoice: 'በዚህ መሣሪያ ላይ የአማርኛ ድምፅ የለም። የተቀዳ ድምፅ በቅርቡ ይመጣል።',
      noVoiceEn: 'የአማርኛ ድምፅ እስኪቀዳ ድረስ እንግሊዝኛውን እናነባለን። (No Amharic voice yet, so the English line is read aloud.)',
      showEnglish: 'እንግሊዝኛም አሳይ', unitDone: 'ሁሉንም ጨርሰናል! አሁን ክለሳ እንሥራ።',
      reviewDue: 'ለክለሳ የደረሰ', mastered: 'ተችሏል', learning: 'በመማር ላይ', notStarted: 'ገና አልተጀመረም'
    },
    en: {
      appName: 'Math Adventure', start: "Let's start", next: 'Next', hint: 'Hint', listen: 'Listen', home: 'Home',
      lessons: 'Lessons', parents: 'For grown-ups', stars: 'stars', check: 'Check', review: 'Review',
      diagnostic: 'Starting game', diagnosticIntro: "Hello! I'm Wali. Let's play six short questions together.",
      welcome: 'Welcome!', chooseLesson: "Today's adventure", recommended: 'Wali suggests',
      correct: ['Well done!', 'Great thinking!', "That's right!"], tryAgain: "Let's try again. Let's look at the picture carefully.",
      reveal: "The answer is {ans}. Let's look at it together.", example: 'Example', practice: 'Practice', game: 'Game',
      lessonDone: 'Lesson complete!', badgeEarned: 'New badge!', keepGoing: "Let's keep practising.",
      left: 'Left', right: 'Right', tapToCount: "Let's tap each one as we count.", counted: 'counted',
      buildN: "Let's put {n} counters in the ten frame.", tapLine: "Let's tap the answer on the number line.",
      noVoice: 'No Amharic voice on this device. Recorded narration is coming soon.',
      showEnglish: 'Show English too', unitDone: "We finished them all! Now let's review.",
      reviewDue: 'Due for review', mastered: 'Mastered', learning: 'Learning', notStarted: 'Not started'
    }
  };

  // Lessons: story, worked example, prompts. {plural} etc. are filled at run time.
  LK.lessons = [
    { id: 'count10', n: 1, scene: 'garden', thing: 'flower',
      title: { am: 'የአትክልት ቦታ ቆጠራ', en: 'Counting in the garden' },
      story: { am: 'ሰላም ልጆች! በአያቴ የአትክልት ቦታ ብዙ አበቦች አሉ። እያንዳንዱን አንድ ጊዜ ብቻ እንቁጠር።',
        en: "Hello, friends! Grandma's garden is full of flowers. Let's count each one just once." },
      example: { am: 'አንድ፣ ሁለት፣ ሶስት፣ አራት፣ አምስት፣ ስድስት። የመጨረሻው ቁጥር ስድስት ነው፤ ስለዚህ ስድስት አበቦች አሉ።',
        en: 'One, two, three, four, five, six. The last number we say is six, so there are six flowers.' } },
    { id: 'teens', n: 2, scene: 'market', thing: 'orange',
      title: { am: 'የገበያ አስሮች', en: 'Market tens' },
      story: { am: 'ዛሬ ገበያ ነን። ነጋዴዋ ብርቱካኖችን በአስር በአስር ታስቀምጣለች። አስር እና ጥቂት አንዶች ስንት ይሆናሉ?',
        en: 'Today we are at the market. The seller packs oranges in tens. How many is one ten and some more?' },
      example: { am: 'አንድ ሙሉ አስር ሳጥን አለ፤ ያ አስር ነው። ከዚያ አራት ተጨማሪ። አስር እና አራት አስራ አራት ነው።',
        en: 'One full ten frame is ten. Then four more. Ten and four is fourteen.' } },
    { id: 'compare', n: 3, scene: 'school', thing: 'cup',
      title: { am: 'ብዙ ወይስ ጥቂት?', en: 'More or fewer?' },
      story: { am: 'በትምህርት ቤታችን የቡና ሥነ ሥርዓት ትርዒት አለ። የትኛው ትሪ ብዙ ስኒዎች አሉት?',
        en: 'Our school has a coffee ceremony show. Which tray has more cups?' },
      example: { am: 'ስኒዎቹን አንድ ለአንድ እናገናኝ። ጓደኛ የሌለው ስኒ ያለበት ትሪ ብዙ አለው።',
        en: 'Match the cups one to one. The tray with cups left over has more.' } },
    { id: 'add10', n: 4, scene: 'road', thing: 'child',
      title: { am: 'የባጃጅ ጉዞ', en: 'The bajaj ride' },
      story: { am: 'ባጃጁ ልጆችን ወደ ትምህርት ቤት ይወስዳል። በየማቆሚያው ተጨማሪ ልጆች ይገባሉ።',
        en: 'The bajaj takes children to school. More children get in at each stop.' },
      example: { am: 'ሶስት ልጆች አሉ። ሁለት ልጆች ገቡ። ከሶስት ጀምረን እንቁጠር፦ አራት፣ አምስት። ሶስት ሲደመር ሁለት እኩል ነው አምስት።',
        en: 'Three children are inside. Two more get in. Start at three and count on: four, five. Three plus two equals five.' } },
    { id: 'sub10', n: 5, scene: 'tree', thing: 'mango',
      title: { am: 'የማንጎ ዛፍ', en: 'The mango tree' },
      story: { am: 'ነፋስ ነፈሰ! አንዳንድ ማንጎዎች ከዛፉ ወደቁ። ስንት ማንጎዎች ዛፉ ላይ ቀሩ?',
        en: 'The wind blows! Some mangoes fall from the tree. How many are left on the tree?' },
      example: { am: 'ሰባት ማንጎዎች ነበሩ። ሶስቱ ወደቁ። የወደቁትን እናቋርጥ። የቀሩት አራት ናቸው። ሰባት ሲቀነስ ሶስት እኩል ነው አራት።',
        en: 'There were seven mangoes. Three fell. Cross out the ones that fell. Four are left. Seven minus three equals four.' } },
    { id: 'make10', n: 6, scene: 'meadow', thing: 'counter',
      title: { am: 'አስር እንሙላ', en: 'Make ten' },
      story: { am: 'የአደይ አበባ ጊዜ ነው! አስር መሙላት ትልልቅ ቁጥሮችን መደመር ቀላል ያደርጋል።',
        en: 'It is Adey Abeba season! Filling a ten makes big additions easy.' },
      example: { am: 'ስምንት ሲደመር አምስት። ሁለቱን ወደ ስምንት እንውሰድና አስር እንሙላ። አስር እና ሶስት አስራ ሶስት ነው።',
        en: 'Eight plus five. Move two over to fill the ten. Ten and three is thirteen.' } }
  ];

  // Prompt templates by item type. Variables: {a} {b} {n} {thing} {things}.
  LK.prompts = {
    count: { am: 'ስንት {things} አሉ?', en: 'How many {things} are there?' },
    teen: { am: 'ስንት {things} አሉ?', en: 'How many {things} are there?' },
    teenSplit: { am: '{n} እኩል ነው አስር ሲደመር ስንት?', en: '{n} is ten and how many more?' },
    compareMore: { am: 'የትኛው ብዙ {things} አለው?', en: 'Which has more {things}?' },
    compareFewer: { am: 'የትኛው ጥቂት {things} አለው?', en: 'Which has fewer {things}?' },
    compareNum: { am: 'የትኛው ቁጥር ይበልጣል?', en: 'Which number is greater?' },
    add: { am: '{a} ልጆች ባጃጁ ውስጥ አሉ። {b} ልጆች ገቡ። አሁን ስንት ልጆች አሉ?',
      en: '{a} children are in the bajaj. {b} more get in. How many children are there now?' },
    addLine: { am: '{a} ሲደመር {b} ስንት ነው?', en: 'What is {a} plus {b}?' },
    sub: { am: '{a} ማንጎዎች ዛፉ ላይ ነበሩ። {b} ወደቁ። ስንት ቀሩ?',
      en: 'There were {a} mangoes on the tree. {b} fell. How many are left?' },
    subLine: { am: '{a} ሲቀነስ {b} ስንት ነው?', en: 'What is {a} minus {b}?' },
    missingTen: { am: '{a} ሲደመር ስንት አስር ይሆናል?', en: '{a} plus what makes ten?' },
    addTwenty: { am: '{a} ሲደመር {b} ስንት ነው?', en: 'What is {a} plus {b}?' },
    build: { am: '{n} ጠጠሮችን በአስር ሳጥኑ ላይ እናስቀምጥ።', en: "Let's put {n} counters in the ten frame." }
  };

  LK.hints = {
    count: { am: 'እያንዳንዱን አንድ ጊዜ ብቻ እንቁጠር። የመጨረሻው ቁጥር መልሱ ነው።', en: 'Count each one just once. The last number you say is the answer.' },
    teen: { am: 'አንድ ሙሉ አስር አለ። ከአስር ጀምረን የቀሩትን እንቁጠር።', en: 'There is one full ten. Start at ten and count on the rest.' },
    teenSplit: { am: 'ሙሉውን አስር ሳጥን እንለፈው። በሁለተኛው ሳጥን ስንት አሉ?', en: 'Skip the full ten. How many are in the second frame?' },
    compare: { am: 'አንድ ለአንድ እናገናኝ። የተረፈ ያለበት ብዙ አለው።', en: 'Match them one to one. The side with some left over has more.' },
    compareNum: { am: 'በቁጥር መስመሩ ላይ በስተቀኝ ያለው ቁጥር ይበልጣል።', en: 'On the number line, the number further right is greater.' },
    add: { am: 'ከትልቁ ቁጥር ጀምረን ወደ ፊት እንቁጠር።', en: 'Start from the bigger number and count on.' },
    sub: { am: 'የወደቁትን እናቋርጥ፤ የቀሩትን እንቁጠር።', en: 'Cross out the ones that fell, then count the ones left.' },
    subLine: { am: 'ከቁጥር {a} ጀምረን {b} ጊዜ ወደ ኋላ እንዝለል።', en: 'Start at {a} and hop back {b} times.' },
    missingTen: { am: 'ስንት ባዶ ቦታ ቀረ? እነሱን እንቁጠር።', en: 'How many empty spaces are left? Count them.' },
    addTwenty: { am: 'መጀመሪያ አስር እንሙላ፤ ከዚያ የቀሩትን እንጨምር።', en: 'First fill the ten, then add what is left.' },
    build: { am: 'አንድ አንድ እያልን እንንካ። አምስት የላይኛውን ረድፍ ይሞላል።', en: 'Tap one at a time. Five fills the top row.' }
  };

  LK.badges = {
    count10: { am: 'የአበባ ቆጣሪ', en: 'Flower counter' },
    teens: { am: 'የገበያ አስር', en: 'Market tens' },
    compare: { am: 'ብልህ አወዳዳሪ', en: 'Clever comparer' },
    add10: { am: 'የመደመር ጀግና', en: 'Addition hero' },
    sub10: { am: 'የመቀነስ ጀግና', en: 'Subtraction hero' },
    make10: { am: 'የአስር ጀግና', en: 'Ten hero' }
  };

  LK.fill = function (tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] !== undefined ? vars[k] : m));
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
