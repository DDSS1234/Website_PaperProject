// Floating cellulose-like hexagons
(function(){
  const SIDE = 15; // side length of hexagon
  const WIDTH = SIDE * 2;
  const HEIGHT = Math.sqrt(3) * SIDE;
  const NUM_HEX = 75;
  const groups = [];

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
    svg.style.transform = `translate(${x}px, ${y}px)`;
    return { el: svg, x, y, width: WIDTH, height: HEIGHT };
  }

  function newGroup(x, y) {
    const hex = createHex(x, y);
    document.getElementById('molecule-container').appendChild(hex.el);
    const group = {
      hexes: [hex],
      vx: (Math.random() * 0.4 - 0.2),
      vy: (Math.random() * 0.4 - 0.2)
    };
    groups.push(group);
  }

  function overlap(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
  }

  function connect(g1, g2, h1, h2) {
    const dx = (h2.x + h2.width / 2) - (h1.x + h1.width / 2);
    const dy = (h2.y + h2.height / 2) - (h1.y + h1.height / 2);
    let shiftX = 0, shiftY = 0;
    if (Math.abs(dx) > Math.abs(dy)) {
      shiftX = dx > 0 ? h1.width : -h1.width;
    } else {
      shiftY = dy > 0 ? h1.height : -h1.height;
    }
    const offX = h1.x + shiftX - h2.x;
    const offY = h1.y + shiftY - h2.y;
    g2.hexes.forEach(h => { h.x += offX; h.y += offY; });
    g1.hexes = g1.hexes.concat(g2.hexes);
    g1.vx = (g1.vx + g2.vx) / 2;
    g1.vy = (g1.vy + g2.vy) / 2;
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
                const vx = g1.vx, vy = g1.vy;
                g1.vx = g2.vx; g1.vy = g2.vy;
                g2.vx = vx; g2.vy = vy;
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
      g.hexes.forEach(h => {
        h.x += g.vx;
        h.y += g.vy;
        if (h.x < 0 || h.x + h.width > window.innerWidth) g.vx *= -1;
        if (h.y < 0 || h.y + h.height > window.innerHeight) g.vy *= -1;
        h.el.style.transform = `translate(${h.x}px, ${h.y}px)`;
      });
    });
    checkCollisions();
    requestAnimationFrame(update);
  }

  document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < NUM_HEX; i++) {
      const x = Math.random() * (window.innerWidth - WIDTH);
      const y = Math.random() * (window.innerHeight - HEIGHT);
      newGroup(x, y);
    }
    update();
  });
})();
