export const STATUS = { IDLE: 'idle', WORKING: 'working', READY: 'ready', ERROR: 'error' };
export const initialState = {
  status: STATUS.IDLE, requestId: null, sourceText: '', stage: null,
  analysis: null, error: null, focusedNodeId: null, revealedNodeIds: [], focusMode: false,
};

function isCurrentWorkingRequest(state, action) {
  return state.status === STATUS.WORKING && Boolean(action.requestId) && action.requestId === state.requestId;
}

export function pipelineReducer(state, action) {
  switch (action.type) {
    case 'SUBMIT':
      if (!action.requestId || typeof action.text !== 'string' || !action.text.trim()) return state;
      return { ...initialState, status: STATUS.WORKING, requestId: action.requestId, sourceText: action.text };
    case 'STAGE':
      return isCurrentWorkingRequest(state, action) ? { ...state, stage: action.stage } : state;
    case 'RESOLVE':
      return isCurrentWorkingRequest(state, action)
        ? { ...state, status: STATUS.READY, requestId: null, stage: null, analysis: action.analysis, error: null }
        : state;
    case 'REJECT':
      return isCurrentWorkingRequest(state, action)
        ? { ...state, status: STATUS.ERROR, requestId: null, stage: null, analysis: null, error: action.error }
        : state;
    case 'CANCEL':
      return isCurrentWorkingRequest(state, action) ? { ...initialState, sourceText: state.sourceText } : state;
    case 'RESET':
      return state.status === STATUS.WORKING ? state : { ...initialState };
    case 'FOCUS_NODE':
      if (state.status !== STATUS.READY || !state.analysis?.nodes.some((node) => node.id === action.id)) return state;
      return { ...state, focusedNodeId: action.id };
    case 'SET_FOCUS_MODE':
      return state.status === STATUS.READY ? { ...state, focusMode: Boolean(action.enabled) } : state;
    case 'TOGGLE_ORIGINAL': {
      if (state.status !== STATUS.READY || !state.analysis?.nodes.some((node) => node.id === action.id)) return state;
      const open = state.revealedNodeIds.includes(action.id);
      return { ...state, revealedNodeIds: open ? state.revealedNodeIds.filter((id) => id !== action.id) : [...state.revealedNodeIds, action.id] };
    }
    default:
      throw new Error(`pipelineReducer: unknown action "${action.type}"`);
  }
}
