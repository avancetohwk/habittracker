import { Injectable } from '@angular/core';
import { HabitsWithTrackings } from 'src/data/jsonData';
import { IHabit } from 'src/interface/habit.interface';

@Injectable()
export class JsonProvider {

    GetHabitWithTrackingsByHabitId(id:string){
        return <any>HabitsWithTrackings.filter(h=>{
            return h.Id == id;
        })[0] as IHabit
    }
}

