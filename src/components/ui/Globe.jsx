import { useEffect, useMemo, useRef } from 'react';
import { LAND_B64, LAND_COLS, LAND_LAT_STEP, LAND_LON_STEP, LAND_ROWS } from '../../assets/globe-land';
import { useInView } from '../../hooks/useInView';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../utils/cn';

/**
 * Live-traffic globe.
 *
 * The USA sits on the left and India on the right. Everything inside the globe (land dots, grid lines,
 * cities, arcs) slowly rocks as one, about 3.4° each way every 8 seconds, around the globe's centre.
 * On top of that, every second or so a glowing comet flies along a curved arc from a city in one market
 * to a city in the other (either direction), with a pulse where it leaves and where it lands. A small
 * pill above the globe names the newest trip ("Mumbai → New York"). Dark and light themes each have
 * their own colours.
 *
 * Privacy rule from the design: cities only, never a person or an IP address. The component draws
 * whatever cities it is given (name, market, share) and never invents numbers. Cities it has no
 * coordinates for are skipped. It runs only while on screen and while the tab is visible, and it
 * shows a still frame with reduced motion.
 */

const COORDS = {
  Mumbai: [72.88, 19.08],
  Delhi: [77.1, 28.61],
  'Delhi NCR': [77.1, 28.61],
  Bengaluru: [77.59, 12.97],
  Pune: [73.86, 18.52],
  Hyderabad: [78.48, 17.38],
  Chennai: [80.27, 13.08],
  Kolkata: [88.36, 22.57],
  'New York': [-74.0, 40.71],
  SF: [-122.42, 37.77],
  'San Francisco': [-122.42, 37.77],
  Dallas: [-96.8, 32.78],
  Chicago: [-87.63, 41.88],
};

// Fixed camera. Longitude is squeezed to 2/3 so the USA and India both sit on the visible face.
const CENTER_LON = -14;
const TILT = (22 * Math.PI) / 180;
const SQUEEZE = 2 / 3;
const RADIUS = 0.44; // of the canvas width

// Trips: one starts about every 1.1 s, each flight takes 2.4 s, at most three at once.
const TRIP_SECONDS = 2.4;
const TRAIL = 0.42; // length of the comet tail, as a share of the arc
const MAX_TRIPS = 3;
// Slow roll of the whole globe: ±0.059 rad (3.4°) on an 8 second sine wave, as in the reference video.
const ROLL = 0.059;
const ROLL_SECONDS = 8;
const CAPTION_MIN_WIDTH = 300; // smaller globes (the hero card) leave the caption to the card

const rad = (deg) => (deg * Math.PI) / 180;
const clamp01 = (value) => Math.min(1, Math.max(0, value));
const easeInOut = (value) => -(Math.cos(Math.PI * value) - 1) / 2;
const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;

function project([lon, lat]) {
  const delta = rad(wrap(lon - CENTER_LON) * SQUEEZE);
  const phi = rad(lat);
  return {
    x: Math.cos(phi) * Math.sin(delta),
    y: Math.cos(TILT) * Math.sin(phi) - Math.sin(TILT) * Math.cos(phi) * Math.cos(delta),
    z: Math.sin(TILT) * Math.sin(phi) + Math.cos(TILT) * Math.cos(phi) * Math.cos(delta),
  };
}

function decodeLand() {
  const raw = atob(LAND_B64);
  const points = [];
  for (let index = 0; index < LAND_COLS * LAND_ROWS; index += 1) {
    if (raw.charCodeAt(index >> 3) & (1 << (index & 7))) {
      const row = Math.floor(index / LAND_COLS);
      const col = index % LAND_COLS;
      const lon = -178.5 + col * LAND_LON_STEP;
      const lat = 89 - row * LAND_LAT_STEP;
      const view = project([lon, lat]);
      if (view.z <= 0) continue;
      const inIndia = lon > 68 && lon < 98 && lat > 7 && lat < 36;
      const inUsa = lon > -125 && lon < -66 && lat > 25 && lat < 50;
      points.push({ x: view.x, y: view.y, z: view.z, tint: inIndia ? 1 : inUsa ? 2 : 0 });
    }
  }
  return points;
}

