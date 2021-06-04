import { Injectable } from '@angular/core';
import { HabitsWithTrackings } from 'src/data/jsonData';
import { IHabit } from 'src/interface/habit.interface';

@Injectable()
export class JsonProvider {

    GetHabitWithTrackingsByHabitId = async(id:string):Promise<any>=>{
        return  await <any>HabitsWithTrackings.filter(h=>{
            return h.Id == id;
        })[0] as IHabit
    }
}

