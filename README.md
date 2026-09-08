# Codex MX4 Haptics

Powiadomienia haptyczne i dźwiękowe o zakończeniu odpowiedzi i prośbach o uwagę w Codex. Haptyka korzysta z Logitech MX Master 4 przez Haptic Web Plugin, a dźwięki z odtwarzacza WAV w Windows PowerShell.

## Wymagania

- Windows, Node.js 22 lub nowszy.
- MX Master 4 oraz Logi Options+ z włączonym Haptic Web Plugin.
- Windows PowerShell (`powershell.exe`) i lokalne pliki WAV opisane w [sounds/README.md](sounds/README.md).
- Codex z obsługą hooków i zatwierdzonymi definicjami.

Projekt nie ma zależności npm. Używa wbudowanego WebSocket oraz lokalnego endpointu `wss://local.jmw.nz:41443/ws`. Protokół i indeksy efektów pochodzą z projektu BG3 MX4 Haptics. Weryfikacja TLS pozostaje włączona.

## Sygnały

| Zdarzenie | Haptyka | Dźwięk z Battle for Middle-earth |
| --- | --- | --- |
| Zakończenie odpowiedzi (`Stop`) | `happy_alert`, po 650 ms akcent `knock` | Efekt Gondoru (`ulevelu_gondor1.wav`), pełne 7,28 s |
| Prośba o uprawnienia (`PermissionRequest`) | Dwa efekty `knock` | Róg Boromira, skrócony do 3 s |
| `request_user_input` lub `request_user_input_async` przez `PreToolUse` | Dwa efekty `knock` | Róg Boromira, skrócony do 3 s |
| Inne narzędzia i przerwanie pracy | Brak | Cisza |

Zakończeniu towarzyszy `sounds/ulevelu_gondor1.wav` z Battle for Middle-earth (pełne 7,28 s). Prośbie o uwagę towarzyszy `sounds/attention.wav`: pierwsze 3 sekundy `guborom_horn1.wav`, z wyciszeniem ostatnich 50 ms. Dźwięk i haptyka uruchamiają się niezależnie. Ukryty odtwarzacz działa w tle, więc hook nie czeka na zakończenie dźwięku. Błędy odtwarzacza zapisują się jako `audio-failed` w diagnostyce; uruchomienie procesu nie potwierdza słyszalności.

Pliki WAV są lokalne i wyłączone z Git. Źródło oraz sposób przygotowania: [sounds/README.md](sounds/README.md).

`Stop` oznacza próbę zakończenia odpowiedzi, nie potwierdzenie realizacji całego zadania. Inny hook może jeszcze wymusić kontynuację. Pytania w tekście odpowiedzi otrzymują sygnał zakończenia. Nie każda ścieżka narzędzia emituje `PreToolUse`.

## Testy

```powershell
npm test
npm run haptic:test
npm run haptic:attention
```

`npm test` uruchamia testy automatyczne bez odtwarzania sygnałów. `npm run haptic:test` uruchamia haptykę i dźwięk zakończenia, a `npm run haptic:attention` — haptykę i dźwięk prośby o uwagę.

Komunikat testowy potwierdza przesłanie bajtów przez WebSocket i uruchomienie procesu odtwarzacza. Fizyczną wibrację oraz słyszalność dźwięku należy sprawdzić osobiście. Dźwięk może grać jeszcze po zakończeniu komendy.

## Instalacja

1. Przygotuj `sounds/attention.wav` i `sounds/ulevelu_gondor1.wav` według [instrukcji dźwięków](sounds/README.md). Plików WAV nie ma w repozytorium Git; FFmpeg jest potrzebny tylko do przycięcia rogu.
2. Uruchom oba testy ręczne z sekcji powyżej i sprawdź wibrację oraz dźwięk.
3. Dostosuj ścieżki w `hooks.example.json` do lokalizacji repozytorium i Node.js. Przykład zakłada `X:/code/personal/codex-mx4-haptics` i `node` w PATH.
4. Dodaj wpisy do `hooks.json` w `CODEX_HOME` (domyślnie `%USERPROFILE%\.codex`), zachowując istniejące hooki.
5. Otwórz `/hooks` w Codex CLI, przejrzyj i zatwierdź nowe definicje.
6. Całkowicie zamknij i ponownie uruchom klientów Codex, potem sprawdź automatyczne wywołanie.

Zmiana komendy, w tym przeniesienie skryptu, wymaga ponownego zatwierdzenia hooka. Nie zmieniaj istniejącego `notify`, jeśli korzysta z niego inna integracja. Skrypt obsługuje także JSON `agent-turn-complete` przekazany jako argument.

Lokalny `hooks.json` z pełnymi ścieżkami i `diagnostics.jsonl` są wyłączone z Git. Diagnostyka zapisuje czas, etap wykonania, nazwę zdarzenia, numery efektów i ewentualny błąd; nie zapisuje treści rozmów. Skrypt nie zatwierdza operacji, a awaria haptyki nie zwraca decyzji blokującej pracę Codex.

## Stan weryfikacji

- Cztery testy automatyczne przeszły 2026-09-08: sprawdzają wybór efektów, wysyłanie binarnych identyfikatorów przez WebSocket oraz niezależne uruchamianie audio i haptyki przy awarii jednego z kanałów.
- 2026-09-08 potwierdzono długość przyciętego rogu: dokładnie 3 s. Oba pliki przeszły próbę odtwarzania przez Windows PowerShell bez błędów; słyszalność i automatyczne odtwarzanie przez hook wymagają potwierdzenia użytkownika.
- 2026-09-08 potwierdzono automatyczne wywołanie `Stop` w świeżym `codex exec --ephemeral` i fizyczną wibrację.
- Użytkownik przetestował i zaakceptował obecny sygnał `happy_alert` + `knock`.
- Automatyczne powiadomienia w aplikacji desktopowej oraz sygnały prośby o uwagę nadal wymagają osobnej weryfikacji. Wcześniejsze nieudane próby interaktywne nie zostawiły wpisu wywołania skryptu; przyczyna różnicy względem `codex exec` nie została jednoznacznie ustalona.

Źródła: [Hooki Codex](https://learn.chatgpt.com/docs/hooks), [powiadomienia](https://learn.chatgpt.com/docs/config-file/config-advanced#notifications).
