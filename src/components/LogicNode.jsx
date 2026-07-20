import { ROLE_META } from '../services/analysisContract.js';

function confidenceWord(value){if(value==null)return null;if(value>=.8)return'Likely';if(value>=.5)return'Possible';return'A stretch';}

export default function LogicNode({node,isFocused,isDimmed,isRevealed,onFocus,onToggleOriginal}){
  const meta=ROLE_META[node.role];
  const confidence=confidenceWord(node.confidence);
  const select=()=>onFocus(node.id);
  return <div className={['node',`node--${node.role}`,isFocused?'node--focused':'',isDimmed?'node--dimmed':''].filter(Boolean).join(' ')}>
    {node.connective&&<span className="node__connective" aria-hidden="true">{node.connective}</span>}
    <article className="node__card" tabIndex={0} role="button"
      aria-label={`Select ${meta.label}: ${node.plain}`} aria-pressed={isFocused}
      onFocus={select} onClick={select}
      onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}}}>
      <header className="node__head"><span className="node__role">{meta.label}</span>{confidence&&<span className="node__confidence">{confidence}</span>}</header>
      <p className="node__plain">{node.plain}</p>
      <p className="node__hint">{meta.hint}</p>
      {node.original&&<>
        <button type="button" className="btn btn--inline" aria-expanded={isRevealed} aria-controls={`original-${node.id}`}
          onClick={(event)=>{event.stopPropagation();onToggleOriginal(node.id);}}>
          {isRevealed?'Hide original wording':'Show original wording'}
        </button>
        {isRevealed&&<blockquote id={`original-${node.id}`} className="node__original">{node.original}</blockquote>}
      </>}
    </article>
  </div>;
}
