import React, { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Vector3 } from 'three';
import { ContactShadows, RoundedBox, useGLTF } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Camera, MoveUpRight } from 'lucide-react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './style.css';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };


function Slab({ y, width = 5.65, depth = 4.55, color = '#b9b4ac' }) {
  return <group position={[0,y,0]}>
    <RoundedBox args={[width,.19,depth]} radius={.055} smoothness={5} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={.82} />
    </RoundedBox>
    <mesh position={[0,-.105,0]}>
      <boxGeometry args={[width-.08,.035,depth-.08]}/>
      <meshStandardMaterial color="#4c4b47" roughness={.9}/>
    </mesh>
  </group>;
}
function WindowBay({ x, y, z = 2.04, width = .76, height = .91 }) {
  return <group position={[x, y, z]}>
    <mesh><boxGeometry args={[width, height, .055]} /><meshPhysicalMaterial color="#8ec9df" metalness={.22} roughness={.12} transmission={.24} transparent opacity={.84} /></mesh>
    <mesh position={[0, 0, .038]}><boxGeometry args={[.035, height + .08, .035]} /><meshStandardMaterial color="#343744" metalness={.65} roughness={.3} /></mesh>
    <mesh position={[0, 0, .04]}><boxGeometry args={[width + .07, .035, .035]} /><meshStandardMaterial color="#343744" metalness={.65} roughness={.3} /></mesh>
    <mesh position={[0, -height * .12, .05]}><boxGeometry args={[.025, height * .76, .025]} /><meshStandardMaterial color="#424957" metalness={.5} roughness={.35} /></mesh>
  </group>;
}
function Sofa({ x, y, z, color = '#9a7890', scale = 1 }) {
  return <group position={[x, y, z]} scale={scale}>
    <mesh position={[0, .18, 0]} castShadow><boxGeometry args={[.9, .25, .38]} /><meshStandardMaterial color={color} roughness={.92} /></mesh>
    <mesh position={[0, .43, -.15]} castShadow><boxGeometry args={[.9, .43, .12]} /><meshStandardMaterial color={color} roughness={.92} /></mesh>
    {[-.39, .39].map((x, i) => <mesh key={i} position={[x, .3, 0]}><boxGeometry args={[.12, .36, .4]} /><meshStandardMaterial color={color} /></mesh>)}
  </group>;
}
function InteriorRoom({ floor, y }) {
  const warm = floor % 2 ? '#d9c4aa' : '#c8b6a3';
  return <group position={[0, y, 0]}>
    <mesh position={[-.9, .15, -.25]}><boxGeometry args={[1.15, .07, 1.05]} /><meshStandardMaterial color={warm} roughness={.8} /></mesh>
    <Sofa x={-1.0} y={.2} z={.25} color={floor % 2 ? '#687c86' : '#9b7b78'} scale={.78}/>
    <mesh position={[.78, .28, -.3]} castShadow><boxGeometry args={[.85, .08, .62]} /><meshStandardMaterial color="#72584a" roughness={.58} /></mesh>
    <mesh position={[.78, .11, -.3]}><boxGeometry args={[.06, .28, .06]} /><meshStandardMaterial color="#473c38" /></mesh>
    <mesh position={[1.25, .22, .55]}><cylinderGeometry args={[.22, .28, .42, 12]} /><meshStandardMaterial color="#b58b69" roughness={.9} /></mesh>
    <mesh position={[1.25, .55, .55]}><sphereGeometry args={[.25, 14, 12]} /><meshStandardMaterial color="#477b65" roughness={1} /></mesh>
    <mesh position={[-1.7, .18, -.9]}><boxGeometry args={[.52, .34, .52]} /><meshStandardMaterial color="#b69b7f" /></mesh>
    <mesh position={[-1.7, .38, -.9]}><boxGeometry args={[.55, .06, .55]} /><meshStandardMaterial color="#e0d3c1" /></mesh>
  </group>;
}

