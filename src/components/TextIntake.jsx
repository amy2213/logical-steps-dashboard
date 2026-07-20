import { useEffect, useRef, useState } from 'react';

const MAX_LENGTH = 12000;

export default function TextIntake({ disabled, initialValue = '', onSubmit }) {
  const [text, setText] = useState(initialValue);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const length = text.length;
  const tooLong = length > MAX_LENGTH;
  const canSubmit = text.trim().length > 0 && !tooLong && !disabled;
  function submit() { if (canSubmit) onSubmit(text.trim()); }

  return (
    <section className="intake">
      <label className="intake__label" htmlFor="intake-field">Paste the text</label>
      <textarea id="intake-field" ref={ref} className="intake__field" rows={6} value={text}
        disabled={disabled} aria-describedby="intake-count" aria-invalid={tooLong || undefined}
        placeholder="A paragraph, an email, a policy, a page of a contract."
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit(); }} />
      <p id="intake-count" className="intake__count" aria-live="polite">
        {length.toLocaleString()} / {MAX_LENGTH.toLocaleString()} characters
        {tooLong ? ' — shorten the text before submitting.' : ''}
      </p>
      <div className="intake__actions">
        <button type="button" className="btn btn--primary" disabled={!canSubmit} onClick={submit}>Map this out</button>
        <span className="intake__shortcut">or press ⌘/Ctrl + Enter</span>
      </div>
    </section>
  );
}
