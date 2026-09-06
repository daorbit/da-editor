import { createContext, useContext } from 'react';
import type { PromptRequest } from './PromptDialog';

export interface DialogApi {
  prompt: (request: PromptRequest) => void;
  alert: (message: string, title?: string) => void;
}
 
export const DialogContext = createContext<DialogApi>({
  prompt: () => undefined,
  alert: () => undefined,
});

export function useDialogs(): DialogApi {
  return useContext(DialogContext);
}
