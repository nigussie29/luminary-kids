/* Luminary Kids — Grade 3 lessons (draft for review by an Amharic-speaking teacher).
   Same shape as LK.lessonsG2. Each worked example is split into sentences (at ። and . ! ?);
   every sentence is one narration clip and one step of the hook video, so the Amharic and
   English examples must have the same number of sentences. */
(function (G) {
  const LK = (G.LK = G.LK || {});

  // Number words to 999 (Amharic: "ሁለት መቶ አርባ አምስት"; English: "two hundred forty-five").
  LK.hundredWords = { am: 'መቶ', en: 'hundred', thousand: { am: 'አንድ ሺህ', en: 'one thousand' } };
  LK.numberWord = function (n, lang = 'am') {
    const ones = LK.numWords[lang], tens = LK.tensWords[lang];
    if (n === 1000) return LK.hundredWords.thousand[lang];
    if (n < 100) {
      if (n <= 20) return ones[n];
      const t = Math.floor(n / 10), o = n % 10;
      if (!o) return tens[t];
      return lang === 'am' ? `${tens[t]} ${ones[o]}` : `${tens[t]}-${ones[o]}`;
    }
    const h = Math.floor(n / 100), rest = n % 100;
    const head = lang === 'am' ? (h === 1 ? 'መቶ' : `${ones[h]} መቶ`) : `${ones[h]} hundred`;
    return rest ? `${head} ${LK.numberWord(rest, lang)}` : head;
  };

  LK.lessonsG3 = [
    { id: 'g3_hundreds', n: 1, grade: 3, scene: 'store', thing: 'block',
      title: { am: 'መቶዎች፣ አስሮች እና አንዶች', en: 'Hundreds, tens and ones' },
      story: { am: 'ዛሬ በትልልቅ ቁጥሮች እንጫወታለን። አስር አስሮች ሲሰባሰቡ አንድ መቶ ይሆናሉ።',
        en: 'Today we play with big numbers. When ten tens come together, they make one hundred.' },
      example: { am: 'አስር አስሮች አንድ መቶ ይሆናሉ። እዚህ ሁለት መቶዎች፣ አራት አስሮች እና አምስት አንዶች አሉ። ሁለት መቶ፣ አርባ እና አምስት። ቁጥሩ ሁለት መቶ አርባ አምስት ነው።',
        en: 'Ten tens make one hundred. Here are two hundreds, four tens and five ones. Two hundred, forty and five. The number is two hundred forty-five.' } },
    { id: 'g3_add3d', n: 2, grade: 3, scene: 'orchard', thing: 'orange',
      title: { am: 'ባለ ሶስት አሃዝ ቁጥሮችን መደመር', en: 'Adding three-digit numbers' },
      story: { am: 'ገበሬው በመጀመሪያው ቀን ሁለት መቶ ሰላሳ ስምንት ብርቱካኖችን፣ በሁለተኛው ቀን መቶ አርባ አምስት ብርቱካኖችን ለቀመ።',
        en: 'The farmer picked two hundred thirty-eight oranges on the first day and one hundred forty-five on the second day.' },
      example: { am: 'ሁለት መቶ ሰላሳ ስምንት ሲደመር መቶ አርባ አምስት። መጀመሪያ አንዶቹን እንደምር፦ ስምንት እና አምስት አስራ ሶስት ነው። ሶስቱን እንጽፋለን፤ አንዱን አስር ወደ አስሮቹ እንወስዳለን። አስሮች፦ አንድ፣ ሶስት እና አራት ስምንት ናቸው። መቶዎች፦ ሁለት እና አንድ ሶስት ናቸው። መልሱ ሶስት መቶ ሰማንያ ሶስት ነው።',
        en: 'Two hundred thirty-eight plus one hundred forty-five. First add the ones: eight and five is thirteen. We write the three and carry one ten to the tens. Tens: one, three and four make eight. Hundreds: two and one make three. The answer is three hundred eighty-three.' } },
    { id: 'g3_sub3d', n: 3, grade: 3, scene: 'schoolyard', thing: 'child',
      title: { am: 'ባለ ሶስት አሃዝ ቁጥሮችን መቀነስ', en: 'Subtracting three-digit numbers' },
      story: { am: 'በትምህርት ቤታችን አራት መቶ ሃምሳ ሁለት ተማሪዎች አሉ። ዛሬ ሁለት መቶ ሃያ ስምንት ተማሪዎች ለሽርሽር ሄዱ። ስንት ተማሪዎች ቀሩ?',
        en: 'Our school has four hundred fifty-two students. Today two hundred twenty-eight students went on a trip. How many students stayed?' },
      example: { am: 'አራት መቶ ሃምሳ ሁለት ሲቀነስ ሁለት መቶ ሃያ ስምንት። ከሁለት ስምንት መውሰድ አንችልም፤ ስለዚህ አንድ አስር እንፈታለን። አሁን አራት አስሮች እና አስራ ሁለት አንዶች አሉ። አስራ ሁለት ሲቀነስ ስምንት አራት ነው። አራት አስሮች ሲቀነስ ሁለት አስሮች ሁለት አስሮች ናቸው፤ አራት መቶዎች ሲቀነስ ሁለት መቶዎች ሁለት መቶዎች ናቸው። መልሱ ሁለት መቶ ሃያ አራት ነው።',
        en: 'Four hundred fifty-two minus two hundred twenty-eight. We cannot take eight from two, so we break one ten. Now there are four tens and twelve ones. Twelve minus eight is four. Four tens minus two tens is two tens; four hundreds minus two hundreds is two hundreds. The answer is two hundred twenty-four.' } },
    { id: 'g3_times', n: 4, grade: 3, scene: 'field', thing: 'seedling',
      title: { am: 'በረድፍ እናባዛ', en: 'Multiplying in rows' },
      story: { am: 'አባቴ በእርሻው ላይ የቡና ችግኞችን በረድፍ ተከለ። በእያንዳንዱ ረድፍ እኩል ችግኞች አሉ።',
        en: 'Father planted coffee seedlings in rows on the farm. Every row has the same number of seedlings.' },
      example: { am: 'ሶስት ረድፎች አሉ፤ በእያንዳንዱ ረድፍ አምስት ችግኞች አሉ። አምስት፣ አስር፣ አስራ አምስት። ሶስት ጊዜ አምስት እኩል ነው አስራ አምስት። ስናዞረው አምስት ረድፎች በሶስት በሶስት ይሆናሉ፤ አሁንም አስራ አምስት ነው።',
        en: 'There are three rows, with five seedlings in each row. Five, ten, fifteen. Three times five equals fifteen. When we turn it around, there are five rows of three; it is still fifteen.' } },
    { id: 'g3_share', n: 5, grade: 3, scene: 'village', thing: 'orange',
      title: { am: 'እኩል ማካፈል', en: 'Sharing equally' },
      story: { am: 'እማማ አስራ ሁለት ብርቱካኖችን ለሶስት ልጆች በእኩል ማካፈል ትፈልጋለች። ማንም ከሌላው መብለጥ የለበትም።',
        en: 'Mama wants to share twelve oranges equally among three children. Nobody should get more than anyone else.' },
      example: { am: 'አንድ ለአንተ፣ አንድ ለአንቺ፣ አንድ ለእሱ፤ በዙር እናካፍላለን። ሁሉም እስኪያልቁ እንቀጥላለን። እያንዳንዱ ልጅ አራት ብርቱካኖች አገኘ። አስራ ሁለት ሲካፈል ለሶስት እኩል ነው አራት።',
        en: 'One for you, one for you, one for him: we share in turns. We keep going until they are all gone. Each child gets four oranges. Twelve divided by three equals four.' } },
    { id: 'g3_fractions', n: 6, grade: 3, scene: 'kitchen', thing: 'injera',
      title: { am: 'ሶስተኛ እና ሌሎች ክፍልፋዮች', en: 'Thirds and other fractions' },
      story: { am: 'እናቴ አንድ እንጀራ ለሶስት ልጆች በእኩል ታካፍላለች። እያንዳንዱ ልጅ ስንት ያገኛል?',
        en: 'Mother shares one injera equally among three children. How much does each child get?' },
      example: { am: 'እንጀራውን በሶስት እኩል ክፍሎች ከፈለችው። እያንዳንዱ ክፍል አንድ ሶስተኛ ነው፤ እንዲህ እንጽፈዋለን፦ አንድ በሶስት። ሁለት ክፍሎች ሁለት ሶስተኛ ናቸው። ሶስት ሶስተኛዎች አንድ ሙሉ እንጀራ ይሆናሉ።',
        en: 'She divided the injera into three equal parts. Each part is one third; we write it like this: one over three. Two parts are two thirds. Three thirds make one whole injera.' } }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
