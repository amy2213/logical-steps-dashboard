import { useMemo } from 'react';
import { sortNodes, ROLE_META } from '../services/analysisContract.js';
import LogicNode from './LogicNode.jsx';
import { collectDependencyClosure } from '../services/dependencyGraph.js';

export default function LogicMap({ nodes, focusedNodeId, revealedNodeIds, focusMode, onFocusNode, onToggleOriginal, onSetFocusMode }) {
  const ordered = useMemo(() => sortNodes(nodes), [nodes]);
  const litIds = useMemo(() => focusMode && focusedNodeId ? collectDependencyClosure(nodes, focusedNodeId) : null, [focusMode, focusedNodeId, nodes]);
  let lastRole = null;

  return (
    <section className="map" aria-labelledby="logic-map-heading">
      <h2 id="logic-map-heading" className="visually-hidden">Logical map</h2>
      <div className="map__controls">
        <label className="switch">
          <input type="checkbox" checked={focusMode} onChange={(event) => onSetFocusMode(event.target.checked)} />
          Focus mode: dim everything except the selected card and its full support chain
        </label>
      </div>
      <div className="map__list">
        {ordered.map((node) => {
          const showHeading = node.role !== lastRole;
          lastRole = node.role;
          return (
            <div key={node.id} className="map__group">
              {showHeading && <h3 className="map__heading">{ROLE_META[node.role].label}</h3>}
              <LogicNode node={node} isFocused={node.id === focusedNodeId} isDimmed={litIds ? !litIds.has(node.id) : false}
                isRevealed={revealedNodeIds.includes(node.id)} onFocus={onFocusNode} onToggleOriginal={onToggleOriginal} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
