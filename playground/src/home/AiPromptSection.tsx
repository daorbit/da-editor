import { useMemo, useState } from 'react';
import { AI_TASK_PLACEHOLDER, buildAiPrompt } from './aiPrompt';
import { SectionHeading } from './SectionHeading';

const ASSISTANTS = ['Claude', 'ChatGPT', 'Cursor', 'GitHub Copilot', 'Windsurf'];

const STEPS = [
  'Describe what you want to build, or keep the example.',
  'Copy the prompt and paste it into your AI assistant.',
  'Review the changes it proposes, then run your app.',
];

export function AiPromptSection() {
  const [task, setTask] = useState('');
  const [copied, setCopied] = useState(false);

  const docsUrl = `${window.location.origin}/docs/introduction`;
  const prompt = useMemo(() => buildAiPrompt(docsUrl, task), [docsUrl, task]);
  const encoded = encodeURIComponent(prompt);

  const copy = () => {
    void navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <section className="lp-section lp-ai" id="ai">
      <div className="lp-ai__intro">
        <SectionHeading
          eyebrow="Build with AI"
          title={
            <>
              Let your AI assistant <b>do the integration</b>
            </>
          }
          lead="One prompt gives your coding assistant everything it needs: install steps, the real props and APIs, and the mistakes to avoid. Paste it into any tool and describe your task."
        />

        <ol className="lp-ai__steps">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <p className="lp-ai__works">Works with</p>
        <ul className="lp-ai__tools">
          {ASSISTANTS.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>

      <div className="lp-ai__card">
        <div className="lp-ai__bar">
          <span className="lp-ai__file">integration-prompt.md</span>
          <button type="button" className="lp-ai__copy" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <label className="lp-ai__task">
          <span className="lp-ai__task-label">What do you want to build?</span>
          <textarea
            className="lp-ai__input"
            rows={2}
            value={task}
            placeholder={AI_TASK_PLACEHOLDER}
            onChange={(event) => setTask(event.target.value)}
          />
        </label>

        <pre className="lp-ai__prompt">{prompt}</pre>

        <div className="lp-ai__actions">
          <button type="button" className="lp-btn lp-btn--light" onClick={copy}>
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
          <a
            className="lp-btn lp-btn--outline-light"
            href={`https://claude.ai/new?q=${encoded}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Claude
          </a>
          <a
            className="lp-btn lp-btn--outline-light"
            href={`https://chatgpt.com/?q=${encoded}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in ChatGPT
          </a>
        </div>
      </div>
    </section>
  );
}
