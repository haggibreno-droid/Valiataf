import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type BodyMarker = { id:string; region:string; x:number; y:number; z:number }

type Props = {
  markers:BodyMarker[]
  onMark:(marker:BodyMarker)=>void
  onRemove:(id:string)=>void
  readOnly?:boolean
}

function regionForHit(object:THREE.Object3D, point:THREE.Vector3):string {
  const side = point.x >= 0 ? 'esquerdo' : 'direito'
  const kind = object.userData.kind as string
  if(kind==='head') return 'Cabeça / face'
  if(kind==='torso'){
    const front = point.z >= 0
    if(front) return point.y > .86 ? 'Tórax anterior' : point.y > .25 ? 'Abdome' : 'Pelve anterior'
    return point.y > .82 ? 'Região escapular' : point.y > .28 ? 'Região dorsal' : point.y > -.22 ? 'Região lombar' : 'Sacro'
  }
  if(kind==='pelvis') return point.z >= 0 ? 'Pelve anterior' : 'Glúteo '+side
  const part = object.userData.part as string
  return part+' '+side
}

export default function BodyModel3D({markers,onMark,onRemove,readOnly=false}:Props){
  const host=useRef<HTMLDivElement>(null)
  const markRef=useRef(onMark)
  const markersRef=useRef(markers)
  const markerGroupRef=useRef<THREE.Group|null>(null)
  useEffect(()=>{markRef.current=onMark},[onMark])
  useEffect(()=>{markersRef.current=markers},[markers])

  useEffect(()=>{
    const el=host.current
    if(!el)return
    const scene=new THREE.Scene()
    scene.background=new THREE.Color('#f8fbf9')
    const camera=new THREE.PerspectiveCamera(34,1,.1,100)
    camera.position.set(0,.05,5.8)
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.outputColorSpace=THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    scene.add(new THREE.HemisphereLight(0xffffff,0xc8d8d0,2.1))
    const key=new THREE.DirectionalLight(0xffffff,2.1);key.position.set(3,4,5);scene.add(key)
    const rim=new THREE.DirectionalLight(0xd6eee4,1.1);rim.position.set(-4,1,-3);scene.add(rim)
    const model=new THREE.Group();scene.add(model)
    const skin=new THREE.MeshStandardMaterial({color:'#d6bca9',roughness:.72,metalness:0})
    const joint=new THREE.MeshStandardMaterial({color:'#c7a994',roughness:.76})
    const add=(geometry:THREE.BufferGeometry,material:THREE.Material,position:[number,number,number],scale:[number,number,number],kind:string,part='')=>{
      const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);mesh.scale.set(...scale);mesh.userData={kind,part};model.add(mesh);return mesh
    }
    const sphere=new THREE.SphereGeometry(1,28,20)
    const capsule=new THREE.CapsuleGeometry(.105,.42,6,12)
    add(sphere,skin,[0,1.56,0],[.19,.24,.19],'head')
    add(capsule,joint,[0,1.28,0],[.8,.62,.8],'neck')
    add(sphere,skin,[0,.67,0],[.43,.64,.24],'torso')
    add(sphere,skin,[0,-.12,0],[.36,.31,.23],'pelvis')
    // Limbs are separate clickable surfaces; the anatomical right side is on the viewer's left in anterior view.
    for(const sign of [-1,1]){
      const side=sign===1?'esquerdo':'direito'
      const upper=add(capsule,skin,[sign*.52,.78,0],[1,1.12,1],'limb','Braço')
      upper.rotation.z=sign*.18
      const fore=add(capsule,skin,[sign*.68,.23,0],[.83,1.05,.88],'limb','Antebraço')
      fore.rotation.z=sign*.10
      add(sphere,joint,[sign*.76,-.12,0],[.12,.14,.12],'limb','Mão')
      const thigh=add(capsule,skin,[sign*.205,-.62,0],[1.22,1.55,1.12],'limb','Coxa')
      thigh.rotation.z=-sign*.025
      add(sphere,joint,[sign*.205,-1.02,.005],[.13,.14,.13],'limb','Joelho')
      add(capsule,skin,[sign*.205,-1.35,0],[.82,1.18,.9],'limb','Perna')
      add(sphere,joint,[sign*.205,-1.69,.12],[.14,.10,.27],'limb','Pé')
      // keep anatomical labels on mesh data for screen-reader-friendly legend and click result
      for(const child of model.children){if(child.userData.part&&child.position.x*sign>0)child.userData.side=side}
    }
    const floor=new THREE.Mesh(new THREE.CircleGeometry(1.45,48),new THREE.MeshBasicMaterial({color:'#eef4f0',transparent:true,opacity:.7}))
    floor.rotation.x=-Math.PI/2;floor.position.y=-1.82;floor.scale.set(1,.23,1);scene.add(floor)

    const markerGroup=new THREE.Group();model.add(markerGroup);markerGroupRef.current=markerGroup
    const drawMarkers=()=>{
      markerGroup.clear()
      for(const m of markersRef.current){
        const dot=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),new THREE.MeshBasicMaterial({color:'#b74f55'}))
        dot.position.set(m.x,m.y,m.z);markerGroup.add(dot)
      }
    }
    drawMarkers()
    const controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false
    controls.minDistance=4.2;controls.maxDistance=8
    const resize=()=>{const w=el.clientWidth||320;const h=el.clientHeight||430;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
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
      cancelAnimationFrame(frame);observer.disconnect();controls.dispose()
      renderer.domElement.removeEventListener('pointerdown',pointerDown)
      renderer.domElement.removeEventListener('pointerup',pointerUp)
      scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}})
      markerGroupRef.current=null;renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement)
    }
  },[])
  useEffect(()=>{
    markersRef.current=markers
    const group=markerGroupRef.current
    if(!group)return
    group.clear()
    for(const m of markers){
      const dot=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),new THREE.MeshBasicMaterial({color:'#b74f55'}))
      dot.position.set(m.x,m.y,m.z);group.add(dot)
    }
  },[markers])
  return <div className="body3d-wrap">
    <div className="bodymap-head"><b>Modelo corporal 3D</b><span>Clique na superfície e arraste para girar</span></div>
    <div className="body3d-stage" ref={host}/>
    <div className="body3d-hint">Role para aproximar · Arraste para girar · Selecione a superfície correspondente</div>
    <div className="body3d-selected">{markers.length?markers.map(m=>readOnly?<span key={m.id}>{m.region} · ponto marcado</span>:<button type="button" key={m.id} onClick={()=>onRemove(m.id)}>{m.region} · ponto marcado ×</button>):<small>Nenhum ponto marcado</small>}</div>
  </div>
}
