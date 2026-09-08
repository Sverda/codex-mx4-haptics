import { pathToFileURL } from 'node:url';
import { appendFileSync } from 'node:fs';

function diagnostic(status, fields = {}) {
  try {
    appendFileSync(new URL('./diagnostics.jsonl', import.meta.url),
      JSON.stringify({ time: new Date().toISOString(), status, ...fields }) + '\n');
  } catch { /* Diagnostic storage must not interfere with a notification. */ }
}

export function effect(event) {
  // happy_alert followed by a distinct knock accent.
  if (event?.type === 'agent-turn-complete') return [11, 2];
  if (event?.hook_event_name === 'Stop') return event.stop_hook_active ? [] : [11, 2];
  if (event?.hook_event_name === 'PermissionRequest') return [2, 2];
  if (event?.hook_event_name === 'PreToolUse' &&
      /(^|[.:/])request_user_input(_async)?$/.test(event.tool_name ?? '')) return [2, 2];
  return [];
}

export async function vibrate(pattern, url = 'wss://local.jmw.nz:41443/ws') {
  if (!pattern.length) return;
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error('Haptic Web Plugin: connection timeout'));
    }, 2000);
    socket.addEventListener('error', () => {
      clearTimeout(timer);
      socket.close();
      reject(new Error('Haptic Web Plugin is unavailable. Enable it in Logi Options+.'));
    }, { once: true });
    socket.addEventListener('close', () => {
      clearTimeout(timer);
      reject(new Error('Haptic Web Plugin closed the connection'));
    }, { once: true });
    socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
  });
  try {
    for (const index of pattern) {
      if (socket.readyState !== WebSocket.OPEN) throw new Error('Haptic connection lost');
      socket.send(Uint8Array.of(index));
      await new Promise(resolve => setTimeout(resolve, index === 11 ? 650 : 220));
    }
  } finally { socket.close(); }
}

async function main() {
  const test = process.argv[2] === '--test';
  diagnostic('started', { test });
  const deadline = setTimeout(() => process.exit(test ? 1 : 0), 4000);
  try {
    let event;
    if (test) event = { hook_event_name: process.argv[3] === 'attention' ? 'PermissionRequest' : 'Stop' };
    else {
      let input = process.argv[2] ?? '';
      if (!input) for await (const chunk of process.stdin) {
        input += chunk;
        if (input.length > 4 * 1024 * 1024) throw new Error('Hook payload too large');
      }
      event = JSON.parse(input);
    }
    const pattern = effect(event);
    diagnostic('received', { event: event.hook_event_name ?? event.type, pattern });
    await vibrate(pattern);
    diagnostic(pattern.length ? 'sent' : 'ignored');
    if (test) console.log('Pattern sent to the plugin; confirm the physical vibration.');
  } catch (error) {
    diagnostic('failed', { error: error.message });
    console.error(error.message);
    if (test) process.exitCode = 1;
  } finally {
    clearTimeout(deadline);
    // Empty successful output never approves, rejects, or continues a Codex turn.
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
