window.SimpleOBJ = {
  parse: (text) => {
    const vp=[[0,0,0]], vn=[[0,0,1]];
    const positions=[], normals=[], indices=[];
    const verts = new Map();
    let idx = 0;

    const addVert = (vi, ni) => {
      const key = `${vi}/${ni}`;
      if (verts.has(key)) return verts.get(key);
      const p = vp[vi], n = vn[ni] || vn[1];
      positions.push(p[0],p[1],p[2]);
      normals.push(n[0],n[1],n[2]);
      verts.set(key, idx);
      return idx++;
    };

    const lines = text.split(/\r?\n/);
    for (let ln of lines) {
      ln = ln.trim();
      if (!ln || ln.startsWith('#')) continue;
      const t = ln.split(/\s+/);
      if (t[0]==='v')  vp.push([+t[1],+t[2],+t[3]]);
      if (t[0]==='vn') vn.push([+t[1],+t[2],+t[3]]);
      if (t[0]==='f') {
        const fs = t.slice(1).map(s=>{
          const [vi,,ni] = s.split('/').map(x=>+x||0);
          return addVert(vi, ni||1);
        });
        for (let i=1;i<fs.length-1;i++) indices.push(fs[0],fs[i],fs[i+1]);
      }
    }
    if (positions.length/3 > 65535) {
      console.warn('OBJ too large for Uint16 indices; consider simplifying the mesh.');
    }
    return {
      positions: new Float32Array(positions),
      normals:   new Float32Array(normals),
      indices:   new Uint16Array(indices)
    };
  }
};
