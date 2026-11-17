import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type BodyMarker = { id:string; region:string; x:number; y:number; z:number }

type Props = {
  markers:BodyMarker[]
  onMark:(marker:BodyMarker)=>void
  onRemove:(id:string)=>void
  readOnly?:boolean
}

type View = 'anterior' | 'posterior' | 'lateral'

function regionForHit(object:THREE.Object3D, point:THREE.Vector3):string {
  const side = point.x >= 0 ? 'esquerdo' : 'direito'
  const kind = object.userData.kind as string
  if(kind==='head') return point.z >= 0 ? 'Cabeça / face' : 'Região occipital'
  if(kind==='torso'){
    const front = point.z >= 0
    if(front) return point.y > .72 ? 'Tórax anterior' : point.y > .12 ? 'Abdome' : 'Pelve anterior'
    return point.y > .72 ? 'Região escapular' : point.y > .18 ? 'Região dorsal' : point.y > -.2 ? 'Região lombar' : 'Sacro'
  }
  if(kind==='pelvis') return point.z >= 0 ? 'Pelve anterior' : 'Glúteo '+side
  if(kind==='arm') return (object.userData.part as string)+' '+side
  if(kind==='leg') return (object.userData.part as string)+' '+side
  return 'Superfície corporal'
}

export default function BodyModel3D({markers,onMark,onRemove,readOnly=false}:Props){
  const host=useRef<HTMLDivElement>(null)
  const markRef=useRef(onMark)
  const markersRef=useRef(markers)
  const markerGroupRef=useRef<THREE.Group|null>(null)
  const cameraRef=useRef<THREE.PerspectiveCamera|null>(null)
  const controlsRef=useRef<OrbitControls|null>(null)
  const [view,setView]=useState<View>('anterior')
  useEffect(()=>{markRef.current=onMark},[onMark])
  useEffect(()=>{markersRef.current=markers},[markers])

  useEffect(()=>{
    const el=host.current
    if(!el)return
    const scene=new THREE.Scene()
    scene.background=new THREE.Color('#f5f8f7')
    const camera=new THREE.PerspectiveCamera(30,1,.1,100)
    camera.position.set(0,.02,7.7)
    cameraRef.current=camera
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.outputColorSpace=THREE.SRGBColorSpace
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=1.12
    el.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xfff7ef,0x9caea7,2.0))
    const key=new THREE.DirectionalLight(0xffeadb,3.0);key.position.set(3.5,5,6);scene.add(key)
    const fill=new THREE.DirectionalLight(0xd8e9ff,1.35);fill.position.set(-4,2,4);scene.add(fill)
    const rim=new THREE.DirectionalLight(0xe1f5ed,2.3);rim.position.set(-3,3,-5);scene.add(rim)
    const front=new THREE.PointLight(0xffffff,.45,12);front.position.set(0,1,4);scene.add(front)

    const model=new THREE.Group();scene.add(model)
    const skin=new THREE.MeshPhysicalMaterial({color:'#d8bba7',roughness:.66,metalness:0,clearcoat:.12,clearcoatRoughness:.72})
    const skinLight=new THREE.MeshPhysicalMaterial({color:'#e2c8b5',roughness:.7,clearcoat:.08})
    const skinShade=new THREE.MeshStandardMaterial({color:'#bd9d89',roughness:.78})
    const detail=new THREE.MeshStandardMaterial({color:'#ad8978',roughness:.82})
    const subtle=new THREE.MeshStandardMaterial({color:'#c5a593',roughness:.82})
    const dark=new THREE.MeshStandardMaterial({color:'#795f55',roughness:.9})
    const floorMat=new THREE.MeshStandardMaterial({color:'#e6eeea',roughness:1})

    const sphere=new THREE.SphereGeometry(1,40,28)
    const addEllipsoid=(position:[number,number,number],scale:[number,number,number],material:THREE.Material,kind='torso',part='')=>{
      const mesh=new THREE.Mesh(sphere,material)
      mesh.position.set(...position);mesh.scale.set(...scale);mesh.userData={kind,part}
      model.add(mesh);return mesh
    }
    const addSegment=(a:THREE.Vector3,b:THREE.Vector3,r1:number,r2:number,material:THREE.Material,kind:string,part:string)=>{
      const direction=new THREE.Vector3().subVectors(b,a)
      const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,direction.length(),28,3,true),material)
      mesh.position.copy(a).add(b).multiplyScalar(.5)
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize())
      mesh.userData={kind,part};model.add(mesh)
      const capA=new THREE.Mesh(sphere,material);capA.position.copy(a);capA.scale.set(r1,r1,r1);capA.userData={kind,part};model.add(capA)
      const capB=new THREE.Mesh(sphere,material);capB.position.copy(b);capB.scale.set(r2,r2,r2);capB.userData={kind,part};model.add(capB)
      return mesh
    }
    const line=(points:THREE.Vector3[],material:THREE.Material,radius=.012)=>{
      const curve=new THREE.CatmullRomCurve3(points)
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,radius,8,false),material)
      mesh.userData={kind:'torso'};model.add(mesh);return mesh
    }

    // Head, face and neck: deliberately neutral, non-identifiable clinical mannequin.
    addEllipsoid([0,1.67,0],[.205,.265,.19],skinLight,'head')
    addEllipsoid([0,1.535,.045],[.145,.105,.15],skin,'head')
    addEllipsoid([-.207,1.68,0],[.045,.075,.045],skin,'head')
    addEllipsoid([.207,1.68,0],[.045,.075,.045],skin,'head')
    addEllipsoid([0,1.69,.185],[.027,.055,.045],skinShade,'head')
    addEllipsoid([-.075,1.735,.165],[.018,.012,.009],dark,'head')
    addEllipsoid([.075,1.735,.165],[.018,.012,.009],dark,'head')
    addEllipsoid([0,1.585,.17],[.065,.012,.012],detail,'head')
    addEllipsoid([0,1.36,0],[.105,.16,.105],skin,'torso')

    // Thorax and abdomen use a lathed anatomical silhouette instead of stacked spheres.
    const torsoProfile=[
      new THREE.Vector2(.12,-.55),new THREE.Vector2(.19,-.48),new THREE.Vector2(.255,-.30),
      new THREE.Vector2(.29,-.08),new THREE.Vector2(.34,.16),new THREE.Vector2(.39,.39),
      new THREE.Vector2(.37,.56),new THREE.Vector2(.29,.66),new THREE.Vector2(.16,.69),
      new THREE.Vector2(.12,.63)
    ]
    const torsoGeo=new THREE.LatheGeometry(torsoProfile,64)
    torsoGeo.computeVertexNormals()
    const torso=new THREE.Mesh(torsoGeo,skin);torso.position.y=.72;torso.scale.set(1,1,.72);torso.userData={kind:'torso'};model.add(torso)
    addEllipsoid([0,.02,0],[.285,.22,.19],skin,'pelvis')
    addEllipsoid([-.155,.08,.16],[.145,.17,.055],skinLight,'torso')
    addEllipsoid([.155,.08,.16],[.145,.17,.055],skinLight,'torso')
    // Clavicles, sternum and gentle abdominal landmarks.
    line([new THREE.Vector3(-.29,1.13,.185),new THREE.Vector3(-.16,1.18,.205),new THREE.Vector3(0,1.12,.21),new THREE.Vector3(.16,1.18,.205),new THREE.Vector3(.29,1.13,.185)],subtle,.012)
    line([new THREE.Vector3(0,1.06,.218),new THREE.Vector3(0,.82,.225),new THREE.Vector3(0,.56,.22)],skinShade,.009)
    for(let y=.73;y>.28;y-=.17){
      line([new THREE.Vector3(-.105,y,.205),new THREE.Vector3(0,y-.012,.226),new THREE.Vector3(.105,y,.205)],subtle,.006)
    }
    // Back landmarks: scapular planes and a subtle spinal midline.
    addEllipsoid([-.205,.99,-.17],[.12,.20,.035],skinShade,'torso')
    addEllipsoid([.205,.99,-.17],[.12,.20,.035],skinShade,'torso')
    line([new THREE.Vector3(0,1.12,-.19),new THREE.Vector3(0,.75,-.205),new THREE.Vector3(0,.38,-.18),new THREE.Vector3(0,.12,-.17)],detail,.009)
    addEllipsoid([-.15,-.02,-.12],[.16,.17,.09],skinLight,'pelvis')
    addEllipsoid([.15,-.02,-.12],[.16,.17,.09],skinLight,'pelvis')

    // Arms: upper arm, elbow, forearm, wrist and individually modelled palm/fingers.
    for(const s of [-1,1]){
      const shoulder=new THREE.Vector3(s*.39,1.12,0)
      const elbow=new THREE.Vector3(s*.54,.66,.005)
      const wrist=new THREE.Vector3(s*.62,.18,.025)
      addEllipsoid([s*.39,1.105,0],[.14,.16,.14],skin,'arm','Ombro')
      addSegment(shoulder,elbow,.115,.085,skin,'arm','Braço')
      addEllipsoid([s*.54,.66,.005],[.087,.09,.09],skinShade,'arm','Cotovelo')
      addSegment(elbow,wrist,.083,.052,skinLight,'arm','Antebraço')
      addEllipsoid([s*.62,.18,.025],[.058,.065,.06],skinShade,'arm','Punho')
      addEllipsoid([s*.64,.055,.04],[.075,.115,.035],skin,'arm','Mão')
      for(let f=0;f<4;f++){
        const x=s*(.585+f*.036)
        const start=new THREE.Vector3(x,.005,.045)
        const end=new THREE.Vector3(x+s*(f===0?-.018:.012),-.115-(f===1||f===2?.018:0),.05)
        addSegment(start,end,.014,.010,skinLight,'arm','Dedo')
      }
      addSegment(new THREE.Vector3(s*.585,.09,.065),new THREE.Vector3(s*.535,.025,.075),.018,.012,skin,'arm','Polegar')
    }

    // Lower limbs with distinct thigh, patella, calf, ankle and feet.
    for(const s of [-1,1]){
      const hip=new THREE.Vector3(s*.17,-.12,0)
      const knee=new THREE.Vector3(s*.19,-.91,.015)
      const ankle=new THREE.Vector3(s*.19,-1.62,.005)
      addSegment(hip,knee,.16,.105,skin,'leg','Coxa')
      addEllipsoid([s*.19,-.91,.095],[.105,.12,.07],skinLight,'leg','Joelho')
      addEllipsoid([s*.19,-.91,.16],[.065,.075,.025],skinShade,'leg','Patela')
      addSegment(knee,ankle,.105,.052,skin,'leg','Perna')
      addEllipsoid([s*.19,-1.62,.01],[.06,.075,.065],skinShade,'leg','Tornozelo')
      addEllipsoid([s*.19,-1.72,.105],[.075,.075,.19],skinLight,'leg','Pé')
      for(let t=0;t<5;t++){
        const x=s*.19+(t-2)*.023
        addEllipsoid([x,-1.755,.245-Math.abs(t-2)*.018],[.014,.025,.075-Math.abs(t-2)*.009],skin,'leg','Dedo do pé')
      }
      // Posterior calf contour.
      addEllipsoid([s*.19,-1.30,-.045],[.092,.23,.07],skinLight,'leg','Panturrilha')
    }

    // Soft studio plinth and orientation guide.
    const plinth=new THREE.Mesh(new THREE.CylinderGeometry(.88,.96,.055,64),floorMat)
    plinth.position.y=-1.86;scene.add(plinth)
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.76,.008,8,96),new THREE.MeshBasicMaterial({color:'#c7d9d0'}))
    ring.rotation.x=Math.PI/2;ring.position.y=-1.825;scene.add(ring)
    const markerGroup=new THREE.Group();model.add(markerGroup);markerGroupRef.current=markerGroup
    const drawMarkers=()=>{
      markerGroup.clear()
      for(const m of markersRef.current){
        const halo=new THREE.Mesh(new THREE.SphereGeometry(.075,20,16),new THREE.MeshBasicMaterial({color:'#d46a65',transparent:true,opacity:.22,depthWrite:false}))
        halo.position.set(m.x,m.y,m.z);markerGroup.add(halo)
        const dot=new THREE.Mesh(new THREE.SphereGeometry(.035,20,16),new THREE.MeshBasicMaterial({color:'#b83f4c'}))
        dot.position.set(m.x,m.y,m.z);markerGroup.add(dot)
      }
    }
    drawMarkers()

    const controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true;controls.dampingFactor=.075;controls.enablePan=false
    controls.minDistance=5.2;controls.maxDistance=10;controls.target.set(0,0,0)
    controlsRef.current=controls
    const resize=()=>{const w=el.clientWidth||320;const h=el.clientHeight||480;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
    resize()
    const observer=new ResizeObserver(resize);observer.observe(el)
    const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2()
    let down:{x:number;y:number}|null=null
    const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY}}
    const pointerUp=(e:PointerEvent)=>{
      if(readOnly){down=null;return}
      if(!down)return
      const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null
      if(moved>5)return
      const rect=renderer.domElement.getBoundingClientRect()
      pointer.x=((e.clientX-rect.left)/rect.width)*2-1
      pointer.y=-((e.clientY-rect.top)/rect.height)*2+1
      raycaster.setFromCamera(pointer,camera)
      const hits=raycaster.intersectObjects(model.children.filter(x=>x!==markerGroup),true)
      const hit=hits.find(h=>h.object.userData.kind)
      if(!hit)return
      const local=model.worldToLocal(hit.point.clone())
      const region=regionForHit(hit.object,local)
      markRef.current({id:'BM-'+Date.now()+'-'+Math.round(Math.random()*10000),region,x:Number(local.x.toFixed(3)),y:Number(local.y.toFixed(3)),z:Number(local.z.toFixed(3))})
    }
    renderer.domElement.addEventListener('pointerdown',pointerDown)
    renderer.domElement.addEventListener('pointerup',pointerUp)
    let frame=0
    const animate=()=>{frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}
    animate()
    return ()=>{
      cancelAnimationFrame(frame);observer.disconnect();controls.dispose();controlsRef.current=null;cameraRef.current=null
      renderer.domElement.removeEventListener('pointerdown',pointerDown)
      renderer.domElement.removeEventListener('pointerup',pointerUp)
      scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}})
      markerGroupRef.current=null;renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement)
    }
  },[readOnly])

  useEffect(()=>{
    markersRef.current=markers
    const group=markerGroupRef.current
    if(!group)return
    group.clear()
    for(const m of markers){
      const halo=new THREE.Mesh(new THREE.SphereGeometry(.075,20,16),new THREE.MeshBasicMaterial({color:'#d46a65',transparent:true,opacity:.22,depthWrite:false}))
      halo.position.set(m.x,m.y,m.z);group.add(halo)
      const dot=new THREE.Mesh(new THREE.SphereGeometry(.035,20,16),new THREE.MeshBasicMaterial({color:'#b83f4c'}))
      dot.position.set(m.x,m.y,m.z);group.add(dot)
    }
  },[markers])

  function setCameraView(next:View){
    setView(next)
    const camera=cameraRef.current
    const controls=controlsRef.current
    if(!camera||!controls)return
    const positions:Record<View,[number,number,number]>={anterior:[0,.02,7.7],posterior:[0,.02,-7.7],lateral:[7.7,.02,0]}
    camera.position.set(...positions[next])
    controls.target.set(0,0,0)
    controls.update()
  }

  return <div className="body3d-wrap">
    <div className="bodymap-head"><div><b>Atlas corporal tridimensional</b><span className="body3d-subtitle">Modelo anatômico interativo · rotação 360°</span></div><span className="body3d-live"><i/> 3D ATIVO</span></div>
    <div className="body3d-toolbar" role="group" aria-label="Orientação do modelo">
      <button type="button" className={view==='anterior'?'active':''} onClick={()=>setCameraView('anterior')}>Anterior</button>
      <button type="button" className={view==='posterior'?'active':''} onClick={()=>setCameraView('posterior')}>Posterior</button>
      <button type="button" className={view==='lateral'?'active':''} onClick={()=>setCameraView('lateral')}>Lateral</button>
    </div>
    <div className="body3d-stage" ref={host}/>
    <div className="body3d-hint">Arraste para girar · Role para aproximar · Toque na superfície para marcar a região</div>
    <div className="body3d-selected">{markers.length?markers.map(m=>readOnly?<span key={m.id}>{m.region} · ponto marcado</span>:<button type="button" key={m.id} onClick={()=>onRemove(m.id)}>{m.region} · ponto marcado ×</button>):<small>{readOnly?'Nenhum ponto anatômico registrado':'Selecione diretamente no modelo para registrar a localização da lesão'}</small>}</div>
  </div>
}