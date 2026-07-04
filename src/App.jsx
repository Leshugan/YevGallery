import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { registerPlugin, Capacitor } from "@capacitor/core";
const Apps = registerPlugin("Apps");

/* ===== YevGallery — leshugan.yg ===== палитра/стиль YevFiles (шоколад) */

const BG = "var(--bg)", BAR = "var(--bar)", ROW2 = "var(--row2)", ACC = "var(--acc)";
const RED = "var(--red)", TXT = "var(--txt)", SUB = "var(--sub)", LINE = "var(--line)";
const THEMES = {
  dark:  { "--bg": "#1C140C", "--bar": "#2A2017", "--barA": "rgba(36,27,19,.78)", "--row2": "#2E251C", "--btn": "rgba(255,255,255,.06)", "--acc": "#EF6C00", "--accbg": "rgba(239,108,0,.18)", "--gold": "#F5A623", "--red": "#E05252", "--txt": "#F2EAE0", "--ink": "#E0D5C8", "--sub": "#B0A498", "--line": "#4A3A2A" },
  light: { "--bg": "#EEF1F4", "--bar": "#FFFFFF", "--barA": "rgba(255,255,255,.82)", "--row2": "#E4E8EC", "--btn": "#E4E8EC", "--acc": "#2F80ED", "--accbg": "rgba(47,128,237,.14)", "--gold": "#2F80ED", "--red": "#D14343", "--txt": "#1E2329", "--ink": "#3D4754", "--sub": "#6B7280", "--line": "#D3D8DE" },
};
const THEMEKEY = "yg_theme_v1", TRASHMETA = "yg_trashmeta_v1", SPECKEY = "yg_specials_v1", GRIDKEY = "yg_grid_v1";
const ls = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const loadMap = (k) => { try { return JSON.parse(ls.get(k)) || {}; } catch { return {}; } };
const saveMap = (k, m) => ls.set(k, JSON.stringify(m));
const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };
const baseName = (p) => { p = String(p).replace(/^file:\/\//, ""); return p.includes("/") ? p.slice(p.lastIndexOf("/") + 1) : p; };
const parentOf = (p) => { p = String(p).replace(/^file:\/\//, ""); return p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : ""; };
const VID_EXT = new Set(["mp4", "mkv", "avi", "mov", "webm", "3gp", "m4v", "ts"]);
const isVidName = (n) => VID_EXT.has((n.split(".").pop() || "").toLowerCase());
const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const monthLabel = (ms) => { const d = new Date(ms); return MONTHS[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : ""); };
const fmtDate = (ms) => { try { return new Date(ms).toLocaleString("ru-RU"); } catch { return ""; } };
const fmtDur = (ms) => { if (!ms) return ""; const t = Math.round(ms / 1000), m = Math.floor(t / 60), ss = t % 60; return m + ":" + (ss < 10 ? "0" : "") + ss; };
const fmtSize = (b) => { if (b == null) return ""; const u = ["Б", "КБ", "МБ", "ГБ"]; let i = 0, n = b; while (n >= 1024 && i < 3) { n /= 1024; i++; } return n.toFixed(i ? 1 : 0) + " " + u[i]; };
const groupByMonth = (items) => { const g = []; let cur = null; for (const m of items) { const k = new Date(m.mtime); const key = k.getFullYear() + "-" + k.getMonth(); if (!cur || cur.key !== key) { cur = { key, label: monthLabel(m.mtime), items: [] }; g.push(cur); } cur.items.push(m); } return g; };

const I = {
  back: <path d="M15 18l-6-6 6-6" />,
  x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  check: <path d="M5 12l4 4 10-11" />,
  trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  img: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  video: <><rect x="2" y="5" width="14" height="14" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></>,
  play: <><circle cx="12" cy="12" r="10" /><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" /></>,
  albums: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  grid: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" /><path d="M9.9 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.2 3.9M6.2 6.2A16 16 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3.1-.5" /></>,
  wall: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M3 13l5-4 4 3 3-2 6 4" /><circle cx="16" cy="8.5" r="1.4" /><path d="M9 21h6M12 17v4" /></>,
  restore: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" /></>,
  sun: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>,
  moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>,
  selectAll: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  stack: <><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7 21h12a2 2 0 0 0 2-2V9" /><circle cx="8" cy="8" r="1.6" /><path d="M3 14l3.5-3.5L11 15" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5h.01" /></>,
  gsize: <><rect x="4" y="4" width="7" height="11" rx="1.4" /><rect x="13" y="4" width="7" height="6.5" rx="1.4" /><rect x="13" y="12.5" width="7" height="7.5" rx="1.4" /><rect x="4" y="17" width="7" height="3" rx="1.2" /></>,
  gclassic: <>
    <rect x="4" y="4" width="4.4" height="4.4" rx=".9" /><rect x="9.8" y="4" width="4.4" height="4.4" rx=".9" /><rect x="15.6" y="4" width="4.4" height="4.4" rx=".9" />
    <rect x="4" y="9.8" width="4.4" height="4.4" rx=".9" /><rect x="9.8" y="9.8" width="4.4" height="4.4" rx=".9" /><rect x="15.6" y="9.8" width="4.4" height="4.4" rx=".9" />
    <rect x="4" y="15.6" width="4.4" height="4.4" rx=".9" /><rect x="9.8" y="15.6" width="4.4" height="4.4" rx=".9" /><rect x="15.6" y="15.6" width="4.4" height="4.4" rx=".9" />
  </>,
  chevR: <path d="M9 6l6 6-6 6" />,
};
const Svg = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

/* ===== ленивые превью с кэшем и ограничением параллелизма ===== */
const tq = []; let tActive = 0; const T_MAX = 6;
const tPump = () => { while (tActive < T_MAX && tq.length) { const j = tq.shift(); tActive++; j().finally(() => { tActive--; tPump(); }); } };
const tEnqueue = (j) => { tq.push(j); tPump(); };
const thumbCache = new Map();
const thumbAR = new Map();
function Empty({ icon, text }) { return <div style={{ minHeight: "62vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--sub)", gap: 12 }}><Svg d={icon} size={54} /><span style={{ fontSize: 14 }}>{text}</span></div>; }
const convFile = (p) => { try { return Capacitor.convertFileSrc(p && p.startsWith("file://") ? p : "file://" + p); } catch { return p; } };
const cacheThumb = (k, v) => { thumbCache.set(k, v); if (thumbCache.size > 500) { const first = thumbCache.keys().next().value; thumbCache.delete(first); } };
const clampAR = (r) => { const n = Number(r); return (isFinite(n) && n > 0) ? Math.min(Math.max(n, 0.45), 2.4) : 1; };

function Thumb({ item, video, square }) {
  const u = item.uri;
  const tp = item.thumb ? convFile(item.thumb) : "";
  const [dataUrl, setDataUrl] = useState("");
  const [ratio, setRatio] = useState(() => (square ? 1 : clampAR((item.w && item.h) ? item.w / item.h : (thumbAR.get(u) || 1))));
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = dataUrl || tp;
  const onLoad = (e) => { setLoaded(true); const w = e.target.naturalWidth, h = e.target.naturalHeight; if (w && h) { const r = clampAR(w / h); thumbAR.set(u, r); if (!square && !item.w) setRatio(r); } };
  // файла превью ещё нет (не прогрет) — генерим через мост и показываем результат
  const onErr = () => { if (dataUrl || broken) return; Apps.thumb({ uri: u }).then((r) => { if (r && r.thumb) { setDataUrl(r.thumb); if (r.w && r.h) { const rr = clampAR(r.w / r.h); thumbAR.set(u, rr); if (!square) setRatio(rr); } } else setBroken(true); }).catch(() => setBroken(true)); };
  useEffect(() => { if (item.thumb || dataUrl || broken) return; let live = true; Apps.thumb({ uri: u }).then((r) => { if (!live) return; if (r && r.thumb) { setDataUrl(r.thumb); if (r.w && r.h && !square) { const rr = clampAR(r.w / r.h); thumbAR.set(u, rr); setRatio(rr); } } else setBroken(true); }).catch(() => { if (live) setBroken(true); }); return () => { live = false; }; }, [item.thumb]);
  return (
    <div style={{ width: "100%", aspectRatio: square ? "1" : String(clampAR(ratio)), background: ROW2, borderRadius: "inherit", overflow: "hidden", position: "relative" }}>
      {src && !broken && <img src={src} alt="" loading="lazy" decoding="async" draggable={false} onLoad={onLoad} onError={onErr} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", WebkitUserDrag: "none", userSelect: "none", opacity: loaded ? 1 : 0, transition: "opacity .25s ease" }} />}
      {broken && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: SUB }}><Svg d={video ? I.video : I.img} size={30} /></div>}
      {video && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ display: "flex", color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,.7))" }}><Svg d={I.play} size={34} /></span></div>}
      {video && item.dur ? <span style={{ position: "absolute", right: 5, bottom: 5, background: "rgba(0,0,0,.6)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 6, pointerEvents: "none" }}>{fmtDur(item.dur)}</span> : null}
    </div>
  );
}

/* ===== классификация спец-альбомов ===== */
function classify(p, n) {
  p = (p || "").toLowerCase(); n = n || "";
  if (p.includes("whatsapp") && p.includes("image")) return { key: "whatsapp", name: "WhatsApp" };
  if (p.includes("telegram")) return { key: "telegram", name: "Telegram" };
  if (n.toLowerCase() === "screenshots" || p.includes("/screenshots")) return { key: "screenshots", name: "Скриншоты" };
  if (p.includes("/dcim/camera") || n === "Camera") return { key: "camera", name: "Камера" };
  if (n === "Pictures") return { key: "pictures", name: "Pictures" };
  return null;
}
const SPEC_ORDER = ["screenshots", "camera", "pictures", "whatsapp", "telegram"]; // [0] = правый нижний угол
const SPEC_NAME = { screenshots: "Скриншоты", camera: "Камера", pictures: "Pictures", whatsapp: "WhatsApp", telegram: "Telegram" };

function buildAlbums(items, mode) {
  const isHidden = mode === "hidden";
  const isVideo = mode === "video";
  const map = new Map();
  for (const it of items) {
    const sp = isHidden ? null : classify(it.bucketPath, it.bucketName);
    const key = sp ? sp.key : it.bucketPath;
    const name = sp ? sp.name : (it.bucketName || baseName(it.bucketPath));
    let a = map.get(key);
    if (!a) { a = { key, name, special: !!sp, paths: new Set(), items: [] }; map.set(key, a); }
    a.paths.add(it.bucketPath); a.items.push(it);
  }
  for (const a of map.values()) a.items.sort((x, y) => y.mtime - x.mtime);
  if (isHidden) return [...map.values()].sort((x, y) => x.items[0].mtime - y.items[0].mtime);
  const seen = isVideo ? {} : loadMap(SPECKEY);
  if (!isVideo) { for (const k of SPEC_ORDER) { const a = map.get(k); if (a) seen[k] = [...a.paths]; } saveMap(SPECKEY, seen); }
  const others = [...map.values()].filter((a) => !a.special).sort((x, y) => x.items[0].mtime - y.items[0].mtime);
  const specials = [];
  for (const k of SPEC_ORDER) {
    let a = map.get(k);
    if (!a && !isVideo && seen[k] && seen[k].length) a = { key: k, name: SPEC_NAME[k], special: true, paths: new Set(seen[k]), items: [] };
    if (a) specials.push(a);
  }
  return [...specials, ...others];
}

// привязка к правому нижнему углу
function brCells(seq, cols) {
  const rows = Math.max(1, Math.ceil(seq.length / cols));
  const total = rows * cols;
  const cells = new Array(total).fill(null);
  for (let i = 0; i < seq.length; i++) cells[total - 1 - i] = seq[i];
  return cells;
}

function Editor({ item, onClose, onSaved }) {
  const [rot, setRot] = useState(0);
  const [br, setBr] = useState(1), [co, setCo] = useState(1), [sa, setSa] = useState(1);
  const [tool, setTool] = useState("adjust");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [cropR, setCropR] = useState(null);
  const baseRef = useRef(null), viewRef = useRef(null), scaleRef = useRef(1);
  const strokes = useRef([]), draw = useRef(null), cdrag = useRef(null);
  const [penC, setPenC] = useState("#FF3B30"), [penW, setPenW] = useState(6);
  const filter = "brightness(" + br + ") contrast(" + co + ") saturate(" + sa + ")";

  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      const maxS = 1600, w = im.naturalWidth, h = im.naturalHeight, sc = Math.min(1, maxS / Math.max(w, h));
      const bw = Math.round(w * sc), bh = Math.round(h * sc), rotated = rot % 180 !== 0;
      const c = document.createElement("canvas"); c.width = rotated ? bh : bw; c.height = rotated ? bw : bh;
      const ctx = c.getContext("2d"); ctx.translate(c.width / 2, c.height / 2); ctx.rotate(rot * Math.PI / 180); ctx.drawImage(im, -bw / 2, -bh / 2, bw, bh);
      baseRef.current = c; setCropR(null); strokes.current = strokes.current; setReady(true); setTick((t) => t + 1);
    };
    im.onerror = () => onClose();
    im.src = convFile(item.uri);
  }, [item.uri, rot]);

  useEffect(() => {
    const base = baseRef.current, v = viewRef.current; if (!base || !v || !v.parentElement) return;
    const wrap = v.parentElement, maxW = wrap.clientWidth, maxH = wrap.clientHeight;
    const sc = Math.min(maxW / base.width, maxH / base.height), vw = Math.round(base.width * sc), vh = Math.round(base.height * sc);
    v.width = vw; v.height = vh; v.style.width = vw + "px"; v.style.height = vh + "px"; scaleRef.current = base.width / vw;
    const ctx = v.getContext("2d"); ctx.clearRect(0, 0, vw, vh); ctx.filter = filter; ctx.drawImage(base, 0, 0, vw, vh); ctx.filter = "none";
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const st of strokes.current) { ctx.strokeStyle = st.c; ctx.lineWidth = st.w; ctx.beginPath(); st.p.forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)); ctx.stroke(); }
  }, [ready, tick, br, co, sa]);

  const pos = (e) => { const r = viewRef.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; };
  const down = (e) => {
    if (tool === "draw") { draw.current = { c: penC, w: penW, p: [pos(e)] }; strokes.current.push(draw.current); setTick((t) => t + 1); }
    else if (tool === "crop") { const p = pos(e); cdrag.current = p; setCropR({ x: p.x, y: p.y, w: 0, h: 0 }); }
  };
  const move = (e) => {
    if (tool === "draw" && draw.current) { e.preventDefault(); draw.current.p.push(pos(e)); setTick((t) => t + 1); }
    else if (tool === "crop" && cdrag.current) { e.preventDefault(); const p = pos(e), s = cdrag.current; setCropR({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }); }
  };
  const up = () => { draw.current = null; cdrag.current = null; };

  const save = async () => {
    if (saving) return; setSaving(true);
    const base = baseRef.current, cr = cropR && cropR.w > 8 && cropR.h > 8 ? cropR : null, sc = scaleRef.current;
    const cx = cr ? Math.round(cr.x * sc) : 0, cy = cr ? Math.round(cr.y * sc) : 0, cw = cr ? Math.round(cr.w * sc) : base.width, ch = cr ? Math.round(cr.h * sc) : base.height;
    const out = document.createElement("canvas"); out.width = cw; out.height = ch; const ctx = out.getContext("2d");
    ctx.filter = filter; ctx.drawImage(base, cx, cy, cw, ch, 0, 0, cw, ch); ctx.filter = "none";
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const st of strokes.current) { ctx.strokeStyle = st.c; ctx.lineWidth = st.w * sc; ctx.beginPath(); st.p.forEach((pt, i) => { const x = pt.x * sc - cx, y = pt.y * sc - cy; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
    const b64 = out.toDataURL("image/jpeg", 0.92).split(",")[1];
    const path = item.uri.replace("file://", ""), dir = path.substring(0, path.lastIndexOf("/")), nm = (item.name || "IMG").replace(/\.[^.]+$/, "") + "_edit.jpg";
    try { const r = await Apps.writeFile({ path: dir + "/" + nm, data: b64 }); onSaved(r && r.uri); } catch (e) { setSaving(false); }
  };

  const sld = (label, val, set, min, max) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
      <span style={{ width: 96, color: "#ccc", fontSize: 13 }}>{label}</span>
      <input type="range" min={min} max={max} step="0.01" value={val} onChange={(e) => set(parseFloat(e.target.value))} style={{ flex: 1 }} />
    </div>
  );
  const tabBtn = (id, lbl) => <button onClick={() => setTool(id)} style={{ flex: 1, background: tool === id ? "rgba(255,255,255,.15)" : "transparent", border: "none", color: tool === id ? "#fff" : "#aaa", fontSize: 13, fontWeight: 600, padding: "10px 0", borderRadius: 8 }}>{lbl}</button>;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1800, background: "#000", display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", display: "flex" }}><Svg d={I.x} size={24} /></button>
        <span style={{ flex: 1 }} />
        <button onClick={save} disabled={saving} style={{ background: ACC, border: "none", color: "#fff", borderRadius: 20, padding: "8px 20px", fontSize: 14, fontWeight: 700 }}>{saving ? "…" : "Сохранить"}</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 8 }}>
        <div style={{ position: "relative" }}>
          <canvas ref={viewRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} style={{ touchAction: "none", display: "block" }} />
          {tool === "crop" && cropR && cropR.w > 4 && <div style={{ position: "absolute", left: cropR.x, top: cropR.y, width: cropR.w, height: cropR.h, border: "2px solid #fff", boxShadow: "0 0 0 9999px rgba(0,0,0,.45)", pointerEvents: "none" }} />}
        </div>
      </div>
      <div style={{ padding: "8px 16px 4px" }}>
        {tool === "adjust" && (<>{sld("Яркость", br, setBr, 0.3, 2)}{sld("Контраст", co, setCo, 0.3, 2)}{sld("Насыщенность", sa, setSa, 0, 2)}</>)}
        {tool === "crop" && <div style={{ color: "#aaa", fontSize: 13, padding: "10px 0", textAlign: "center" }}>Выделите область для обрезки. Пусто — без обрезки.</div>}
        {tool === "draw" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
            {["#FF3B30", "#FFCC00", "#34C759", "#0A84FF", "#FFFFFF", "#000000"].map((c) => <span key={c} onClick={() => setPenC(c)} style={{ width: 26, height: 26, borderRadius: 13, background: c, border: penC === c ? "3px solid #fff" : "1px solid #555" }} />)}
            <input type="range" min="2" max="24" step="1" value={penW} onChange={(e) => setPenW(parseInt(e.target.value))} style={{ flex: 1 }} />
            <button onClick={() => { strokes.current = []; setTick((t) => t + 1); }} style={{ background: "none", border: "1px solid #555", color: "#ccc", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>Стереть</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, padding: "4px 12px 8px", alignItems: "center" }}>
        <button onClick={() => setRot((r) => (r + 90) % 360)} style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#fff", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>Повернуть</button>
        {tabBtn("adjust", "Фильтры")}{tabBtn("crop", "Обрезка")}{tabBtn("draw", "Кисть")}
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => ls.get(THEMEKEY) || "dark");
  const T = THEMES[theme] || THEMES.dark;
  const [allFiles, setAllFiles] = useState(true);
  const [root, setRoot] = useState("/storage/emulated/0");
  const TRASH = root + "/Android/data/leshugan.yg/files/.trash";

  const [media, setMedia] = useState([]);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHidden, setLoadingHidden] = useState(false);

  const [section, setSection] = useState("albums");
  const [albumKey, setAlbumKey] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [bar, setBar] = useState(true);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const [selMode, setSelMode] = useState(null);
  const [sel, setSel] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null);
  const [gridMode, setGridMode] = useState(() => ls.get(GRIDKEY) || "size");
  const [gridMenu, setGridMenu] = useState(false);
  const [info, setInfo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [hideTop, setHideTop] = useState(false);
  const [progress, setProgress] = useState(null);
  const [scrub, setScrub] = useState({ frac: 0, show: false, drag: false });
  useEffect(() => { setHideTop(false); lastY.current = 0; }, [albumKey, section]);
  const scrubHide = useRef(null);
  const lastY = useRef(0);
  const onScroll = (e) => {
    const el = e.target, y = el.scrollTop, dy = y - lastY.current, max = el.scrollHeight - el.clientHeight;
    if (y < 60) setHideTop(false); else if (dy > 6) setHideTop(true); else if (dy < -6) setHideTop(false);
    lastY.current = y;
    setScrub((sc) => ({ ...sc, frac: max > 0 ? y / max : 0, show: true }));
    clearTimeout(scrubHide.current); scrubHide.current = setTimeout(() => setScrub((sc) => sc.drag ? sc : { ...sc, show: false }), 1200);
  };
  const scrubTo = (clientY) => { const el = scrollRef.current; if (!el) return; const r = el.getBoundingClientRect(), top = r.top + 70, bot = r.bottom - 90; let fr = (clientY - top) / (bot - top); fr = Math.max(0, Math.min(1, fr)); el.scrollTop = fr * (el.scrollHeight - el.clientHeight); };

  const cfs = (u) => { try { return Capacitor.convertFileSrc(u); } catch { return u; } };
  const scrollRef = useRef(null);
  const vTouch = useRef(null);
  const lastScan = useRef(0);
  const mediaSig = useRef("");
  const pending = useRef(0);
  const hiddenLoaded = useRef(false);
  const dedup = (arr) => { const seen = new Set(); const out = []; for (const x of arr) { if (!seen.has(x.uri)) { seen.add(x.uri); out.push(x); } } return out; };

  const photosOnly = useMemo(() => media.filter((m) => !m.video), [media]);
  const videosOnly = useMemo(() => media.filter((m) => m.video), [media]);
  const albums = useMemo(() => buildAlbums(photosOnly, false), [photosOnly]);
  const videoAlbums = useMemo(() => buildAlbums(videosOnly, "video"), [videosOnly]);
  const hiddenAlbums = useMemo(() => buildAlbums(hiddenItems, "hidden"), [hiddenItems]);
  const allPhotos = useMemo(() => [...photosOnly].sort((a, b) => b.mtime - a.mtime), [photosOnly]);
  const albumPool = section === "hidden" ? hiddenAlbums : section === "video" ? videoAlbums : albums;
  const curItems = albumKey ? (albumPool.find((a) => a.key === albumKey) || { items: [] }).items : section === "all" ? allPhotos : section === "trash" ? trashItems : [];
  const album = albumKey ? albumPool.find((a) => a.key === albumKey) : null;

  /* ---- доступ + сканирование (с кэшем, без слепого пересканирования) ---- */
  const checkAccess = useCallback(async () => { try { const r = await Apps.hasAllFiles(); setAllFiles(!!r.granted); return !!r.granted; } catch { setAllFiles(true); return true; } }, []);
  const persistCache = (key, data) => { try { Apps.cacheSet({ key, data: JSON.stringify(data) }).catch(() => {}); } catch {} };
  const scan = useCallback(async (bg) => {
    if (bg && pending.current > 0) return; // не сканируем во время файловых операций
    if (!bg) setLoading(true);
    try {
      const r = await Apps.scanMedia({ mode: "visible" });
      if (r.root) setRoot(r.root);
      const items = dedup(r.items || []);
      const sig = items.length + ":" + items.reduce((a, m) => a + (m.mtime || 0), 0);
      if (sig !== mediaSig.current) { mediaSig.current = sig; setMedia(items); persistCache("media", { items, root: r.root || root }); }
      lastScan.current = Date.now();
    } catch {}
    setLoading(false);
  }, [root]);
  const scanHidden = useCallback(async (bg) => {
    if (bg && pending.current > 0) return;
    if (!bg) setLoadingHidden(true);
    try {
      const r = await Apps.scanMedia({ mode: "hidden" });
      const items = dedup(r.items || []);
      setHiddenItems(items);
      hiddenLoaded.current = true;
      persistCache("hidden", { items });
    } catch {}
    setLoadingHidden(false);
  }, []);
  const loadTrash = useCallback(async () => {
    const meta = loadMap(TRASHMETA);
    try {
      const r = await Apps.list({ uri: "file://" + TRASH });
      const files = (r.files || []).map((f) => { const m = meta[baseName(f.uri)]; return { ...f, name: m ? m.name : f.name }; });
      files.sort((a, b) => b.mtime - a.mtime);
      setTrashItems(files);
    } catch { setTrashItems([]); }
  }, [TRASH]);

  // первый запуск: показываем кэш мгновенно, досканируем в фоне
  useEffect(() => { (async () => {
    await checkAccess();
    let had = false;
    try { const c = await Apps.cacheGet({ key: "media" }); if (c && c.data) { const j = JSON.parse(c.data); if (j.root) setRoot(j.root); setMedia(dedup(j.items || [])); setLoading(false); had = !!(j.items && j.items.length); } } catch {}
    await scan(had);
  })(); }, []);
  // дисковый кэш после локальных изменений (с задержкой, вне основного потока)
  useEffect(() => { const id = setTimeout(() => persistCache("media", { items: media, root }), 800); return () => clearTimeout(id); }, [media, root]);
  useEffect(() => { if (!hiddenLoaded.current) return; const id = setTimeout(() => persistCache("hidden", { items: hiddenItems }), 800); return () => clearTimeout(id); }, [hiddenItems]);
  useEffect(() => { Apps.setBars({ color: T["--bg"], light: theme === "light" }).catch(() => {}); ls.set(THEMEKEY, theme); }, [theme]);
  useEffect(() => { ls.set(GRIDKEY, gridMode); }, [gridMode]);
  useEffect(() => { let sub; try { sub = Apps.addListener("mediaChanged", () => scan(true)); } catch {} return () => { if (sub) sub.then((x) => x.remove()).catch(() => {}); }; }, [scan]);
  // прогрев скрытых в фоне ПОСЛЕ загрузки основных (чтобы вход в «Скрытые» был мгновенным)
  useEffect(() => { if (loading || hiddenLoaded.current) return; const id = setTimeout(() => scanHidden(true), 1500); return () => clearTimeout(id); }, [loading, scanHidden]);
  useEffect(() => { if (!album || !album.items.length) return; const uris = [...new Set([...album.items.map((m) => m.uri), ...media.map((m) => m.uri)])]; const id = setTimeout(() => Apps.warmThumbs({ uris }).catch(() => {}), 100); return () => clearTimeout(id); }, [albumKey]);
  const warmed = useRef(false);
  useEffect(() => {
    if (loading || warmed.current || !media.length) return;
    warmed.current = true;
    const covers = albums.map((a) => a.items[0] && a.items[0].uri).filter(Boolean);
    const rest = [...media].sort((a, b) => b.mtime - a.mtime).map((m) => m.uri);
    const uris = [...new Set([...covers, ...rest])];
    const id = setTimeout(() => { Apps.warmThumbs({ uris }).catch(() => {}); }, 600);
    return () => clearTimeout(id);
  }, [loading, media, albums]);
  // возврат в приложение: фоновое обновление, без экрана загрузки и не чаще раза в 20с
  useEffect(() => {
    const sub = CapApp.addListener("appStateChange", ({ isActive }) => { if (isActive) checkAccess().then((ok) => { if (ok && Date.now() - lastScan.current > 20000) { scan(true); if (hiddenLoaded.current) scanHidden(true); } }); });
    return () => { sub.then((s) => s.remove()).catch(() => {}); };
  }, [checkAccess, scan, scanHidden]);

  useEffect(() => { if (albumKey && !album) setAlbumKey(null); }, [albumKey, album]);

  useLayoutEffect(() => {
    const el = scrollRef.current; if (!el) return;
    if (!albumKey && (section === "albums" || section === "hidden")) el.scrollTop = el.scrollHeight;
  }, [section, albumKey, albums, hiddenAlbums, media]);

  const navRef = useRef({});
  navRef.current = { confirm: !!confirm, viewer: !!viewer, selMode, albumKey, section };
  useEffect(() => {
    const sub = CapApp.addListener("backButton", () => {
      setTimeout(() => {
        const st = navRef.current;
        if (st.confirm) { setConfirm(null); return; }
        if (st.viewer) { setViewer(null); return; }
        if (st.selMode) { exitSel(); return; }
        if (st.albumKey) { setAlbumKey(null); return; }
        if (st.section !== "albums") { setSection("albums"); return; }
        CapApp.exitApp();
      }, 0);
    });
    return () => { sub.then((s) => s.remove()).catch(() => {}); };
  }, []);

  /* ---- выделение ---- */
  const exitSel = () => { setSelMode(null); setSel(new Set()); };
  const toggleSel = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const startSel = (mode, id) => { buzz(15); setGridMenu(false); setConfirm(null); setInfo(null); setSelMode(mode); setSel(new Set([id])); };

  /* ---- локальные мутации (без пересканирования) ---- */
  const removeUris = (uris) => { setMedia((ms) => ms.filter((m) => !uris.has(m.uri))); setHiddenItems((hs) => hs.filter((m) => !uris.has(m.uri))); };
  const runJobs = (jobs) => { if (!jobs.length) return; pending.current += jobs.length; (async () => { for (const fn of jobs) { try { await fn(); } catch {} finally { pending.current = Math.max(0, pending.current - 1); } } })(); };

  // выполнение пачки с прогрессом (для больших операций)
  const runProgress = async (jobs, label) => {
    if (!jobs.length) return;
    const total = jobs.length; const show = total > 5;
    if (show) setProgress({ done: 0, total, label });
    pending.current += total;
    for (let i = 0; i < total; i++) { try { await jobs[i](); } catch {} pending.current = Math.max(0, pending.current - 1); if (show) setProgress({ done: i + 1, total, label }); }
    setProgress(null);
  };

  const moveToTrash = (items) => {
    const meta = loadMap(TRASHMETA); const newT = []; const uris = new Set(); const jobs = [];
    for (const it of items) {
      const tname = Date.now() + "_" + Math.random().toString(36).slice(2, 7) + "__" + baseName(it.uri);
      const to = "file://" + TRASH + "/" + tname;
      meta[tname] = { orig: it.uri, name: baseName(it.uri), mtime: it.mtime };
      newT.push({ uri: to, name: baseName(it.uri), mtime: it.mtime, video: !!it.video });
      uris.add(it.uri); jobs.push(() => Apps.move({ from: it.uri, to }));
    }
    saveMap(TRASHMETA, meta);
    removeUris(uris); setTrashItems((ts) => [...newT, ...ts]); // мгновенно
    runProgress(jobs, "Удаление");
  };
  // восстановление: ждём move (обрабатываем коллизии имён по факту)
  const restoreTrash = async (items) => {
    const meta = loadMap(TRASHMETA);
    const tasks = items.map((it) => ({ it, m: meta[baseName(it.uri)] })).filter((x) => x.m);
    const rm = new Set(tasks.map((x) => x.it.uri));
    setTrashItems((ts) => ts.filter((t) => !rm.has(t.uri)));
    const total = tasks.length; const show = total > 5; if (show) setProgress({ done: 0, total, label: "Восстановление" });
    pending.current += total; const back = [];
    for (let i = 0; i < total; i++) {
      const { it, m } = tasks[i];
      try { const r = await Apps.move({ from: it.uri, to: m.orig }); const uri = (r && r.uri) || m.orig; const pp = parentOf(uri); back.push({ uri, name: baseName(uri), mtime: m.mtime || Date.now(), size: it.size, video: isVidName(uri), bucketPath: pp, bucketName: baseName(pp) }); } catch {}
      delete meta[baseName(it.uri)]; pending.current = Math.max(0, pending.current - 1);
      if (show) setProgress({ done: i + 1, total, label: "Восстановление" });
    }
    saveMap(TRASHMETA, meta);
    if (back.length) setMedia((ms) => dedup([...back, ...ms]));
    setProgress(null);
  };
  const deleteForever = (items) => {
    const meta = loadMap(TRASHMETA); const done = new Set(); const jobs = [];
    for (const it of items) { delete meta[baseName(it.uri)]; done.add(it.uri); jobs.push(() => Apps.delete({ uri: it.uri })); }
    saveMap(TRASHMETA, meta);
    setTrashItems((ts) => ts.filter((t) => !done.has(t.uri))); // мгновенно
    runProgress(jobs, "Удаление");
  };

  /* ---- подтверждение (инлайн, рядом с кнопкой удалить) + действия ---- */
  const ask = (text, onYes, el) => { const rect = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null; setConfirm({ text, rect, onYes: async () => { setConfirm(null); await onYes(); } }); };
  const photoPool = () => album ? album.items : section === "all" ? allPhotos : section === "video" ? videosOnly : section === "trash" ? trashItems : [];
  const selPhotos = () => { const map = new Map(); for (const m of media) map.set(m.uri, m); for (const m of hiddenItems) map.set(m.uri, m); for (const m of trashItems) map.set(m.uri, m); return [...sel].map((u) => map.get(u)).filter(Boolean); };

  const doDeletePhotos = (e) => { const items = selPhotos(); if (!items.length) return; ask(items.length > 1 ? "Удалить " + items.length + "?" : "Удалить файл?", () => { exitSel(); moveToTrash(items); }, e && e.currentTarget); };
  const doSharePhotos = () => { const items = selPhotos(); if (items[0]) Apps.share({ uri: items[0].uri, mime: items[0].video ? "video/*" : "image/*" }).catch(() => {}); exitSel(); };
  const doRestore = () => { const items = trashItems.filter((m) => sel.has(m.uri)); exitSel(); restoreTrash(items); };
  const doDeleteForever = (e) => { let items = trashItems.filter((m) => sel.has(m.uri)); if (!items.length) items = selPhotos(); if (!items.length) return; ask("Удалить навсегда?", () => { exitSel(); deleteForever(items); }, e && e.currentTarget); };
  const doHideAlbums = () => {
    const list = albums.filter((a) => sel.has(a.key)); exitSel();
    const uris = new Set(); const moved = []; const jobs = [];
    for (const a of list) { for (const p of a.paths) jobs.push(() => Apps.setNomedia({ path: "file://" + p, on: true })); for (const it of a.items) { uris.add(it.uri); moved.push(it); } }
    setMedia((ms) => ms.filter((m) => !uris.has(m.uri))); setHiddenItems((hs) => dedup([...moved, ...hs])); runJobs(jobs);
  };
  const doShowAlbums = () => {
    const list = hiddenAlbums.filter((a) => sel.has(a.key)); exitSel();
    const uris = new Set(); const moved = []; const jobs = [];
    for (const a of list) { for (const p of a.paths) jobs.push(() => Apps.setNomedia({ path: "file://" + p, on: false })); for (const it of a.items) { uris.add(it.uri); moved.push(it); } }
    setHiddenItems((hs) => hs.filter((m) => !uris.has(m.uri))); setMedia((ms) => dedup([...moved, ...ms])); runJobs(jobs);
  };
  const doDeleteAlbums = (e) => {
    const pool = albumPool;
    const list = pool.filter((a) => sel.has(a.key)); if (!list.length) return;
    let all = []; for (const a of list) all = all.concat(a.items);
    ask("Удалить альбомы в корзину?", () => { exitSel(); moveToTrash(all); }, e && e.currentTarget);
  };

  /* ---- вьювер ---- */
  const vFrom = useRef(null);
  const openViewer = (items, idx, trash, rect) => { vFrom.current = rect || null; setGridMenu(false); setConfirm(null); setViewer({ items, idx, trash: !!trash }); setBar(false); setDragX(0); };
  const viewerGo = (d) => setViewer((v) => { if (!v) return v; const ni = v.idx + d; if (ni < 0 || ni >= v.items.length) return v; return { ...v, idx: ni }; });
  const vCur = viewer && viewer.items[viewer.idx];
  const removeFromViewer = () => setViewer((v) => { const items = v.items.filter((_, i) => i !== v.idx); if (!items.length) return null; return { ...v, items, idx: Math.min(v.idx, items.length - 1) }; });
  const viewerDeleteOne = (e) => { if (!vCur) return; const cur = vCur, isTrash = viewer.trash; ask("Удалить файл?", () => { removeFromViewer(); if (isTrash) deleteForever([cur]); else moveToTrash([cur]); }, e && e.currentTarget); };
  const viewerRestoreOne = () => { if (!vCur) return; const cur = vCur; removeFromViewer(); restoreTrash([cur]); };

  // ---- жесты вьювера: пинч-зум, пан, свайп-навигация, свайп-вниз для закрытия ----
  const stageRef = useRef(null), vbgRef = useRef(null);
  const gz = useRef({ scale: 1, tx: 0, ty: 0, dragX: 0, dragY: 0, mode: "none", pts: new Map(), lastTap: 0, sx: 0, sy: 0, st0: 0, bTx: 0, bTy: 0, sScale: 1, sDist: 0, sMidX: 0, sMidY: 0 });
  useEffect(() => { const g = gz.current; g.scale = 1; g.tx = 0; g.ty = 0; g.dragX = 0; g.dragY = 0; g.mode = "none"; g.pts.clear(); if (stageRef.current) { stageRef.current.style.transition = "none"; stageRef.current.style.transform = ""; } if (vbgRef.current) vbgRef.current.style.opacity = "1"; }, [vCur && vCur.uri]);
  useEffect(() => {
    if (!viewer || !vFrom.current) return;
    const el = vbgRef.current; if (!el) { vFrom.current = null; return; }
    const r = vFrom.current, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const s = Math.max(r.width / window.innerWidth, r.height / window.innerHeight);
    el.style.transformOrigin = cx + "px " + cy + "px";
    el.style.transition = "none"; el.style.transform = "scale(" + s + ")"; el.style.opacity = "0";
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = "transform .26s ease, opacity .22s ease"; el.style.transform = "none"; el.style.opacity = "1"; }));
    vFrom.current = null;
  }, [viewer]);
  const vApply = (anim) => { const g = gz.current, st = stageRef.current; if (st) { st.style.transition = anim ? "transform .22s ease" : "none"; st.style.transform = "translate(" + (g.tx + g.dragX) + "px," + (g.ty + g.dragY) + "px) scale(" + g.scale + ")"; } if (vbgRef.current) vbgRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(g.dragY) / 600)); };
  const vDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const vClampPan = () => { const g = gz.current, w = window.innerWidth, h = window.innerHeight, mx = (g.scale - 1) * w / 2, my = (g.scale - 1) * h / 2; g.tx = Math.max(-mx, Math.min(mx, g.tx)); g.ty = Math.max(-my, Math.min(my, g.ty)); };
  const vCloseAnim = () => { const st = stageRef.current; if (st) { st.style.transition = "transform .2s ease"; st.style.transform = "translateY(" + window.innerHeight + "px)"; } if (vbgRef.current) { vbgRef.current.style.transition = "opacity .2s"; vbgRef.current.style.opacity = "0"; } setTimeout(() => setViewer(null), 185); };
  const vToggleZoom = (x, y) => { const g = gz.current; if (g.scale > 1) { g.scale = 1; g.tx = 0; g.ty = 0; } else { g.scale = 2.6; g.tx = (window.innerWidth / 2 - x) * (g.scale - 1); g.ty = (window.innerHeight / 2 - y) * (g.scale - 1); vClampPan(); } g.mode = g.scale > 1 ? "pan" : "none"; vApply(true); };
  const vStart = (e) => { const g = gz.current; for (const t of e.changedTouches) g.pts.set(t.identifier, { x: t.clientX, y: t.clientY }); if (g.pts.size >= 2) { const [a, b] = [...g.pts.values()]; g.mode = "pinch"; g.sDist = vDist(a, b) || 1; g.sScale = g.scale; g.sMidX = (a.x + b.x) / 2; g.sMidY = (a.y + b.y) / 2; g.bTx = g.tx; g.bTy = g.ty; } else { const t = e.changedTouches[0]; g.sx = t.clientX; g.sy = t.clientY; g.st0 = Date.now(); g.dragX = 0; g.dragY = 0; g.bTx = g.tx; g.bTy = g.ty; g.mode = g.scale > 1 ? "pan" : "undecided"; } };
  const vMove = (e) => { e.preventDefault(); const g = gz.current; for (const t of e.changedTouches) if (g.pts.has(t.identifier)) g.pts.set(t.identifier, { x: t.clientX, y: t.clientY }); if (g.mode === "pinch" && g.pts.size >= 2) { const [a, b] = [...g.pts.values()]; g.scale = Math.max(1, Math.min(4, g.sScale * vDist(a, b) / g.sDist)); g.tx = g.bTx + ((a.x + b.x) / 2 - g.sMidX); g.ty = g.bTy + ((a.y + b.y) / 2 - g.sMidY); vApply(false); return; } const t = e.changedTouches[0]; const dx = t.clientX - g.sx, dy = t.clientY - g.sy; if (g.mode === "pan") { g.tx = g.bTx + dx; g.ty = g.bTy + dy; vApply(false); return; } if (g.mode === "undecided" && Math.hypot(dx, dy) > 8) g.mode = (Math.abs(dy) > Math.abs(dx) && dy > 0) ? "close" : "nav"; if (g.mode === "nav") { g.dragX = dx; vApply(false); } else if (g.mode === "close") { g.dragY = Math.max(0, dy); g.dragX = dx * 0.25; vApply(false); } };
  const vEnd = (e) => { const g = gz.current; for (const t of e.changedTouches) g.pts.delete(t.identifier); if (g.mode === "pinch") { if (g.scale <= 1.02) { g.scale = 1; g.tx = 0; g.ty = 0; } else vClampPan(); vApply(true); if (g.pts.size === 1) { const t = [...g.pts.values()][0]; g.sx = t.x; g.sy = t.y; g.bTx = g.tx; g.bTy = g.ty; g.mode = "pan"; } else if (g.pts.size === 0) g.mode = g.scale > 1 ? "pan" : "none"; return; } if (g.pts.size > 0) return; const dt = Date.now() - g.st0; if (g.mode === "undecided") { const now = Date.now(); if (now - g.lastTap < 280) { g.lastTap = 0; vToggleZoom(g.sx, g.sy); } else { g.lastTap = now; setBar((b) => !b); } g.mode = "none"; return; } if (g.mode === "close") { if (g.dragY > 110) { vCloseAnim(); } else { g.dragY = 0; g.dragX = 0; vApply(true); } g.mode = "none"; return; } if (g.mode === "nav") { const TH = Math.min(60, window.innerWidth * 0.12), flick = dt < 260 && Math.abs(g.dragX) > 30; let moved = false; if ((g.dragX < -TH || (flick && g.dragX < 0)) && viewer.idx < viewer.items.length - 1) { moved = true; viewerGo(1); } else if ((g.dragX > TH || (flick && g.dragX > 0)) && viewer.idx > 0) { moved = true; viewerGo(-1); } g.dragX = 0; if (!moved) vApply(true); g.mode = "none"; return; } if (g.mode === "pan") { vClampPan(); vApply(true); g.mode = g.scale > 1 ? "pan" : "none"; } };

  /* ---- секции ---- */
  const goSection = (s, e) => {
    if (s === "trash") loadTrash();
    exitSel(); setAlbumKey(null); setSection(s); setGridMenu(false); setConfirm(null); setInfo(null);
  };
  const selBytes = () => { if (selMode === "album") { let n = 0; for (const a of albumPool) if (sel.has(a.key)) for (const it of a.items) n += it.size || 0; return n; } return selPhotos().reduce((n, m) => n + (m.size || 0), 0); };
  const selectAllCur = () => { if (selMode === "album") setSel(new Set(albumPool.map((a) => a.key))); else setSel(new Set(photoPool().map((m) => m.uri))); };
  const emptyTrashAsk = (el) => { if (!trashItems.length) return; ask("Очистить корзину?", () => { deleteForever(trashItems); }, el); };
  const enterHidden = () => {
    buzz(20); exitSel(); setAlbumKey(null); setSection("hidden");
    (async () => {
      if (!hiddenLoaded.current) {
        try { const c = await Apps.cacheGet({ key: "hidden" }); if (c && c.data) { const j = JSON.parse(c.data); setHiddenItems(dedup(j.items || [])); hiddenLoaded.current = true; } } catch {}
      }
      scanHidden(hiddenLoaded.current);
    })();
  };

  /* ================= РЕНДЕР ================= */
  const headerTitle = album ? album.name : section === "albums" ? "Альбомы" : section === "all" ? "Все" : section === "video" ? "Видео" : section === "trash" ? "Корзина" : "Скрытые";
  const SECS = [
    { id: "trash", icon: I.trash, label: "Корзина" },
    { id: "video", icon: I.video, label: "Видео" },
    { id: "all", icon: I.stack, label: "Все" },
    { id: "albums", icon: I.albums, label: "Альбомы" },
  ];
  const showNav = !selMode && !album && section !== "hidden";

  return (
    <div style={{ ...T, position: "fixed", inset: 0, background: BG, color: TXT, fontFamily: "system-ui, Roboto, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`html,body{margin:0;background:${T["--bg"]}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none}img{-webkit-user-drag:none;user-drag:none}`}</style>

      {/* ===== header (оверлей поверх фото, полупрозрачный) ===== */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, paddingTop: "env(safe-area-inset-top)", transform: hideTop ? "translateY(-130%)" : "translateY(0)", transition: "transform .25s ease" }}>
        <div style={{ height: 50, margin: "8px 8px 6px", borderRadius: 25, background: "var(--barA)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid " + LINE, display: "flex", alignItems: "center", gap: 6, padding: "0 8px 0 16px", boxShadow: "0 4px 16px -6px rgba(0,0,0,.4)" }}>
          {selMode ? (
            <>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{sel.size}{sel.size ? " · " + fmtSize(selBytes()) : ""}</span>
              <button onClick={exitSel} style={btnIcon}><Svg d={I.x} size={22} /></button>
            </>
          ) : (
            <>
              {(album || section === "hidden") && <button onClick={() => { if (album) setAlbumKey(null); else setSection("albums"); }} style={{ ...btnIcon, marginLeft: -8, background: "transparent" }}><Svg d={I.back} size={23} /></button>}
              <span style={{ flex: 1, fontSize: 17, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{headerTitle}</span>
              {(album || section === "all" || section === "trash") && (
                <button onClick={() => setGridMode((m) => (m === "size" ? "classic" : "size"))} style={btnIconBg}><Svg d={gridMode === "classic" ? I.gclassic : I.gsize} size={21} /></button>
              )}
              <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} style={btnIconBg}><Svg d={theme === "dark" ? I.sun : I.moon} size={21} /></button>
            </>
          )}
        </div>
      </div>

      {!allFiles && (
        <div style={{ position: "absolute", inset: 0, zIndex: 40, background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
          <span style={{ display: "flex", color: ACC, marginBottom: 20 }}><Svg d={I.img} size={72} /></span>
          <div style={{ color: TXT, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Доступ к фото</div>
          <div style={{ color: SUB, fontSize: 14, lineHeight: 1.5, maxWidth: 300, marginBottom: 24 }}>Чтобы показывать ваши фото и видео из всех папок, приложению нужен доступ ко всем файлам.</div>
          <button onClick={() => Apps.requestAllFiles().catch(() => {})} style={{ background: ACC, color: "#fff", border: "none", borderRadius: 12, padding: "13px 32px", fontSize: 15, fontWeight: 700 }}>Разрешить доступ</button>
        </div>
      )}

      {/* ===== контент (под панелями, фото видны за ними при скролле) ===== */}
      <div ref={scrollRef} onScroll={onScroll} style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", paddingTop: "calc(env(safe-area-inset-top) + 64px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 74px)" }}>
        {loading && !media.length ? (
          <div style={{ padding: 40, textAlign: "center", color: SUB, fontSize: 14 }}>Сканирование…</div>
        ) : album ? (
          <PhotoGrid items={album.items} mode={gridMode} {...{ selMode, sel, toggleSel, startSel, openViewer, trash: false }} empty="Альбом пуст" />
        ) : section === "albums" ? (
          <AlbumsView albums={albums} {...{ selMode, sel, toggleSel, startSel, setAlbumKey }} />
        ) : section === "hidden" ? (
          (loadingHidden && !hiddenItems.length) ? <div style={{ padding: 40, textAlign: "center", color: SUB, fontSize: 14 }}>Сканирование…</div> : <AlbumsView albums={hiddenAlbums} hidden {...{ selMode, sel, toggleSel, startSel, setAlbumKey }} />
        ) : section === "all" ? (
          <PhotoGrid items={allPhotos} mode={gridMode} {...{ selMode, sel, toggleSel, startSel, openViewer, trash: false }} empty="Нет фотографий" />
        ) : section === "video" ? (
          <AlbumsView albums={videoAlbums} {...{ selMode, sel, toggleSel, startSel, setAlbumKey }} />
        ) : (
          <PhotoGrid items={trashItems} mode={gridMode} {...{ selMode, sel, toggleSel, startSel, openViewer, trash: true }} empty="Корзина пуста" />
        )}
      </div>

      {/* быстрый скроллбар с датой */}
      {curItems.length > 40 && (scrub.show || scrub.drag) && (
        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top) + 70px)", bottom: "calc(env(safe-area-inset-bottom) + 90px)", right: 4, width: 44, zIndex: 15, pointerEvents: "none" }}>
          <div onTouchStart={(e) => { setScrub((sc) => ({ ...sc, drag: true })); scrubTo(e.touches[0].clientY); }} onTouchMove={(e) => { e.preventDefault(); scrubTo(e.touches[0].clientY); }} onTouchEnd={() => setScrub((sc) => ({ ...sc, drag: false }))}
            style={{ position: "absolute", top: (scrub.frac * 100) + "%", right: 0, transform: "translateY(-50%)", width: 44, height: 44, pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{ width: 6, height: 36, borderRadius: 3, background: ACC, boxShadow: "0 1px 4px rgba(0,0,0,.4)" }} />
          </div>
          {scrub.drag && (
            <div style={{ position: "absolute", top: (scrub.frac * 100) + "%", right: 22, transform: "translateY(-50%)", background: BAR, border: "1px solid " + LINE, borderRadius: 10, padding: "6px 12px", color: TXT, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,.4)" }}>
              {monthLabel(curItems[Math.min(curItems.length - 1, Math.floor(scrub.frac * curItems.length))].mtime)}
            </div>
          )}
        </div>
      )}

      {/* ===== нижняя зона (оверлей поверх фото) ===== */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 20, paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)", paddingTop: 6, display: "flex", alignItems: "center", justifyContent: "center", transform: (hideTop && !selMode) ? "translateY(130%)" : "translateY(0)", transition: "transform .25s ease" }}>
        {selMode === "album" ? (
          <Toolbar items={section === "hidden"
            ? [[I.selectAll, "Все", selectAllCur, false], [I.eye, "Показать", doShowAlbums, false], [I.trash, "Удалить", doDeleteAlbums, true]]
            : [[I.selectAll, "Все", selectAllCur, false], [I.eyeOff, "Скрыть", doHideAlbums, false], [I.trash, "Удалить", doDeleteAlbums, true]]} disabled={sel.size === 0} />
        ) : selMode === "photo" ? (
          <Toolbar items={section === "trash"
            ? [[I.selectAll, "Все", selectAllCur, false], [I.restore, "Восстановить", doRestore, false], [I.trash, "Удалить", doDeleteForever, true]]
            : [[I.selectAll, "Все", selectAllCur, false], [I.share, "Поделиться", doSharePhotos, false], [I.trash, "Удалить", doDeletePhotos, true]]} disabled={sel.size === 0} />
        ) : showNav ? (
          <div style={{ display: "flex", background: "var(--barA)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid " + LINE, borderRadius: 30, padding: 5, gap: 2, boxShadow: "0 6px 22px rgba(0,0,0,.4)" }}>
            {SECS.map((s) => {
              const act = section === s.id;
              return (
                <button key={s.id}
                  onClick={(e) => { if (holdRef.fired) { holdRef.fired = false; return; } goSection(s.id, e); }}
                  onContextMenu={(e) => { e.preventDefault(); if (s.id === "albums") enterHidden(); else if (s.id === "trash") emptyTrashAsk(e.currentTarget); }}
                  onTouchStart={(s.id === "albums" || s.id === "trash") ? (e) => { const el = e.currentTarget; holdRef.fired = false; holdRef.t = setTimeout(() => { holdRef.fired = true; if (s.id === "albums") enterHidden(); else emptyTrashAsk(el); }, 550); } : undefined}
                  onTouchEnd={(s.id === "albums" || s.id === "trash") ? () => clearTimeout(holdRef.t) : undefined}
                  onTouchMove={(s.id === "albums" || s.id === "trash") ? () => clearTimeout(holdRef.t) : undefined}
                  onTouchCancel={(s.id === "albums" || s.id === "trash") ? () => { clearTimeout(holdRef.t); holdRef.fired = false; } : undefined}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, border: "none", background: act ? ACC : "transparent", color: act ? "#fff" : SUB, borderRadius: 24, padding: "7px 14px", minWidth: 58, transition: "background .15s" }}>
                  <Svg d={s.icon} size={21} /><span style={{ fontSize: 10.5, fontWeight: act ? 700 : 500 }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ===== вьювер ===== */}
      {viewer && vCur && (
        <div ref={vbgRef} style={{ position: "fixed", inset: 0, zIndex: 1300, background: "#000", touchAction: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            {...(vCur.video ? {} : { onTouchStart: vStart, onTouchMove: vMove, onTouchEnd: vEnd })}>
            <div ref={stageRef} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", willChange: "transform" }}>
              {vCur.video ? (
                <video key={vCur.uri} src={cfs(vCur.uri)} controls autoPlay style={{ maxWidth: "100%", maxHeight: "100%" }} />
              ) : (
                <img key={vCur.uri} src={cfs(vCur.uri)} alt="" draggable={false} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", pointerEvents: "none", userSelect: "none" }} />
              )}
            </div>
          </div>

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: "env(safe-area-inset-top)", background: "linear-gradient(to bottom, rgba(0,0,0,.75), transparent)", transform: bar ? "translateY(0)" : "translateY(-110%)", transition: "transform .2s ease", pointerEvents: bar ? "auto" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 18px" }}>
              <span style={{ flex: 1, minWidth: 0, color: "#fff", fontSize: 15, fontWeight: 500, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vCur.name}</span>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: "env(safe-area-inset-bottom)", background: "linear-gradient(to top, rgba(0,0,0,.8), transparent)", transform: bar ? "translateY(0)" : "translateY(110%)", transition: "transform .2s ease", pointerEvents: bar ? "auto" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-around", padding: "16px 4px 14px" }}>
              {(viewer.trash
                ? [[I.restore, "Восстановить", viewerRestoreOne, false], [I.info, "Свойства", () => setInfo(vCur), false], [I.x, "Закрыть", () => setViewer(null), false], [I.trash, "Удалить", viewerDeleteOne, true]]
                : vCur.video
                ? [[I.share, "Поделиться", () => Apps.share({ uri: vCur.uri, mime: "video/*" }).catch(() => {}), false], [I.info, "Свойства", () => setInfo(vCur), false], [I.x, "Закрыть", () => setViewer(null), false], [I.trash, "Удалить", viewerDeleteOne, true]]
                : [[I.wall, "Обои", () => Apps.setWallpaper({ uri: vCur.uri }).catch(() => {}), false], [I.info, "Свойства", () => setInfo(vCur), false], [I.share, "Поделиться", () => Apps.share({ uri: vCur.uri, mime: "image/*" }).catch(() => {}), false], [I.edit, "Изменить", () => setEditing(vCur), false], [I.trash, "Удалить", viewerDeleteOne, true]]
              ).map(([ic, lbl, fn, red], i) => (
                <span key={i} onClick={(e) => fn(e)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: red ? "#FF6B6B" : "#fff", minWidth: 50 }}>
                  <Svg d={ic} size={22} /><span style={{ fontSize: 10.5 }}>{lbl}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== подтверждение Да/Нет — аккуратный popup прямо над кнопкой удаления ===== */}
      {confirm && (() => {
        const W = 196, rect = confirm.rect;
        let pos, arrow;
        if (rect) {
          const left = Math.min(Math.max(rect.left + rect.width / 2 - W / 2, 8), window.innerWidth - W - 8);
          pos = { position: "fixed", left, bottom: window.innerHeight - rect.top + 10, width: W };
          arrow = Math.min(Math.max(rect.left + rect.width / 2 - left - 8, 14), W - 30);
        } else {
          pos = { position: "fixed", left: "50%", bottom: "50%", transform: "translate(-50%,50%)", width: W };
        }
        return (
          <>
            <div onClick={() => setConfirm(null)} style={{ position: "fixed", inset: 0, zIndex: 1590 }} />
            <div style={{ ...pos, zIndex: 1600, background: BAR, border: "1px solid " + LINE, borderRadius: 14, padding: "12px 12px 10px", boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>
              <div style={{ color: TXT, fontSize: 14, fontWeight: 600, marginBottom: 10, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{confirm.text}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={confirm.onYes} style={{ flex: 1, background: RED, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: "9px 0" }}>Да</button>
                <button onClick={() => setConfirm(null)} style={{ flex: 1, background: ROW2, border: "1px solid " + LINE, borderRadius: 10, color: SUB, fontSize: 14, padding: "9px 0" }}>Нет</button>
              </div>
              {rect && <div style={{ position: "absolute", bottom: -8, left: arrow, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid var(--bar)" }} />}
            </div>
          </>
        );
      })()}

      {progress && (
        <div style={{ position: "fixed", left: "50%", bottom: "calc(env(safe-area-inset-bottom) + 92px)", transform: "translateX(-50%)", zIndex: 1700, background: BAR, border: "1px solid " + LINE, borderRadius: 12, padding: "10px 16px", minWidth: 210, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
          <div style={{ color: TXT, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{progress.label} {progress.done}/{progress.total}</div>
          <div style={{ height: 4, background: ROW2, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: (progress.done / progress.total * 100) + "%", background: ACC, transition: "width .15s" }} /></div>
        </div>
      )}

      {/* ===== Свойства ===== */}
      {info && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1650, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setInfo(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: BAR, borderRadius: 16, padding: 18, width: "86%", maxWidth: 360, boxShadow: "0 18px 48px rgba(0,0,0,.6)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: TXT, marginBottom: 14 }}>Свойства</div>
            {[["Имя", info.name], ["Папка", parentOf(info.uri) || "—"], ["Дата", fmtDate(info.mtime)], ["Размер", fmtSize(info.size)], ["Тип", info.video ? "Видео" : "Изображение"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, padding: "5px 0", fontSize: 13, borderBottom: "1px solid " + LINE }}>
                <span style={{ width: 64, flexShrink: 0, color: SUB }}>{k}</span>
                <span style={{ flex: 1, color: TXT, wordBreak: "break-all" }}>{v || "—"}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setInfo(null)} style={{ background: ROW2, border: "1px solid " + LINE, borderRadius: 10, color: TXT, fontSize: 14, padding: "9px 22px" }}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {editing && <Editor item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setViewer(null); scan(true); }} />}
    </div>
  );
}

const holdRef = { t: null, fired: false };
const btnIcon = { display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, border: "none", background: "transparent", color: "var(--txt)", borderRadius: 20 };
const btnIconBg = { display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, border: "none", background: "var(--btn)", color: "var(--txt)", borderRadius: 19 };

/* ===== сетка фото: size = мозаика по размеру, classic = ровные квадраты по месяцам ===== */
function PhotoCell({ e, items, selMode, sel, toggleSel, startSel, openViewer, trash, hold, square }) {
  const m = e.m, on = sel.has(m.uri);
  return (
    <div
      onClick={(ev) => { if (hold.current.fired) { hold.current.fired = false; return; } if (selMode) toggleSel(m.uri); else openViewer(items, e.i, trash, ev.currentTarget.getBoundingClientRect()); }}
      onContextMenu={(ev) => ev.preventDefault()}
      onTouchStart={() => { hold.current.fired = false; hold.current.t = setTimeout(() => { hold.current.fired = true; if (!selMode) startSel("photo", m.uri); }, 450); }}
      onTouchEnd={() => clearTimeout(hold.current.t)}
      onTouchMove={() => clearTimeout(hold.current.t)}
      onTouchCancel={() => { clearTimeout(hold.current.t); hold.current.fired = false; }}
      style={{ position: "relative", breakInside: "avoid", WebkitColumnBreakInside: "avoid", marginBottom: square ? 0 : 3, aspectRatio: square ? "1" : undefined, borderRadius: 8, overflow: "hidden", outline: on ? "3px solid var(--acc)" : "none", outlineOffset: -3 }}>
      <Thumb item={m} video={m.video} square={square} />
      {selMode && (
        <span style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: 11, border: "2px solid #fff", background: on ? "var(--acc)" : "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{on && <Svg d={I.check} size={14} />}</span>
      )}
    </div>
  );
}

const estH = (g, classic, cw3, cw4) => {
  const hdr = 46;
  if (classic) { const rows = Math.ceil(g.entries.length / 4); return hdr + rows * cw4 + (rows - 1) * 3; }
  let sum = 0; for (const e of g.entries) { const ar = (e.m.w && e.m.h) ? clampAR(e.m.w / e.m.h) : 1; sum += cw3 / ar + 3; }
  return hdr + Math.ceil(sum / 3);
};
// секция месяца с виртуализацией: далеко от экрана — только заголовок + распорка нужной высоты
function MonthSection({ g, classic, pass, cw3, cw4 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const [h, setH] = useState(() => estH(g, classic, cw3, cw4));
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); else { if (ref.current && ref.current.offsetHeight) setH(ref.current.offsetHeight); setVis(false); } }, { rootMargin: "1200px 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ minHeight: vis ? undefined : h }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--txt)", padding: "16px 6px 10px" }}>{g.label}</div>
      {vis && (classic ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>{g.entries.map((e) => <PhotoCell key={e.m.uri} e={e} square {...pass} />)}</div>
      ) : (
        <div style={{ columnCount: 3, columnGap: 3 }}>{g.entries.map((e) => <PhotoCell key={e.m.uri} e={e} {...pass} />)}</div>
      ))}
    </div>
  );
}
function PhotoGrid({ items, selMode, sel, toggleSel, startSel, openViewer, trash, empty, mode }) {
  const hold = useRef({ t: null, fired: false });
  if (!items.length) return <Empty icon={trash ? I.trash : I.img} text={empty} />;
  const indexed = items.map((m, i) => ({ m, i }));
  const pass = { items, selMode, sel, toggleSel, startSel, openViewer, trash, hold };
  const classic = mode === "classic";

  // обе сетки разбиваем по месяцам
  const groups = [];
  let cur = null;
  for (const e of indexed) { const d = new Date(e.m.mtime); const key = d.getFullYear() + "-" + d.getMonth(); if (!cur || cur.key !== key) { cur = { key, label: monthLabel(e.m.mtime), entries: [] }; groups.push(cur); } cur.entries.push(e); }

  const W = (typeof window !== "undefined" ? window.innerWidth : 400) - 8;
  const cw3 = (W - 2 * 3) / 3, cw4 = (W - 3 * 3) / 4;
  const body = (
    <div style={{ padding: "0 4px 4px" }}>
      {groups.map((g) => <MonthSection key={g.key} g={g} classic={classic} pass={pass} cw3={cw3} cw4={cw4} />)}
    </div>
  );
  return <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>{body}</div>;
}

/* ===== сетка альбомов (привязана к правому нижнему углу) ===== */
function AlbumsView({ albums, selMode, sel, toggleSel, startSel, setAlbumKey, hidden }) {
  const hold = useRef({ t: null, fired: false });
  if (!albums.length) return <Empty icon={I.albums} text={hidden ? "Нет скрытых альбомов" : "Альбомы не найдены"} />;
  const cells = brCells(albums, 3);
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: 10, width: "100%" }}>
        {cells.map((a, ci) => {
          if (!a) return <div key={"e" + ci} aria-hidden style={{ visibility: "hidden" }}><div style={{ width: "100%", aspectRatio: "1" }} /><div style={{ height: 40 }} /></div>;
          const on = sel.has(a.key); const cover = a.items[0];
          return (
            <div key={a.key}
              onClick={() => { if (hold.current.fired) { hold.current.fired = false; return; } if (selMode === "album") toggleSel(a.key); else setAlbumKey(a.key); }}
              onContextMenu={(e) => e.preventDefault()}
              onTouchStart={() => { hold.current.fired = false; hold.current.t = setTimeout(() => { hold.current.fired = true; startSel("album", a.key); }, 450); }}
              onTouchEnd={() => clearTimeout(hold.current.t)}
              onTouchMove={() => clearTimeout(hold.current.t)}
              onTouchCancel={() => { clearTimeout(hold.current.t); hold.current.fired = false; }}
              style={{ minWidth: 0 }}>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", outline: on ? "3px solid var(--acc)" : "none", outlineOffset: -3 }}>
                {cover ? <Thumb item={cover} video={cover.video} square />
                  : <div style={{ width: "100%", aspectRatio: "1", background: "var(--row2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sub)" }}><Svg d={I.folder} size={34} /></div>}
                {hidden && <span style={{ position: "absolute", top: 6, left: 6, color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.8))" }}><Svg d={I.eyeOff} size={16} /></span>}
                {selMode === "album" && (
                  <span style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, border: "2px solid #fff", background: on ? "var(--acc)" : "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{on && <Svg d={I.check} size={14} />}</span>
                )}
              </div>
              <div style={{ marginTop: 5, fontSize: 12.5, fontWeight: 600, color: "var(--txt)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
              <div style={{ fontSize: 11, color: "var(--sub)" }}>{a.items.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== нижний тулбар выделения ===== */
function Toolbar({ items, disabled }) {
  return (
    <div style={{ display: "flex", background: "var(--barA)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid var(--line)", borderRadius: 30, padding: 5, gap: 2, boxShadow: "0 6px 22px rgba(0,0,0,.4)", opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      {items.map(([ic, lbl, fn, red], i) => (
        <span key={i} onClick={(e) => fn(e)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: red ? "var(--red)" : "var(--txt)", minWidth: 64, padding: "7px 12px" }}>
          <Svg d={ic} size={21} /><span style={{ fontSize: 10.5 }}>{lbl}</span>
        </span>
      ))}
    </div>
  );
}
