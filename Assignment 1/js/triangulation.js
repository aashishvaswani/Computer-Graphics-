function delaunayTriangulate(pts) {
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (const p of pts) {
    if (p.x<minX) minX=p.x; if (p.y<minY) minY=p.y;
    if (p.x>maxX) maxX=p.x; if (p.y>maxY) maxY=p.y;
  }
  const dx = maxX-minX, dy=maxY-minY, delta=Math.max(dx,dy)*4;
  const superA={x:minX-1, y:minY-1-2*delta};
  const superB={x:minX-1+2*delta, y:minY-1+delta};
  const superC={x:minX-1-2*delta, y:minY-1+delta};

  const workPts = pts.slice();
  const iA=workPts.push(superA)-1, iB=workPts.push(superB)-1, iC=workPts.push(superC)-1;

  let triangles = [{a:iA,b:iB,c:iC}];

  for (let i=0;i<pts.length;i++) {
    const p = workPts[i];
    const bad = [];
    for (let t=0;t<triangles.length;t++) {
      const tri=triangles[t];
      const cc = circumcircle(workPts[tri.a], workPts[tri.b], workPts[tri.c]);
      if (!cc.valid) continue;
      const dx=p.x-cc.x, dy=p.y-cc.y;
      if (dx*dx+dy*dy <= cc.r2 + 1e-9) bad.push(t);
    }
    const edges = [];
    function addEdge(u,v) {
      for (let e=0;e<edges.length;e++) {
        const ed=edges[e];
        if ((ed.u===v && ed.v===u) || (ed.u===u && ed.v===v)) {
          edges.splice(e,1); return;
        }
      }
      edges.push({u,v});
    }
    bad.sort((a,b)=>b-a);
    for (const idx of bad) {
      const tri=triangles[idx];
      addEdge(tri.a, tri.b); addEdge(tri.b, tri.c); addEdge(tri.c, tri.a);
      triangles.splice(idx,1);
    }
    for (const e of edges) triangles.push({a:e.u, b:e.v, c:i});
  }
  triangles = triangles.filter(tri => tri.a<iA && tri.b<iA && tri.c<iA);
  const out=[]; for (const t of triangles) { out.push(t.a, t.b, t.c); }
  return out;
}

function circumcircle(a,b,c){
  const ax=a.x, ay=a.y, bx=b.x, by=b.y, cx=c.x, cy=c.y;
  const A = bx-ax, B = by-ay, C = cx-ax, D = cy-ay;
  const E = A*(ax+bx) + B*(ay+by);
  const F = C*(ax+cx) + D*(ay+cy);
  const G = 2*(A*(cy-by) - B*(cx-bx));
  if (Math.abs(G) < 1e-12) return {valid:false, x:0,y:0,r2:Infinity};
  const ux = (D*E - B*F) / G;
  const uy = (A*F - C*E) / G;
  const dx = ux-ax, dy=uy-ay;
  return {valid:true, x:ux, y:uy, r2:dx*dx+dy*dy};
}
