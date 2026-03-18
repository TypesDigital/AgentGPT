import React, { useEffect, useMemo, useState } from "react";
import Button from "./Button";

type ConsoleEntryType = "log" | "warn" | "error" | "system";

interface ConsoleEntry {
  id: number;
  type: ConsoleEntryType;
  message: string;
}

interface Template {
  id: string;
  label: string;
  description: string;
  code: string;
}

const templates: Template[] = [
  {
    id: "orbital-cubes",
    label: "Orbital Cubes",
    description: "A rotating cube cluster with lights and fog.",
    code: `api.setBackground("#050816");
api.camera.position.set(0, 2.2, 7);
scene.fog = new THREE.Fog("#050816", 8, 20);

const ambient = new THREE.AmbientLight("#7dd3fc", 0.6);
const keyLight = new THREE.DirectionalLight("#ffffff", 1.1);
keyLight.position.set(4, 8, 6);
scene.add(ambient, keyLight);

const cubes = [];
const group = new THREE.Group();
scene.add(group);

for (let i = 0; i < 14; i += 1) {
  const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(i / 14, 0.8, 0.58),
    roughness: 0.25,
    metalness: 0.25,
  });

  const cube = new THREE.Mesh(geometry, material);
  const angle = (i / 14) * Math.PI * 2;
  cube.position.set(Math.cos(angle) * 3, Math.sin(angle * 2) * 0.8, Math.sin(angle) * 3);
  cube.rotation.set(angle, angle * 0.5, 0);
  cubes.push(cube);
  group.add(cube);
}

api.onFrame(({ elapsedTime }) => {
  group.rotation.y = elapsedTime * 0.35;
  cubes.forEach((cube, index) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;
    cube.position.y = Math.sin(elapsedTime * 1.8 + index * 0.45) * 0.9;
  });
});

console.log("Loaded orbital cubes scene.");`,
  },
  {
    id: "neon-tunnel",
    label: "Neon Tunnel",
    description: "Animated ring tunnel with a pulsing camera move.",
    code: `api.setBackground("#020617");
api.camera.position.set(0, 0, 8);

const ambient = new THREE.AmbientLight("#38bdf8", 0.8);
const rim = new THREE.PointLight("#f472b6", 2.5, 30);
rim.position.set(0, 0, 6);
scene.add(ambient, rim);

const rings = [];
for (let i = 0; i < 24; i += 1) {
  const geometry = new THREE.TorusGeometry(1.9 + i * 0.08, 0.05, 16, 96);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(0.55 + i * 0.012, 0.95, 0.6),
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.position.z = -i * 0.6;
  rings.push(ring);
  scene.add(ring);
}

api.onFrame(({ elapsedTime }) => {
  rings.forEach((ring, index) => {
    ring.rotation.z = elapsedTime * (0.2 + index * 0.01);
    ring.rotation.x = Math.sin(elapsedTime + index * 0.2) * 0.25;
  });

  api.camera.position.x = Math.sin(elapsedTime * 0.5) * 0.8;
  api.camera.lookAt(0, 0, -6);
});

console.log("Neon tunnel ready.");`,
  },
  {
    id: "particle-wave",
    label: "Particle Wave",
    description: "A grid of glowing particles that ripple over time.",
    code: `api.setBackground("#030712");
api.camera.position.set(0, 6.5, 8);
api.camera.lookAt(0, 0, 0);

const count = 40;
const points = [];
const group = new THREE.Group();
const light = new THREE.PointLight("#a855f7", 1.6, 30);
light.position.set(0, 6, 4);
scene.add(light, group);

for (let x = 0; x < count; x += 1) {
  for (let z = 0; z < count; z += 1) {
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: "#67e8f9",
      emissive: "#155e75",
      roughness: 0.3,
      metalness: 0.1,
    });
    const point = new THREE.Mesh(geometry, material);
    point.position.set(x * 0.22 - 4.4, 0, z * 0.22 - 4.4);
    points.push(point);
    group.add(point);
  }
}

api.onFrame(({ elapsedTime }) => {
  points.forEach((point) => {
    const distance = Math.hypot(point.position.x, point.position.z);
    point.position.y = Math.sin(distance * 2.8 - elapsedTime * 2.4) * 0.35;
  });
  group.rotation.y = elapsedTime * 0.14;
});

console.log("Particle wave engaged.");`,
  },
];

