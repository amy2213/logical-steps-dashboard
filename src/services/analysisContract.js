/** Runtime contract and display metadata for analysis results. */
export const ROLES = { CONTEXT:'context', PREMISE:'premise', CONCLUSION:'conclusion', ASSUMPTION:'assumption', COUNTERPOINT:'counterpoint' };
export const ROLE_META = {
  [ROLES.CONTEXT]: { label:'Background', hint:'Sets the scene. You can skim this.', order:0 },
  [ROLES.COUNTERPOINT]: { label:'Other side', hint:'A view the author raises or answers.', order:1 },
  [ROLES.PREMISE]: { label:'Given reason', hint:'Support the author actually wrote down.', order:2 },
  [ROLES.ASSUMPTION]: { label:'Unstated leap', hint:'A bridge the argument needs but does not state.', order:3 },
  [ROLES.CONCLUSION]: { label:'The point', hint:'What the author wants you to believe.', order:4 },
};
const roleValues=new Set(Object.values(ROLES));
const connectiveValues=new Set(['because','therefore','unless','but','if/then']);
const badGists=new Set(['summary','gist','response','string','analysis']);

export class AnalysisValidationError extends Error {
  constructor(issues){super(`Invalid analysis response: ${issues.join('; ')}`);this.name='AnalysisValidationError';this.issues=issues;}
}

function isOneSentence(text){
  const trimmed=text.trim().replace(/[.!?]\s*$/,'');
  return !/[.!?]\s+\S/.test(trimmed);
}

export function validateAnalysis(value){
  const issues=[];
  if(!value||typeof value!=='object'||Array.isArray(value))throw new AnalysisValidationError(['response must be an object']);
  for(const key of ['id','sourceText','gist'])if(typeof value[key]!=='string'||!value[key].trim())issues.push(`${key} must be a non-empty string`);
  if(typeof value.gist==='string'){
    const gist=value.gist.trim();
    if(gist.length<20||gist.split(/\s+/).length<4||badGists.has(gist.toLowerCase()))issues.push('gist is too short or looks like placeholder text');
    if(gist.length>180)issues.push('gist must be 180 characters or fewer');
    if(!isOneSentence(gist))issues.push('gist must be one sentence');
  }
  if(!Array.isArray(value.nodes)||value.nodes.length===0)issues.push('nodes must be a non-empty array');
  if(!value.meta||typeof value.meta!=='object'||Array.isArray(value.meta))issues.push('meta must be an object');
  const ids=new Set();let primaryCount=0;let conclusionCount=0;
  if(Array.isArray(value.nodes)){
    value.nodes.forEach((node,index)=>{
      const path=`nodes[${index}]`;
      if(!node||typeof node!=='object'||Array.isArray(node)){issues.push(`${path} must be an object`);return;}
      if(typeof node.id!=='string'||!node.id.trim())issues.push(`${path}.id must be a non-empty string`);else if(ids.has(node.id))issues.push(`${path}.id must be unique`);else ids.add(node.id);
      if(!roleValues.has(node.role))issues.push(`${path}.role is unknown`);
      if(typeof node.plain!=='string'||!node.plain.trim())issues.push(`${path}.plain must be a non-empty string`);
      if(typeof node.original!=='string')issues.push(`${path}.original must be a string`);
      if(!Array.isArray(node.dependsOn)||node.dependsOn.some(id=>typeof id!=='string'))issues.push(`${path}.dependsOn must be a string array`);
      if(node.connective!=null&&!connectiveValues.has(node.connective))issues.push(`${path}.connective is unknown`);
      if(node.connective!=null&&Array.isArray(node.dependsOn)&&node.dependsOn.length===0)issues.push(`${path}.connective requires at least one dependency`);
      if(node.confidence!=null&&(typeof node.confidence!=='number'||node.confidence<0||node.confidence>1))issues.push(`${path}.confidence must be between 0 and 1`);
      if(node.role===ROLES.ASSUMPTION&&node.original.trim())issues.push(`${path}.assumption must not contain original wording`);
      if(node.role===ROLES.CONCLUSION){conclusionCount++;if(node.conclusionType==='primary')primaryCount++;}
    });
    value.nodes.forEach((node,index)=>{if(!node||!Array.isArray(node.dependsOn))return;for(const id of node.dependsOn){if(!ids.has(id))issues.push(`nodes[${index}].dependsOn references missing node "${id}"`);if(id===node.id)issues.push(`nodes[${index}] cannot depend on itself`);}});
  }
  if(conclusionCount>0&&primaryCount!==1)issues.push('analysis must contain exactly one primary conclusion');
  if(issues.length)throw new AnalysisValidationError(issues);
  return value;
}

export function sortNodes(nodes){return [...nodes].sort((a,b)=>ROLE_META[a.role].order-ROLE_META[b.role].order);}
