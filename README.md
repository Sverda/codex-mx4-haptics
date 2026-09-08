# Codex MX4 Haptics

Powiadomienia haptyczne o zakończeniu odpowiedzi i prośbach o uwagę w Codex, odtwarzane na Logitech MX Master 4 przez Haptic Web Plugin.

## Wymagania

- Windows, Node.js 22 lub nowszy.
- MX Master 4 oraz Logi Options+ z włączonym Haptic Web Plugin.
- Codex z obsługą hooków i zatwierdzonymi definicjami.

Projekt nie ma zależności npm. Używa wbudowanego WebSocket oraz lokalnego endpointu `wss://local.jmw.nz:41443/ws`. Protokół i indeksy efektów pochodzą z projektu BG3 MX4 Haptics. Weryfikacja TLS pozostaje włączona.

## Sygnały

| Zdarzenie | Efekt |
| --- | --- |
| Zakończenie odpowiedzi (`Stop`) | `happy_alert`, po 650 ms akcent `knock` |
| Prośba o uprawnienia (`PermissionRequest`) | Dwa efekty `knock` |
| `request_user_input` lub `request_user_input_async` przez `PreToolUse` | Dwa efekty `knock` |
| Inne narzędzia i przerwanie pracy | Cisza |

`Stop` oznacza próbę zakończenia odpowiedzi, nie potwierdzenie realizacji całego zadania. Inny hook może jeszcze wymusić kontynuację. Pytania w tekście odpowiedzi otrzymują sygnał zakończenia. Nie każda ścieżka narzędzia emituje `PreToolUse`.

## Testy

```powershell
npm test
npm run haptic:test
npm run haptic:attention
```

Komunikat o wysłaniu potwierdza przesłanie bajtów przez WebSocket; fizyczną wibrację należy sprawdzić na myszce.

## Instalacja

1. Dostosuj ścieżki w `hooks.example.json` do lokalizacji repozytorium i Node.js. Przykład zakłada `X:/code/personal/codex-mx4-haptics` i `node` w PATH.
2. Dodaj wpisy do `hooks.json` w `CODEX_HOME` (domyślnie `%USERPROFILE%\.codex`), zachowując istniejące hooki.
3. Otwórz `/hooks` w Codex CLI, przejrzyj i zatwierdź nowe definicje.
4. Całkowicie zamknij i ponownie uruchom klientów Codex, potem sprawdź automatyczne wywołanie.

Zmiana komendy, w tym przeniesienie skryptu, wymaga ponownego zatwierdzenia hooka. Nie zmieniaj istniejącego `notify`, jeśli korzysta z niego inna integracja. Skrypt obsługuje także JSON `agent-turn-complete` przekazany jako argument.

Lokalny `hooks.json` z pełnymi ścieżkami i `diagnostics.jsonl` są wyłączone z Git. Diagnostyka zapisuje czas, etap wykonania, nazwę zdarzenia, numery efektów i ewentualny błąd; nie zapisuje treści rozmów. Skrypt nie zatwierdza operacji, a awaria haptyki nie zwraca decyzji blokującej pracę Codex.

## Stan weryfikacji

- Testy automatyczne sprawdzają wybór efektów i wysyłanie binarnych identyfikatorów przez WebSocket.
- 2026-09-08 potwierdzono automatyczne wywołanie `Stop` w świeżym `codex exec --ephemeral` i fizyczną wibrację.
- Użytkownik przetestował i zaakceptował obecny sygnał `happy_alert` + `knock`.
- Automatyczne powiadomienia w aplikacji desktopowej oraz sygnały prośby o uwagę nadal wymagają osobnej weryfikacji. Wcześniejsze nieudane próby interaktywne nie zostawiły wpisu wywołania skryptu; przyczyna różnicy względem `codex exec` nie została jednoznacznie ustalona.

Źródła: [Hooki Codex](https://learn.chatgpt.com/docs/hooks), [powiadomienia](https://learn.chatgpt.com/docs/config-file/config-advanced#notifications).