function readPalette(node) {
  const style = getComputedStyle(node);
  const channel = (name) => `rgb(${style.getPropertyValue(name).trim().split(/\s+/).join(',')})`;
  const light = document.documentElement.classList.contains('light');
  return light
    ? {
        light,
        sphereTop: '#FFFFFF',
        sphereMid: '#FAF7F0',
        sphereBottom: '#EBE4D2',
        rim: 'rgba(217,170,55,0.85)',
        glow: 'rgba(255,199,44,0.34)',
        land: 'rgb(172,167,153)',
        grid: 'rgba(110,100,80,0.16)',
        text: channel('--fg'),
        gold: '#DD9A12',
        blue: '#4A63B5',
        comet: '224,150,10',
        headCore: 'rgba(235,160,20,1)',
        headMid: 'rgba(224,150,10,0.65)',
        headEdge: 'rgba(224,150,10,0)',
      }
    : {
        light,
        sphereTop: channel('--ink-800'),
        sphereBottom: channel('--ink-950'),
        rim: 'rgba(255,199,44,0.45)',
        glow: 'rgba(255,199,44,0.28)',
        land: channel('--fg-subtle'),
        grid: 'rgba(255,199,44,0.10)',
        text: channel('--fg'),
        gold: '#FFC72C',
        blue: '#8FA3D6',
        comet: '255,205,70',
        headCore: 'rgba(255,246,200,1)',
        headMid: 'rgba(255,205,70,0.7)',
        headEdge: 'rgba(255,199,44,0)',
      };
}

/** Faint latitude / longitude lines, projected once (unit sphere coordinates). */
function buildGrid() {
  const lines = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const line = [];
    for (let lon = -180; lon <= 180; lon += 4) line.push(project([lon, lat]));
    lines.push(line);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const line = [];
    for (let lat = -88; lat <= 88; lat += 4) line.push(project([lon, lat]));
    lines.push(line);
  }
  return lines;
}

/** Quadratic arc between two screen points, bowing upwards like a flight path. */
function makeArc(a, b, center, radius) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  let nx = -dy / length;
  let ny = dx / length;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  let lift = length * 0.42;
  // Keep the control point near the sphere so tall arcs do not shoot off the top.
  const cx = mx + nx * lift;
  const cy = my + ny * lift;
  const over = Math.hypot(cx - center, cy - center) / (radius * 1.25);
  if (over > 1) lift /= over;
  return { a, b, c: { x: mx + nx * lift, y: my + ny * lift } };
}

function arcPoint(arc, t) {
  const u = 1 - t;
  return {
    x: u * u * arc.a.x + 2 * u * t * arc.c.x + t * t * arc.b.x,
    y: u * u * arc.a.y + 2 * u * t * arc.c.y + t * t * arc.b.y,
  };
}

function pickWeighted(list, avoid) {
  const pool = list.filter((city) => city !== avoid);
  const source = pool.length ? pool : list;
  const total = source.reduce((sum, city) => sum + Math.max(1, city.share), 0);
  let roll = Math.random() * total;
  for (const city of source) {
    roll -= Math.max(1, city.share);
    if (roll <= 0) return city;
  }
  return source[source.length - 1];
}

