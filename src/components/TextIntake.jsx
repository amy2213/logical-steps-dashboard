/**
 * TextIntake.jsx
 * --------------
 * Zero-friction entry: the field is focused on load, there is exactly one
 * button, and there are no options to decide between before starting.
 *
 * Cmd/Ctrl+Enter submits, because reaching for the mouse is a place people
 * lose the thread.
 */

import { useEffect, useRef, useState } from 'react';

export default function TextIntake({ disabled, initialValue = '', onSubmit }) {
  const [text, setText] = useState(initialValue);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const canSubmit = text.trim().length > 0 && !disabled;

  function submit() {
    if (canSubmit) onSubmit(text.trim());
  }

  return (
    <section className="intake">
      <label className="intake__label" htmlFor="intake-field">
        Paste the text
      </label>

      <textarea
        id="intake-field"
        ref={ref}
        className="intake__field"
        rows={6}
        value={text}
        disabled={disabled}
        placeholder="A paragraph, an email, a policy, a page of a contract."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
        }}
      />

      <div className="intake__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canSubmit}
          onClick={submit}
        >
          Map this out
        </button>
        <span className="intake__shortcut">or press ⌘/Ctrl + Enter</span>
      </div>
    </section>
  );
}
