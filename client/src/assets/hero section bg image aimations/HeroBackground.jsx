// HeroBackground.jsx - AgriMart hero section-க்கான உயிருள்ள background
// Files (same folder): HeroBackground.jsx, hero-bg.webp
// Use: hero section (position:relative) உள்ளே முதல் child ஆக <HeroBackground />, மற்ற content-க்கு position:relative; z-index:1
import { useEffect, useRef, useState } from "react";
import heroImg from "./hero-bg.webp";

/* AgriMart hero: ஒரே படம் + realistic motion (WebGL shader). காற்றில் புல்/இலை, மேகம், ஒளிக்கதிர், மேக நிழல், மகரந்தத் துகள், பறவைகள், mouse parallax */
const HERO_FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_tex; uniform float u_t, u_ca, u_fx; uniform vec2 u_m;
varying vec2 v_uv;
const float IA = 2.852;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ return noise(p) * 0.55 + noise(p * 2.1 + 7.3) * 0.3 + noise(p * 4.3 + 3.1) * 0.15; }
float ell(vec2 p, vec2 c, vec2 r){ return 1.0 - smoothstep(0.7, 1.0, length((p - c) / r)); }
float ell2(vec2 p, vec2 c, vec2 r){ return 1.0 - smoothstep(1.0, 1.4, length((p - c) / r)); }
float green(vec3 c){ return clamp((c.g - max(c.r, c.b) * 0.92 - 0.02) * 5.0, 0.0, 1.0); }
void main(){
  float t = u_t;
  float fw = u_ca / IA;                                           // object-fit: cover
  vec2 uv = fw < 1.0 ? vec2((1.0 - fw) * u_fx + v_uv.x * fw, v_uv.y) : vec2(v_uv.x, 0.5 + (v_uv.y - 0.5) / fw);
  float sc = 1.0 + 0.022 * (0.5 + 0.5 * sin(t * 0.08)) + 0.035 * exp(-t * 0.5);   // மெதுவான camera zoom + intro settle
  uv = (uv - 0.5) / sc + 0.5;

  vec3 c0 = texture2D(u_tex, uv).rgb;
  float g = green(c0);
  float solid = max(max(ell(uv, vec2(0.70, 0.47), vec2(0.095, 0.30)), ell(uv, vec2(0.65, 0.78), vec2(0.11, 0.17))), ell(uv, vec2(0.87, 0.55), vec2(0.10, 0.22)));
  float wind = (sin(uv.x * 7.0 + t * 1.5 + uv.y * 2.0) * 0.6 + sin(uv.x * 17.0 - t * 2.3 + uv.y * 5.0) * 0.4) * (0.65 + 0.35 * sin(t * 0.5 + uv.x * 3.0));
  vec2 d = vec2(0.0);

  float grass = smoothstep(0.58, 0.80, uv.y) * g * (1.0 - solid);            // முன்புறப் புல்
  d += vec2(wind * 0.0050, sin(uv.x * 11.0 + t * 1.9) * 0.0012) * grass * (0.5 + uv.y);
  float tl = (1.0 - smoothstep(0.10, 0.20, uv.x)) * (1.0 - smoothstep(0.30, 0.40, uv.y)) * g;   // மேல்-இடது இலைகள்
  float sway = sin(t * 1.15 + uv.y * 6.0) * 0.7 + sin(t * 2.3 + uv.x * 9.0) * 0.3;
  d += vec2(sway * 0.008, sin(t * 1.3 + uv.x * 5.0) * 0.004) * tl * (uv.x * 4.0 + uv.y * 2.0 + 0.2);
  float bl = (1.0 - smoothstep(0.12, 0.22, uv.x)) * smoothstep(0.50, 0.62, uv.y) * g;         // கீழ்-இடது இலைகள்
  d += vec2(sin(t * 1.0 + uv.y * 5.0) * 0.007, sin(t * 1.7 + uv.x * 8.0) * 0.004) * bl * (1.4 - uv.y);
  float rt = smoothstep(0.86, 0.93, uv.x) * (1.0 - smoothstep(0.45, 0.62, uv.y)) * g * (1.0 - solid);   // வலது மரங்கள்
  d += vec2(wind * 0.0045, sin(t * 1.4 + uv.y * 8.0) * 0.002) * rt;
  float body = ell(uv, vec2(0.70, 0.52), vec2(0.085, 0.22));                                   // விவசாயி மூச்சு
  d.y += -sin(t * 1.6) * 0.0013 * body * (1.0 - (uv.y - 0.30) * 1.2);
  float sky = (1.0 - smoothstep(0.29, 0.38, uv.y)) * (1.0 - ell2(uv, vec2(0.70, 0.42), vec2(0.09, 0.28)));   // மேகம்
  d.x += (sin(t * 0.13) * 0.014 + (fbm(vec2(uv.x * 3.0 + t * 0.02, uv.y * 5.0)) - 0.5) * 0.006) * sky;
  d.y += (fbm(vec2(uv.x * 3.0 - t * 0.015, uv.y * 6.0 + 4.0)) - 0.5) * 0.004 * sky;
  float depth = max(smoothstep(0.30, 1.0, uv.y) * 0.6, max(tl, bl * 1.2));                       // mouse parallax
  d -= u_m * vec2(0.008, 0.004) * depth;

  vec3 col = texture2D(u_tex, clamp(uv + d, 0.001, 0.999)).rgb;

  float n = fbm(vec2(uv.x * 2.4 - t * 0.035, uv.y * 3.2));                                     // நகரும் மேக நிழல்
  col *= 1.0 - 0.14 * smoothstep(0.52, 0.78, n) * smoothstep(0.36, 0.52, uv.y);
  col *= 1.0 + 0.025 * sin(t * 0.4);
  vec2 sp = uv - vec2(0.03, 0.30); sp.x *= IA;                                                 // சூரிய ஒளி + கதிர்கள்
  float dist = length(sp), ang = atan(sp.y, sp.x);
  float glow = exp(-dist * dist * 1.1) * (0.85 + 0.15 * sin(t * 0.55));
  float rays = pow(0.5 + 0.5 * sin(ang * 11.0 + t * 0.12 + sin(ang * 5.0 + t * 0.07) * 1.5), 3.0) * exp(-dist * 0.9);
  col += vec3(1.0, 0.86, 0.58) * (glow * 0.20 + rays * 0.10);
  for (int i = 0; i < 12; i++) {                                                               // மிதக்கும் மகரந்தத் துகள்
    float s = float(i);
    float h1 = hash(vec2(s, 1.7)), h2 = hash(vec2(s, 9.3)), h3 = hash(vec2(s, 4.1));
    vec2 p = vec2(fract(h1 + t * (0.004 + 0.006 * h3) + sin(t * 0.4 + s) * 0.01), fract(h2 - t * (0.006 + 0.006 * h1)));
    vec2 q = uv - p; q.x *= IA;
    float r = 0.0035 + 0.004 * h3;
    float tw = 0.5 + 0.5 * sin(t * (1.0 + h2 * 2.0) + s * 3.0);
    float vis = smoothstep(0.30, 0.55, p.y) * (1.0 - smoothstep(0.85, 1.0, p.y)) * smoothstep(0.0, 0.06, p.x) * (1.0 - smoothstep(0.94, 1.0, p.x));
    col += vec3(1.0, 0.95, 0.75) * exp(-dot(q, q) / (r * r)) * 0.30 * tw * vis;
  }
  gl_FragColor = vec4(col, 1.0);
}`;
const HERO_VS = `attribute vec2 a_p; varying vec2 v_uv; void main(){ v_uv = vec2(a_p.x * 0.5 + 0.5, 0.5 - a_p.y * 0.5); gl_Position = vec4(a_p, 0.0, 1.0); }`;

function drawBirds(ctx, w, h, T, dpr) {
  ctx.clearRect(0, 0, w, h); ctx.strokeStyle = "rgba(40,45,50,.65)"; ctx.lineCap = "round"; ctx.lineWidth = 1.5 * dpr;
  for (let i = 0; i < 4; i++) {
    const ph = (T * (0.012 + i * 0.003) + i * 0.31) % 1;
    const x = w * (1.08 - ph * 1.25), y = h * (0.10 + 0.045 * i + 0.015 * Math.sin(T * 0.6 + i * 2));
    const s = (5 + i * 1.2) * dpr * Math.max(0.7, w / (1440 * dpr)), f = Math.sin(T * (6.5 + i * 0.7) + i * 1.7);
    ctx.beginPath(); ctx.moveTo(x - s, y - f * s * 0.7);
    ctx.quadraticCurveTo(x - s * 0.4, y - f * s * 0.2 - s * 0.35, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - f * s * 0.2 - s * 0.35, x + s, y - f * s * 0.7); ctx.stroke();
  }
}

function startHeroBg(canvas, birdCanvas, src, { focus = 0.6, reduced = false, onReady } = {}) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; };
  const vs = sh(gl.VERTEX_SHADER, HERO_VS), fs = sh(gl.FRAGMENT_SHADER, HERO_FS);
  if (!vs || !fs) return null;
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(pr, "a_p"); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const U = (k) => gl.getUniformLocation(pr, k), bctx = birdCanvas.getContext("2d");
  gl.uniform1f(U("u_fx"), focus);
  let dpr = 1, q = 1;                                   // q: தரம் (மெதுவான device-ல் தானாகக் குறையும்)
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(1.25 * q, 1400 / Math.max(1, r.width));   // render அளவு அதிகபட்சம் ~1400px
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    canvas.width = birdCanvas.width = w; canvas.height = birdCanvas.height = h;
    gl.viewport(0, 0, w, h); gl.uniform1f(U("u_ca"), w / h);
  };
  fit(); const ro = new ResizeObserver(() => { fit(); if (reduced) draw(0); }); ro.observe(canvas);
  let raf = 0, dead = false, vis = true, t0 = 0, mx = 0, my = 0, tx = 0, ty = 0, ema = 16, lastT = 0, n = 0;
  const onMove = (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; };
  addEventListener("pointermove", onMove);
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }); io.observe(canvas);
  const draw = (t) => {
    if (!t0) t0 = t; const T = reduced ? 8 : (t - t0) / 1000;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    gl.uniform1f(U("u_t"), T); gl.uniform2f(U("u_m"), mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reduced) drawBirds(bctx, canvas.width, canvas.height, T, dpr);
  };
  const loop = (t) => {
    if (dead) return;
    if (vis) {
      if (lastT) ema = ema * 0.9 + (t - lastT) * 0.1;
      draw(t); n++;
      if (n > 40 && ema > 34) {                          // மெதுவாக இருந்தால் தரத்தைக் குறை
        if (q > 0.55) { q *= 0.75; fit(); n = 0; ema = 16; }
        else if (ema > 80) { dead = true; canvas.style.display = birdCanvas.style.display = "none"; return; }   // மிக மெதுவு: static படம்
      }
    }
    lastT = vis ? t : 0; raf = requestAnimationFrame(loop);
  };
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    if (reduced) draw(0); else raf = requestAnimationFrame(loop);
    onReady && onReady();
  };
  img.src = src;
  return () => { dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener("pointermove", onMove); };
}

const css = `
.hb{position:absolute;inset:0;overflow:hidden;z-index:0}
.hb img,.hb canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.hb img{object-fit:cover}
.hb canvas{transition:opacity 1s ease}
.hb-birds{pointer-events:none}
`;

export default function HeroBackground({ focus = 0.6, className = "", style }) {
  const gl = useRef(null), bd = useRef(null);
  const [ready, setReady] = useState(false), [fallback, setFallback] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stop = startHeroBg(gl.current, bd.current, heroImg, { focus, reduced, onReady: () => setReady(true) });
    if (!stop) setFallback(true);
    return () => stop && stop();
  }, [focus]);
  return (
    <div className={`hb ${className}`} style={style} aria-hidden="true">
      <style>{css}</style>
      <img src={heroImg} alt="" style={{ objectPosition: `${focus * 100}% 50%` }} />
      {!fallback && (<>
        <canvas ref={gl} style={{ opacity: ready ? 1 : 0 }} />
        <canvas ref={bd} className="hb-birds" />
      </>)}
    </div>
  );
}
