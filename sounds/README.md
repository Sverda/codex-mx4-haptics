# Dźwięki Battle for Middle-earth

Źródło: [The Sounds Resource — Sound Effects](https://sounds.spriters-resource.com/pc_computer/lordoftheringsbattleformiddleearth/asset/428618/), pobrane 2026-09-08.

Pliki WAV są wyłączone z Git i nie są objęte licencją kodu projektu. Nowa instalacja wymaga przygotowania lokalnych plików z paczki źródłowej:

- `Sound Effects/ulevelu_gondor1.wav` → `sounds/ulevelu_gondor1.wav`, bez zmian (7,280975 s).
- `Sound Effects/guborom_horn1.wav` → `sounds/guborom_horn1.wav`, źródło do przycięcia.

Przygotowanie efektu uwagi z katalogu projektu (FFmpeg jest potrzebny tylko do przygotowania):

```powershell
ffmpeg -i sounds/guborom_horn1.wav -t 3 -af "afade=t=out:st=2.95:d=0.05" -c:a pcm_s16le sounds/attention.wav
```

Wynik: dokładnie 3 sekundy, z wyciszeniem ostatnich 50 ms. Odtwarzanie wymaga tylko Windows PowerShell i plików WAV.
