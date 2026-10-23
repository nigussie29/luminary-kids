#!/usr/bin/env bash
# Clean up narrator recordings so every clip sounds warm, clear and equally loud.
#   tools/process-audio.sh <folder of raw recordings>   →  writes audio/am/<same name>.m4a
# Steps: remove rumble · gentle noise reduction · trim silence at both ends · soft compression ·
#        a little presence (clarity) · loudness matched to -16 LUFS (comfortable on phones).
set -euo pipefail
IN="${1:?usage: tools/process-audio.sh <raw folder>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/audio/am"
mkdir -p "$OUT"
shopt -s nullglob nocaseglob
n=0
for f in "$IN"/*.{m4a,mp3,wav,ogg,aac,webm,caf}; do
  base="$(basename "${f%.*}")"
  ffmpeg -nostdin -loglevel error -y -i "$f" -vn -ac 1 -ar 44100 -af "\
highpass=f=80,\
afftdn=nr=12:nf=-45,\
silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,\
areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,\
acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,\
equalizer=f=3200:t=q:w=1.2:g=2,\
loudnorm=I=-16:TP=-1.5:LRA=7" -c:a aac -b:a 96k "$OUT/$base.m4a"
  n=$((n+1)); echo "ok  $base"
done
echo "$n clip(s) written to $OUT"
