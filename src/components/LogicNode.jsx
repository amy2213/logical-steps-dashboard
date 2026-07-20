import { ROLE_META } from '../services/analysisContract.js';

function confidenceWord(value){if(value==null)return null;if(value>=.8)return'Likely';if(value>=.5)return'Possible';return'A stretch';}
function displayRole(node){return node.role==='assumption'&&node.original?.trim()?'premise':node.role;}
function accessibleRole(node){const role=displayRole(node);if(role!=='conclusion')return ROLE_META[role].label;return node.conclusionType==='primary'?'Main point':'Intermediate point';}

export default function LogicNode({node,isFocused,isDimmed,isRevealed,onFocus,onToggleOriginal}){
  const role=displayRole(node);
  const meta=ROLE_META[role];
  const confidence=confidenceWord(node.confidence);
  const roleLabel=accessibleRole(node);
  const select=()=>onFocus(node.id);
  return <div className={['node',`node--${role}`,isFocused?'node--focused':'',isDimmed?'node--dimmed':''].filter(Boolean).join(' ')}>
    {node.connective&&<span className="node__connective" aria-hidden="true">{node.connective}</span>}
    <article className="node__card" tabIndex={0} role="button"
      aria-label={`Select ${roleLabel} card`} aria-pressed={isFocused}
      onFocus={select} onClick={select}
      onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}}}>
      <header className="node__head">
        <span className="node__role">{roleLabel}</span>
        {confidence&&<span className="node__confidence">{confidence}</span>}
      </header>
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
