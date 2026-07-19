/**
 * LogicNode.jsx
 * -------------
 * One card = one idea. Never two.
 *
 * Three rules this component exists to enforce:
 *   1. The conversational rewrite is the primary text. The original is hidden
 *      behind a disclosure, because two versions of the same sentence side by
 *      side doubles the reading load.
 *   2. Role is signalled by colour AND a written label AND position — never by
 *      colour alone.
 *   3. Nothing animates in or out except at the user's request. No autoplay,
 *      no ambient motion, no attention-grabbing.
 */

import { ROLE_META } from '../services/analysisContract.js';

/** Confidence as words. A raw 0.82 means nothing to a reader mid-overwhelm. */
function confidenceWord(value) {
  if (value == null) return null;
  if (value >= 0.8) return 'Likely';
  if (value >= 0.5) return 'Possible';
  return 'A stretch';
}

export default function LogicNode({
  node,
  isFocused,
  isDimmed,
  isRevealed,
  onFocus,
  onToggleOriginal,
}) {
  const meta = ROLE_META[node.role];
  const confidence = confidenceWord(node.confidence);

  return (
    <div
      className={[
        'node',
        `node--${node.role}`,
        isFocused ? 'node--focused' : '',
        isDimmed ? 'node--dimmed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Spine token: the logical joint, pinned to the left rail. Reading only
          the tokens down the page gives you the argument's skeleton. */}
      {node.connective && (
        <span className="node__connective" aria-hidden="true">
          {node.connective}
        </span>
      )}

      <article
        className="node__card"
        tabIndex={0}
        aria-current={isFocused ? 'true' : undefined}
        onFocus={() => onFocus(node.id)}
        onClick={() => onFocus(node.id)}
      >
        <header className="node__head">
          <span className="node__role">{meta.label}</span>
          {confidence && <span className="node__confidence">{confidence}</span>}
        </header>

        {/* The rewrite. Short lines, generous leading, no justification. */}
        <p className="node__plain">{node.plain}</p>

        <p className="node__hint">{meta.hint}</p>

        {/* Progressive disclosure. Closed by default, every time. */}
        {node.original && (
          <>
            <button
              type="button"
              className="btn btn--inline"
              aria-expanded={isRevealed}
              aria-controls={`original-${node.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleOriginal(node.id);
              }}
            >
              {isRevealed ? 'Hide original wording' : 'Show original wording'}
            </button>

            {isRevealed && (
              <blockquote id={`original-${node.id}`} className="node__original">
                {node.original}
              </blockquote>
            )}
          </>
        )}
      </article>
    </div>
  );
}
