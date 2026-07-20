import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, validateAnalysis, AnalysisValidationError } from '../src/services/analysisContract.js';

const valid={id:'a',sourceText:'Source',gist:'The author argues that the policy should be adopted because it improves retention.',meta:{model:'test'},nodes:[
{id:'n1',role:ROLES.PREMISE,plain:'Retention improved after the policy began.',original:'Retention improved.',dependsOn:[]},
{id:'n2',role:ROLES.CONCLUSION,conclusionType:'primary',plain:'The policy should be adopted.',original:'Adopt the policy.',dependsOn:['n1'],connective:'therefore'}]};

test('runtime contract accepts valid analysis',()=>assert.equal(validateAnalysis(valid),valid));
test('lone intermediate conclusion is promoted instead of discarding the map',()=>{
 const gym={...valid,nodes:[valid.nodes[0],{...valid.nodes[1],conclusionType:'intermediate'}]};
 const result=validateAnalysis(gym);
 assert.equal(result.nodes[1].conclusionType,'primary');
 assert.notEqual(result,gym);
});
test('assumption with source wording is safely relabeled as a premise',()=>{
 const response={...valid,nodes:[{...valid.nodes[0],role:ROLES.ASSUMPTION,original:'Retention improved.'},valid.nodes[1]]};
 const result=validateAnalysis(response);
 assert.equal(result.nodes[0].role,ROLES.PREMISE);
});
test('runtime contract still rejects duplicate and dangling IDs',()=>{
 const invalid={...valid,nodes:[valid.nodes[0],{...valid.nodes[1],id:'n1',dependsOn:['missing']}]};
 assert.throws(()=>validateAnalysis(invalid),AnalysisValidationError);
});
test('runtime contract rejects unknown roles and invalid confidence',()=>{
 assert.throws(()=>validateAnalysis({...valid,nodes:[{...valid.nodes[0],role:'mystery',confidence:2}]}),/incomplete map/);
});
test('validation errors use user-facing text while retaining diagnostics',()=>{
 try{validateAnalysis({...valid,nodes:[]});assert.fail('expected validation error');}
 catch(error){assert.equal(error.message,'Logical Steps received an incomplete map. Please try that text again.');assert.ok(error.issues.length);}
});
