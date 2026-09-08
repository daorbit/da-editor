import { useCallback, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import type { DaEditorHandle } from '../../../../src';
import { useAiConfig } from '../hooks/useAiConfig';
import { useEditorColumnRect } from '../hooks/useEditorColumnRect';
import { insertComposedText } from '../lib/insertIntoEditor';
import type { ComposeMode } from '../types';
import { AiComposerPanel } from './AiComposerPanel';
import { AiSetupDialog } from './AiSetupDialog';
import '../ai.css';

export interface AiWorkspaceHandle {
  open: () => void;
}

interface Props {
  children: ReactNode;
  getEditor: () => DaEditorHandle | null;
  theme: 'light' | 'dark';
  handleRef: Ref<AiWorkspaceHandle>;
}

function readSelection(): string {
  try {
    return window.getSelection?.()?.toString().trim() ?? '';
  } catch {
    return '';
  }
}

export function AiWorkspace({ children, getEditor, theme, handleRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { config, isConfigured, save, clear } = useAiConfig();
  const [setupOpen, setSetupOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selection, setSelection] = useState('');
  const [context, setContext] = useState('');
  const [busy, setBusy] = useState(false);

  const columnRect = useEditorColumnRect(rootRef, panelOpen);

  const open = useCallback(() => {
    const editor = getEditor();
    setSelection(readSelection());
    setContext(editor?.getMarkdown().slice(0, 6000) ?? '');
    if (isConfigured) setPanelOpen(true);
    else setSetupOpen(true);
  }, [getEditor, isConfigured]);

  useImperativeHandle(handleRef, () => ({ open }), [open]);

  const onInsert = useCallback(
    (text: string, mode: ComposeMode) => {
      const editor = getEditor();
      if (editor) insertComposedText(editor, text, mode);
    },
    [getEditor]
  );

  return (
    <div className="ai-workspace" ref={rootRef}>
      <div className="ai-workspace__surface" data-busy={busy || undefined}>
        {children}
      </div>

      {config && panelOpen && (
        <AiComposerPanel
          theme={theme}
          config={config}
          selection={selection}
          context={context}
          columnRect={columnRect}
          onInsert={onInsert}
          onBusyChange={setBusy}
          onOpenSettings={() => setSetupOpen(true)}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <AiSetupDialog
        open={setupOpen}
        theme={theme}
        current={config}
        onSave={(next) => {
          save(next);
          setPanelOpen(true);
        }}
        onClear={() => {
          clear();
          setPanelOpen(false);
        }}
        onClose={() => setSetupOpen(false)}
      />
    </div>
  );
}
