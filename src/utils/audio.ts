/**
 * Audio synthesis, recitation & recording utilities for Biblical Hebrew
 * Integrates high-fidelity server Gemini TTS ('gemini-3.8-flash-lite-tts')
 * with instant client-side caching and resilient Web Speech API fallback.
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voice?: string;
  phoneticFallback?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export class HebrewSpeechSynthesizer {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static audioCtx: AudioContext | null = null;
  private static currentAudio: HTMLAudioElement | null = null;
  private static activeAbortController: AbortController | null = null;
  private static memoryCache = new Map<string, string>();
  private static isPreloading = false;

  /**
   * Unlock AudioContext and check Web Audio support
   */
  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Get cached audio from memory or localStorage
   */
  private static getCachedAudio(key: string): string | null {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }
    try {
      const stored = localStorage.getItem(`torah_audio_${key}`);
      if (stored) {
        this.memoryCache.set(key, stored);
        return stored;
      }
    } catch {
      // localStorage quota or disabled
    }
    return null;
  }

  /**
   * Store synthesized audio into memory & localStorage
   */
  private static setCachedAudio(key: string, base64: string): void {
    this.memoryCache.set(key, base64);
    try {
      // Keep only short or verse keys in localStorage to prevent quota overflow
      if (base64.length < 500000) {
        localStorage.setItem(`torah_audio_${key}`, base64);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Check if native browser Hebrew voice is available
   */
  static getHebrewVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    try {
      const voices = this.synth.getVoices();
      return voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('he') ||
          v.lang.toLowerCase().includes('iw') ||
          v.name.toLowerCase().includes('hebrew') ||
          v.lang.toLowerCase().includes('il')
      );
    } catch {
      return [];
    }
  }

  /**
   * Primary speech function:
   * 1. Check local cache (instant replay)
   * 2. Request Gemini Biblical Hebrew TTS from /api/tts
   * 3. Fallback to Web Speech API if offline or server unavailable
   */
  static speak(text: string, options: SpeechOptions = {}): void {
    const cleanText = text.trim();
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    // Stop any existing playback
    this.stop();

    // Ensure AudioContext is primed
    this.getAudioContext();

    const voice = options.voice || 'Fenrir';
    const cacheKey = `${voice}_${cleanText}`;
    const cachedData = this.getCachedAudio(cacheKey);

    // If already cached, play immediately
    if (cachedData) {
      this.playBase64Audio(cachedData, options);
      return;
    }

    // Prepare abort controller for server fetch
    this.activeAbortController = new AbortController();

    // Notify start / loading
    options.onStart?.();

    // Fetch from backend Gemini TTS endpoint
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        voice: voice,
      }),
      signal: this.activeAbortController.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`TTS server responded with status: ${res.status}`);
        }
        const data = await res.json();
        if (!data.audio) {
          throw new Error('No audio in response');
        }
        this.setCachedAudio(cacheKey, data.audio);
        this.playBase64Audio(data.audio, options);
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return; // Intentionally stopped
        }
        console.warn('Backend TTS failed, falling back to browser speech synthesis:', err);
        // Resilient fallback
        this.fallbackSpeak(cleanText, options);
      });
  }

  /**
   * Play base64 WAV audio via HTMLAudioElement
   */
  private static playBase64Audio(base64: string, options: SpeechOptions): void {
    try {
      const audioUrl = `data:audio/wav;base64,${base64}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      if (options.rate && options.rate > 0) {
        audio.playbackRate = options.rate;
      }

      audio.onplay = () => {
        options.onStart?.();
      };

      audio.onended = () => {
        this.currentAudio = null;
        options.onEnd?.();
      };

      audio.onerror = (e) => {
        console.error('HTMLAudioElement error:', e);
        this.currentAudio = null;
        // If audio playback fails, try fallback
        this.fallbackSpeak('', options);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play was prevented by browser policy:', err);
          this.fallbackSpeak('', options);
        });
      }
    } catch (err) {
      console.error('Failed to instantiate Audio:', err);
      this.fallbackSpeak('', options);
    }
  }

  /**
   * Browser SpeechSynthesis Fallback
   */
  private static fallbackSpeak(hebrewText: string, options: SpeechOptions): void {
    if (!this.synth) {
      this.playFallbackChime();
      options.onEnd?.();
      return;
    }

    try {
      this.synth.cancel();

      const hebrewVoices = this.getHebrewVoices();
      let textToSpeak = hebrewText;
      let lang = 'he-IL';
      let voice: SpeechSynthesisVoice | null = null;

      if (hebrewVoices.length > 0) {
        voice = hebrewVoices[0];
        lang = voice.lang || 'he-IL';
      } else {
        // If browser has NO Hebrew voice installed, speaking Hebrew Unicode characters causes silence or error.
        // We use phonetic transliteration or Korean phonetics so the user actually hears the recitation!
        if (options.phoneticFallback) {
          textToSpeak = options.phoneticFallback;
          // Prefer Korean or English voice for phonetics
          const allVoices = this.synth.getVoices();
          const koVoice = allVoices.find((v) => v.lang.startsWith('ko'));
          if (koVoice) {
            voice = koVoice;
            lang = 'ko-KR';
          }
        }
      }

      if (!textToSpeak) {
        this.playFallbackChime();
        options.onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.lang = lang;
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        options.onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.playFallbackChime();
        options.onError?.(e);
        options.onEnd?.();
      };

      this.synth.speak(utterance);
    } catch (e) {
      this.playFallbackChime();
      options.onError?.(e);
      options.onEnd?.();
    }
  }

  /**
   * Pre-cache verse & key words in the background
   */
  static async precache(texts: string[], voice = 'Fenrir'): Promise<void> {
    if (this.isPreloading || typeof window === 'undefined') return;
    this.isPreloading = true;

    try {
      for (const text of texts.slice(0, 5)) {
        const clean = text.trim();
        if (!clean) continue;
        const key = `${voice}_${clean}`;
        if (this.getCachedAudio(key)) continue;

        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: clean, voice }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.audio) {
              this.setCachedAudio(key, data.audio);
            }
          }
        } catch {
          // ignore background prefetch errors
        }
      }
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Immediately stop any recitation
   */
  static stop(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Play ancient lyre / temple bell chime for audible feedback
   */
  static playChime(freq = 440, type: OscillatorType = 'sine', duration = 0.5): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore
    }
  }

  static playFallbackChime(): void {
    this.playChime(392, 'sine', 0.4); // G4
  }

  static playSuccessFanfare(): void {
    const notes = [261.63, 329.63, 392.0, 523.25]; // C E G C
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'triangle', 0.45);
      }, idx * 120);
    });
  }
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async start(): Promise<boolean> {
    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.start();
      return true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      return false;
    }
  }

  stop(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not started'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
        resolve(audioUrl);
      };

      this.mediaRecorder.stop();
    });
  }
}
