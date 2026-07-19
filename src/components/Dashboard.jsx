import { useEffect, useRef } from 'react';
import { STATUS } from '../state/pipelineReducer.js';
import { STAGES } from '../services/analyzeText.js';
import TextIntake from './TextIntake.jsx';
import LogicMap from './LogicMap.jsx';

export default function Dashboard({ state, status, isWorking, onSubmit, onCancel, onReset, onFocusNode, onToggleOriginal, onSetFocusMode }) {
  const resultHeadingRef = useRef(null);
  const errorHeadingRef = useRef(null);
  const previousStatusRef = useRef(status);

  useEffect(() => {
    if (previousStatusRef.current !== status) {
      if (status === STATUS.READY) resultHeadingRef.current?.focus();
      if (status === STATUS.ERROR) errorHeadingRef.current?.focus();
      previousStatusRef.current = status;
    }
  }, [status]);

  const activeIndex = STAGES.findIndex((stage) => stage.id === state.stage);
  const activeLabel = STAGES[activeIndex]?.label;

  return (
    <div className="shell">
      <header className="masthead">
        <h1 className="masthead__title">Logical Steps</h1>
        <p className="masthead__sub">Paste dense text. See the argument, one logical step at a time.</p>
      </header>

      <main className="stack">
        <TextIntake disabled={isWorking} initialValue={state.sourceText} onSubmit={onSubmit} />

        <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {isWorking && activeLabel ? `${activeLabel}.` : ''}
          {status === STATUS.READY ? 'Analysis complete. Results are ready.' : ''}
        </div>

        {isWorking && (
          <section className="rail" aria-label="Analysis progress" aria-busy="true">
            <ol className="rail__list">
              {STAGES.map((stage, thisIndex) => {
                const stepState = thisIndex < activeIndex ? 'done' : thisIndex === activeIndex ? 'active' : 'pending';
                return (
                  <li key={stage.id} className={`rail__step rail__step--${stepState}`} aria-current={stepState === 'active' ? 'step' : undefined}>
                    <span className="rail__dot" aria-hidden="true" />
                    {stage.label}<span className="visually-hidden">, {stepState}</span>
                  </li>
                );
              })}
            </ol>
            <button type="button" className="btn btn--quiet" onClick={onCancel}>Stop</button>
          </section>
        )}

        {status === STATUS.ERROR && (
          <section className="notice" role="alert" aria-labelledby="error-heading">
            <h2 id="error-heading" ref={errorHeadingRef} tabIndex={-1}>We could not map that text</h2>
            <p>{state.error.message}</p>
            <button type="button" className="btn btn--quiet" onClick={onReset}>Start over</button>
          </section>
        )}

        {status === STATUS.READY && (
          <>
            <section className="gist" aria-labelledby="result-heading">
              <h2 id="result-heading" ref={resultHeadingRef} tabIndex={-1} className="gist__eyebrow">In one sentence</h2>
              <p className="gist__text">{state.analysis.gist}</p>
            </section>
            <LogicMap nodes={state.analysis.nodes} focusedNodeId={state.focusedNodeId} revealedNodeIds={state.revealedNodeIds}
              focusMode={state.focusMode} onFocusNode={onFocusNode} onToggleOriginal={onToggleOriginal} onSetFocusMode={onSetFocusMode} />
            <button type="button" className="btn btn--quiet" onClick={onReset}>Clear and start over</button>
          </>
        )}
      </main>
    </div>
  );
}
