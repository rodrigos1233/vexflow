// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Key Signature Tests
//

import { MAJOR_KEYS, MINOR_KEYS, TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Flow } from '../src/flow';
import { Glyph } from '../src/glyph';
import { KeySignature } from '../src/keysignature';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';

const KeySignatureTests = {
  Start(): void {
    QUnit.module('KeySignature');
    QUnit.test('Key Parser Test', parser);
    const run = VexFlowTests.runTests;
    run('Major Key Test', majorKeys);
    run('Minor Key Test', minorKeys);
    run('Stave Helper', staveHelper);
    run('Cancelled key test', majorKeysCanceled);
    run('Cancelled key (for each clef) test', keysCanceledForEachClef);
    run('Altered key test', majorKeysAltered);
    run('Extended Keys Test', extendedKeysTest);
    run('Extended Keys Canceled test', extendedKeysCanceled);
    run('End key with clef test', endKeyWithClef);
    run('Key Signature Change test', changeKey);
    run('Key Signature with/without clef symbol', clefKeySignature);
  },
};

const fontWidths = () => {
  const glyphScale = 39; // default font scale
  const sharpWidth = Glyph.getWidth('accidentalSharp', glyphScale) + 1;
  const flatWidth = Glyph.getWidth('accidentalFlat', glyphScale) + 1;
  const naturalWidth = Glyph.getWidth('accidentalNatural', glyphScale) + 2;
  const clefWidth = Glyph.getWidth('gClef', glyphScale) * 2; // widest clef
  return { sharpWidth, flatWidth, naturalWidth, clefWidth };
};

function parser(assert: Assert): void {
  assert.expect(13);

  function catchError(spec: string): void {
    assert.throws(() => Flow.keySignature(spec), /BadKeySignature/);
  }

  catchError('asdf');
  catchError('D!');
  catchError('E#');
  catchError('#');
  catchError('b');
  catchError('Kb');
  catchError('Fb');
  catchError('B#m');
  catchError('flats_15');
  catchError('sharps_-1');
  catchError('b:invalid');
  catchError('#:not_a_number');

  Flow.keySignature('B');
  Flow.keySignature('C');
  Flow.keySignature('Fm');
  Flow.keySignature('Ab');
  Flow.keySignature('Abm');
  Flow.keySignature('F#');
  Flow.keySignature('G#m');
  Flow.keySignature('G#');
  Flow.keySignature('Dbm');

  Flow.keySignature('flats_8');
  Flow.keySignature('sharps_14');
  Flow.keySignature('flats_10');
  Flow.keySignature('sharps_8');


  assert.ok(true, 'all pass');
}

