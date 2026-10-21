# Narration clips

Put recorded Amharic clips in `audio/am/`, named exactly as in `dist/narration-script.csv`
(for example `num.7.m4a`, `lesson.count10.story.m4a`, `prompt.add.1.m4a`).
Phone voice-memo files (.m4a) work; .mp3, .ogg, .wav and .webm also work.

Push to GitHub and Railway redeploys. The app plays a line from the recordings when every
clip in that line exists, and falls back to the device voice when one is missing.
