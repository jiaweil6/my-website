---
title: Jiawei Liu
description: Jiawei (David) Liu, Carnegie Mellon BESA student in Electrical and Computer Engineering and Music Technology working on audio signal processing and generative music tools.
author: Jiawei Liu
canonical: https://jiaweil6.github.io/my-website/
name: Jiawei Liu
native_name: 刘嘉唯
email: jiaweil6@andrew.cmu.edu
cv: files/cv.pdf
portrait:
  light: img/profile-photo-light.jpg
  dark: img/profile-photo.jpg
  alt: Portrait of Jiawei Liu
social:
  - { icon: fab fa-github, label: GitHub, url: "https://github.com/jiaweil6" }
---

## About

Hey, I'm David! I'm an undergrad at Carnegie Mellon University in the BESA program, studying Electrical and Computer Engineering and Music Technology. As a musician, engineer, and researcher, I'm particularly interested in how advanced technology can help people become a more creative version of themselves. My engineering interests center on signal processing, especially signals sampled at 44.1 kHz. Feel free to reach out if you have any questions, or if you just want to chat!

Right now I'm a research intern in Prof. Chris Donahue's [G-CLef lab](https://gclef-cmu.org), a teaching assistant for Intro to Computer Music, and I'm building a pedal-morphing guitar instrument for my BXA capstone.

I'm also a sports enthusiast. Collegiate-level badminton player 🏸, single-digit handicap golfer ⛳, and recently a V2-4 climber 🧗. I'm always down to stay active, so definitely hit me up if you're interested!

### Interests

- Audio Signal Processing
- Generative Music
- Neural Audio Effects
- Electroacoustics

### Skills

- **Digital Signal Processing** — Python · MATLAB · C · Max/MSP
- **Music Production** — Logic · Ableton · Pro Tools

### Languages

- **🇺🇸 English** — Native or bilingual proficiency
- **🇨🇳 Chinese** — Native or bilingual proficiency
- **🇰🇷 Korean** — Daily conversational proficiency

## Education

### Carnegie Mellon University

```yaml
logo: img/trajectory/carnegie-mellon-wordmark.png
logo_alt: Carnegie Mellon University wordmark
degree: BESA in ECE and Music Technology
meta: Pittsburgh, PA · Class of 2027 · President, CMU Badminton · Founding Member, CMU Audio Engineering Society.
```

### Dwight School Seoul

```yaml
logo: img/trajectory/dwight-school-shield.png
logo_alt: Dwight School shield
degree: International Baccalaureate Diploma Programme
meta: Seoul, South Korea · Class of 2023 · Varsity Badminton, Varsity Basketball, Varsity Volleyball, Orchestra.
```

## Experience

### Research Intern

```yaml
label: G-CLef
organization: Generative Creativity Lab, Carnegie Mellon University
organization_url: https://gclef-cmu.org
details: Advised by Prof. Chris Donahue · Sep 2026 – Present
```

Collaborating with Yewon Kim on an ongoing research project.

### Research Intern, Course Development

```yaml
label: 15-322/622
organization: Intro to Computer Music, Carnegie Mellon University
organization_url: https://www.cs.cmu.edu/~15322/
details: Advised by Prof. Chris Donahue · May 2026 – Aug 2026
links:
  - { icon: far fa-copy, label: Course site, url: "https://www.cs.cmu.edu/~15322/" }
  - { icon: far fa-arrow-alt-circle-right, label: browseraudio on GitHub, url: "https://github.com/jiaweil6/browseraudio" }
  - { icon: far fa-arrow-alt-circle-right, label: PyPI, url: "https://pypi.org/project/browseraudio/" }
```

Co-developed the Fall 2026 redesign of the course, building its interactive online textbook and course website with Jupyter Book and MyST. Added live in-browser Python (Pyodide), interactive Plotly widgets, and Manim animations to teach DSP concepts; built and published **browseraudio**, an open-source library for recording and playing audio in browser-based Python; and wrote new assignments on convolution, Fourier analysis, filters, and reverb with Python autograder tests for Gradescope.

## Teaching Experience

### Intro to Computer Music

```yaml
course: 15-322/622
course_url: https://www.cs.cmu.edu/~15322/
url: https://www.cs.cmu.edu/~15322/
audience: Undergraduate / Graduate
position: Teaching Assistant, Spring 2026 – Present
links:
  - { icon: far fa-copy, label: Course site, url: "https://www.cs.cmu.edu/~15322/" }
```

Work with Professor Chris Donahue to support a programming- and project-based course covering digital audio fundamentals, sound synthesis, and audio signal processing. Host office hours, answer student questions on Piazza, lead review sessions, and grade assignments and final projects, with a focus on helping students apply computational tools to sound synthesis, audio effects, and music composition.

## Projects

### Pedal Morphing Instrument

```yaml
url: https://jiaweil6.github.io/bxa-capstone/
icon: img/publications/project-aurora.svg
icon_alt: Project icon
links:
  - { icon: far fa-arrow-alt-circle-right, label: Project page, url: "https://jiaweil6.github.io/bxa-capstone/" }
```

BXA capstone advised by Prof. Chris Donahue (Aug 2026 – present). A guitar-effect instrument that morphs continuously between real pedals so guitarists can design new hybrid tones. A VAE learns a continuous tone space from recordings of 10–20 overdrive, distortion, and fuzz pedals, played through a real-time plugin with a 2D tone plane and text control, and evaluated in recorded studio sessions with guitarists.

### Piano Genie Max Edition

```yaml
icon: img/publications/project-aurora.svg
icon_alt: Project icon
```

Final project for Twisted Signals at Carnegie Mellon University (Apr 2026). Rebuilt Piano Genie in Max 9, running the Magenta.js model through Node for Max so eight computer keys play all 88 piano keys. A JavaScript style arranger re-voices the played notes in real time as classical, jazz, or J-pop in any key and mode, feeding an 8-voice sampler (piano, violin, organ, guitar) with custom chorus, stereo delay, and reverb effects.

### Intergram

```yaml
icon: img/publications/project-aurora.svg
icon_alt: Project icon
```

Google-sponsored GenAI Hackathon at the Tepper School of Business (Mar 2024). Led a four-person team as primary developer on a Python demo of a multilingual messaging platform that lets each user chat in their preferred language. Finished in the top 15% of teams.

### CMUapartment.com

```yaml
icon: img/publications/project-aurora.svg
icon_alt: Project icon
```

24-hour hackathon (Jan 2024). Led a three-person team to build a website that helps CMU students find housing by ranking apartments on each student's priorities. Built the responsive front end with JavaScript, Bootstrap, and jQuery, including slider-weighted scoring, filters, and live rankings.

## Blog

### Algorithm Behind Realistic Reverb? What is Convolution?

```yaml
date: Mar 2025
tag: Audio DSP
url: blog/audio/posts/convolution.html
link_label: Read post
```

An interactive version of the original Streamlit post, covering the main intuition, equations, and figures behind convolution reverb.
