---
jupytext:
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
kernelspec:
  display_name: Python 3 (ipykernel)
  language: python
  name: python3
---

# Algorithm Behind Realistic Reverb? What is Convolution?

Writer: Jiawei (David) Liu ·
Date: 2025-03-14 · Rebuilt 2026 as a live notebook — the Python below runs in
your browser.

## Introduction

Ever wonder how your computer magically transports your voice into a grand
concert hall? 🪄 Is it just stretching out the tail end of your vocals to
create that luscious reverb? Or how your amp simulator seems to capture the
exact sound of that ridiculously expensive amp you've been eyeing? 🤑 The
secret behind the scenes is something called convolution — and it's a total
game-changer. 🔥

Convolution is a special mathematical operation that combines two signals to
produce a third signal. You've probably heard the term thrown around in
convolution reverb or IR (impulse response) simulation. No one wants to slog
through the entire Wikipedia page just to end up more confused, right? 😅

Convolution of two signals $x$ and $h$ is written $x \ast h$ where:

$$(x \ast h)(t) = \int_{-\infty}^{\infty} x(\tau)\, h(t - \tau)\, d\tau$$

Don't bail on me just yet — I know you're probably scratching your head over
that funky-looking integral. 🤮 Trust me, I was just as confused the first
time I saw it! Think of $x$ as your input (or "dry") signal and $h$ as a
mystery box or effect that the signal passes through. That's all there is to
it for now — no need to freak out! 👍

```{figure} assets/flow-chart.png
:alt: A dry signal passing through a system h to produce an output
:width: 100%
```

## Intuition of Impulse Response

As I mentioned, $h$ is basically the effect we want to apply to the dry
signal. Sometimes we refer to it as the "system" or the "impulse response."
Mathematically, the impulse response is the output you get when you feed an
impulse signal into the system.

$$x(t) = \delta(t)$$

$$(x \ast h)(t) = y(t) = h(t)$$

Imagine an impulse signal as a single spike of sound — maybe a single drum
hit 🥁 or a balloon pop 🎈, which is about as close as you can get to a Dirac
delta function in real life. Now picture playing that spike in a concert
hall: the sound bounces off the walls and ceiling, so that short spike — plus
the concert hall's reverberation — becomes the impulse response. While this
isn't exactly how you'd measure an impulse response in real life, it's still
a great way to wrap your head around the math behind it.

Here is a real one, the very impulse response the original version of this
post used:

:::{audio}
[A concert-hall impulse response](assets/reverb.wav)

A recorded concert-hall impulse response — one sharp spike, then the hall
answering back. This is the $h(t)$ a convolution reverb would load.
:::

Now that we've captured the impulse response (or the "effect"), we can apply
it to our dry signal. To get that epic concert hall reverb in our final
output, we simply convolve the dry signal with the impulse response. And
voilà — instant big-stage vibes! 😌

$$y(t) = x(t) \ast h(t)$$

## Practical Scenarios

In the digital world 💻, we can't directly convolve continuous signals — our
computers have only so much horsepower! Instead, we break (discretize) the
signal into samples and perform a discrete convolution. That funky integral
you saw earlier transforms into a summation in the discrete domain.

$$y[n] = \sum_{k=0}^{N-1} x[k]\, h[n-k]$$

Don't calculate your $y[n]$ just yet — imagine your $N$ is a billion and you
have a super long signal. That summation would take forever! How can this be
done in real time? We engineers have a trick to work around this 😉. All
signals have two domains: the time domain and the frequency domain.

```{figure} assets/domain.jpeg
:alt: Time domain vs. frequency domain
:width: 100%

Time Domain vs. Frequency Domain, image from Keysight
```

Convolution in the time domain is actually multiplication in the frequency
domain! 🤯 Much simpler now, but how do we find the signal in its frequency
domain?

$$x[n] \ast h[n] \longleftrightarrow X[f] \cdot H[f]$$

:::{admonition} Interested in the mathematical proof behind this?
:class: dropdown

$$y[n] = x[n] \ast h[n] = \sum_{k=-\infty}^{\infty}x[k]\,h[n-k]$$

$$Y(e^{jw}) = \sum_{n=-\infty}^{\infty}y[n]e^{-jwn}=\sum_{n=-\infty}^{\infty}\left(\sum_{k=-\infty}^{\infty}x[k]\,h[n-k]\right)e^{-jwn}$$

