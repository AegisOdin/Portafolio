import * as THREE from "three";

/** Procedural mechanical squid: shared geometry, articulated cables, no textures. */
export function createSentinel(colors: { steel: string; edge: string; eye: string }) {
  const root = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: colors.steel, metalness: 0.78, roughness: 0.36 });
  const edge = new THREE.MeshStandardMaterial({ color: colors.edge, metalness: 0.85, roughness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: colors.steel, roughness: 0.92 });
  const red = new THREE.MeshStandardMaterial({ color: colors.eye, emissive: colors.eye, emissiveIntensity: 2.8, roughness: 0.2 });
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  const ring = new THREE.TorusGeometry(1, 0.15, 6, 20);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const claw = new THREE.ConeGeometry(0.065, 0.42, 5);

  function part(geometry: THREE.BufferGeometry, material: THREE.Material, parent = root) {
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    return mesh;
  }
  const hull = part(sphere, rubber);
  hull.scale.set(1.12, 0.68, 0.82);

  // Overlapping armour lobes leave dark seams around the pressure hull.
  for (let row = 0; row < 3; row++) {
    for (let side = -1; side <= 1; side++) {
      const shell = part(sphere, metal);
      shell.position.set(side * 0.56, 0.17 + (side === 0 ? 0.18 : 0), -0.55 + row * 0.45);
      shell.scale.set(0.47, 0.47, 0.34);
      shell.rotation.z = -side * 0.32;
      const strap = part(ring, edge);
      strap.position.copy(shell.position);
      strap.scale.set(0.45, 0.43, 0.32);
    }
  }
  // Raised vents and side-mounted actuators make the silhouette mechanical.
  for (const side of [-1, 1]) {
    const actuator = part(sphere, edge);
    actuator.position.set(side * 0.98, -0.08, -0.12);
    actuator.scale.set(0.24, 0.34, 0.7);
    for (let i = 0; i < 7; i++) {
      const vent = part(box, rubber);
      vent.position.set(side * 0.6, 0.57, -0.55 + i * 0.13);
      vent.scale.set(0.35, 0.045, 0.055);
      vent.rotation.z = -side * 0.35;
    }
  }

  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color(colors.eye) } },
    vertexShader: "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: "varying vec2 vUv; uniform vec3 tint; void main(){float r=length(vUv-0.5)*2.0;float a=pow(max(0.0,1.0-r),3.0)*0.45;gl_FragColor=vec4(tint,a);}",
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const haloGeometry = new THREE.PlaneGeometry(1, 1);
  const eyes = [
    [0.12, 0.02, 0.23], [-0.4, 0.22, 0.13], [0.5, 0.3, 0.12],
    [-0.1, 0.42, 0.12], [0.72, 0.03, 0.1], [-0.73, 0.06, 0.11],
    [-0.43, -0.24, 0.11], [0.42, -0.29, 0.12], [0.02, -0.39, 0.1],
    [-0.7, 0.38, 0.075], [0.75, 0.4, 0.07], [-0.8, -0.25, 0.075], [0.7, -0.31, 0.075],
  ];
  for (const [x, y, radius] of eyes) {
    const z = 0.78 - Math.abs(x) * 0.22;
    const socket = part(sphere, edge);
    socket.position.set(x, y, z);
    socket.scale.set(radius * 1.45, radius * 1.45, radius * 1.2);
    const lens = part(sphere, red);
    lens.position.set(x, y, z + radius * 0.8);
    lens.scale.set(radius, radius, radius * 0.65);
    const halo = part(haloGeometry, glowMaterial);
    halo.position.set(x, y, z + radius * 1.5);
    halo.scale.setScalar(radius * 6);
  }

  const tentacles: THREE.Group[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const side = Math.cos(angle);
    const rig = new THREE.Group();
    rig.position.set(side * 0.85, Math.sin(angle) * 0.4 - 0.1, -0.35);
    root.add(rig);
    tentacles.push(rig);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(side * 0.55, Math.sin(angle) * 0.55 - 0.25, -0.6),
      new THREE.Vector3(side * 1.15, -0.8 + Math.sin(angle) * 0.7, -1.0),
      new THREE.Vector3(side * 1.55 + Math.sin(i * 2) * 0.45, -1.9 - (i % 3) * 0.3, -0.35),
      new THREE.Vector3(side * 1.2, -2.7 - (i % 3) * 0.3, 0.45 + Math.sin(angle) * 0.5),
    ]);
    part(new THREE.TubeGeometry(curve, 44, 0.048, 6, false), rubber, rig);
    const ribs = new THREE.InstancedMesh(ring, edge, 48);
    const pose = new THREE.Object3D();
    const axis = new THREE.Vector3(0, 0, 1);
    for (let j = 0; j < 48; j++) {
      const t = j / 47;
      pose.position.copy(curve.getPointAt(t));
      pose.quaternion.setFromUnitVectors(axis, curve.getTangentAt(t).normalize());
      pose.scale.setScalar(0.092 - t * 0.043);
      pose.updateMatrix();
      ribs.setMatrixAt(j, pose.matrix);
    }
    ribs.computeBoundingSphere();
    rig.add(ribs);
    const tip = new THREE.Group();
    tip.position.copy(curve.getPointAt(1));
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(1).normalize());
    rig.add(tip);
    for (const direction of [-1, 1]) {
      const finger = part(claw, metal, tip);
      finger.position.set(direction * 0.075, 0.14, 0);
      finger.rotation.z = direction * 0.28;
    }
  }

  return {
    root,
    articulate(progress: number, pointerX: number, pointerY: number) {
      tentacles.forEach((rig, i) => {
        rig.rotation.x = Math.sin(progress * 5 + i * 0.7) * 0.12 + pointerY * 0.045;
        rig.rotation.z = Math.sin(progress * 6 + i) * 0.1 + pointerX * 0.035;
      });
    },
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => materials.add(m));
          if (object instanceof THREE.InstancedMesh) object.dispose();
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
