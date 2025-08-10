// Floating cellulose-like hexagons
(function(){
  const WIDTH = 50;
  const HEIGHT = 50;
  const NUM_HEX = 75;
  const DECAY = 0.95; // rate at which extra motion/rotation fades
  const groups = [];
  const mouse = { x: 0, y: 0, active: false };
  const PATH_D = "M11.65,18.49,21.04,2.48h-8.16l-4.08,7.07,4.08,7.07h8.16l4.08-7.07-4.08-7.07ZM24.88,26.32,34.27,10.31h-8.16l-4.08,7.07,4.08,7.07h8.16l4.08-7.07-4.08-7.07ZM40.38.03h-3.81l-1.9,3.3,1.9,3.3h3.81l1.9-3.3L40.38.03ZM48,14.99h-2.7l-1.35,2.34,1.35,2.34h2.7l1.35-2.34-1.35-2.34ZM10.93,19.66h-2.89l-1.44,2.5,1.44,2.5h2.89l1.44-2.5-1.44-2.5ZM12.84,16.56l-1.91,3.1M34.27,24.45l2.41,4.09M43.95,17.33h-5.67M36.57,6.62l-2.3,3.69M27.12,11.49h6.62M33.69,23.01l3.43-5.63M23.75,17.38l3.37,5.76M13.44,15.64h6.81M10.15,9.21l3.19-5.49M23.75,9.23l-3.38-5.71";

  function createHex(x, y) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', WIDTH);
    svg.setAttribute('height', HEIGHT);
    svg.setAttribute('viewBox', '0 0 50 50');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', PATH_D);
    path.setAttribute('stroke', '#2a2a2a');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.2');
    svg.appendChild(path);
    svg.style.position = 'absolute';
    svg.style.transformOrigin = 'center';
    return { el: svg, path, x, y, width: WIDTH, height: HEIGHT, angle: 0, spin: 0 };
  }

  function newGroup(x, y) {
    const hex = createHex(x, y);
    document.getElementById('molecule-container').appendChild(hex.el);
    const bbox = hex.path.getBBox();
    hex.width = bbox.width;
    hex.height = bbox.height;
    hex.x += bbox.x;
    hex.y += bbox.y;
    hex.el.style.transform = `translate(${hex.x}px, ${hex.y}px)`;
    const baseVx = Math.random() * 0.4 - 0.2;
    const baseVy = Math.random() * 0.4 - 0.2;
    const speed0 = Math.hypot(baseVx, baseVy);
    hex.spin = (Math.random() * 0.25 * speed0) * (Math.random() < 0.5 ? -1 : 1);
    const group = {
      hexes: [hex],
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      speed0
    };
    groups.push(group);
  }

  function overlap(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
  }

  function connect(g1, g2, h1, h2) {
    const dx = (h2.x + h2.width / 2) - (h1.x + h1.width / 2);
    const shiftX = dx > 0 ? h1.width : -h1.width;
    const offX = h1.x + shiftX - h2.x;
    g2.hexes.forEach(h => { h.x += offX; });
    g1.hexes = g1.hexes.concat(g2.hexes);
    g1.baseVx = (g1.baseVx + g2.baseVx) / 2;
    g1.baseVy = (g1.baseVy + g2.baseVy) / 2;
    g1.vx = g1.baseVx;
    g1.vy = g1.baseVy;
    g1.speed0 = (g1.speed0 + g2.speed0) / 2;
    groups.splice(groups.indexOf(g2), 1);
  }

  function checkCollisions() {
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const g1 = groups[i], g2 = groups[j];
        let collided = false;
        for (const h1 of g1.hexes) {
          for (const h2 of g2.hexes) {
            if (overlap(h1, h2)) {
              collided = true;
              if (Math.random() < 0.1) {
                connect(g1, g2, h1, h2);
                j--;
              } else {
                const vx = g1.vx, vy = g1.vy,
                      bvx = g1.baseVx, bvy = g1.baseVy,
                      s0 = g1.speed0;
                g1.vx = g2.vx; g1.vy = g2.vy;
                g1.baseVx = g2.baseVx; g1.baseVy = g2.baseVy;
                g1.speed0 = g2.speed0;
                g2.vx = vx; g2.vy = vy;
                g2.baseVx = bvx; g2.baseVy = bvy;
                g2.speed0 = s0;
              }
              break;
            }
          }
          if (collided) break;
        }
      }
    }
  }

  function update() {
    groups.forEach(g => {
      if (mouse.active) {
        g.hexes.forEach(h => {
          const dx = h.x + h.width / 2 - mouse.x;
          const dy = h.y + h.height / 2 - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100 && dist > 0) {
            const strength = (1 - dist / 100) * g.speed0;
            g.vx += (dx / dist) * strength;
            g.vy += (dy / dist) * strength;
          }
        });
      }

      const speed = Math.hypot(g.vx, g.vy);
      const max = g.speed0 * 3;
      if (speed > max) {
        const s = max / speed;
        g.vx *= s; g.vy *= s;
      }

      // drift back toward original motion
      g.vx = g.baseVx + (g.vx - g.baseVx) * DECAY;
      g.vy = g.baseVy + (g.vy - g.baseVy) * DECAY;

      g.hexes.forEach(h => {
        h.spin *= DECAY;
        h.angle += h.spin;
        h.x += g.vx;
        h.y += g.vy;
        if (h.x + h.width < 0) {
          h.x = window.innerWidth;
        } else if (h.x > window.innerWidth) {
          h.x = -h.width;
        }
        if (h.y < 0 || h.y + h.height > window.innerHeight) {
          g.vy *= -1; g.baseVy *= -1;
        }
        h.el.style.transform = `translate(${h.x}px, ${h.y}px) rotate(${h.angle}deg)`;
      });
    });
    checkCollisions();
    requestAnimationFrame(update);
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    });
    window.addEventListener('mouseout', () => { mouse.active = false; });
    for (let i = 0; i < NUM_HEX; i++) {
      const x = Math.random() * (window.innerWidth - WIDTH);
      const y = Math.random() * (window.innerHeight - HEIGHT);
      newGroup(x, y);
    }
    update();
  });
})();