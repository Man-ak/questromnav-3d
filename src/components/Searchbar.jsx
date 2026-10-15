import { useId, useMemo, useRef, useState, useEffect } from 'react';
import { Search, X, ArrowUpRight, MapPin } from 'lucide-react';
import { searchRooms } from '../lib/routing';
import { categories } from '../data/questromMapData';
import { useMapStore } from '../store/useMapStore';
export default function Searchbar({onSelect}){
  const [query,setQuery]=useState(''),[open,setOpen]=useState(false),[active,setActive]=useState(0),input=useRef(),root=useRef(),id=useId();const select=useMapStore(s=>s.select);
  const results=useMemo(()=>searchRooms(query).slice(0,7),[query]);
  useEffect(()=>{const handler=e=>{if(!root.current?.contains(e.target))setOpen(false);if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();input.current?.focus();}};document.addEventListener('pointerdown',handler);document.addEventListener('keydown',handler);return()=>{document.removeEventListener('pointerdown',handler);document.removeEventListener('keydown',handler);};},[]);
  const choose=room=>{select(room.id);setQuery('');setOpen(false);input.current?.blur();onSelect?.();};
  return <div className="search-container" ref={root}><div className={`searchbar ${open?'focused':''}`}><Search size={18}/><input ref={input} aria-label="Search rooms, centers, and amenities" role="combobox" aria-autocomplete="list" aria-expanded={open&&!!query} aria-controls={id} aria-activedescendant={open&&results[active]?`${id}-${active}`:undefined} placeholder="Search rooms, places…" value={query} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(0);}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(i=>Math.min(i+1,results.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(i-1,0));}if(e.key==='Enter'&&results[active])choose(results[active]);if(e.key==='Escape')setOpen(false);}}/>{query?<button aria-label="Clear search" onClick={()=>{setQuery('');input.current?.focus();}}><X size={15}/></button>:<kbd>⌘ K</kbd>}</div>
  {open&&query&&<div className="search-results" id={id} role="listbox" aria-label="Matching locations">{results.length?results.map((room,i)=><button key={room.id} id={`${id}-${i}`} role="option" aria-selected={active===i} className={active===i?'active':''} onPointerMove={()=>setActive(i)} onClick={()=>choose(room)}><MapPin size={17}/><span><strong>{room.short||room.name}</strong><small>{room.serviceOnly?'Service access · no visitor directions':categories[room.type].label}{room.number?' · '+room.number:''}</small></span><ArrowUpRight size={15}/></button>):<div className="empty-search">No spaces found. Try “105”, “Susilo”, or “restroom”.</div>}</div>}
  </div>;
}
