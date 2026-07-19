/** Return the focused node plus every transitive dependency, cycle-safe. */
export function collectDependencyClosure(nodes, focusedNodeId) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const lit = new Set();
  const stack = focusedNodeId ? [focusedNodeId] : [];
  while (stack.length) {
    const id = stack.pop();
    if (lit.has(id)) continue;
    lit.add(id);
    for (const dependencyId of byId.get(id)?.dependsOn ?? []) stack.push(dependencyId);
  }
  return lit;
}
