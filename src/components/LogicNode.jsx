import { ROLE_META } from '../services/analysisContract.js';

function confidenceWord(value){if(value==null)return null;if(value>=.8)return'Likely';if(value>=.5)return'Possible';return'A stretch';}

function accessibleRole(node){
  if(node.role!=='conclusion')return ROLE_META[node.role].label;
  return node.conclusionType==='primary'?'Main point':'Intermediate point';
}

export default function LogicNode