/** Runtime contract, normalization, and display metadata for analysis results. */
export const ROLES = { CONTEXT:'context', PREMISE:'premise', CONCLUSION:'conclusion', ASSUMPTION:'assumption', COUNTERPOINT:'counterpoint' };
export const ROLE_META = {
  [ROLES.CONTEXT]: { label:'Background', hint:'Sets the scene. You can skim this.', order:0 },
  [ROLES.COUNTERPOINT]: { label:'Other side', hint:'A view the author