"use client"
import { useEffect, useMemo, useState } from 'react'

type Heights = Record<string, number> // px

const STORAGE_KEY = 'dashboard.widgetHeights'

function applyHeights(heights: Heights){
  Object.entries(heights).forEach(([key,h])=>{
    const el = document.querySelector<HTMLElement>(`[data-widget=\"${key}\"]`)
    if(!el) return
    el.style.minHeight = h ? `${h}px` : ''
  })
}

export default function DashboardLayoutEditor(){
  const [editing,setEditing] = useState(false)
  const [heights,setHeights] = useState<Heights>({})

  // load and apply sizes
  useEffect(()=>{
    try{ const raw = localStorage.getItem(STORAGE_KEY); if(raw) setHeights(JSON.parse(raw)) } catch {}
  },[])
  useEffect(()=>{ applyHeights(heights) },[heights])

  // persist
  useEffect(()=>{ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(heights)) }catch{} },[heights])

  useEffect(()=>{
    if(!editing){
      // remove edit rings and controls
      document.querySelectorAll('[data-widget]').forEach((n:any)=>{
        n.classList.remove('ring-2','ring-emerald-400')
        const ctl = n.querySelector('.hb-size-ctl'); if(ctl) ctl.remove()
      })
      return
    }
    const cleanup: Array<() => void> = []
    document.querySelectorAll<HTMLElement>('[data-widget]').forEach(el=>{
      const key = el.getAttribute('data-widget') || ''
      if(key==='profile') return // fixed, non-customizable
      el.classList.add('ring-2','ring-emerald-400')
      el.style.position = el.style.position || 'relative'
      const ctl = document.createElement('div')
      ctl.className = 'hb-size-ctl absolute bottom-1 right-1 z-10 w-3 h-3 bg-emerald-600 rounded-sm cursor-se-resize'
      let active = false
      let startY = 0
      let startH = 0
      ctl.onmousedown = (e: MouseEvent) => {
        active = true; startY = e.clientY; startH = el.getBoundingClientRect().height
        document.body.style.userSelect = 'none'
      }
      const move = (e: MouseEvent) => {
        if(!active) return
        const dy = e.clientY - startY
        const h = Math.max(120, startH + dy)
        el.style.minHeight = `${h}px`
      }
      const up = () => {
        if(!active) return
        active = false
        document.body.style.userSelect = ''
        const key = el.getAttribute('data-widget')||''
        const h = Math.max(120, el.getBoundingClientRect().height)
        const next = { ...heights, [key]: h }
        setHeights(next); applyHeights(next)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
      el.appendChild(ctl)
      cleanup.push(()=>{
        ctl.remove(); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up)
      })
    })
    return ()=>{ cleanup.forEach(fn=>fn()) }
  },[editing, heights])

  return (
    <button
      type="button"
      onClick={()=>setEditing(v=>!v)}
      className={`rounded border px-3 py-1.5 text-sm ${editing? 'bg-emerald-600 text-white hover:bg-emerald-700':'bg-white hover:bg-slate-50'}`}
      title="Edit Layout"
    >{editing? 'Done':'Edit Layout'}</button>
  )
}