function Balcony({ y, width = 2.65 }) {
  return <group position={[0,y,2.38]}>
    <RoundedBox args={[width,.16,.88]} radius={.075} smoothness={5} position={[0,0,.18]} castShadow receiveShadow>
      <meshStandardMaterial color="#bcb8b0" roughness={.74}/>
    </RoundedBox>
    {/* frameless laminated glass balustrade with dark anodised cap */}
    <mesh position={[0,.48,.57]}>
      <boxGeometry args={[width-.12,.84,.035]}/>
      <meshPhysicalMaterial color="#a9c4c7" metalness={.32} roughness={.12} transmission={.08} transparent opacity={.34} />
    </mesh>
    <mesh position={[0,.91,.57]}>
      <boxGeometry args={[width,.045,.065]}/>
      <meshStandardMaterial color="#292c2e" metalness={.82} roughness={.24}/>
    </mesh>
    {[-width/2+.08,width/2-.08].map((x,i)=><mesh key={i} position={[x,.46,.57]}>
      <boxGeometry args={[.045,.9,.065]}/>
      <meshStandardMaterial color="#343638" metalness={.78} roughness={.26}/>
    </mesh>)}
    <mesh position={[-width*.31,.22,.02]}>
      <cylinderGeometry args={[.18,.2,.42,20]}/>
      <meshStandardMaterial color="#5d5146" roughness={.88}/>
    </mesh>
    <mesh position={[-width*.31,.52,.02]}>
      <icosahedronGeometry args={[.23,2]}/>
      <meshStandardMaterial color="#496653" roughness={.96}/>
    </mesh>
    <mesh position={[width*.28,.17,.12]}>
      <boxGeometry args={[.48,.07,.42]}/>
      <meshStandardMaterial color="#57483d" roughness={.8}/>
    </mesh>
  </group>;
}
function FacadeWindow({x,y,z,width=0.78,height=1.12}) {
  return <group position={[x,y,z]}>
    <mesh>
      <boxGeometry args={[width,height,.045]}/>
      <meshPhysicalMaterial color="#26383d" metalness={.42} roughness={.16} clearcoat={.8} clearcoatRoughness={.12} transparent opacity={.9}/>
    </mesh>
    <mesh position={[0,0,.03]}>
      <boxGeometry args={[.035,height+.035,.055]}/>
      <meshStandardMaterial color="#343a3b" metalness={.8} roughness={.28}/>
    </mesh>
    <mesh position={[0,0,.032]}>
      <boxGeometry args={[width+.035,.035,.055]}/>
      <meshStandardMaterial color="#343a3b" metalness={.8} roughness={.28}/>
    </mesh>
    <mesh position={[0,0,.034]}>
      <boxGeometry args={[.022,height,.06]}/>
      <meshStandardMaterial color="#4d5555" metalness={.72} roughness={.3}/>
    </mesh>
    <mesh position={[0,-height*.18,.04]}>
      <boxGeometry args={[width,.022,.06]}/>
      <meshStandardMaterial color="#4d5555" metalness={.72} roughness={.3}/>
    </mesh>
  </group>;
}
function FloorModule({ index, progress }) {
  const ref = useRef();
  const y = index * 1.48;
  useFrame(() => {
    if (!ref.current) return;
    const reveal = smooth(.53, .76, progress.current);
    ref.current.position.y = y + (index - 2) * reveal * .92;
  });
  const concrete = index % 2 ? '#b7b2a9' : '#c7c1b7';
  return <group ref={ref} position={[0,y,0]}>
    <Slab y={0} width={5.65} depth={4.55} color={concrete}/>
    {/* warm interior ceiling and floor finish */}
    <mesh position={[0,.13,-.02]} receiveShadow>
      <boxGeometry args={[5.25,.045,4.18]}/>
      <meshStandardMaterial color={index%2?'#827b70':'#988c7d'} roughness={.92}/>
    </mesh>
    {/* solid service core and side returns */}
    <mesh position={[0,.78,-2.17]} castShadow receiveShadow>
      <boxGeometry args={[5.42,1.34,.16]}/>
      <meshStandardMaterial color="#aaa49b" roughness={.9}/>
    </mesh>
    <mesh position={[-2.72,.78,0]} castShadow>
      <boxGeometry args={[.16,1.34,4.35]}/>
      <meshStandardMaterial color="#c0bbb2" roughness={.86}/>
    </mesh>
    <mesh position={[2.72,.78,0]} castShadow>
      <boxGeometry args={[.16,1.34,4.35]}/>
      <meshStandardMaterial color="#c0bbb2" roughness={.86}/>
    </mesh>
    {/* interior partition walls, door opening and joinery */}
    <mesh position={[.72,.76,-.72]}>
      <boxGeometry args={[.11,1.22,2.55]}/>
      <meshStandardMaterial color="#d4cec4" roughness={.9}/>
    </mesh>
    <mesh position={[1.62,.76,-1.35]}>
      <boxGeometry args={[1.7,1.22,.11]}/>
      <meshStandardMaterial color="#d4cec4" roughness={.9}/>
    </mesh>
    <mesh position={[2.24,.75,-.73]}>
      <boxGeometry args={[.055,1.12,.055]}/>
      <meshStandardMaterial color="#7a6b5b" roughness={.7}/>
    </mesh>
    <InteriorRoom floor={index} y={.17}/>
    {/* full-height glazed façade, separated into realistic curtain-wall bays */}
    {[-2.08,-1.24,-.4,.44,1.28,2.12].map((x,i)=>
      <FacadeWindow key={i} x={x} y={.79} z={2.25} width={i===5?.54:.78} height={1.22}/>
    )}
    {/* concrete balcony fascia and glass guard */}
    <Balcony y={.18} width={2.85}/>
    {/* vertical bronze fins and slab-edge shadow gap */}
    {[-2.45,2.45].map((x,i)=><mesh key={i} position={[x,.78,2.32]} castShadow>
      <boxGeometry args={[.12,1.38,.19]}/>
      <meshStandardMaterial color="#4a4540" metalness={.58} roughness={.34}/>
    </mesh>)}
    <mesh position={[0,1.39,2.27]}>
      <boxGeometry args={[5.5,.075,.16]}/>
      <meshStandardMaterial color="#77736c" roughness={.78}/>
    </mesh>
    {/* recessed linear warm architectural lighting */}
    <mesh position={[0,1.34,2.355]}>
      <boxGeometry args={[4.95,.018,.018]}/>
      <meshStandardMaterial color="#ff9a45" emissive="#ff6a00" emissiveIntensity={1.4}/>
    </mesh>
    {/* window reveals and dark metal sill details */}
    {[-2.1,-1.25,-.4,.45,1.3,2.12].map((x,i)=><mesh key={i} position={[x,.13,2.28]}>
      <boxGeometry args={[.78,.045,.12]}/>
      <meshStandardMaterial color="#55534f" metalness={.55} roughness={.38}/>
    </mesh>)}
  </group>;
}