$$= \sum_{k=-\infty}^{\infty}x[k]\sum_{n=-\infty}^{\infty}h[n-k]e^{-jwn}$$

$$= \sum_{k=-\infty}^{\infty}x[k]\sum_{m=-\infty}^{\infty}h[m]e^{-jw(m+k)}$$

$$= \sum_{k=-\infty}^{\infty}x[k]\sum_{m=-\infty}^{\infty}h[m]e^{-jwm}e^{-jwk}$$

$$=\sum_{k=-\infty}^{\infty}x[k]e^{-jwk}\sum_{m=-\infty}^{\infty}h[m]e^{-jwm}$$

$$=X(e^{jw})\cdot H(e^{jw})$$

This is the proof for the DTFT, where the frequency domain is continuous. In
computers, we use the DFT (a discrete version of the DTFT), where the
frequency domain consists of a finite set of discrete points.
:::

This is rather technical but very, very efficient. The
[Fourier Transform](https://www.jezzamon.com/fourier/), more specifically FFT
(Fast Fourier Transform), is sometimes called the most important algorithm of
all time. As its name suggests, it is FAST. Which improves the whole
convolution process from

$$O(N^2) \longrightarrow O(N \log N)$$

I'm not going to scare you with big equations here, but if you're interested
in just the high-level concept itself, check out the fantastic demo by Jez
Swanson in the link above. 🫡 It essentially converts a signal from its time
domain to its frequency domain. Now, instead of time/sample on the x-axis, we
have frequency (in Hz) on the x-axis.

$$x[n] \longrightarrow X[f]$$

$$h[n] \longrightarrow H[f]$$

Vice versa — after multiplying two signals in the frequency domain, we
perform the Inverse Fourier Transform to get our time-domain signal back,
which we can then blast through a loudspeaker! 🔈

$$Y[f] = X[f] \cdot H[f]$$

$$Y[f] \longrightarrow y[n]$$

In order for your DAW to process the entire convolution in real time, it
chops your signal into chunks and performs the same process shown above on
each chunk at a speed so fast you can barely notice it. More specifically, a
variation of the FFT, the STFT (Short-Time Fourier Transform). ⚡️

## Ready to try it out yourself?

The original version of this post asked you to sing into your microphone
right away — we'll get there, I promise 🎤 (it's the last section). But first
let's build the whole convolution pipeline out of code you can see, edit, and
re-run. Every cell below already ran once when this page was built, so the
players and plots work immediately; hit **▶ Run** on any cell to boot a real
Python kernel *in your browser* and make it live.

We need a dry signal. Instead of shipping you a recording, let's synthesize a
little arpeggio from scratch — a few decaying sine partials pretending to be
a plucked string:

```{code-cell} ipython3
import numpy as np
import pyquist as pq

SR = 44100  # sample rate (Hz) for everything below


def pluck(freq, dur=0.4, sr=SR):
    """A cheap plucked-string note: a few harmonics dying away exponentially."""
    t = np.arange(int(dur * sr)) / sr
    partials = sum(np.sin(2 * np.pi * freq * k * t) / k**2 for k in (1, 2, 3, 4))
    return partials * np.exp(-6 * t)


notes = [262, 330, 392, 523, 392, 330, 262]  # C major arpeggio, up and down
dry = pq.Audio(np.concatenate([pluck(f) for f in notes]), sample_rate=SR)
dry.normalize(peak_dbfs=-3.0)
pq.play(dry)
```

Bone dry, right? Now the impulse response. A concert hall answers a spike
with a dense burst of echoes that dies away exponentially — so exponentially
decaying noise is the classic synthetic stand-in for a hall IR (and it means
this whole page keeps working when you re-run it live, no file downloads
needed). Try changing the `2.5` to `6.0` and re-running — instant cathedral.
🏰

```{code-cell} ipython3
rng = np.random.default_rng(15322)
t_ir = np.arange(int(2.5 * SR)) / SR             # 2.5 seconds of reverb tail
h = pq.Audio(rng.standard_normal(t_ir.size) * np.exp(-3.0 * t_ir), sample_rate=SR)
h.normalize(peak_dbfs=-3.0)
pq.play(h)
```

1️⃣ Remember how to efficiently perform convolution? We need to perform a
Fourier Transform on both the dry signal and the IR.

$$X[f] = FFT(x[n])$$

This is our dry arpeggio in the frequency domain — you can literally see the
harmonics of each note as spikes:

