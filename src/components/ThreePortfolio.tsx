import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import gsap from "gsap";
import resumeJson from "../data/resume.json";
import type { ResumeData } from "../types/resume";

type PanelKey = "about" | "skills" | "experience" | "projects";

interface PanelDefinition {
  title: string;
  subtitle?: string;
  render: () => ReactNode;
}

const CONTACT_ICONS: Record<string, ReactNode> = {
  linkedin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  portfolio: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
};

const resume = resumeJson as ResumeData;

const emphasize = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, "<span class='text-indigo-200 font-semibold'>$1</span>");

const panelDefinitions: Record<PanelKey, PanelDefinition> = {
  about: {
    title: "About Bharathkumar",
    render: () => <p className="text-slate-300 leading-relaxed">{resume.profile}</p>,
  },
  skills: {
    title: "Technical Skills",
    render: () => {
      const groups = [
        {
          name: "Frontend & UI",
          items: ["React", "Next.js", "Sveltekit", "Tailwind", "shadcnUI", "Astro"].filter((item) =>
            resume.techStack.includes(item),
          ),
        },
        {
          name: "Backend & APIs",
          items: ["Node.js", "Express", "TypeScript", "GraphQL", "REST"].filter((item) =>
            resume.techStack.includes(item),
          ),
        },
        {
          name: "Data & Infra",
          items: ["Postgres", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS"].filter((item) =>
            resume.techStack.includes(item),
          ),
        },
        {
          name: "Tooling",
          items: ["GitHub Actions"].filter((item) => resume.techStack.includes(item)),
        },
      ].filter((group) => group.items.length > 0);

      return (
        <div className="space-y-5">
          <p className="text-slate-400 text-sm">
            Production-ready across modern JavaScript stacks, cloud infrastructure, and developer experience tooling.
          </p>
          {groups.map((group) => (
            <div key={group.name} className="space-y-2">
              <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-[0.3em]">{group.name}</h4>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  experience: {
    title: "Experience",
    render: () => (
      <div className="space-y-4">
        {resume.experience.map((role) => (
          <div key={role.company} className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h4 className="text-lg font-semibold text-white">{role.title}</h4>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-400">{role.dates}</span>
            </div>
            <p className="text-sm text-indigo-300">{role.company}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {role.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                  <span dangerouslySetInnerHTML={{ __html: emphasize(bullet) }} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  projects: {
    title: "Projects",
    render: () => (
      <div className="space-y-4">
        {resume.projects.map((project) => (
          <div key={project.name} className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-white">{project.name}</h4>
              {project.tech && <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{project.tech}</span>}
            </div>
            <p className="mt-2 text-sm text-slate-300">{project.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
};

const nodeKeys = Object.keys(panelDefinitions) as PanelKey[];

export function ThreePortfolio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const infoPanelRef = useRef<HTMLDivElement | null>(null);
  const infoContentRef = useRef<HTMLDivElement | null>(null);

  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const defaultCameraPosition = useRef(new Vector3(0, 0, 30));

  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const [sceneReady, setSceneReady] = useState(false);

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    gsap.to(camera.position, {
      x: defaultCameraPosition.current.x,
      y: defaultCameraPosition.current.y,
      z: defaultCameraPosition.current.z,
      duration: 1.2,
      ease: "power3.inOut",
      onUpdate: () => {
        controls.update();
      },
    });
    gsap.to(controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.2,
      ease: "power3.inOut",
      onUpdate: () => {
        controls.update();
      },
    });
  }, []);

  const handleNodeSelect = useCallback((panel: PanelKey, nodePosition: Vector3) => {
    setActivePanel(panel);

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const cameraTarget = nodePosition.clone();
    const direction = nodePosition.clone().normalize();
    const cameraDestination = nodePosition.clone().add(direction.multiplyScalar(6));
    cameraDestination.z += 4;

    gsap.to(camera.position, {
      x: cameraDestination.x,
      y: cameraDestination.y,
      z: cameraDestination.z,
      duration: 1.4,
      ease: "power3.inOut",
      onUpdate: () => {
        controls.update();
      },
    });
    gsap.to(controls.target, {
      x: cameraTarget.x,
      y: cameraTarget.y,
      z: cameraTarget.z,
      duration: 1.4,
      ease: "power3.inOut",
      onUpdate: () => {
        controls.update();
      },
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new Scene();
    scene.background = new THREE.Color("#05050c");
    scene.fog = new THREE.FogExp2(0x050816, 0.01);

    const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(defaultCameraPosition.current);
    cameraRef.current = camera;

    const renderer = new WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 12;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.45);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x8b5cf6, 1.8, 180);
    pointLight.position.set(5, 6, 12);
    scene.add(pointLight);
    const fillLight = new THREE.PointLight(0x22d3ee, 1, 120);
    fillLight.position.set(-6, -3, -10);
    scene.add(fillLight);

    const centralGeometry = new THREE.IcosahedronGeometry(4, 1);
    const centralMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.3,
      wireframe: true,
    });
    const centralObject = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(centralObject);

    const starGeometry = new THREE.BufferGeometry();
    const starVertices: number[] = [];
    for (let i = 0; i < 8000; i += 1) {
      starVertices.push(THREE.MathUtils.randFloatSpread(120));
      starVertices.push(THREE.MathUtils.randFloatSpread(120));
      starVertices.push(THREE.MathUtils.randFloatSpread(120));
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.6, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const nodes: THREE.Mesh[] = [];
    const mouse = new Vector2();
    const raycaster = new THREE.Raycaster();
    let intersected: THREE.Mesh | null = null;

    const nodeGeometry = new THREE.SphereGeometry(0.8, 32, 32);

    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://unpkg.com/three@0.157.0/examples/fonts/helvetiker_regular.typeface.json",
      (font: Font) => {
        nodeKeys.forEach((key, index) => {
          const angle = (index / nodeKeys.length) * Math.PI * 2;
          const radius = 12;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(index / nodeKeys.length, 0.6, 0.6),
            metalness: 0.6,
            roughness: 0.4,
            emissive: new THREE.Color().setHSL(index / nodeKeys.length, 0.6, 0.25),
            emissiveIntensity: 0,
          });

          const node = new THREE.Mesh(nodeGeometry.clone(), material);
          node.position.set(x, y, 0);
          node.userData.panelKey = key;
          scene.add(node);
          nodes.push(node);

          const textGeometry = new TextGeometry(panelDefinitions[key].title, {
            font,
            size: 0.6,
            depth: 0.05,
          });
          textGeometry.center();
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.set(x * 1.2, y * 1.2, 0);
          node.userData.label = textMesh;
          scene.add(textMesh);
        });

        setSceneReady(true);
      },
      undefined,
      () => setSceneReady(true),
    );

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersections = raycaster.intersectObjects(nodes);
      if (intersections.length > 0) {
        const node = intersections[0].object as THREE.Mesh;
        const key = node.userData.panelKey as PanelKey | undefined;
        if (key) {
          handleNodeSelect(key, node.position.clone());
        }
      }
    };

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = Date.now() * 0.0006;
      centralObject.rotation.y += 0.003;
      centralObject.rotation.x += 0.0015;
      stars.rotation.y += 0.0002;

      nodes.forEach((node, index) => {
        node.position.z = Math.sin(elapsed + index * 0.5) * 4;
        const label = node.userData.label as THREE.Mesh | undefined;
        if (label) {
          label.position.z = node.position.z;
          label.lookAt(camera.position);
        }
      });

      raycaster.setFromCamera(mouse, camera);
      const intersections = raycaster.intersectObjects(nodes);

      if (intersections.length > 0) {
        const node = intersections[0].object as THREE.Mesh;
        if (intersected !== node) {
          if (intersected) {
            gsap.to(intersected.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
            const mat = intersected.material as THREE.MeshStandardMaterial;
            gsap.to(mat, { emissiveIntensity: 0, duration: 0.3 });
          }
          intersected = node;
          gsap.to(intersected.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.3 });
          const mat = intersected.material as THREE.MeshStandardMaterial;
          gsap.to(mat, { emissiveIntensity: 0.6, duration: 0.3 });
          document.body.style.cursor = "pointer";
        }
      } else if (intersected) {
        gsap.to(intersected.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        const mat = intersected.material as THREE.MeshStandardMaterial;
        gsap.to(mat, { emissiveIntensity: 0, duration: 0.3 });
        intersected = null;
        document.body.style.cursor = "default";
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      controls.dispose();
      renderer.dispose();
      nodeGeometry.dispose();
      centralGeometry.dispose();
      centralMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      document.body.style.cursor = "default";
    };
  }, [handleNodeSelect]);

  useEffect(() => {
    if (!loaderRef.current) return;
    if (sceneReady) {
      gsap.to(loaderRef.current, {
        autoAlpha: 0,
        duration: 0.6,
        onComplete: () => {
          if (loaderRef.current) loaderRef.current.style.display = "none";
        },
      });
    }
  }, [sceneReady]);

  useEffect(() => {
    if (!headerRef.current || !introRef.current) return;
    if (activePanel) {
      gsap.to(headerRef.current, { opacity: 0.4, duration: 0.5 });
      gsap.to(introRef.current, { opacity: 0, duration: 0.4, onComplete: () => { if (introRef.current) introRef.current.style.pointerEvents = "none"; } });
    } else {
      gsap.to(headerRef.current, { opacity: 1, duration: 0.5 });
      if (introRef.current) {
        introRef.current.style.pointerEvents = "auto";
      }
      gsap.to(introRef.current, { opacity: 1, duration: 0.5, delay: 0.2 });
    }
  }, [activePanel]);

  const panelNode = activePanel ? panelDefinitions[activePanel] : null;
  const panelOpen = Boolean(activePanel);

  useEffect(() => {
    if (!infoContentRef.current) return;
    infoContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [panelOpen]);

  return (
    <div className="relative h-screen w-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        ref={loaderRef}
        className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/80 text-white backdrop-blur"
      >
        <div className="h-16 w-16 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin" />
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-indigo-200">Loading 3D Experience</p>
        <p className="text-xs text-slate-300">Three.js • GSAP • Tailwind CSS</p>
      </div>

      <div className="pointer-events-none relative z-20 flex h-full flex-col p-6 sm:p-8 lg:p-12">
        <header ref={headerRef} className="pointer-events-auto flex w-full items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">{resume.personal.name}</h1>
            <p className="text-sm text-indigo-300 sm:text-base">{resume.personal.role}</p>
          </div>
          <div className="hidden items-center gap-4 text-slate-300 md:flex">
            {Object.entries(resume.personal)
              .filter(([key]) => ["linkedin", "github", "portfolio"].includes(key))
              .map(([key, value]) => (
                <a key={key} href={value} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-white">
                  {CONTACT_ICONS[key]}
                </a>
              ))}
          </div>
        </header>

        <main className="pointer-events-none flex flex-1 items-center justify-center">
          <div ref={introRef} className="pointer-events-auto max-w-2xl text-center transition-opacity duration-500">
            <h2 className="text-3xl font-semibold text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text sm:text-5xl">
              Welcome to my interactive portfolio
            </h2>
            <p className="mt-4 text-sm text-slate-300 sm:text-base">
              Orbit around the scene and explore the floating nodes to uncover projects, skills, and enterprise experience.
            </p>
          </div>
        </main>

        <div className="pointer-events-auto">
          <div
            ref={infoPanelRef}
            className={`absolute bottom-0 left-0 right-0 mx-auto w-full max-w-lg rounded-t-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur transition-transform duration-500 md:left-auto md:right-12 md:w-[420px] md:rounded-3xl ${
              panelOpen
                ? "pointer-events-auto translate-y-0 md:translate-x-0"
                : "pointer-events-none translate-y-full md:translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-indigo-300">Focused Explorer</p>
                  <h3 className="mt-1 text-2xl font-semibold text-white">
                    {panelNode ? panelNode.title : ""}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="rounded-full p-2 text-slate-300 transition hover:bg-white/10"
                  aria-label="Close panel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div ref={infoContentRef} className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2 text-sm text-slate-200">
                {panelNode && panelNode.render()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/70 px-6 py-2 text-xs uppercase tracking-[0.32em] text-slate-300 backdrop-blur md:block">
        Click the orbiting nodes to explore
      </div>
    </div>
  );
}

export default ThreePortfolio;