function Tree({ position, size = 1 }) {
  return <group position={position} scale={size}>
    <mesh position={[0,.7,0]} castShadow>
      <cylinderGeometry args={[.075,.14,1.4,12]}/>
      <meshStandardMaterial color="#514337" roughness={1}/>
    </mesh>
    {[[0,1.45,0,.66],[.28,1.82,.05,.48],[-.25,1.98,-.08,.43],[.02,2.27,.02,.34]].map((v,i)=>
      <mesh key={i} position={v.slice(0,3)} castShadow>
        <icosahedronGeometry args={[v[3],2]}/>
        <meshStandardMaterial color={['#344c3d','#405b46','#526c50','#3b5844'][i]} roughness={1}/>
      </mesh>
    )}
  </group>;
}
function Drone({ progress }) {
  const ref = useRef();
  const rotors = useRef([]);
  useFrame((state) => {
    if (!ref.current) return;
    // Keep the aircraft above the roofline and on the camera-facing orbit.
    const droneFade = 1 - smooth(.56, .76, progress.current);
    ref.current.visible = droneFade > .02;
    ref.current.scale.setScalar(2.25 * droneFade);
    const a = progress.current * Math.PI * 2.35 + .95;
    ref.current.position.set(Math.cos(a) * 5.7, 24.2 + Math.sin(a * 1.4) * .22, Math.sin(a) * 5.7);
    ref.current.rotation.y = -a + .35;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.8) * .018;
    rotors.current.forEach((rotor, i) => { if (rotor) rotor.rotation.y += (i % 2 ? -1 : 1) * .48; });
  });
  return <group ref={ref}>
    {/* compact quadcopter body with a clear signal-orange top shell */}
    <mesh castShadow><boxGeometry args={[.48, .13, .36]} /><meshStandardMaterial color="#20252a" metalness={.72} roughness={.24}/></mesh>
    <mesh position={[0,.075,0]} castShadow><boxGeometry args={[.27,.045,.24]} /><meshStandardMaterial color="#e76b2f" metalness={.35} roughness={.34}/></mesh>
    <mesh position={[0,-.115,.205]}><sphereGeometry args={[.095,18,14]}/><meshStandardMaterial color="#ffb16b" emissive="#ff6b24" emissiveIntensity={2.1}/></mesh>
    <mesh position={[0,-.12,-.19]}><sphereGeometry args={[.045,12,10]}/><meshStandardMaterial color="#ff4545" emissive="#ff2020" emissiveIntensity={1.5}/></mesh>
    {[[-.48,0,-.36],[.48,0,-.36],[-.48,0,.36],[.48,0,.36]].map(([x,y,z],i)=><group key={i} position={[x,y,z]}>
      <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.026,.026,.55,10]}/><meshStandardMaterial color="#8c9298" metalness={.8} roughness={.25}/></mesh>
      <group ref={el=>rotors.current[i]=el} position={[0,.075,0]}>
        <mesh><cylinderGeometry args={[.205,.205,.018,28]}/><meshStandardMaterial color="#c6cbd0" metalness={.55} roughness={.28} transparent opacity={.72}/></mesh>
        <mesh rotation={[0,.42,0]}><boxGeometry args={[.48,.012,.045]}/><meshStandardMaterial color="#e3e6e8" transparent opacity={.72}/></mesh>
      </group>
      <mesh position={[0,-.08,0]}><cylinderGeometry args={[.045,.045,.16,12]}/><meshStandardMaterial color="#33383c" metalness={.7}/></mesh>
    </group>)}
    <pointLight color="#ff7958" intensity={2.2} distance={3}/>
  </group>;
}
function Camera360({ progress }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const show = smooth(.57, .68, progress.current);
    ref.current.visible = show > .02;
    ref.current.scale.setScalar(.001 + show * .95);
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * .4) * .08;
  });
  return <group ref={ref} position={[.9, 6.0, .8]}>
    <mesh position={[0, .62, 0]}><cylinderGeometry args={[.035,.05,1.15,12]}/><meshStandardMaterial color="#343a45" metalness={.7}/></mesh>
    <mesh position={[0, 1.22, 0]}><sphereGeometry args={[.22,24,18]}/><meshPhysicalMaterial color="#171d28" metalness={.7} roughness={.2}/></mesh>
    <mesh position={[0, 1.22, .19]}><sphereGeometry args={[.075,16,12]}/><meshStandardMaterial color="#9fdcff" emissive="#397da0" emissiveIntensity={.8}/></mesh>
    <mesh position={[0, .05, 0]}><cylinderGeometry args={[.16,.2,.08,16]}/><meshStandardMaterial color="#5b6270"/></mesh>
  </group>;
}

