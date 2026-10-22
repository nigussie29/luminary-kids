/* Luminary Kids — privacy notice and terms (DRAFT for lawyer review).
   Fill the COMPANY fields once the business is registered. Bracketed values render highlighted. */
(function (G) {
  const LK = (G.LK = G.LK || {});
  const COMPANY = {
    name: '[Company legal name, e.g. Luminary EdTech LLC]',
    state: '[State of registration]',
    address: '[Mailing address]',
    email: 'support@theluminaryacademy.net',
    effective: '[Effective date]'
  };
  LK.company = COMPANY;

  const C = COMPANY;
  LK.legal = {
    privacy: {
      title: 'Privacy notice for parents',
      am: {
        title: 'ለወላጆች የግላዊነት ማሳሰቢያ (አጭር)',
        points: [
          'ሉሚናሪ ኪድስን ልጆች የሚጠቀሙት ወላጅ ወይም አሳዳጊ በሚያዘጋጀው መገለጫ ብቻ ነው።',
          'በአሁኑ የሙከራ ስሪት የልጅዎ ቅጽል ስምና የልምምድ መረጃ በዚህ መሣሪያ ላይ ብቻ ይቀመጣል፤ ወደ እኛ አይላክም።',
          'የልጅዎን ሙሉ ስም፣ ፎቶ፣ ኢሜይል ወይም አድራሻ አንጠይቅም።',
          'ማስታወቂያ የለም። የልጆችን መረጃ አንሸጥም፤ የኤአይ ሞዴሎችን ለማሰልጠን አንጠቀምበትም።',
          'መረጃውን ለማየት ወይም ለማጥፋት በኢሜይል ይጻፉልን፦ ' + C.email
        ]
      },
      sections: [
        ['Who we are', `Luminary Kids (የሂሳብ ጀብዱ) is a math practice app offered by ${C.name}, registered in ${C.state}, under the names Luminary Academy and KingNigUs Academy. Contact us at ${C.email} or ${C.address}.`],
        ['Who this notice is for', 'This notice is written for parents and guardians. Children use Luminary Kids only through a profile that a parent or guardian creates and supervises. Purchases are made by adults only.'],
        ['What the current pilot version collects', 'In the current version, everything your child does stays in the browser on your device: the nickname you choose, the picture you pick, and practice records (questions answered, hints used, level per skill). None of it is sent to us. We do not ask for a child\'s full name, photo, email, phone number, address or location, and the app has no advertising or tracking tools.'],
        ['Services that see technical information', 'When the app loads, two services receive the technical information any website receives, such as your device\'s IP address and browser type: our hosting provider (Railway), which serves the app, and Google Fonts, which supplies the lettering for Amharic and English. Neither receives your child\'s nickname or practice records.'],
        ['When paid pilot accounts start', 'When we add parent accounts, we will collect your email address and keep your child\'s nickname and practice records on our servers so progress follows your child across devices and appears in your weekly report. Payments are handled by Stripe; we never see or store your full card number. We will ask for your consent before any child information leaves your device, and we will update this notice before that happens.'],
        ['How we use information', 'Only to run Luminary Kids: to show lessons at the right level, schedule review, produce your progress report, provide support, and improve the lessons using combined, non-identifying statistics.'],
        ['What we never do', 'We do not sell personal information. We do not show advertising. We do not use children\'s information to train artificial intelligence models. We do not share children\'s information with third parties except the service providers that run the app for us, under contracts that limit their use to that purpose. If that ever needs to change, we will ask for your separate consent first.'],
        ['How long we keep it', 'Information stored on your device stays until you delete it from the grown-ups page or clear your browser. Once accounts exist, we will delete a child\'s records 12 months after the last activity, or within 30 days of your request. We keep payment records as long as tax law requires.'],
        ['Your choices and rights', `You can review, copy or delete your child's information at any time on the grown-ups page. Once accounts exist, you can also ask us by email to review or delete your child's information or to stop collecting it. Write to ${C.email}; we reply within 10 working days.`],
        ['Children\'s privacy laws', 'We design Luminary Kids to meet the US Children\'s Online Privacy Protection Act (COPPA), including verifiable parental consent, a written retention policy and a written information security program, and we follow the UK Age Appropriate Design Code principles for children in the UK.'],
        ['Families outside the United States', 'Once accounts exist, information will be stored in the United States. For families in Ethiopia and elsewhere, we will explain this and ask for your consent to the transfer when you create an account.'],
        ['Security', 'We limit access to children\'s information to the people who need it to run the service, encrypt it in transit, and review our safeguards at least once a year.'],
        ['Changes to this notice', 'We will tell parents about important changes before they take effect, by email once accounts exist and on this page.']
      ]
    },
    terms: {
      title: 'Terms of use and pilot terms',
      sections: [
        ['Who we are', `These terms are an agreement between you and ${C.name} ("we"), which offers Luminary Kids. Contact: ${C.email}.`],
        ['Who may use Luminary Kids', 'Purchases and account set-up are for adults aged 18 or over. Children may use Luminary Kids only through a profile created and supervised by their parent or guardian.'],
        ['The Founding Families pilot', 'The pilot is a single payment of USD 29 for 6 weeks of access to the Grade 1 unit for up to two children in one family, a weekly progress email, and two calls with our team. It does not renew automatically and there is nothing to cancel. The price is a test price for the pilot and may differ for later plans.'],
        ['Refunds', `You can get a full refund within 14 days of payment, for any reason, by emailing ${C.email}. Refunds go back to the original payment method.`],
        ['Future subscriptions', 'If you later choose a monthly or yearly plan, we will show the price, billing date and renewal terms before you pay. Plans renew until you cancel. You can cancel at any time from your account, and cancellation takes effect at the end of the paid period. We will email a reminder before each yearly renewal.'],
        ['Pilot software', 'Luminary Kids is in an early pilot. Lessons, Amharic wording and features are still being reviewed and may change. Some features, such as recorded narration and syncing across devices, may not be available during the pilot.'],
        ['Educational purpose', 'Luminary Kids is a practice tool. It does not replace a teacher or school, and we do not promise specific test results. Progress records are practice information, not test scores.'],
        ['Acceptable use', 'Please do not copy, resell or redistribute the app, try to access other families\' information, or disrupt the service.'],
        ['Our content', `The characters (including Wali), illustrations, lessons and software are owned by ${C.name} or its licensors. Your purchase gives your family a personal, non-transferable right to use them for the paid period.`],
        ['Liability', '[To be completed with legal advice: limitation of liability and disclaimer appropriate to the state of registration.]'],
        ['Governing law', `These terms are governed by the laws of ${C.state}, except where the law where you live gives you rights that cannot be waived.`],
        ['Changes', 'If we change these terms, we will post the new version here and tell current customers before the change takes effect.']
      ]
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
if (typeof module !== 'undefined') module.exports = globalThis.LK;
