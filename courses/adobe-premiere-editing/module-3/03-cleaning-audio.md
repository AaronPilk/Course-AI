---
module: 3
position: 3
title: "Cleaning audio — noise, hum, plosives"
objective: "Diagnose and fix common audio problems."
estimated_minutes: 5
---

# Cleaning audio — noise, hum, plosives

## The four common problems

Most audio cleanup falls into four categories:
1. **Background noise.** Hiss, fan, AC, ambient sound.
2. **Hum.** 50/60 Hz electrical buzz from grounding issues.
3. **Plosives.** "P" and "B" pops from breath hitting the mic.
4. **Sibilance.** Harsh "S" sounds.

Each has specific tools. Master the diagnoses; apply the right fix.

## Background noise

Sources:
- HVAC / fan / air conditioner.
- Computer fan.
- Distant traffic / city ambience.
- Hiss from cheap mic or preamp.

Fix tools (in order of subtlety):
- **Essential Sound → Repair → Reduce Noise** (slider 0-10).
- **Audition's Noise Reduction** (learn the noise profile from a quiet section; apply to whole track).
- **DeNoise plugins** (Waves NS1, iZotope RX, Krotos Studio).

Aggression vs. artifacts trade-off: more noise reduction = more artifact ("underwater," "musical noises"). Find the sweet spot.

## Noise profile learning

Audition's classic workflow:
1. Find a section with ONLY noise (1-2 seconds of "silence" without voice).
2. Select that section.
3. Effects → Noise Reduction / Restoration → Capture Noise Print.
4. Audition learns the noise spectrum.
5. Select the whole clip; apply Noise Reduction (Process) with the learned profile.
6. Adjust amount + sensitivity; preview.

Profile-based noise reduction works better than generic; the algorithm "knows" what's noise vs. signal.

## Hum (electrical)

50 Hz (Europe) or 60 Hz (US) buzz from ungrounded equipment, ground loops, fluorescent lights, dimmers near recording space.

Fix:
- **Essential Sound → Repair → DeHum.**
- **Audition's Notch filter** at 60 Hz (and harmonics: 120, 180, 240 Hz).
- **iZotope RX De-hum** (best-in-class).

Hum is narrow-band; removal usually doesn't degrade voice.

Prevention: ground equipment, balance cables, distance from electrical sources.

## Plosives

"P" and "B" sounds where breath blast hits the mic capsule = "thump" sound.

Visible: huge spike on waveform at the consonant.

Fix:
- **High-pass filter** at 80-100 Hz on the affected clip — cuts the low-frequency thump.
- **Audition's Spectral Edit** — surgically remove just the plosive frame.
- **Volume keyframe** at the spike — drop volume 6-12 dB just at the plosive moment.

Prevention: pop filter on mic; mic angled slightly off-axis (3-5 degrees from straight-on); voice trained to "soft P" delivery.

## Sibilance

Harsh "S" and "SH" sounds in the 5-8 kHz range — fatiguing on listeners.

Fix:
- **Essential Sound → Repair → DeEss** (slider 0-10).
- **Audition's DeEsser** or **third-party (FabFilter Pro-DS).**
- **Manual EQ cut** at 5-8 kHz (broadband or narrow).

Sibilance varies by mic + voice + EQ choices. Some voices need 0 DeEss; others need heavy.

## Click and pop removal

Clicks (digital glitches, mouth clicks):
- **Essential Sound's noise reduction** sometimes addresses.
- **Audition's Click Removal** explicitly targets clicks.
- **iZotope RX De-click** is industry standard.

For one-off clicks: zoom in to the waveform; manually shape the spike (level → 0; brief fade).

## Wind noise

Outdoor recordings often have wind blast:
- **Low-cut filter** at 80-100 Hz (often built into mics with "low-cut switch").
- **Essential Sound's Reduce Rumble.**
- **iZotope RX De-wind** (specialized).