const sanitizeForScript = (value: string) =>
  value.replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--");

const buildPreviewDocument = (code: string) => {
  const sanitizedCode = sanitizeForScript(code);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #020617;
        color: white;
        font-family: Inter, system-ui, sans-serif;
      }

      #app {
        width: 100%;
        height: 100%;
      }

      .status {
        position: fixed;
        left: 12px;
        bottom: 12px;
        padding: 8px 10px;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.25);
        font-size: 12px;
        color: rgba(226, 232, 240, 0.9);
        backdrop-filter: blur(12px);
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <div class="status">Live preview sandbox</div>
    <script src="https://unpkg.com/three@0.161.0/build/three.min.js"></script>
    <script>
      const parentOrigin = "*";
      const post = (type, payload = {}) => {
        window.parent.postMessage({ source: "three-playground", type, payload }, parentOrigin);
      };

      const sendConsole = (type, args) => {
        const message = args
          .map((entry) => {
            if (typeof entry === "string") return entry;
            try {
              return JSON.stringify(entry, null, 2);
            } catch (error) {
              return String(entry);
            }
          })
          .join(" ");
        post("console", { type, message });
      };

      const consoleProxy = {
        log: (...args) => sendConsole("log", args),
        warn: (...args) => sendConsole("warn", args),
        error: (...args) => sendConsole("error", args),
      };

      const mountNode = document.getElementById("app");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      camera.position.set(0, 1.5, 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mountNode.appendChild(renderer.domElement);

      const grid = new THREE.GridHelper(14, 14, "#1d4ed8", "#1e293b");
      grid.position.y = -1.5;
      scene.add(grid);

      const hemisphere = new THREE.HemisphereLight("#cbd5e1", "#020617", 0.7);
      scene.add(hemisphere);

      const clock = new THREE.Clock();
      let frameHandler = null;

      const resize = () => {
        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      resize();
      window.addEventListener("resize", resize);

      const api = {
        scene,
        camera,
        renderer,
        THREE,
        onFrame: (callback) => {
          frameHandler = callback;
        },
        setBackground: (color) => {
          renderer.setClearColor(color, 1);
        },
        clearScene: () => {
          [...scene.children].forEach((child) => {
            if (child !== grid && child !== hemisphere) {
              scene.remove(child);
            }
          });
        },
        resetCamera: () => {
          camera.position.set(0, 1.5, 5);
          camera.lookAt(0, 0, 0);
        },
        fitToObject: (object) => {
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z, 1);
          const distance = maxDim * 1.8;
          camera.position.set(center.x + distance, center.y + distance * 0.65, center.z + distance);
          camera.lookAt(center);
        },
      };

      const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        try {
          if (typeof frameHandler === "function") {
            frameHandler({ elapsedTime, delta: clock.getDelta() });
          }
          renderer.render(scene, camera);
        } catch (error) {
          post("runtime-error", { message: error instanceof Error ? error.message : String(error) });
          frameHandler = null;
        }
      };

      try {
        const userCode = ${JSON.stringify(sanitizedCode)};
        const execute = new Function("THREE", "api", "scene", "camera", "renderer", "console", userCode);
        execute(THREE, api, scene, camera, renderer, consoleProxy);
        post("ready");
        animate();
      } catch (error) {
        const message = error instanceof Error ? error.stack || error.message : String(error);
        post("runtime-error", { message });
      }
    </script>
  </body>
