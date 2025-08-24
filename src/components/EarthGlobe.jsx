import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function EarthGlobe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const loader = new THREE.TextureLoader();
    const dayTexture = loader.load('/images/earth/2k_earth_daymap.jpg');
    const nightTexture = loader.load('/images/earth/2k_earth_nightmap.jpg');
    const cloudsTexture = loader.load('/images/earth/2k_earth_clouds.jpg');

    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Shader material for day/night
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDir: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDir;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          float intensity = dot(normalize(vNormal), normalize(sunDir));
          float factor = clamp(intensity * 0.5 + 0.5, 0.0, 1.0);
          gl_FragColor = mix(nightColor, dayColor, factor);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(geometry, earthMaterial);
    // Tilt the Earth by 23.44° around X-axis (fixed tilt)
    earthMesh.rotation.x = THREE.MathUtils.degToRad(23.44);
    scene.add(earthMesh);

    // Clouds
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(geometry.clone(), cloudMaterial);
    cloudMesh.scale.set(1.01, 1.01, 1.01);
    cloudMesh.rotation.x = THREE.MathUtils.degToRad(23.44);
    scene.add(cloudMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(ambientLight, directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);

      const now = new Date();
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
      const rotationAngle = (utcHours / 24) * 2 * Math.PI;

      // Rotate Earth around its fixed axis (Y through poles)
      earthMesh.rotation.y = rotationAngle;
      cloudMesh.rotation.y = rotationAngle * 1.02; // clouds slightly faster

      // Compute sun direction vector relative to fixed axis
      // Sun always points along +X in world space for simplicity
      earthMaterial.uniforms.sunDir.value.set(1, 0, 0);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '500px' }} />;
}