function majorKeys(options: TestOptions, contextBuilder: ContextBuilder): void {
  const w = fontWidths();
  const accidentalCount = 28; // total number in all the keys
  const casePadding = 10; // hard-coded in staveModifier
  const testCases = 7; // all keys, but includes key of C
  const sharpTestWidth = accidentalCount * w.sharpWidth + casePadding * testCases + Stave.defaultPadding;
  const flatTestWidth = accidentalCount * w.flatWidth + casePadding * testCases + Stave.defaultPadding;

  const ctx = contextBuilder(options.elementId, Math.max(sharpTestWidth, flatTestWidth) + 100, 240);
  const stave1 = new Stave(10, 10, flatTestWidth);
  const stave2 = new Stave(10, 90, sharpTestWidth);
  const keys = MAJOR_KEYS;

  let keySig = null;
  for (let i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.addToStave(stave1);
  }

  for (let n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.addToStave(stave2);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();

  options.assert.ok(true, 'all pass');
}

function majorKeysCanceled(options: TestOptions, contextBuilder: ContextBuilder): void {
  const scale = 0.9;
  const w = fontWidths();
  const flatPadding = 18;
  const sharpPadding = 20;
  const flatTestCases = 8;
  const sharpTestCases = 7;
  // magic numbers are the numbers of that symbol that appear in the test case
  const sharpTestWidth =
    28 * w.sharpWidth + 21 * w.naturalWidth + sharpPadding * sharpTestCases + Stave.defaultPadding + w.clefWidth;
  const flatTestWidth =
    28 * w.flatWidth + 28 * w.naturalWidth + flatPadding * flatTestCases + Stave.defaultPadding + w.clefWidth;
  const eFlatTestWidth =
    28 * w.flatWidth + 32 * w.naturalWidth + flatPadding * flatTestCases + Stave.defaultPadding + w.clefWidth;
  const eSharpTestWidth =
    28 * w.sharpWidth + 28 * w.naturalWidth + sharpPadding * sharpTestCases + Stave.defaultPadding + w.clefWidth;
  const maxWidth = Math.max(Math.max(sharpTestWidth, flatTestWidth, Math.max(eSharpTestWidth, eFlatTestWidth)));
  const ctx = contextBuilder(options.elementId, maxWidth + 100, 500);
  ctx.scale(scale, scale);
  const stave1 = new Stave(10, 10, flatTestWidth).addClef('treble');
  const stave2 = new Stave(10, 90, sharpTestWidth).addClef('treble');
  const stave3 = new Stave(10, 170, eFlatTestWidth).addClef('treble');
  const stave4 = new Stave(10, 250, eSharpTestWidth).addClef('treble');
  const keys = MAJOR_KEYS;

  let keySig = null;
  let i;
  let n;
  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.cancelKey('Cb');
    keySig.setPadding(flatPadding);
    keySig.addToStave(stave1);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.cancelKey('C#');
    keySig.setPadding(sharpPadding);
    keySig.addToStave(stave2);
  }

  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.cancelKey('E');
    keySig.setPadding(flatPadding);
    keySig.addToStave(stave3);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.cancelKey('Ab');
    keySig.setPadding(sharpPadding);
    keySig.addToStave(stave4);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();
  stave3.setContext(ctx);
  stave3.draw();
  stave4.setContext(ctx);
  stave4.draw();

  options.assert.ok(true, 'all pass');
}

function keysCanceledForEachClef(options: TestOptions, contextBuilder: ContextBuilder): void {
  const scale = 0.8;
  const w = fontWidths();
  const keyPadding = 10;
  const keys = ['C#', 'Cb'];
  const flatsKey = [7, 14];
  const sharpsKey = [14, 7];
  const natsKey = [7, 7];
  const max = 21 * Math.max(w.sharpWidth, w.flatWidth) * 2 + keyPadding * 6 + Stave.defaultPadding + w.clefWidth;
  const ctx = contextBuilder(options.elementId, max + 100, 380);
  ctx.scale(scale, scale);

  const x = 20;
  let y = 20;
  let tx = x;
  ['bass', 'tenor', 'soprano', 'mezzo-soprano', 'baritone-f'].forEach(function (clef) {
    keys.forEach((key, keyIx) => {
      const cancelKey = keys[(keyIx + 1) % 2];
      const width =
        flatsKey[keyIx] * w.flatWidth +
        natsKey[keyIx] * w.naturalWidth +
        sharpsKey[keyIx] * w.sharpWidth +
        keyPadding * 3 +
        w.clefWidth +
        Stave.defaultPadding;
      const stave = new Stave(tx, y, width);
      stave.setClef(clef);
      stave.addKeySignature(cancelKey);
      stave.addKeySignature(key, cancelKey);
      stave.addKeySignature(key);
      stave.setContext(ctx).draw();
      tx += width;
    });
    tx = x;
    y += 80;
  });

  options.assert.ok(true, 'all pass');
}

