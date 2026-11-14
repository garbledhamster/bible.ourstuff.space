"""Render the original Island Post dock motif with Python's standard library."""

import math
import struct
import wave
from pathlib import Path

RATE = 16_000
BEAT = 0.9375   # 64 bpm; four bars in 4/4
LENGTH = 15 * RATE

# Each entry is (beat, MIDI note, strength, decay in seconds).
NOTES = [
    (0, 50, .31, 1.35), (0.5, 57, .17, 1.15),
    (1, 64, .30, .95), (2.5, 66, .25, .9),
    (4, 47, .24, 1.3), (4.5, 57, .15, 1.2), (5, 69, .25, 1.0),
    (7, 64, .17, .83),
    (8, 43, .28, 1.3), (8.5, 50, .16, 1.25),
    (9.5, 62, .24, 1.05), (11, 59, .18, .85),
    (12, 45, .24, 1.25), (12.5, 52, .15, 1.2),
    (13.5, 64, .19, 1.0), (15, 61, .13, .78),
]


def render():
    sound = [0.0] * LENGTH
    for beat, note, strength, decay in NOTES:
        onset = round(beat * BEAT * RATE)
        angular = math.tau * 440 * 2 ** ((note - 69) / 12)
        tail = decay * 4.2
        for i in range(round(tail * RATE)):
            t = i / RATE
            attack = min(t / .035, 1) ** 2
            release = .5 - .5 * math.cos(math.pi * min((tail - t) / .32, 1))
            phase = t * angular
            # A soft tine with overtones that decay sooner than the fundamental.
            tone = (.78 * math.sin(phase) +
                    .18 * math.exp(-t * 3) * math.sin(phase * 2.004) +
                    .04 * math.exp(-t * 9) * math.sin(phase * 3.01))
            value = strength * attack * release * math.exp(-t / decay) * tone
            sound[(onset + i) % LENGTH] += value
            sound[(onset + i + 733) % LENGTH] += value * .10
            sound[(onset + i + 1471) % LENGTH] += value * .055
    peak = max(map(abs, sound))
    samples = [round(value * 32767 * .58 / peak) for value in sound]
    with wave.open(str(Path(__file__).with_name('dock-score.wav')), 'wb') as target:
        target.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        target.writeframes(struct.pack(f'<{LENGTH}h', *samples))


if __name__ == '__main__':
    render()
