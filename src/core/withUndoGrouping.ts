import { Operation } from 'slate';
import { HistoryEditor } from 'slate-history';
import type { DaEditor } from './types';

const PAUSE_MS = 800;

 
export function withUndoGrouping(editor: DaEditor): DaEditor {
  const { apply } = editor;
  let lastTime = 0;
  let lastWasInsert = false;

  editor.apply = (operation: Operation) => {
    const now = Date.now();
    const isInsert = operation.type === 'insert_text';

    if (isInsert) {
      const endsWord = /\s/.test(operation.text);
      const paused = now - lastTime > PAUSE_MS;

   
      if (paused || (lastWasInsert && endsWord)) {
        HistoryEditor.withoutMerging(editor, () => apply(operation));
        lastTime = now;
        lastWasInsert = true;
        return;
      }
    }

    lastTime = now;
    lastWasInsert = isInsert;
    apply(operation);
  };

  return editor;
}
