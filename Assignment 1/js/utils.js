function toNDC(x, y, W, H) {
  return [(x / W) * 2 - 1, 1 - (y / H) * 2];
}

function pointInRect(p, rb) {
  return (p.x >= rb.x && p.x <= rb.x + rb.w && p.y >= rb.y && p.y <= rb.y + rb.h);
}

function pointInRotRect(px, py, ob) {
  const {cx, cy, w, h, angle} = ob;
  const c=Math.cos(-angle), s=Math.sin(-angle);
  const dx=px-cx, dy=py-cy;
  const rx=dx*c - dy*s, ry=dx*s + dy*c;
  return Math.abs(rx) <= w/2 && Math.abs(ry) <= h/2;
}

function rectCornersRB(rb) {
  return [
    {x:rb.x,y:rb.y}, {x:rb.x+rb.w,y:rb.y},
    {x:rb.x+rb.w,y:rb.y+rb.h}, {x:rb.x,y:rb.y+rb.h}
  ];
}

function pointInTriangle(px, py, a, b, c) {
  const v0x=c.x-a.x, v0y=c.y-a.y;
  const v1x=b.x-a.x, v1y=b.y-a.y;
  const v2x=px-a.x, v2y=py-a.y;
  const dot00=v0x*v0x+v0y*v0y;
  const dot01=v0x*v1x+v0y*v1y;
  const dot02=v0x*v2x+v0y*v2y;
  const dot11=v1x*v1x+v1y*v1y;
  const dot12=v1x*v2x+v1y*v2y;
  const invDen = 1 / (dot00*dot11 - dot01*dot01 + 1e-12);
  const u = (dot11*dot02 - dot01*dot12) * invDen;
  const v = (dot00*dot12 - dot01*dot02) * invDen;
  return (u >= 0) && (v >= 0) && (u + v <= 1);
}
