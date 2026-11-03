/* Luminary Kids — Grade 2 lessons (draft for review by an Amharic-speaking teacher).
   Same shape as LK.lessons in i18n.js. Not in the app build yet: used by the lesson animations
   (animations/export_lessons.js) until Grade 2 practice is added to the engine. */
(function (G) {
  const LK = (G.LK = G.LK || {});

  // Tens words for numbers past twenty (index = number of tens).
  LK.tensWords = {
    am: ['', 'አስር', 'ሃያ', 'ሰላሳ', 'አርባ', 'ሃምሳ', 'ስልሳ', 'ሰባ', 'ሰማንያ', 'ዘጠና', 'መቶ'],
    en: ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'one hundred']
  };

  LK.lessonsG2 = [
    { id: 'g2_placevalue', n: 1, grade: 2, scene: 'home', thing: 'stick',
      title: { am: 'አስሮች እና አንዶች', en: 'Tens and ones' },
      story: { am: 'አያቴ እንጨቶችን በአስር በአስር ታስራለች። እስራቶቹን ስንቆጥር ትልልቅ ቁጥሮች ቀላል ይሆናሉ።',
        en: 'Grandma ties sticks in bundles of ten. Counting bundles makes big numbers easy.' },
      example: { am: 'ሶስት የአስር እስሮች እና አራት ነጠላ እንጨቶች አሉ። ሶስት አስሮች ሰላሳ ናቸው። ሰላሳ እና አራት ሰላሳ አራት ነው።',
        en: 'There are three bundles of ten and four single sticks. Three tens are thirty. Thirty and four is thirty-four.' } },
    { id: 'g2_add2d', n: 2, grade: 2, scene: 'library', thing: 'block',
      title: { am: 'አስር ሲሞላ እንደምራለን', en: 'Adding with a new ten' },
      story: { am: 'በትምህርት ቤቱ ቤተ መጽሐፍት መጻሕፍትን እናደራጃለን። ሁለት ክምሮችን አንድ ላይ እንደምር።',
        en: 'We are sorting books in the school library. Let us add two piles together.' },
      example: { am: 'ሃያ ሰባት ሲደመር አስራ አምስት። መጀመሪያ አንዶቹን እንደምር፦ ሰባት እና አምስት አስራ ሁለት ነው። አስር አንዶች አንድ አስር ይሆናሉ። አሁን አራት አስሮች እና ሁለት አንዶች አሉ፤ አርባ ሁለት።',
        en: 'Twenty-seven plus fifteen. First add the ones: seven and five is twelve. Ten ones make one ten. Now there are four tens and two ones: forty-two.' } },
    { id: 'g2_sub2d', n: 3, grade: 2, scene: 'market', thing: 'block',
      title: { am: 'አስርን ፈትተን እንቀንሳለን', en: 'Subtracting by breaking a ten' },
      story: { am: 'በገበያው ቅርጫት ውስጥ አርባ ሁለት እንቁላሎች አሉ። አንድ ደንበኛ አስራ ሰባት እንቁላሎች ገዛ።',
        en: 'There are forty-two eggs in the market basket. A customer buys seventeen eggs.' },
      example: { am: 'አርባ ሁለት ሲቀነስ አስራ ሰባት። ከሁለት ሰባት መውሰድ አንችልም፤ ስለዚህ አንድ አስር እንፈታለን። አሁን ሶስት አስሮች እና አስራ ሁለት አንዶች አሉ። አስራ ሁለት ሲቀነስ ሰባት አምስት ነው፤ ሶስት ሲቀነስ አንድ ሁለት ነው። መልሱ ሃያ አምስት ነው።',
        en: 'Forty-two minus seventeen. We cannot take seven from two, so we break one ten. Now there are three tens and twelve ones. Twelve minus seven is five; three tens minus one ten is two tens. The answer is twenty-five.' } },
    { id: 'g2_groups', n: 4, grade: 2, scene: 'ceremony', thing: 'cup',
      title: { am: 'እኩል ቡድኖች', en: 'Equal groups' },
      story: { am: 'ለቡና ሥነ ሥርዓቱ ሶስት ትሪዎች ተዘጋጅተዋል። በእያንዳንዱ ትሪ ላይ አራት ስኒዎች አሉ።',
        en: 'Three trays are ready for the coffee ceremony. Each tray has four cups.' },
      example: { am: 'አራት፣ ስምንት፣ አስራ ሁለት። ሶስት ቡድኖች በአራት በአራት አስራ ሁለት ናቸው። ሶስት ጊዜ አራት እኩል ነው አስራ ሁለት።',
        en: 'Four, eight, twelve. Three groups of four make twelve. Three times four equals twelve.' } },
    { id: 'g2_birr', n: 5, grade: 2, scene: 'shop', thing: 'birr',
      title: { am: 'ብር እንቁጠር', en: 'Counting birr' },
      story: { am: 'ዛሬ ለቤተሰቡ ዳቦ ልንገዛ ነው። በኪሳችን ስንት ብር አለ?',
        en: 'Today we are buying bread for the family. How many birr are in our pocket?' },
      example: { am: 'ከትልቁ እንጀምር። ሁለት የአስር ብር ኖቶች ሃያ ብር ናቸው። የአምስት ብር ኖት ሲጨመር ሃያ አምስት። አንድ ብር ሲጨመር ሃያ ስድስት ብር።',
        en: 'Start with the biggest. Two ten-birr notes are twenty birr. Add a five-birr note: twenty-five. Add one birr: twenty-six birr.' } },
    { id: 'g2_halves', n: 6, grade: 2, scene: 'home', thing: 'injera',
      title: { am: 'ግማሽ እና ሩብ', en: 'Halves and quarters' },
      story: { am: 'እናቴ እንጀራ ለቤተሰቡ ታካፍላለች። ሁሉም እኩል ድርሻ ማግኘት አለበት።',
        en: 'Mother shares injera with the family. Everyone should get an equal share.' },
      example: { am: 'እንጀራውን ለሁለት እኩል ስንከፍል እያንዳንዱ ክፍል ግማሽ ነው። ለአራት እኩል ስንከፍል እያንዳንዱ ክፍል ሩብ ነው። ክፍሎቹ እኩል መሆን አለባቸው።',
        en: 'When we cut the injera into two equal parts, each part is a half. Into four equal parts, each part is a quarter. The parts must be equal.' } }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