function Building({ progress }) {
  const root = useRef();
  const { scene } = useGLTF('/models/byom-residence-realistic.glb');
  const model = useMemo(() => scene.clone(true), [scene]);
  const floorNames = ['Floor_01','Floor_02','Floor_03','Floor_04','Floor_05'];
  const floorBase = [3.35,6.42,9.49,12.56,15.63];

  useEffect(() => {
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.needsUpdate = true;
        }
      }
    });
  }, [model]);

  useFrame((state) => {
    const p = progress.current;
    if (!root.current) return;
    root.current.rotation.y = -.34 + p * 1.12 + Math.sin(state.clock.elapsedTime * .10) * .008;
    root.current.rotation.x = .012 + Math.sin(p * Math.PI) * .012;

    const reveal = smooth(.53, .78, p);
    floorNames.forEach((name, i) => {
      const floor = model.getObjectByName(name);
      if (floor) floor.position.y = floorBase[i] + (i - 2) * reveal * 1.7;
    });

    const glassReveal = smooth(.43, .66, p);
    model.traverse((obj) => {
      if (obj.isMesh && obj.material && obj.material.name?.toLowerCase().includes('glass')) {
        obj.material.transparent = true;
        obj.material.opacity = 1 - glassReveal * .58;
      }
    });

    const angle = -.36 + p * Math.PI * .78;
    const radius = p < .34 ? 13.2 : p < .68 ? 11.7 : 10.9;
    const closeIn = smooth(.24, .6, p);
    const desired = new Vector3(Math.sin(angle) * radius + .5 * (1-p), 6.0 - closeIn * .55, Math.cos(angle) * radius + .4);
    // Final chapter: leave the exterior orbit and travel through the open façade
    // toward a furnished living room on the second level.
    const roomZoom = smooth(.73, .94, p);
    desired.lerp(new Vector3(.15, -.15, 3.9), roomZoom);
    const exteriorTarget = new Vector3(0, .15 + smooth(.55,.78,p)*.15, 0);
    exteriorTarget.lerp(new Vector3(-.55, -1.95, .9), roomZoom);
    state.camera.position.lerp(desired, .045 + roomZoom * .045);
    state.camera.lookAt(exteriorTarget);
  });

  return <group ref={root} position={[0,-4.0,0]} scale={.42}>
    <primitive object={model}/>
    <Drone progress={progress}/>
    <Camera360 progress={progress}/>
  </group>;
}
useGLTF.preload('/models/byom-residence-realistic.glb');

