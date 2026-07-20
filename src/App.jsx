import { useReducer, useRef, useCallback, useEffect } from 'react';
import { pipelineReducer, initialState, STATUS } from './state/pipelineReducer.js';
import { analyzeText } from './services/analyzeText.js';
import Dashboard from './components/Dashboard.jsx';
import './styles/tokens.css';
import './styles/app.css';

export default function App() {
  const [state, dispatch] = useReducer(pipelineReducer, initialState);
  const activeRunRef = useRef(null);

  useEffect(() => () => activeRunRef.current?.controller.abort(), []);

  const runAnalysis = useCallback(async (text) => {
    activeRunRef.current?.controller.abort();
    const requestId = crypto.randomUUID();
    const controller = new AbortController();
    activeRunRef.current = { requestId, controller };
    dispatch({ type: 'SUBMIT', text, requestId });

    try {
      const analysis = await analyzeText(text, {
        signal: controller.signal,
        onStage: (stage) => dispatch({ type: 'STAGE', stage, requestId }),
      });
      dispatch({ type: 'RESOLVE', analysis, requestId });
    } catch (error) {
      if (error?.name === 'AbortError') return;
      dispatch({
        type: 'REJECT',
        requestId,
        error: {
          message: typeof error?.message === 'string' && error.message.trim()
            ? error.message
            : 'The text could not be mapped because something unexpected happened.',
          recoverable: true,
        },
      });
    } finally {
      if (activeRunRef.current?.requestId === requestId) activeRunRef.current = null;
    }
  }, []);

  const cancelAnalysis = useCallback(() => {
    const activeRun = activeRunRef.current;
    if (!activeRun) return;
    activeRun.controller.abort();
    dispatch({ type: 'CANCEL', requestId: activeRun.requestId });
    activeRunRef.current = null;
  }, []);

  return <Dashboard state={state} status={state.status} isWorking={state.status === STATUS.WORKING}
    onSubmit={runAnalysis} onCancel={cancelAnalysis} onReset={() => dispatch({ type: 'RESET' })}
    onFocusNode={(id) => dispatch({ type: 'FOCUS_NODE', id })}
    onToggleOriginal={(id) => dispatch({ type: 'TOGGLE_ORIGINAL', id })}
    onSetFocusMode={(enabled) => dispatch({ type: 'SET_FOCUS_MODE', enabled })} />;
}
