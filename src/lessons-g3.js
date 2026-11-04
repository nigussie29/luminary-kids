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
        en: 'She divided the injera into three equal parts. Each part is one third; we write it like this: one over three. Two parts are two thirds. Three thirds make one whole injera.' } },
    { id: 'g3_round', n: 7, grade: 3, scene: 'farm', thing: 'cherry',
      title: { am: 'ማወዳደር እና ማጠጋጋት', en: 'Comparing and rounding' },
      story: { am: 'ሁለት ቡድኖች የቡና ፍሬ ለቀሙ። ቀዩ ቡድን ሶስት መቶ አርባ ስምንት፣ ሰማያዊው ቡድን ሶስት መቶ ሰማንያ አራት ፍሬዎች ለቀሙ።',
        en: 'Two teams picked coffee cherries. The red team picked three hundred forty-eight and the blue team three hundred eighty-four.' },
      example: { am: 'የሁለቱም መቶዎች እኩል ናቸው፤ ስለዚህ አስሮቹን እናወዳድር። አራት አስሮች ከስምንት አስሮች ያንሳሉ፤ ሶስት መቶ አርባ ስምንት ያንሳል። በቁጥር መስመር ላይ ሶስት መቶ አርባ ስምንት ለሶስት መቶ ሃምሳ ይቀርባል። ወደ ቅርብ መቶ ስናጠጋጋው ግን ሶስት መቶ ይሆናል።',
        en: 'Both numbers have the same hundreds, so we compare the tens. Four tens are fewer than eight tens, so three hundred forty-eight is less. On the number line, three hundred forty-eight is closest to three hundred fifty. Rounded to the nearest hundred, it is three hundred.' } },
    { id: 'g3_tables', n: 8, grade: 3, scene: 'market', thing: 'egg',
      title: { am: 'የማባዛት ሰንጠረዥ እስከ አስር ጊዜ አስር', en: 'Times tables to 10 × 10' },
      story: { am: 'በገበያው እንቁላሎች በሳጥን ይሸጣሉ። በእያንዳንዱ ሳጥን ስድስት እንቁላሎች አሉ።',
        en: 'At the market, eggs are sold in boxes. Each box holds six eggs.' },
      example: { am: 'አንድ ሳጥን ስድስት፣ ሁለት ሳጥኖች አስራ ሁለት፣ ሶስት ሳጥኖች አስራ ስምንት ናቸው። በስድስት በስድስት እየዘለልን እንቆጥራለን። ሰባት ሳጥኖች፦ ሰባት ጊዜ ስድስት አርባ ሁለት ነው። ስድስት ጊዜ ሰባትም አርባ ሁለት ነው።',
        en: 'One box is six, two boxes are twelve, three boxes are eighteen. We skip count in sixes. Seven boxes: seven times six is forty-two. Six times seven is forty-two too.' } },
    { id: 'g3_divide', n: 9, grade: 3, scene: 'playground', thing: 'child',
      title: { am: 'ማካፈል እና ማባዛት', en: 'Division and multiplication' },
      story: { am: 'ሃያ አራት ተማሪዎች ለጨዋታ በቡድን ይከፈላሉ። በእያንዳንዱ ቡድን ስድስት ተማሪዎች ይኖራሉ።',
        en: 'Twenty-four students split into teams for a game. Each team will have six students.' },
      example: { am: 'ሃያ አራት ተማሪዎችን በስድስት በስድስት እንቧድናለን። አራት ቡድኖች ሆኑ። ሃያ አራት ሲካፈል ለስድስት አራት ነው። ምክንያቱም አራት ጊዜ ስድስት ሃያ አራት ነው።',
        en: 'We put the twenty-four students in groups of six. That makes four teams. Twenty-four divided by six is four. That is because four times six is twenty-four.' } },
    { id: 'g3_fracline', n: 10, grade: 3, scene: 'road', thing: 'child',
      title: { am: 'ክፍልፋዮች በቁጥር መስመር ላይ', en: 'Fractions on a number line' },
      story: { am: 'ከቤት እስከ ትምህርት ቤት ያለውን መንገድ በአራት እኩል ክፍሎች እንከፍለው። ሰላም ምን ያህል ተጓዘች?',
        en: 'Let us split the road from home to school into four equal parts. How far has Selam walked?' },
      example: { am: 'ከዜሮ እስከ አንድ ያለውን መስመር በአራት እኩል ክፍሎች እንከፍላለን። እያንዳንዱ ዝላይ አንድ ሩብ ነው፤ አንድ ሩብ፣ ሁለት ሩብ፣ ሶስት ሩብ፣ አራት ሩብ። ሁለት ሩብ ከግማሽ ጋር በአንድ ቦታ ላይ ነው። ስለዚህ ሁለት ሩብ እና ግማሽ እኩል ናቸው።',
        en: 'We split the line from zero to one into four equal parts. Each jump is one quarter: one quarter, two quarters, three quarters, four quarters. Two quarters is at the same place as one half. So two quarters and one half are equal.' } },
    { id: 'g3_measure', n: 11, grade: 3, scene: 'market', thing: 'pencil',
      title: { am: 'ርዝመት፣ ክብደት እና መጠን', en: 'Length, mass and liquids' },
      story: { am: 'ዛሬ በገበያ ዕቃዎችን እንለካለን፦ ርዝመትን፣ ክብደትን እና የፈሳሽ መጠንን።',
        en: 'Today at the market we measure things: length, mass and how much liquid.' },
      example: { am: 'እርሳሱን ከዜሮ ጀምረን በገዢ እንለካለን፤ ርዝመቱ አስራ ሁለት ሳንቲ ሜትር ነው። የጤፍ ከረጢቱን በሚዛን እንመዝናለን፤ ክብደቱ ሶስት ኪሎ ግራም ነው። ጀሪካኑ አምስት ሊትር ውሃ ይይዛል። ለርዝመት ሜትር እና ሳንቲ ሜትር፣ ለክብደት ኪሎ ግራም፣ ለፈሳሽ ሊትር እንጠቀማለን።',
        en: 'We measure the pencil with a ruler, starting at zero: it is twelve centimetres long. We weigh the bag of teff on a scale: it is three kilograms. The jerrycan holds five litres of water. We use metres and centimetres for length, kilograms for mass and litres for liquids.' } },
    { id: 'g3_time', n: 12, grade: 3, scene: 'home', thing: 'clock',
      title: { am: 'ሰዓት በደቂቃ', en: 'Time to the minute' },
      story: { am: 'ሰላም በየቀኑ ጠዋት ወደ ትምህርት ቤት ትሄዳለች። ሰዓቱን አብረን እናንብብ።',
        en: 'Selam walks to school every morning. Let us read the clock together.' },
      example: { am: 'ትንሹ መርፌ ከሰባት ትንሽ አልፏል፤ ሰዓቱ ሰባት ነው። ትልቁ መርፌ አራት ላይ ነው፤ በአምስት በአምስት ስንቆጥር ሃያ ደቂቃ ነው። ሰዓቱ ሰባት ከሃያ ነው፤ በኢትዮጵያ አቆጣጠር ደግሞ ከጠዋቱ አንድ ሰዓት ከሃያ ነው። ከአርባ ደቂቃ በኋላ ስምንት ሰዓት ይሆናል፤ ትምህርት ይጀምራል።',
        en: 'The short hand is just past seven, so the hour is seven. The long hand is on the four: counting by fives, that is twenty minutes. The time is seven twenty; in Ethiopian time it is twenty past one in the morning. Forty minutes later it is eight o\'clock, and school begins.' } },
    { id: 'g3_shapes', n: 13, grade: 3, scene: 'house', thing: 'shape',
      title: { am: 'ቅርጾች', en: 'Shapes' },
      story: { am: 'በመስኮት፣ በበር እና በጣሪያ ላይ ብዙ ቅርጾች አሉ። ጎኖቻቸውን እና ማዕዘኖቻቸውን እንቁጠር።',
        en: 'Windows, doors and roofs have many shapes. Let us count their sides and corners.' },
      example: { am: 'ሶስት ማዕዘን ሶስት ጎኖች እና ሶስት ማዕዘኖች አሉት። አራት ማዕዘን አራት ጎኖች አሉት፤ ተቃራኒ ጎኖቹ እኩል ናቸው። ካሬ አራት እኩል ጎኖች እና አራት ቀጥ ያሉ ማዕዘኖች አሉት። አራት ጎኖች ያሉት ቅርጽ ሁሉ ባለ አራት ጎን ይባላል።',
        en: 'A triangle has three sides and three corners. A rectangle has four sides, and its opposite sides are equal. A square has four equal sides and four square corners. Every shape with four sides is called a quadrilateral.' } },
    { id: 'g3_area', n: 14, grade: 3, scene: 'kitchen', thing: 'square',
      title: { am: 'ስፋት እና ዙሪያ', en: 'Area and perimeter' },
      story: { am: 'አባቴ የወጥ ቤቱን ወለል በካሬ ሰቆች ሊሸፍን ነው። ስንት ሰቆች ያስፈልጉታል?',
        en: 'Father is covering the kitchen floor with square tiles. How many tiles does he need?' },
      example: { am: 'ወለሉ ሶስት ረድፎች አሉት፤ በእያንዳንዱ ረድፍ አራት ሰቆች አሉ። ሶስት ጊዜ አራት አስራ ሁለት ነው፤ ስፋቱ አስራ ሁለት ካሬ አሃዶች ነው። ዙሪያውን ለማግኘት ጎኖቹን እንደምራለን፦ አራት፣ ሶስት፣ አራት እና ሶስት። ዙሪያው አስራ አራት አሃዶች ነው።',
        en: 'The floor has three rows with four tiles in each row. Three times four is twelve, so the area is twelve square units. To find the perimeter we add the sides: four, three, four and three. The perimeter is fourteen units.' } },
    { id: 'g3_graphs', n: 15, grade: 3, scene: 'school', thing: 'square',
      title: { am: 'ግራፎች እና የቃላት ጥያቄዎች', en: 'Graphs and word problems' },
      story: { am: 'የክፍላችን ልጆች የሚወዱትን ፍራፍሬ ተጠየቁ። መልሶቹን በግራፍ እናሳይ።',
        en: 'The children in our class were asked which fruit they like best. Let us show the answers on a graph.' },
      example: { am: 'ሰባት ልጆች ሙዝ፣ አምስት ልጆች ማንጎ፣ ሶስት ልጆች ብርቱካን ወደዱ። ለእያንዳንዱ ልጅ አንድ ሳጥን እንቀባለን፤ ረጅሙ አምድ የሙዝ ነው። ሙዝ ከማንጎ በሁለት ይበልጣል። በአጠቃላይ ሰባት፣ አምስት እና ሶስት አስራ አምስት ልጆች ናቸው።',
        en: 'Seven children liked bananas, five liked mangoes and three liked oranges. We colour one box for each child; the tallest bar is bananas. Bananas have two more than mangoes. Altogether seven, five and three make fifteen children.' } }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
