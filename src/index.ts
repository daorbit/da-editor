import './styles/editor.css';

export { Editor, DEFAULT_TOOLBAR } from './components/Editor';
export { Toolbar } from './components/Toolbar';
export type { ToolbarProps } from './components/Toolbar';
export { execCommand, isActive } from './commands';
export type {
  EditorProps,
  EditorHandle,
  ToolbarItem,
  MarkCommand,
  BlockCommand,
} from './types';
