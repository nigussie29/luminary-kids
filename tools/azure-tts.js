#!/usr/bin/env node
/* Make the Amharic narration clips with Microsoft Azure's neural voice (default: Mekdes).
   Run on your own computer, from the luminary-kids folder:

     Windows PowerShell:
       $env:AZURE_SPEECH_KEY="your-key"; $env:AZURE_SPEECH_REGION="eastus"
       node tools/azure-tts.js --sample      # 5 audition lines → audio/sample/ (listen first)
       node tools/azure-tts.js               # all clips → audio/am/

     Mac / Linux:
       AZURE_SPEECH_KEY=your-key AZURE_SPEECH_REGION=eastus node tools/azure-tts.js --sample

   Options: --voice am-ET-AmehaNeural (male voice) · --force (remake clips that already exist)
            --rate -8% --pitch +8% (speed and pitch; defaults are slightly slower and brighter for children)
   Needs Node 18 or newer. The key stays on your computer; it is only sent to Azure. */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const has = (name) => args.includes(name);

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
const URL = process.env.AZURE_TTS_URL || (REGION && `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`);
const VOICE = opt('--voice', 'am-ET-MekdesNeural');
const RATE = opt('--rate', '-8%');
const PITCH = opt('--pitch', '+8%');
const SAMPLE = has('--sample');
const FORCE = has('--force');

if (!KEY || !URL) {
  console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION first (see the top of this file).');
  process.exit(1);
}
if (typeof fetch !== 'function') { console.error('Please use Node 18 or newer.'); process.exit(1); }

// Load the app's own recording script so file names always match what the app plays.
const root = path.join(__dirname, '..');
for (const f of ['i18n.js', 'engine.js', 'art.js', 'narration.js']) require(path.join(root, 'src', f));
const all = globalThis.LK.narr.script();

const AUDITION = ['ui.diagnosticIntro', 'lesson.count10.story', 'num.7', 'ui.correct.0', 'ui.tryAgain'];
const rows = SAMPLE ? all.filter((r) => AUDITION.includes(r.key)) : all;
const outDir = path.join(root, 'audio', SAMPLE ? 'sample' : 'am');
fs.mkdirSync(outDir, { recursive: true });

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ssml = (text) =>
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="am-ET">` +
  `<voice name="${VOICE}"><prosody rate="${RATE}" pitch="${PITCH}">${xml(text)}</prosody></voice></speak>`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function speak(text) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'luminary-kids-narration'
      },
      body: ssml(text)
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 401 || res.status === 403) throw new Error('Azure refused the key (check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION).');
    if (res.status === 429 || res.status >= 500) { await sleep(1500 * attempt); continue; }
    throw new Error(`Azure error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error('Azure kept refusing after 4 tries; wait a minute and run again (finished clips are kept).');
}

(async () => {
  console.log(`Voice ${VOICE} · rate ${RATE} · pitch ${PITCH} · ${rows.length} clip(s) → ${path.relative(root, outDir)}`);
  let made = 0, skipped = 0;
  for (const r of rows) {
    const file = path.join(outDir, r.key + '.mp3');
    if (!FORCE && fs.existsSync(file)) { skipped++; continue; }
    try {
      fs.writeFileSync(file, await speak(r.am));
      made++;
      console.log(`ok   ${r.key}   ${r.am}`);
    } catch (e) {
      console.error(`FAIL ${r.key}: ${e.message}`);
      process.exit(1);
    }
    await sleep(120);
  }
  console.log(`Done: ${made} made, ${skipped} already there.`);
  if (SAMPLE) console.log('Listen to the files in audio/sample/. If you like the voice, run again without --sample.');
  else console.log('Next: push the audio/am folder to GitHub (or send the files to Claude) so the app can use them.');
})();
