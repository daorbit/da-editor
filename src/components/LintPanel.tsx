import { useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { CloseIcon, WarningIcon, InfoIcon, CheckIcon } from '../icons';
import { lintDocument, revealIssue, type LintIssue, type LintOptions } from '../core/lint';
import type { DaEditor, EditorValue } from '../core/types';

export interface LintPanelProps {
  open: boolean;
  onClose: () => void;
  /** Rule ids to skip, forwarded to the linter. */
  options?: LintOptions;
}

const SEVERITY_ICON = {
  error: WarningIcon,
  warning: WarningIcon,
  info: InfoIcon,
} as const;

export function LintPanel({ open, onClose, options }: LintPanelProps) {
  const editor = useSlate() as DaEditor;

  const issues = useMemo(
    () => lintDocument(editor.children as EditorValue, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor.children, options],
  );

  if (!open) return null;

  const counts = issues.reduce(
    (acc, issue) => ({ ...acc, [issue.severity]: (acc[issue.severity] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  const go = (issue: LintIssue) => {
    revealIssue(editor, issue);
    try {
      ReactEditor.focus(editor);
    } catch {
      /* not mounted */
    }
  };

  const applyFix = (issue: LintIssue) => {
    issue.fix?.(editor);
  };

  return (
    <aside className="da-lint" aria-label="Content checks">
      <div className="da-lint__head">
        <span className="da-lint__title">Checks</span>
        <span className="da-lint__summary">
          {counts.error ? <b className="da-lint__pill da-lint__pill--error">{counts.error}</b> : null}
          {counts.warning ? (
            <b className="da-lint__pill da-lint__pill--warning">{counts.warning}</b>
          ) : null}
          {counts.info ? <b className="da-lint__pill da-lint__pill--info">{counts.info}</b> : null}
        </span>
        <button
          type="button"
          className="da-lint__close"
          aria-label="Close checks"
          onClick={onClose}
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="da-lint__empty">
          <CheckIcon size={18} />
          <span>No issues found.</span>
        </div>
      ) : (
        <ul className="da-lint__list">
          {issues.map((issue) => {
            const Icon = SEVERITY_ICON[issue.severity];
            return (
              <li key={issue.id} className={`da-lint__item da-lint__item--${issue.severity}`}>
                <button type="button" className="da-lint__go" onClick={() => go(issue)}>
                  <Icon size={14} className="da-lint__icon" />
                  <span className="da-lint__msg">{issue.message}</span>
                </button>
                {issue.fix && (
                  <button
                    type="button"
                    className="da-lint__fix"
                    onClick={() => applyFix(issue)}
                  >
                    Fix
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
