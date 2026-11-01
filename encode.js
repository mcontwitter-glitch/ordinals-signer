// Minimal ABI encoder (types: uint, address, bytes, T[], tuple). Works in browser and node.
(function(root){
const pad=h=>h.padStart(64,'0');
const hx=s=>s.replace(/^0x/,'').toLowerCase();
function enc(t,v){ // returns {dyn, head/hex}
  if(t.type==='tuple'){const parts=t.components.map((c,i)=>[c,v[i]]);return encSeq(parts);}
  if(t.type==='array'){const body=pad(v.length.toString(16))+encSeq(v.map(x=>[t.item,x]));return body;}
  if(t.type==='bytes'){const b=hx(v);const len=b.length/2;return pad(len.toString(16))+b.padEnd(Math.ceil(b.length/64)*64,'0');}
  if(t.type==='address'){const a=hx(v);if(!/^[0-9a-f]{40}$/.test(a))throw Error('bad address '+v);return pad(a);}
  if(t.type==='uint'){const n=BigInt(v);if(n<0n)throw Error('neg');return pad(n.toString(16));}
  throw Error('type '+t.type);
}
function isDyn(t){return t.type==='bytes'||t.type==='array'||(t.type==='tuple'&&t.components.some(isDyn));}
function encSeq(parts){
  let heads=[],tails=[],headLen=parts.length*32;let off=headLen;
  for(const [t,v] of parts){const e=enc(t,v);if(isDyn(t)){heads.push(pad(off.toString(16)));tails.push(e);off+=e.length/2;}else heads.push(e);}
  return heads.join('')+tails.join('');
}
const U={type:'uint'},A={type:'address'},B={type:'bytes'};
const arr=item=>({type:'array',item}),tup=(...components)=>({type:'tuple',components});
const C={ENDPOINT:'0x1a44076050125825900e736c501f859c50fE728c',RECV_ULN:'0x7B9E184e07a6EE1aC23eAe0fe8D6Be2f663f05e6',ARB_DVN:'0x2f55C492897526677C5B68fb199ea31E2c126416',
 ABS_EID:30324,VAULT:'0xe81DdAB112137112B8FeeB853e22BC4c38F999e5',OWNER:'0xb19F00e095B1387061d73751C772bbA848D196b1',
 SEND_ULN:'0x166CAb679EBDB0853055522D3B523621b94029a1',ABS_DVN:'0xF4DA94b4EE9D8e209e3bf9f469221CE2731A7112',EXECUTOR:'0x643E1471f37c4680Df30cF0C540Cd379a0fF58A5',ORD_EID:30110,CONF:20,SINK:'0xAaB3eEb4ef0BC311D79898A0B84FC74D24f64622'};
const E={
 constructorArgs:()=>encSeq([[A,C.ENDPOINT],[U,C.ABS_EID],[A,C.VAULT],[A,C.OWNER]]),
 A1:sink=>'0x6a14d715'+encSeq([[A,sink],[U,C.ABS_EID],[A,C.RECV_ULN],[U,0]]),
 A2:sink=>{const uln=tup(U,U,U,U,arr(A),arr(A));
   const cfg='0x'+encSeq([[uln,[C.CONF,1,0,0,[C.ARB_DVN],[]]]]);
   return '0x6dbd9f90'+encSeq([[A,sink],[A,C.RECV_ULN],[arr(tup(U,U,B)),[[C.ABS_EID,2,cfg]]]]);},
 B1:()=>'0x0a672e2b'+encSeq([[A,C.SEND_ULN],[U,C.ORD_EID],[U,C.CONF],[A,C.ABS_DVN],[U,10000],[A,C.EXECUTOR]]),
 // B2: vault.setPeer(uint32 eid, bytes32 peer) — selector 0x3400288b; peer = sink left-padded to 32 bytes
 B2:(sink=C.SINK)=>'0x3400288b'+encSeq([[U,C.ORD_EID],[A,sink]]),
 C};
root.GoLiveEnc=E; if(typeof module!=='undefined')module.exports=E;
})(typeof window!=='undefined'?window:globalThis);
