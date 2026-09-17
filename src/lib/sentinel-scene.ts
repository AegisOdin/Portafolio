/** Load WebGL only when the visitor enters the red-pill world. */
export function mountSentinel(mount: HTMLElement) {
  const root = document.documentElement;
  let pending = false;
  let disposed = false;
  let refresh: (() => void) | undefined;
  let cleanup: (() => void) | undefined;
  const isMatrix = () => root.dataset.theme === "realworld";

  async function syncTheme() {
    if (refresh) { refresh(); return; }
    if (!isMatrix() || pending || disposed) return;
    pending = true;
    try {
      const [THREE, { createSentinel }] = await Promise.all([import("three"), import("./sentinel")]);
      if (disposed) return;
      const canvas = mount.querySelector("canvas")!;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
      const mobileResolution = matchMedia("(max-width: 767px), (pointer: coarse)");
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobileResolution.matches ? 1 : 1.5));
      renderer.setClearColor(0, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
      camera.position.z = 9;
      const css = getComputedStyle(root);
      const color = (name: string) => css.getPropertyValue(name.replace("--sentinel-", "--color-sentinel-")).trim();
      const sentinel = createSentinel({ steel: color("--sentinel-steel"), edge: color("--sentinel-edge"), eye: color("--sentinel-eye") });
      scene.add(sentinel.root);
      scene.add(new THREE.HemisphereLight(color("--sentinel-light"), color("--sentinel-steel"), 2.4));
      const key = new THREE.DirectionalLight(color("--sentinel-light"), 4);
      key.position.set(-3, 5, 6);
      const rim = new THREE.DirectionalLight(color("--sentinel-light"), 6);
      rim.position.set(4, 2, -3);
      scene.add(key, rim);

      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      const fine = matchMedia("(hover: hover) and (pointer: fine)");
      let frame = 0;
      let last = 0;
      let progress = 0;
      let targetProgress = 0;
      let x = 0, y = 0, targetX = 0, targetY = 0;
      let reveal = reduced.matches ? 1 : 0;
      let active = false;
      let contextLost = false;

      function render(time: number) {
        frame = 0;
        if (!active) return;
        const dt = Math.min((time - last) / 1000 || 0.016, 0.05);
        last = time;
        const damping = reduced.matches ? 1 : 1 - Math.exp(-dt * 6);
        progress += (targetProgress - progress) * damping;
        x += (targetX - x) * damping;
        y += (targetY - y) * damping;
        reveal = reduced.matches ? 1 : Math.min(1, reveal + dt * 0.65);
        const emergence = 1 - Math.pow(1 - reveal, 3);
        const dive = reduced.matches ? 0.4 : progress;
        const mobile = innerWidth < 768;
        // Compensate x/y for perspective so it remains beside the content as z recedes.
        const z = -dive * 8 - (1 - emergence) * 5;
        const distance = camera.position.z - z;
        const halfHeight = Math.tan(THREE.MathUtils.degToRad(21)) * distance;
        const halfWidth = halfHeight * camera.aspect;
        sentinel.root.position.set(
          halfWidth * (mobile ? 0.7 : 0.61) + x * 0.3,
          halfHeight * (0.2 - dive * 0.32) + y * 0.18 - (1 - emergence) * 1.8,
          z,
        );
        sentinel.root.scale.setScalar(mobile ? 0.75 : 1);
        sentinel.root.rotation.set(-0.08 - dive * 0.25 - y * 0.15, -0.32 + x * 0.3 + dive * 0.18, -0.12 + dive * 0.22);
        sentinel.articulate(dive, x, y);
        canvas.style.opacity = String(emergence * (mobile ? 0.42 : 0.86) * (1 - dive * 0.5));
        renderer.render(scene, camera);
        root.classList.add("sentinel-ready");
        if (reveal < 1 || Math.abs(targetProgress - progress) + Math.abs(targetX - x) + Math.abs(targetY - y) > 0.0005) schedule();
      }
      function schedule() { if (active && !frame) frame = requestAnimationFrame(render); }
      function scroll() {
        targetProgress = Math.min(1, Math.max(0, scrollY / Math.max(1, root.scrollHeight - innerHeight)));
        schedule();
      }
      function resize() {
        if (!active) return;
        const pixelRatio = Math.min(devicePixelRatio || 1, mobileResolution.matches ? 1 : 1.5);
        if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = innerWidth / Math.max(1, innerHeight);
        camera.updateProjectionMatrix();
        scroll();
      }
      function pointer(event: PointerEvent) {
        if (!active || !fine.matches || reduced.matches || event.pointerType === "touch") return;
        targetX = event.clientX / innerWidth * 2 - 1;
        targetY = 1 - event.clientY / innerHeight * 2;
        schedule();
      }
      function resetPointer() { targetX = targetY = 0; schedule(); }
      refresh = () => {
        const wasActive = active;
        active = isMatrix() && !document.hidden && !contextLost;
        if (!active) { cancelAnimationFrame(frame); frame = 0; return; }
        if (!wasActive) last = performance.now();
        if (reduced.matches) { targetX = targetY = x = y = 0; }
        resize();
      };
      const update = () => refresh?.();
      const lost = (event: Event) => { event.preventDefault(); contextLost = true; canvas.style.opacity = "0"; root.classList.remove("sentinel-ready"); update(); };
      const restored = () => { contextLost = false; update(); };
      const pagehide = (event: PageTransitionEvent) => { if (!event.persisted) dispose(); };
      window.addEventListener("scroll", scroll, { passive: true });
      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("pointermove", pointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", resetPointer);
      window.addEventListener("blur", resetPointer);
      window.addEventListener("pagehide", pagehide);
      window.addEventListener("pageshow", update);
      document.addEventListener("visibilitychange", update);
      reduced.addEventListener("change", update);
      fine.addEventListener("change", resetPointer);
      mobileResolution.addEventListener("change", resize);
      canvas.addEventListener("webglcontextlost", lost);
      canvas.addEventListener("webglcontextrestored", restored);
      const sizeObserver = new ResizeObserver(scroll);
      sizeObserver.observe(document.body);
      cleanup = () => {
        active = false;
        cancelAnimationFrame(frame);
        sizeObserver.disconnect();
        window.removeEventListener("scroll", scroll);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", pointer);
        root.removeEventListener("pointerleave", resetPointer);
        window.removeEventListener("blur", resetPointer);
        window.removeEventListener("pagehide", pagehide);
        window.removeEventListener("pageshow", update);
        document.removeEventListener("visibilitychange", update);
        reduced.removeEventListener("change", update);
        fine.removeEventListener("change", resetPointer);
        mobileResolution.removeEventListener("change", resize);
        canvas.removeEventListener("webglcontextlost", lost);
        canvas.removeEventListener("webglcontextrestored", restored);
        sentinel.dispose();
        renderer.dispose();
        root.classList.remove("sentinel-ready");
      };
      update();
    } catch (error) {
      // Decorative enhancement: the portfolio remains usable without WebGL.
      console.warn("No se pudo iniciar el centinela 3D.", error);
    }
  }
  function dispose() { disposed = true; observer.disconnect(); cleanup?.(); }
  const observer = new MutationObserver(() => { void syncTheme(); });
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  void syncTheme();
}