</html>`;
};

const getFeedback = (code: string, runtimeError: string | null) => {
  const suggestions: string[] = [];

  if (runtimeError) {
    suggestions.push(
      "Runtime error detected. Fix the line referenced in the error output before adding more scene logic."
    );
  } else {
    suggestions.push("Scene executed successfully. Iterate by changing geometry, lighting, or camera motion.");
  }

  if (!code.includes("api.onFrame")) {
    suggestions.push("Add `api.onFrame(...)` if you want continuous animation or time-based interactivity.");
  }

  if (!code.includes("Light")) {
    suggestions.push("Introduce a light source for stronger depth and material contrast.");
  }

  if (!code.includes("camera.position")) {
    suggestions.push("Move the camera to frame your subject and create a stronger composition.");
  }

  if (!code.includes("setBackground")) {
    suggestions.push("Set a background color to make the scene feel intentional and easier to read.");
  }

  return suggestions.slice(0, 4);
};

const ThreePlayground = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? "");
  const [code, setCode] = useState(templates[0]?.code ?? "");
  const [srcDoc, setSrcDoc] = useState(() => buildPreviewDocument(templates[0]?.code ?? ""));
  const [autoRun, setAutoRun] = useState(true);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [runCount, setRunCount] = useState(1);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as
        | {
            source?: string;
            type?: "console" | "runtime-error" | "ready";
            payload?: { message?: string; type?: ConsoleEntryType };
          }
        | undefined;

      if (data?.source !== "three-playground") {
        return;
      }

      if (data.type === "ready") {
        setConsoleEntries((current) => [
          ...current,
          {
            id: Date.now() + Math.random(),
            type: "system",
            message: `Preview run #${runCount} is live.`,
          },
        ]);
      }

      if (data.type === "console") {
        setConsoleEntries((current) => [
          ...current,
          {
            id: Date.now() + Math.random(),
            type: data.payload?.type ?? "log",
            message: data.payload?.message ?? "",
          },
        ]);
      }

      if (data.type === "runtime-error") {
        setRuntimeError(data.payload?.message ?? "Unknown runtime error");
        setConsoleEntries((current) => [
          ...current,
          {
            id: Date.now() + Math.random(),
            type: "error",
            message: data.payload?.message ?? "Unknown runtime error",
          },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [runCount]);

  useEffect(() => {
    if (!autoRun) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setConsoleEntries([]);
      setRuntimeError(null);
      setRunCount((current) => current + 1);
      setSrcDoc(buildPreviewDocument(code));
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [autoRun, code]);

  const feedback = useMemo(() => getFeedback(code, runtimeError), [code, runtimeError]);

  const handleRun = () => {
    setConsoleEntries([]);
    setRuntimeError(null);
    setRunCount((current) => current + 1);
    setSrcDoc(buildPreviewDocument(code));
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template.id);
    setCode(template.code);
    setConsoleEntries([
      {
        id: Date.now(),
        type: "system",
        message: `Loaded template: ${template.label}`,
      },
    ]);
    setRuntimeError(null);
    setRunCount((current) => current + 1);
    setSrcDoc(buildPreviewDocument(template.code));
  };

  const activeTemplate = templates.find((template) => template.id === selectedTemplate);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-sky-950/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
              Live Three.js Workshop
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Build, run, and review immersive 3D scenes in one browser tab.
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              This editor gives you a live preview sandbox, runnable scene code,
              starter templates, console output, and quick feedback prompts so
              you can iterate fast on ideas for a three.js experience.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4 text-sm text-slate-200 sm:grid-cols-3">
            <div>
              <div className="text-2xl font-bold text-white">Live</div>
              <div>Auto-runs edits with a debounce and manual rerun controls.</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Feedback</div>
              <div>Console logs, runtime errors, and scene improvement hints.</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Sandboxed</div>
              <div>Preview executes inside an isolated iframe with three.js loaded from CDN.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-[820px] flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl backdrop-blur">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Scene editor</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Edit JavaScript that receives `THREE`, `scene`, `camera`, `renderer`, and the `api` helpers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <input
                    checked={autoRun}
                    onChange={(event) => setAutoRun(event.target.checked)}
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-slate-900 text-sky-400"
                  />
                  Auto-run
                </label>
                <Button className="!px-5 !py-2" onClick={handleRun}>
                  Run code
                </Button>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedTemplate === template.id
                      ? "border-sky-400/80 bg-sky-500/15 shadow-lg shadow-sky-950/30"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                  type="button"
                >
                  <div className="text-sm font-semibold text-white">{template.label}</div>
                  <div className="mt-1 text-sm text-slate-400">{template.description}</div>
                </button>
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>{activeTemplate?.label ?? "Custom scene"}</span>
              <span>{code.split("\n").length} lines</span>
            </div>

            <textarea
              aria-label="Three.js scene code editor"
              className="editor-textarea min-h-[500px] w-full rounded-3xl border border-white/10 bg-slate-950/90 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-sky-400/60"
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
              value={code}
            />
          </div>
        </div>

        <div className="flex min-h-[820px] flex-col gap-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-white">Live preview</h2>
                <p className="mt-1 text-sm text-slate-400">
                  The scene rerenders in a sandboxed iframe. Manual runs clear the console and restart the preview.
                </p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Run #{runCount}
              </div>
            </div>
            <div className="h-[460px] bg-slate-950">
              <iframe
                className="h-full w-full"
                sandbox="allow-scripts"
                srcDoc={srcDoc}
                title="Three.js live preview"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Runtime feedback</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Use these hints to polish composition, motion, and reliability.
                  </p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                    runtimeError
                      ? "border border-red-400/20 bg-red-500/10 text-red-300"
                      : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  {runtimeError ? "Needs fixes" : "Healthy"}
                </div>
              </div>

              <div className="space-y-3">
                {feedback.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>

              {runtimeError ? (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                  <div className="mb-2 font-semibold text-red-200">Latest error</div>
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-red-100">
                    {runtimeError}
                  </pre>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Console</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Capture `console.log`, warnings, errors, and preview lifecycle notices.
                  </p>
                </div>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:bg-white/10"
                  onClick={() => setConsoleEntries([])}
                  type="button"
                >
                  Clear
                </button>
              </div>

              <div className="max-h-[280px] space-y-3 overflow-auto pr-2">
                {consoleEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">
                    Run the scene to populate logs and lifecycle messages.
                  </div>
                ) : (
                  consoleEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        entry.type === "error"
                          ? "border-red-400/20 bg-red-500/10 text-red-100"
                          : entry.type === "warn"
                          ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
                          : entry.type === "system"
                          ? "border-sky-400/20 bg-sky-500/10 text-sky-100"
                          : "border-white/10 bg-white/5 text-slate-200"
                      }`}
                    >
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em] opacity-80">
                        {entry.type}
                      </div>
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6">
                        {entry.message}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl backdrop-blur">
          <h2 className="text-xl font-bold text-white">Built-in API helpers</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">api.onFrame(callback)</div>
              <p className="mt-2">Register animation logic that receives elapsed time and delta values each frame.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">api.setBackground(color)</div>
              <p className="mt-2">Quickly apply a solid renderer clear color without touching renderer internals.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">api.clearScene()</div>
              <p className="mt-2">Remove user-added objects while preserving the default grid and hemisphere light.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">api.fitToObject(object)</div>
              <p className="mt-2">Reposition the camera so larger generated meshes stay in frame automatically.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl backdrop-blur">
          <h2 className="text-xl font-bold text-white">Shipping checklist</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">1. Prototype fast</div>
              <p className="mt-2">Start from a template, tweak geometry and materials, then refine motion with `api.onFrame`.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">2. Watch the console</div>
              <p className="mt-2">Use logs to verify camera values, object counts, or animation state while building a scene.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">3. Fix errors early</div>
              <p className="mt-2">Runtime errors are mirrored into the feedback panel so you can correct mistakes before the next iteration.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-white">4. Publish from your fork</div>
              <p className="mt-2">After reviewing the local commit, push the current branch to your GitHub fork and open a PR if you want a hosted review flow.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThreePlayground;