function majorKeysAltered(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 780, 500);
  ctx.scale(0.9, 0.9);
  const stave1 = new Stave(10, 10, 750).addClef('treble');
  const stave2 = new Stave(10, 90, 750).addClef('treble');
  const stave3 = new Stave(10, 170, 750).addClef('treble');
  const stave4 = new Stave(10, 250, 750).addClef('treble');
  const keys = MAJOR_KEYS;

  let keySig = null;
  let i;
  let n;
  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.alterKey(['bs', 'bs']);
    keySig.setPadding(18);
    keySig.addToStave(stave1);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.alterKey(['+', '+', '+']);
    keySig.setPadding(20);
    keySig.addToStave(stave2);
  }

  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.alterKey(['n', 'bs', 'bb']);
    keySig.setPadding(18);
    keySig.addToStave(stave3);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.alterKey(['++', '+', 'n', '+']);
    keySig.setPadding(20);
    keySig.addToStave(stave4);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();
  stave3.setContext(ctx);
  stave3.draw();
  stave4.setContext(ctx);
  stave4.draw();

  options.assert.ok(true, 'all pass');
}

function minorKeys(options: TestOptions, contextBuilder: ContextBuilder): void {
  const accidentalCount = 28; // total number in all the keys
  const w = fontWidths();
  const casePadding = 10; // hard-coded in staveModifier
  const testCases = 7; // all keys, but includes key of C
  const sharpTestWidth = accidentalCount * w.sharpWidth + casePadding * testCases + Stave.defaultPadding;
  const flatTestWidth = accidentalCount * w.flatWidth + casePadding * testCases + Stave.defaultPadding;

  const ctx = contextBuilder(options.elementId, Math.max(sharpTestWidth, flatTestWidth) + 100, 240);
  const stave1 = new Stave(10, 10, flatTestWidth);
  const stave2 = new Stave(10, 90, sharpTestWidth);
  const keys = MINOR_KEYS;

  let keySig = null;
  for (let i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.addToStave(stave1);
  }

  for (let n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.addToStave(stave2);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();

  options.assert.ok(true, 'all pass');
}

function endKeyWithClef(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 200);
  ctx.scale(0.9, 0.9);
  const stave1 = new Stave(10, 10, 350);
  stave1
    .setKeySignature('G')
    .setBegBarType(BarlineType.REPEAT_BEGIN)
    .setEndBarType(BarlineType.REPEAT_END)
    .setClef('treble')
    .addTimeSignature('4/4')
    .setEndClef('bass')
    .setEndKeySignature('Cb');
  const stave2 = new Stave(10, 90, 350);
  stave2.setKeySignature('Cb').setClef('bass').setEndClef('treble').setEndKeySignature('G');

  stave1.setContext(ctx).draw();
  stave2.setContext(ctx).draw();
  options.assert.ok(true, 'all pass');
}

function staveHelper(options: TestOptions, contextBuilder: ContextBuilder): void {
  const w = fontWidths();
  const accidentalCount = 28; // total number in all the keys
  const casePadding = 10; // hard-coded in staveModifier
  const testCases = 7; // all keys, but includes key of C
  const sharpTestWidth = accidentalCount * w.sharpWidth + casePadding * testCases + Stave.defaultPadding;
  const flatTestWidth = accidentalCount * w.flatWidth + casePadding * testCases + Stave.defaultPadding;

  const ctx = contextBuilder(options.elementId, Math.max(sharpTestWidth, flatTestWidth) + 100, 240);
  const stave1 = new Stave(10, 10, flatTestWidth);
  const stave2 = new Stave(10, 90, sharpTestWidth);
  const keys = MAJOR_KEYS;

  for (let i = 0; i < 8; ++i) {
    stave1.addKeySignature(keys[i]);
  }

  for (let n = 8; n < keys.length; ++n) {
    stave2.addKeySignature(keys[n]);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();

  options.assert.ok(true, 'all pass');
}

function extendedKeysTest(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 1200, 300);
  const stave = new Stave(10, 10, 1150).addClef('treble');

  const keys = [
    'flats_8',
    'flats_9',
    'flats_14',
    'sharps_8',
    'sharps_14',
  ];

  keys.forEach((key) => {
    const keySig = new KeySignature(key);
    keySig.addToStave(stave);
  });

  stave.setContext(ctx).draw();

  options.assert.ok(true, 'Extended keys rendered correctly');
}

