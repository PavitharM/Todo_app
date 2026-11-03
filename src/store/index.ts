import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Entity, Task, Project, Habit, Note, FocusSession, Preferences, ThemePreferences, TimerState } from '../types';
import { localRepository } from '../repositories/local';
import { demoData } from '../mock/seed';
import { dateKey, nextDate, stamp, uid } from '../utils/date';
interface Collection<T> { items:T[]; loaded:boolean; error:string|null; load():Promise<void>; save(item:T):Promise<boolean>; remove(id:string):Promise<boolean>; replace(items:T[]):Promise<boolean> }
function collection<T extends Entity>(name:string) { const repo=localRepository<T>(name);return create<Collection<T>>((set)=>({items:[],loaded:false,error:null,
 async load(){try{set({items:await repo.list(),loaded:true,error:null});}catch(e){set({error:String(e),loaded:true});}},
 async save(item){try{const entity={...item,updatedAt:new Date().toISOString()};await repo.put(entity);set(s=>({items:[...s.items.filter(x=>x.id!==item.id),entity],error:null}));return true;}catch(e){set({error:`Could not save. ${String(e)}`});return false;}},
 async remove(id){try{await repo.remove(id);set(s=>({items:s.items.filter(x=>x.id!==id),error:null}));return true;}catch(e){set({error:`Could not delete. ${String(e)}`});return false;}},
 async replace(items){try{await repo.replace(items);set({items,error:null});return true;}catch(e){set({error:String(e)});return false;}}
})); }
export const useTasks=collection<Task>('tasks');
export const useProjects=collection<Project>('projects');
export const useHabits=collection<Habit>('habits');
export const useNotes=collection<Note>('notes');
export const useFocus=collection<FocusSession>('focus');
export const defaultPreferences:Preferences={name:'Alex Morgan',email:'',intention:'Make time for what matters',onboarded:false,notifications:false,weekStart:1,defaultPriority:'medium',recentSearches:[]};
export const usePreferences=create<Preferences & {set:(value:Partial<Preferences>)=>void}>()(persist(set=>({...defaultPreferences,set:value=>set(value)}),{name:'super-todo:preferences',storage:createJSONStorage(()=>AsyncStorage)}));
export const useThemeStore=create<ThemePreferences & {set:(value:Partial<ThemePreferences>)=>void}>()(persist(set=>({mode:'system',accent:'#7165E8',set:value=>set(value)}),{name:'super-todo:theme',storage:createJSONStorage(()=>AsyncStorage)}));
export const useFeedback=create<{message:string; show:(message:string)=>void}>(set=>({message:'',show:message=>set({message})}));
const initialTimer:TimerState={kind:'focus',taskId:'',duration:1500,remaining:1500,endsAt:null,running:false,sessionId:uid(),focusMinutes:25,shortMinutes:5,longMinutes:15};
export const useTimer=create<TimerState & {set:(value:Partial<TimerState>)=>void}>()(persist(set=>({...initialTimer,set:value=>set(value)}),{name:'super-todo:timer',storage:createJSONStorage(()=>AsyncStorage)}));
let boot:Promise<void>|null=null;
export function initialize(){ if(!boot)boot=(async()=>{ await Promise.all([usePreferences.persist.rehydrate(),useThemeStore.persist.rehydrate(),useTimer.persist.rehydrate()]);const stores=[useTasks,useProjects,useHabits,useNotes,useFocus];await Promise.all(stores.map(s=>s.getState().load()));const error=stores.find(s=>s.getState().error)?.getState().error;if(error)throw new Error(error);if(!await AsyncStorage.getItem('super-todo:seeded')){const seed=demoData();const results=await Promise.all([useTasks.getState().replace(seed.tasks),useProjects.getState().replace(seed.projects),useHabits.getState().replace(seed.habits),useNotes.getState().replace(seed.notes),useFocus.getState().replace(seed.sessions)]);if(results.some(x=>!x))throw new Error('Could not initialize local data');await AsyncStorage.setItem('super-todo:seeded','1');}})().catch(e=>{boot=null;throw e;});return boot; }
export function newTask(title='',dueDate=dateKey()):Task { return {...stamp(),title,description:'',dueDate,dueTime:'',priority:usePreferences.getState().defaultPriority,category:'Personal',tags:[],projectId:'',subtasks:[],checklist:[],reminder:'none',recurrence:'none',attachments:[],status:'todo',archived:false,order:Date.now()}; }
export async function toggleTask(task:Task) { const done=task.status!=='done';const result=await useTasks.getState().save({...task,status:done?'done':'todo',completedAt:done?new Date().toISOString():undefined});if(result&&done&&task.recurrence!=='none'){const id=`${task.id}-next`;if(!useTasks.getState().items.some(t=>t.id===id)){await useTasks.getState().save({...task,...stamp(),id,dueDate:nextDate(task.dueDate||dateKey(),task.recurrence),status:'todo',completedAt:undefined,subtasks:task.subtasks.map(s=>({...s,done:false})),checklist:task.checklist.map(s=>({...s,done:false}))});}}if(result)useFeedback.getState().show(done?'One more thing, done.':'Task restored');return result; }
export async function clearData(){const results=await Promise.all([useTasks,useProjects,useHabits,useNotes,useFocus].map(s=>s.getState().replace([])));if(results.some(x=>!x))throw new Error('Some data could not be removed. Please retry.');useTimer.getState().set({...initialTimer,sessionId:uid()});usePreferences.getState().set({recentSearches:[]});}
let recording=false;
export async function reconcileTimer(){const timer=useTimer.getState();if(!timer.running||!timer.endsAt||timer.endsAt>Date.now()||recording)return;recording=true;try{const end=new Date(timer.endsAt).toISOString();const ok=await useFocus.getState().save({id:timer.sessionId,createdAt:end,updatedAt:end,endedAt:end,duration:timer.duration,taskId:timer.taskId,kind:timer.kind});if(ok){timer.set({running:false,remaining:0,endsAt:null});useFeedback.getState().show(timer.kind==='focus'?'Focus session complete. Take a breath.':'Break complete. Ready for a fresh start?');}}finally{recording=false;}}
