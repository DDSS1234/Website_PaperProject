// Floating cellulose-like hexagons
(function(){
  const SIDE = 15; // side length of hexagon
  const WIDTH = SIDE * 2;
  const HEIGHT = Math.sqrt(3) * SIDE;
  const NUM_HEX = 75;
  const DECAY = 0.95; // rate at which extra motion/rotation fades
  const groups = [];
  const mouse = { x: 0, y: 0, active: false };

  function createHex(x, y) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', WIDTH);
    svg.setAttribute('height', HEIGHT);
    svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    const poly = document.createElementNS(svgNS, 'polygon');
    const points = [
      [SIDE / 2, 0],
      [1.5 * SIDE, 0],
      [2 * SIDE, HEIGHT / 2],
      [1.5 * SIDE, HEIGHT],
      [SIDE / 2, HEIGHT],
      [0, HEIGHT / 2]
    ].map(p => p.join(',')).join(' ');
    poly.setAttribute('points', points);
    poly.setAttribute('stroke', '#2a2a2a');
    poly.setAttribute('stroke-width', '1');
    poly.setAttribute('fill', 'none');
    poly.setAttribute('opacity', '0.2');
    svg.appendChild(poly);
    svg.style.position = 'absolute';
    svg.style.transformOrigin = 'center';
    svg.style.transform = `translate(${x}px, ${y}px)`;
    return { el: svg, x, y, width: WIDTH, height: HEIGHT, angle: 0, spin: 0 };
  }

  function newGroup(x, y) {
    const hex = createHex(x, y);
    document.getElementById('molecule-container').appendChild(hex.el);
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
        if (h.x < 0 || h.x + h.width > window.innerWidth) {
          g.vx *= -1; g.baseVx *= -1;
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