function Scene({ progress }) {
  return <Canvas fallback={<div className="scene-fallback">3D EXPERIENCE UNAVAILABLE — EXPLORE THE PROJECT STORY BELOW</div>} camera={{position:[7.4,6.1,13.1],fov:33,near:.1,far:100}} dpr={[1,1.25]} shadows gl={{antialias:true,alpha:true}}>
    <color attach="background" args={['#111111']}/><fog attach="fog" args={['#111111',23,48]}/>
    <ambientLight intensity={1.65}/><hemisphereLight args={['#f2e8dc','#30251c',1.35]}/>
    <directionalLight position={[8,13,9]} intensity={2.65} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}/>
    <directionalLight position={[-8,7,-6]} color="#ff8a3d" intensity={1.35}/>
    <pointLight position={[-5,5,-4]} color="#ff7a24" intensity={8}/><pointLight position={[4,2,5]} color="#ff9a45" intensity={10}/>
    <Building progress={progress}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-4.52,0]} receiveShadow><planeGeometry args={[80,80]}/><meshStandardMaterial color="#171715" roughness={1}/></mesh><ContactShadows position={[0,-4.48,0]} opacity={.42} scale={18} blur={2.8} far={7}/>
  </Canvas>;
}

const stages = [
  {eyebrow:'01 / AERIAL VIEW',title:'See the whole\nstructure.',body:'A drone moves around the building to capture façades, elevations, rooflines and the wider site. Follow the exterior story from every angle.',tag:'DRONE · EXTERIOR CAPTURE',icon:'↗'},
  {eyebrow:'02 / CLOSER INSPECTION',title:'Get closer.\nSpot the detail.',body:'The view moves toward the façade. Repeated aerial perspectives help teams review visible changes between site visits and milestones.',tag:'FACADE · PROGRESS REVIEW',icon:'⌁'},
  {eyebrow:'03 / INSIDE THE SPACE',title:'Step inside\nevery room.',body:'The building opens into a floor-by-floor cutaway. A 360° camera captures room-level context so teams can revisit spaces and inspect finishes.',tag:'360° CAMERA · INTERIOR CAPTURE',icon:'◎'},
  {eyebrow:'04 / ROOM-LEVEL DETAIL',title:'Step into the\nliving room.',body:'Move from the building-wide view into a furnished interior. Review the room, finishes and spatial context as part of the same project story.',tag:'LIVING ROOM · INTERIOR REVIEW',icon:'◎'}
];
function Nav(){
  return <header className="byom-nav">
    <a className="byom-wordmark" href="#top" aria-label="Byom AI home">BYOM<span>.</span><i>AI</i></a>
    <nav className="drive-nav" aria-label="Experience navigation">
      <a className="active" href="#top">THE SITE</a>
      <span> / </span><a href="#platform">THE PLATFORM</a>
      <span> / </span><a href="#contact">CONTACT</a>
    </nav>
    <div className="nav-status"><i/> LIVE SITE INTELLIGENCE</div>
  </header>
}
function HeroExperience(){
  const section=useRef(null), progress=useRef(0), progressLine=useRef(null);
  const [stage,setStage]=React.useState(0);
  const stageRef=useRef(0);
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const ctx=gsap.context(()=>{
      gsap.to(progress, {
        current: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: self => {
            const nextStage=Math.min(3,Math.floor(Math.min(.999999,self.progress)*4));
            if(nextStage!==stageRef.current){stageRef.current=nextStage;setStage(nextStage);}
          }
        }
      });
      if(progressLine.current){
        gsap.fromTo(progressLine.current,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:section.current,start:'top top',end:'bottom bottom',scrub:1}});
      }
    },section);
    return ()=>ctx.revert();
  },[]);
  return <section className="hero-scroll" id="top" ref={section}>
    <div className="hero-sticky">
      <div className="hero-ambient"/><div className="hero-blueprint-grid"/>
      <Nav/>
      <div className="hero-side-label"><span>BYOM / FIELD NOTES</span><i/> <span>01—04</span></div>
      <div className="hero-copy-block">
        <div className="hero-eyebrow"><span/> BUILT WORLD INTELLIGENCE <b>·</b> EXPERIENCE 001</div>
        <AnimatePresence mode="wait">
          <motion.div key={stage} className="hero-stage-copy" initial={{opacity:0,y:30,filter:'blur(10px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} exit={{opacity:0,y:-22,filter:'blur(8px)'}} transition={{duration:.55,ease:[.22,1,.36,1]}}>
            <div className="stage-kicker">{stages[stage].eyebrow}</div>
            <h1>{stage===0?<>THE SITE.<br/><span>IN FULL.</span></>:stages[stage].title.split('\n').map((line,i)=><React.Fragment key={i}>{i>0&&<br/>}{line}</React.Fragment>)}</h1>
            <p>{stage===0?'A new perspective on the built world. Byom brings drone captures, 360° interiors and architectural drawings into one living view of your project.':stages[stage].body}</p>
            <div className="hero-stage-tag"><b>{stages[stage].icon}</b>{stages[stage].tag}</div>
          </motion.div>
        </AnimatePresence>
        {stage===0&&<div className="hero-actions"><a className="hero-primary" href="#platform">DISCOVER BYOM <ArrowUpRight size={17}/></a><span>INTERIORS / CONSTRUCTION / PROJECT TEAMS</span></div>}
      </div>
      <div className="hero-model-area"><div className="model-aura"/><div className="model-ring ring-a"/><div className="model-ring ring-b"/><Scene progress={progress}/>
        <div className="model-hud hud-drone"><span className="hud-icon"><MoveUpRight size={15}/></span><span><b>01 / DRONE CAPTURE</b><small>Exterior · Aerial intelligence</small></span><i className="hud-live"/></div>
        <div className="model-hud hud-360"><span className="hud-icon"><Camera size={15}/></span><span><b>02 / 360° WALKTHROUGH</b><small>Interior · Spatial capture</small></span></div>
        <div className="model-coordinates">PROJECT 001 <span>///</span> SPATIAL SCAN ACTIVE</div>
      </div>
      <div className="drive-chapters" aria-label="Experience chapters">{stages.map((s,i)=><div key={s.eyebrow} className={stage===i?'current':''}><b>0{i+1}</b><span>{['AERIAL','INSPECT','EXPLORE','CONNECT'][i]}</span></div>)}</div>
      <div className="hero-bottom-bar"><span>BYOM.AI <b>— THE BUILT WORLD, REIMAGINED</b></span><span className="scroll-prompt">SCROLL TO DRIVE <ChevronDown size={14}/></span><span>DRONE + 360° + DRAWINGS</span></div>
      <div className="hero-progress"><i ref={progressLine}/></div>
      <div className="stage-dots">{stages.map((s,i)=><span key={s.eyebrow} className={stage===i?'active':''}/>)}</div>
    </div>
  </section>
}
function ProductProof(){
  const [view,setView]=React.useState('overview');
  const tabs=[
    {id:'overview',label:'PROJECT VIEW',title:'One project. Multiple perspectives.',copy:'A shared project context for exterior captures, interior walkthroughs and drawing references.',tag:'PROJECT OVERVIEW'},
    {id:'drawing',label:'DRAWINGS',title:'Keep the drawing in the conversation.',copy:'Bring architectural references alongside captured site conditions, so teams can review the same space with more context.',tag:'DRAWING CONTEXT'},
    {id:'walkthrough',label:'360° WALKTHROUGH',title:'Return to the room, without returning to site.',copy:'Revisit captured interior spaces and discuss finishes, coordination and progress with visual context.',tag:'INTERIOR CONTEXT'}
  ];
  const active=tabs.find(t=>t.id===view);
  return <section className="proof-section" id="platform">
    <div className="proof-shell">
      <div className="section-overline"><span/> THE BYOM WORKFLOW <b> / 02</b></div>
      <div className="proof-heading"><h2>From scattered<br/><em>evidence</em> to shared context.</h2><p>Site intelligence should not live in disconnected folders, camera feeds and drawing versions. Byom brings the visual record of a project into one place.</p></div>
      <div className="proof-console">
        <div className="console-top"><div className="console-brand"><span className="console-mark">B.</span><span>BYOM <small>PROJECT SPACE</small></span></div><div className="console-project">SAMPLE PROJECT <b> / RESIDENTIAL</b></div><div className="console-state"><i/> CONCEPT PREVIEW</div></div>
        <div className="console-tabs" role="tablist" aria-label="Project view preview">{tabs.map(t=><button key={t.id} role="tab" aria-selected={view===t.id} className={view===t.id?'selected':''} onClick={()=>setView(t.id)}>{t.label}</button>)}</div>
        <div className="console-content">
          <div className={`console-visual visual-${view}`} aria-hidden="true">
            {view==='overview'&&<><div className="visual-building"><i/><i/><i/><i/><i/></div><div className="visual-pin pin-one">EXTERIOR <b>01</b></div><div className="visual-pin pin-two">INTERIOR <b>02</b></div><div className="visual-orbit"/></>}
            {view==='drawing'&&<div className="blueprint"><div className="blueprint-room room-a"/><div className="blueprint-room room-b"/><div className="blueprint-room room-c"/><span>LEVEL 02 — REFERENCE PLAN</span><i className="blueprint-dim dim-a"/><i className="blueprint-dim dim-b"/></div>}
            {view==='walkthrough'&&<div className="room-preview"><div className="room-wall wall-back"/><div className="room-wall wall-side"/><div className="room-floor"/><div className="room-sofa"/><div className="room-window"/><div className="room-scan">360° VIEW <b>↗</b></div></div>}
            <div className="visual-crosshair">+</div>
          </div>
          <div className="console-details"><div className="console-label">{active.tag}</div><h3>{active.title}</h3><p>{active.copy}</p><div className="console-meta"><span>01 <b>CAPTURE</b></span><span>02 <b>CONTEXT</b></span><span>03 <b>COLLABORATE</b></span></div><div className="console-note">Illustrative interface · Not a live customer project</div></div>
        </div>
      </div>
      <div className="workflow-strip"><div><b>01</b><strong>CAPTURE</strong><span>Drone + 360° imagery</span></div><div><b>02</b><strong>CONNECT</strong><span>Drawings + site context</span></div><div><b>03</b><strong>REVIEW</strong><span>A clearer project conversation</span></div></div>
    </div>
  </section>
}
function ClosingSection(){
  return <footer className="closing-section" id="contact"><div className="closing-grid"/><div className="closing-inner"><div className="section-overline"><span/> YOUR NEXT SITE, IN FULL <b> / 03</b></div><h2>Make the<br/><em>built world</em><br/>easier to see.</h2><p>Bring your next interiors or construction project into focus with Byom.ai.</p><a className="closing-cta" href="mailto:hello@byom.ai?subject=Book%20a%20Byom.ai%20demo">TALK TO OUR TEAM <ArrowUpRight size={18}/></a></div><div className="closing-footer"><a className="byom-wordmark" href="#top">BYOM<span>.</span><i>AI</i></a><span>BUILT WORLD INTELLIGENCE</span><a href="mailto:hello@byom.ai">HELLO@BYOM.AI ↗</a><small>© 2026 BYOM.AI</small></div></footer>
}

function App(){
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const lenis=new Lenis({
      autoRaf:false,
      duration:1.15,
      smoothWheel:true,
      syncTouch:false,
      anchors:true,
      respectReducedMotion:true
    });
    const updateScrollTrigger=()=>ScrollTrigger.update();
    const tick=time=>lenis.raf(time*1000);
    lenis.on('scroll',updateScrollTrigger);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const refresh=()=>ScrollTrigger.refresh();
    window.addEventListener('load',refresh);
    const refreshTimer=window.setTimeout(refresh,250);
    return ()=>{
      window.clearTimeout(refreshTimer);
      window.removeEventListener('load',refresh);
      lenis.off('scroll',updateScrollTrigger);
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger=>trigger.kill());
    };
  },[]);
  return <main className="byom-app"><HeroExperience/><ProductProof/><ClosingSection/></main>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