function extendedKeysCanceled(options: TestOptions, contextBuilder: ContextBuilder): void {
  const scale = 0.9;
  const w = fontWidths();
  const flatPadding = 18;
  const sharpPadding = 20;

  const flatTestWidth = 14 * w.flatWidth + 14 * w.naturalWidth + flatPadding * 8 + Stave.defaultPadding;
  const sharpTestWidth = 14 * w.sharpWidth + 14 * w.naturalWidth + sharpPadding * 7 + Stave.defaultPadding;
  const maxWidth = Math.max(flatTestWidth, sharpTestWidth);
  const ctx = contextBuilder(options.elementId, maxWidth + 100, 500);
  ctx.scale(scale, scale);

  const stave1 = new Stave(10, 10, flatTestWidth).addClef('treble');
  const stave2 = new Stave(10, 90, sharpTestWidth).addClef('treble');
  const stave3 = new Stave(10, 170, flatTestWidth).addClef('treble');
  const stave4 = new Stave(10, 250, sharpTestWidth).addClef('treble');

  const extendedKeys = [
    'flats_8', 'flats_9', 'flats_10', 'flats_14',
    'sharps_8', 'sharps_9', 'sharps_10', 'sharps_14',
  ];

  const cancelKeys = {
    flats: 'C',
    sharps: 'C',
  };

  let keySig = null;
  let i;
  let n;

  // Test canceling extended flat keys
  for (i = 0; i < 4; ++i) {
    keySig = new KeySignature(extendedKeys[i]);
    keySig.cancelKey(cancelKeys.flats);
    keySig.setPadding(flatPadding);
    keySig.addToStave(stave1);
  }

  // Test canceling extended sharp keys
  for (n = 4; n < 8; ++n) {
    keySig = new KeySignature(extendedKeys[n]);
    keySig.cancelKey(cancelKeys.sharps);
    keySig.setPadding(sharpPadding);
    keySig.addToStave(stave2);
  }

  // Additional flat and sharp cancellation tests
  for (i = 0; i < 4; ++i) {
    keySig = new KeySignature(extendedKeys[i]);
    keySig.cancelKey('Ab');
    keySig.setPadding(flatPadding);
    keySig.addToStave(stave3);
  }

  for (n = 4; n < 8; ++n) {
    keySig = new KeySignature(extendedKeys[n]);
    keySig.cancelKey('E');
    keySig.setPadding(sharpPadding);
    keySig.addToStave(stave4);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();
  stave3.setContext(ctx);
  stave3.draw();
  stave4.setContext(ctx);
  stave4.draw();

  options.assert.ok(true, 'Extended key cancellations rendered correctly');
}

function changeKey(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 900);

  // The previous code was buggy: f.Stave(10, 10, 800), even though Factory.Stave() only accepts 1 argument.
  const stave = f.Stave({ x: 10, y: 10, width: 800 }).addClef('treble').addTimeSignature('C|');

  const voice = f
    .Voice()
    .setStrict(false)
    .addTickables([
      f.KeySigNote({ key: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
      f.BarNote(),
      f.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
      f.BarNote(),
      f.KeySigNote({ key: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
      f.BarNote(),
      f.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }), // TODO: alterKey needs to be a string[]
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
    ]);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'all pass');
}

function clefKeySignature(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 900);
  const stave = f.Stave({ x: 10, y: 10, width: 800 }).addClef('bass').addTimeSignature('C|').setClefLines('bass');

  const voice = f
    .Voice()
    .setStrict(false)
    .addTickables([
      f.KeySigNote({ key: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass' }),
      f.BarNote(),
      f.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass'  }),
      f.BarNote(),
      f.KeySigNote({ key: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass'  }),
      f.BarNote(),
      f.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }),
      f.StaveNote({ keys: ['c/4'], duration: '1', clef: 'bass'  }),
    ]);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  options.assert.ok(true, 'all pass');
}

VexFlowTests.register(KeySignatureTests);
export { KeySignatureTests };