```{code-cell} ipython3
pq.plot_freq(dry, n_fft=1 << 18);
```

And this is the impulse response in the frequency domain. Noise spreads its
energy across *all* frequencies — that's exactly why a hall reverb touches
every note you play:

```{code-cell} ipython3
pq.plot_freq(h, n_fft=1 << 18);
```

2️⃣ Remember from earlier? You multiply the two signals in the frequency
domain!

$$Y[f] = X[f] \cdot H[f]$$

```{code-cell} ipython3
N = dry.num_samples + h.num_samples - 1     # full linear-convolution length
X = np.fft.rfft(dry.samples[:, 0], n=N)     # X[f]
H = np.fft.rfft(h.samples[:, 0], n=N)       # H[f]
Y = X * H                                   # convolution, done as multiplication
```

Here are the dry signal and the wet result side by side in the frequency
domain — same skeleton of harmonics, now fleshed out everywhere by the IR:

```{code-cell} ipython3
import matplotlib.pyplot as plt

freqs = np.fft.rfftfreq(N, d=1.0 / SR)
fig, ax = plt.subplots(figsize=(10, 3))
ax.plot(freqs, np.abs(X) / np.abs(X).max(), linewidth=0.5, label="dry — $|X[f]|$")
ax.plot(freqs, np.abs(Y) / np.abs(Y).max(), linewidth=0.5, label="wet — $|Y[f]|$")
ax.set_xscale("log")
ax.set_xlim(20, SR / 2)
ax.set_xlabel("Frequency (Hz)")
ax.set_ylabel("Amplitude (normalized)")
ax.legend();
```

3️⃣ Now it's time to convert the wet signal back into the time domain (and
make it playable) by performing the Inverse Fourier Transform!

$$y[n] = IFFT(Y[f])$$

```{code-cell} ipython3
wet = pq.Audio(np.fft.irfft(Y, n=N), sample_rate=SR)
wet.normalize(peak_dbfs=-3.0)
pq.play(wet)
```

This is the fully wet signal, but you might not need this much reverb. Pick
how much of that concert hall vibe you want and dial it in!

$$output = (1 - \alpha) \cdot x(t) + \alpha \cdot y(t)$$

$x(t)$ is the dry signal, $y(t)$ is the wet signal, and $\alpha$ is the
amount of reverb you want to apply, scaled from 0 to 1. Edit `alpha` below
and press ▶ Run to find your perfect balance:

```{code-cell} ipython3
alpha = 0.5  # 0.0 = fully dry, 1.0 = fully wet — edit me!

n = max(dry.num_samples, wet.num_samples)
pad = lambda a: np.pad(a.samples[:, 0], (0, n - a.num_samples))
mix = pq.Audio((1 - alpha) * pad(dry) + alpha * pad(wet), sample_rate=SR)
mix.normalize(peak_dbfs=-3.0)
pq.play(mix)
```

## Sing your heart out 🎤

Time to keep the original promise. The two cells below don't run at build
time — they need *you*. Press **▶ Run** on the first one (the very first Run
on this page downloads the Python runtime, so give it a moment), click the
round record button that appears, and sing for five seconds. Then Run the
second cell to hear yourself on the big stage.

```{code-cell} ipython3
:tags: [skip-execution]

rec = pq.record(5.0)  # Run me, then click the record button that appears
```

```{code-cell} ipython3
:tags: [skip-execution]

if rec.sample_rate is None:
    print("No take yet — Run the cell above, click Record, sing, then Run me again.")
else:
    voice = rec.resample(SR).as_mono()
    voice.normalize(peak_dbfs=-3.0)
    M = voice.num_samples + h.num_samples - 1
    wet_voice = np.fft.irfft(
        np.fft.rfft(voice.samples[:, 0], n=M) * np.fft.rfft(h.samples[:, 0], n=M),
        n=M,
    )
    out = pq.Audio(wet_voice, sample_rate=SR)
    out.normalize(peak_dbfs=-3.0)
    pq.play(out)
```

All of this might seem like magic! Now you can sing from home and sound as if
you're in a concert hall.

We often take for granted the amount of work that goes into the technology
behind making music. But sometimes, it's fascinating to peek under the hood
of the digital world and see how things really work.

I hope this blog post helps you understand the convolution process in audio
and how it runs behind the scenes on your computer. And this time there's no
"interested in the code behind those buttons?" section at the end — the code
has been right here all along. 😌 If you have any questions, feel free to
reach out!