Prevention: deadcat / windshield on mic; shooting from sheltered angles.

## Mouth noises

Lip smacks, dry-mouth clicks, tongue noises:
- **Audition's Click Removal** sometimes catches.
- **Manual editing** — select the click; lower volume or replace with surrounding ambience.
- **Send-mid-air pop fixes** if the click is small.

For interviews with prominent mouth sounds: ask subject to drink water before continuing; record alt takes.

## Breath removal

Audible breaths between sentences:
- **Manual lower volume on breath sections.** Use audio rubber bands.
- **Manual cut + close.** Extract breath sections.
- **Essential Sound's Dynamics** if breaths are part of compression target.

Some breaths add humanity; remove the ugly ones. Don't strip every breath; sounds robotic.

## De-reverb

If recording was in a reverberant space (high ceilings, hard surfaces):
- **Essential Sound → Reduce Reverb** (slider 0-10).
- **iZotope RX De-reverb** (best-in-class).
- **Acoustica's De-Verb.**

De-reverb is the hardest cleanup; algorithms aren't perfect; expect some artifacts. Re-recording in a better space is sometimes the only true fix.

## Time-domain vs. frequency-domain editing

Time-domain: classic waveform editing; cut, fade, level.

Frequency-domain (spectral editing): see the spectrum (frequency vs. time as a heat map); paint over specific time-frequency regions to remove.

Audition's Spectral Frequency Display is the tool. Cough at 0:34 between 200-2000 Hz? Paint over it; gone, while voice in other frequency ranges continues.

Powerful for surgical work; learning curve.

## When the audio is unsalvageable

Sometimes audio is too poor:
- **Re-record voice-over** to replace the worst sections.
- **Replace with similar take** from another file.
- **Cover with music + B-roll** to mask the problem.

Knowing when to fix vs. when to replace = experience. The 90/10 rule: spend 90% of cleanup effort on 10% of clips that need it; don't spend hours on barely audible problems.

## Cleanup order

Apply effects in order:
1. **DeHum** (remove electrical).
2. **High-pass** (cut rumble/wind).
3. **Reduce Noise / Audition NR** (broadband cleanup).
4. **De-click / De-pop** (transient cleanup).
5. **EQ** (frequency shaping).
6. **DeEss** (sibilance).
7. **Compression** (dynamics control).
8. **Limiter** (catch peaks).
9. **Loudness normalization** (target LUFS).

Order matters. Reduce noise BEFORE compression (compressor amplifies quiet noise); EQ BEFORE compression (cleaner input to compressor).

## When to leave audio alone

Not every audio needs cleanup. A pristine studio recording with light background is usually fine. Over-processing artifacts the audio.

Mantra: "First, do no harm." If a fix introduces artifacts, you've made it worse.

## Adobe Audition for heavy lifting

For complex cleanup: send to Audition (right-click clip → Edit Clip in Adobe Audition).

Audition offers:
- Spectral display + spectral editing.
- Advanced noise reduction.
- Multitrack mixing.
- Voice-over recording with monitoring.
- Multiband compression.
- Heavy de-reverb.

After cleanup in Audition: save; the clip in Premiere updates automatically.

## Mistakes to avoid

- **Over-processing.** Voice sounds artificial.
- **Wrong order.** Compression before noise reduction amplifies hiss.
- **No noise profile.** Generic noise reduction = ugly artifacts.
- **Ignoring plosives.** Big bass thumps in finished mix.
- **Cleaning unimportant problems.** Time wasted on inaudible issues.

## Summary

- Four common problems: noise, hum, plosives, sibilance.
- Essential Sound's Repair section handles most cases.
- Audition for surgical work (spectral editing, advanced NR).
- Order matters: DeHum → HP filter → NR → De-click → EQ → DeEss → Comp → Limiter → LUFS.
- Profile-based noise reduction beats generic.
- Sometimes re-record / replace / cover instead of cleanup.

Next: music and sync; the rhythm question.
