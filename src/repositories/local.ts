import { Entity } from '../types';
import { Repository } from './interfaces';
import { database } from '../database/connection';
export function localRepository<T extends Entity>(collection:string): Repository<T> { return {
 async list(){const db=await database(); const rows=await db.getAllAsync<{payload:string}>('SELECT payload FROM records WHERE collection = ?',collection);return rows.map(r=>JSON.parse(r.payload) as T);},
 async put(entity){const db=await database();await db.runAsync('INSERT OR REPLACE INTO records (collection,id,payload) VALUES (?,?,?)',collection,entity.id,JSON.stringify(entity));},
 async remove(id){const db=await database();await db.runAsync('DELETE FROM records WHERE collection = ? AND id = ?',collection,id);},
 async replace(entities){const db=await database();await db.withTransactionAsync(async()=>{await db.runAsync('DELETE FROM records WHERE collection = ?',collection);for(const entity of entities) await db.runAsync('INSERT INTO records (collection,id,payload) VALUES (?,?,?)',collection,entity.id,JSON.stringify(entity));});}
}; }
