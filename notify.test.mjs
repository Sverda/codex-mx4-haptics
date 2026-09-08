import test from 'node:test';
import assert from 'node:assert/strict';
import { effect, vibrate, notify } from './notify.mjs';

test('audio still runs when the haptic plugin is unavailable', async () => {
  let played = false;
  await assert.rejects(notify([2, 2],
    async () => { throw new Error('offline'); },
    async () => { played = true; }), /offline/);
  assert.equal(played, true);
});

test('audio failure does not prevent haptics', async () => {
  let vibrated = false;
  await assert.rejects(notify([11, 2],
    async () => { vibrated = true; },
    async () => { throw new Error('audio unavailable'); }), /audio unavailable/);
  assert.equal(vibrated, true);
});

test('completion, attention, unrelated tools and continuation', () => {
  assert.deepEqual(effect({type:'agent-turn-complete'}), [11,2]);
  assert.deepEqual(effect({hook_event_name:'Stop'}), [11,2]);
  assert.deepEqual(effect({hook_event_name:'Stop',stop_hook_active:true}), []);
  assert.deepEqual(effect({hook_event_name:'PermissionRequest'}), [2,2]);
  for (const tool_name of ['request_user_input','functions.request_user_input_async'])
    assert.deepEqual(effect({hook_event_name:'PreToolUse',tool_name}), [2,2]);
  assert.deepEqual(effect({hook_event_name:'PreToolUse',tool_name:'exec_command'}), []);
  assert.deepEqual(effect({hook_event_name:'Interrupt'}), []);
});

test('sends binary waveform IDs and closes the connection', async () => {
  const original = globalThis.WebSocket;
  const sent = [];
  let closed = false;
  class FakeSocket extends EventTarget {
    static OPEN = 1;
    readyState = 1;
    constructor() { super(); setTimeout(() => this.dispatchEvent(new Event('open')), 0); }
    send(value) { sent.push([...value]); }
    close() { closed = true; }
  }
  globalThis.WebSocket = FakeSocket;
  try { await vibrate([2,2]); assert.deepEqual(sent, [[2],[2]]); assert.equal(closed,true); }
  finally { globalThis.WebSocket = original; }
});