export function Globe({ cities = [], direction = 'usa-to-india', showLabels = true, className, label = 'Globe showing live visits between the USA and India' }) {
  const canvasRef = useRef(null);
  const captionRef = useRef(null);
  const captionTextRef = useRef(null);
  const [viewRef, inView] = useInView({ threshold: 0.05, once: false });
  const reduced = usePrefersReducedMotion();
  const land = useMemo(decodeLand, []);
  const grid = useMemo(buildGrid, []);
  const stateRef = useRef({ cities, direction, showLabels });
  stateRef.current = { cities, direction, showLabels };
  // Lets the effects below start, stop and repaint the animation loop that lives in the main effect.
  const controlRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const base = document.createElement('canvas'); // sphere + land dots, redrawn only when needed
    const baseCtx = base.getContext('2d');
    let palette = readPalette(canvas);
    let size = 0;
    let ratio = 1;
    let frame = 0;
    let running = false;
    let trips = [];
    let nextSpawn = 0;
    let lastPair = '';
    let captionText = '';
    let epoch = performance.now();

    const screen = (view) => [(size / 2) + view.x * size * RADIUS, (size / 2) - view.y * size * RADIUS];

    function paintBase() {
      if (!size) return;
      base.width = canvas.width;
      base.height = canvas.height;
      baseCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      baseCtx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const radius = size * RADIUS;

      const glow = baseCtx.createRadialGradient(cx, cx, radius * 0.97, cx, cx, radius * 1.2);
      glow.addColorStop(0, palette.glow);
      glow.addColorStop(1, 'rgba(255,199,44,0)');
      baseCtx.fillStyle = glow;
      baseCtx.beginPath();
      baseCtx.arc(cx, cx, radius * 1.2, 0, Math.PI * 2);
      baseCtx.fill();

      const body = baseCtx.createRadialGradient(cx - radius * 0.2, cx - radius * 0.3, radius * 0.05, cx, cx, radius);
      body.addColorStop(0, palette.sphereTop);
      if (palette.sphereMid) body.addColorStop(0.55, palette.sphereMid);
      body.addColorStop(1, palette.sphereBottom);
      baseCtx.fillStyle = body;
      baseCtx.beginPath();
      baseCtx.arc(cx, cx, radius, 0, Math.PI * 2);
      baseCtx.fill();
      baseCtx.strokeStyle = palette.rim;
      baseCtx.lineWidth = 1.2;
      baseCtx.stroke();
    }

    const themeObserver = new MutationObserver(() => {
      palette = readPalette(canvas);
      paintBase();
      if (!running) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const resize = () => {
      const width = canvas.clientWidth;
      if (!width) return;
      ratio = Math.min(2, window.devicePixelRatio || 1);
      size = width;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(width * ratio);
      if (captionRef.current) captionRef.current.style.display = width >= CAPTION_MIN_WIDTH ? '' : 'none';
      paintBase();
      if (!running) draw(performance.now());
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    /** Cities we can place, with their screen position. */
    function placeCities(list) {
      return list
        .map((city) => ({ ...city, coord: COORDS[city.name] }))
        .filter((city) => city.coord)
        .map((city) => {
          const view = project(city.coord);
          const [x, y] = screen(view);
          return { ...city, x, y, z: view.z };
        })
        .filter((city) => city.z > 0.03)
        .sort((a, b) => b.share - a.share);
    }

    function spawnTrip(now, placed, dir) {
      const india = placed.filter((city) => city.market === 'india');
      const usa = placed.filter((city) => city.market === 'usa');
      if (!india.length || !usa.length) return;
      // The chosen direction is the usual one; the other way still happens, as in the live product.
      const towardIndia = Math.random() < (dir === 'india-to-usa' ? 0.35 : 0.65);
      const from = pickWeighted(towardIndia ? usa : india);
      const to = pickWeighted(towardIndia ? india : usa);
      const pair = `${from.name}>${to.name}`;
      if (pair === lastPair && Math.random() < 0.8) return;
      lastPair = pair;
      trips.push({ from, to, arc: makeArc(from, to, size / 2, size * RADIUS), start: now });
      if (trips.length > MAX_TRIPS) trips.shift();
      captionText = `${from.name} → ${to.name}`;
      if (captionTextRef.current) captionTextRef.current.textContent = captionText;
    }

    function drawComet(trip, age) {
      const progress = clamp01(age / TRIP_SECONDS) * (1 + TRAIL);
      const head = easeInOut(clamp01(progress));
      const tail = easeInOut(clamp01(progress - TRAIL));
      const fadeOut = 1 - clamp01((progress - 1) / TRAIL) ** 2;
      const w = Math.max(1, size / 420);

      // Faint full path, so the route stays readable while the comet flies.
      ctx.strokeStyle = `rgba(${palette.comet},0.16)`;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(trip.arc.a.x, trip.arc.a.y);
      ctx.quadraticCurveTo(trip.arc.c.x, trip.arc.c.y, trip.arc.b.x, trip.arc.b.y);
      ctx.globalAlpha = fadeOut;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Tail: thin and transparent at the back, bright and thicker towards the head.
      const steps = 36;
      ctx.lineCap = 'round';
      for (let step = 0; step < steps; step += 1) {
        const t0 = tail + ((head - tail) * step) / steps;
        const t1 = tail + ((head - tail) * (step + 1)) / steps;
        const k = (step + 1) / steps;
        const p0 = arcPoint(trip.arc, t0);
        const p1 = arcPoint(trip.arc, t1);
        ctx.strokeStyle = `rgba(${palette.comet},${(0.95 * k ** 1.7 * fadeOut).toFixed(3)})`;
        ctx.lineWidth = (0.6 + 2.2 * k) * w;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      // Head: a soft glow with a bright core, until it lands.
      if (progress < 1 + TRAIL * 0.35) {
        const p = arcPoint(trip.arc, head);
        const r = 13 * w;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        glow.addColorStop(0, palette.headCore);
        glow.addColorStop(0.3, palette.headMid);
        glow.addColorStop(1, palette.headEdge);
        ctx.fillStyle = glow;
        ctx.globalAlpha = fadeOut;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    function drawPulse(x, y, color, q) {
      if (q <= 0 || q >= 1) return;
      const w = Math.max(1, size / 420);
      ctx.strokeStyle = color;
      ctx.globalAlpha = (1 - q) * 0.85;
      ctx.lineWidth = 1.4 * w;
      ctx.beginPath();
      ctx.arc(x, y, (6 + q * 20) * w, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function drawMarkers(placed, labelAll, cosT, sinT) {
      const w = Math.max(0.7, size / 420);
      const half = size / 2;
      const fontSize = Math.max(9, Math.round(size / 33));
      ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      const taken = [];
      const leaders = new Set(['india', 'usa'].map((market) => placed.find((city) => city.market === market)).filter(Boolean));

      placed.forEach((city) => {
        // Position after the globe's slow roll; the marker and its text stay upright.
        const dx = city.x - half;
        const dy = city.y - half;
        const x = half + dx * cosT - dy * sinT;
        const y = half + dx * sinT + dy * cosT;
        const isUsa = city.market === 'usa';
        const colour = isUsa ? palette.blue : palette.gold;
        ctx.globalAlpha = Math.min(1, city.z * 2.5);
        // outer halo ring, then a thick hollow ring
        ctx.strokeStyle = colour;
        ctx.lineWidth = 1 * w;
        ctx.globalAlpha *= 0.4;
        ctx.beginPath();
        ctx.arc(x, y, 9.5 * w, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = Math.min(1, city.z * 2.5);
        ctx.lineWidth = 2.3 * w;
        ctx.beginPath();
        ctx.arc(x, y, (isUsa ? 4.6 : 5.4) * w, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Labels: USA to the right of the marker, India to the left. An overlapped label is dimmed, not dropped.
        if (!stateRef.current.showLabels || !(labelAll || leaders.has(city))) return;
        const text = `${city.name}  ${city.share}%`;
        const width = ctx.measureText(text).width;
        const gap = 11 * w;
        const left = isUsa ? x + gap : x - gap - width;
        const box = { l: left - 2, r: left + width + 2, t: y - fontSize * 0.7, b: y + fontSize * 0.7 };
        if (box.l < 2 || box.r > size - 2) return;
        const overlapped = taken.some((other) => box.l < other.r && box.r > other.l && box.t < other.b && box.b > other.t);
        if (!overlapped) taken.push(box);
        ctx.globalAlpha = overlapped ? 0.4 : 1;
        ctx.fillStyle = palette.text;
        ctx.textAlign = 'left';
        ctx.fillText(text, left, y);
        ctx.globalAlpha = 1;
      });
    }

    /** Land dots and grid lines, rotated by the current roll. */
    function drawSurface(cosT, sinT) {
      const half = size / 2;
      const scale = size * RADIUS;
      const place = (p) => {
        const dx = p.x * scale;
        const dy = -p.y * scale;
        return [half + dx * cosT - dy * sinT, half + dx * sinT + dy * cosT];
      };

      ctx.lineWidth = Math.max(0.7, size / 520);
      ctx.strokeStyle = palette.grid;
      ctx.beginPath();
      grid.forEach((line) => {
        let pen = false;
        line.forEach((p) => {
          if (p.z <= 0) {
            pen = false;
            return;
          }
          const [sx, sy] = place(p);
          if (pen) ctx.lineTo(sx, sy);
          else ctx.moveTo(sx, sy);
          pen = true;
        });
      });
      ctx.stroke();

      const dot = Math.max(1.3, size / 185);
      for (let index = 0; index < land.length; index += 1) {
        const p = land[index];
        const [sx, sy] = place(p);
        ctx.globalAlpha = p.tint ? 0.45 + 0.5 * p.z : 0.2 + 0.55 * p.z;
        ctx.fillStyle = p.tint === 1 ? palette.gold : p.tint === 2 ? palette.blue : palette.land;
        ctx.fillRect(sx - dot / 2, sy - dot / 2, dot, dot);
      }
      ctx.globalAlpha = 1;
    }

    function draw(now) {
      if (!size) return;
      const { cities: list, direction: dir } = stateRef.current;
      const placed = placeCities(list);
      const center = size / 2;
      const radius = size * RADIUS;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Slow roll of everything inside the globe (none with reduced motion).
      const theta = reduced ? 0 : ROLL * Math.sin((2 * Math.PI * (now - epoch)) / (ROLL_SECONDS * 1000));
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      drawSurface(cosT, sinT);

      // Trips (arcs, comets and pulses are drawn in the rolled frame, so they stay attached to the cities)
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(theta);
      ctx.translate(-center, -center);
      if (reduced) {
        // Still frame: the two busiest routes, fully drawn, no motion.
        const india = placed.filter((city) => city.market === 'india');
        const usa = placed.filter((city) => city.market === 'usa');
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius * 0.995, 0, Math.PI * 2);
        ctx.clip();
        for (let index = 0; index < Math.min(2, india.length, usa.length); index += 1) {
          const arc = makeArc(usa[index], india[index], center, radius);
          ctx.strokeStyle = index === 0 ? 'rgba(255,199,44,0.85)' : 'rgba(255,199,44,0.4)';
          ctx.lineWidth = Math.max(1.2, size / 300);
          ctx.beginPath();
          ctx.moveTo(arc.a.x, arc.a.y);
          ctx.quadraticCurveTo(arc.c.x, arc.c.y, arc.b.x, arc.b.y);
          ctx.stroke();
        }
        ctx.restore();
        if (india[0] && usa[0] && captionTextRef.current) {
          captionTextRef.current.textContent = dir === 'india-to-usa' ? `${india[0].name} → ${usa[0].name}` : `${usa[0].name} → ${india[0].name}`;
          if (captionRef.current) captionRef.current.style.opacity = '1';
        }
      } else {
        if (now >= nextSpawn) {
          spawnTrip(now, placed, dir);
          nextSpawn = now + 900 + Math.random() * 500;
        }
        trips = trips.filter((trip) => (now - trip.start) / 1000 < TRIP_SECONDS);
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius * 0.995, 0, Math.PI * 2);
        ctx.clip();
        trips.forEach((trip) => drawComet(trip, (now - trip.start) / 1000));
        ctx.restore();

        // Pulses where a trip leaves and where it lands.
        trips.forEach((trip) => {
          const age = (now - trip.start) / 1000;
          const landing = TRIP_SECONDS / (1 + TRAIL);
          drawPulse(trip.from.x, trip.from.y, trip.from.market === 'usa' ? palette.blue : palette.gold, age / 0.9);
          drawPulse(trip.to.x, trip.to.y, trip.to.market === 'usa' ? palette.blue : palette.gold, (age - landing) / 0.8);
        });

        // Caption pill: fades in with the newest trip and out as it ends.
        const newest = trips[trips.length - 1];
        if (captionRef.current) {
          const age = newest ? (now - newest.start) / 1000 : TRIP_SECONDS;
          const opacity = clamp01(age / 0.25) * (1 - clamp01((age - (TRIP_SECONDS - 0.7)) / 0.7));
          captionRef.current.style.opacity = opacity.toFixed(2);
        }
      }

      ctx.restore();
      drawMarkers(placed, size >= CAPTION_MIN_WIDTH, cosT, sinT);
    }

    const loop = (now) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    const begin = () => {
      if (running || reduced) return;
      running = true;
      epoch = performance.now();
      trips = [];
      nextSpawn = performance.now() + 150;
      frame = requestAnimationFrame(loop);
    };
    const halt = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const visible = { current: false };
    const onVisibility = () => (document.hidden ? halt() : visible.current && begin());
    controlRef.current = {
      sync(isVisible) {
        visible.current = isVisible;
        if (isVisible && !document.hidden) begin();
        else halt();
      },
      redraw() {
        if (!running) draw(performance.now());
      },
    };
    document.addEventListener('visibilitychange', onVisibility);
    resize();
    draw(performance.now());

    return () => {
      halt();
      controlRef.current = null;
      themeObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [land, grid, reduced]);

  // Start and stop with visibility: nothing runs off screen.
  useEffect(() => {
    controlRef.current?.sync(inView);
  }, [inView, reduced, land]);

  // Repaint a still frame when the data changes while the loop is paused (reduced motion or off screen).
  useEffect(() => {
    controlRef.current?.redraw();
  }, [cities, direction, showLabels]);

  return (
    <div ref={viewRef} className={cn('relative', className)}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="block aspect-square w-full" />
      {/* Names the newest trip. Updated straight on the element so the page never re-renders for it. */}
      <span
        ref={captionRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute left-1/2 top-[1.5%] inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-gold/40 bg-ink-900/75 px-3.5 py-1.5 text-[12px] font-semibold text-fg backdrop-blur-sm"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-coral" />
        <span ref={captionTextRef} />
      </span>
    </div>
  );
}