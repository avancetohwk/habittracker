import { Injectable } from '@angular/core';
import * as firebaseApp from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { IHabit, IHabitTracker } from '../../interface/habit.interface';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { HabitType } from '../../enums'
import { HabitTrackingProvider } from '../habitTracker/habitTracker';

/*
  Generated class for the ComplaintsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HabitProvider {

  trackerCollection: string ='habitTracker';
  
  collection: string = 'lst_habits';


  constructor(private db: AngularFirestore,private afStorage: AngularFireStorage, private habitTrackingProvider: HabitTrackingProvider)  {
  }

  AddHabit(habit: IHabit){
    return this.db.collection(this.collection).doc(this.GenerateNewId(this.collection)).set(habit);
  }

  GetHabits(){
    return this.db.collection(this.collection).snapshotChanges().pipe
      (map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as IHabit;
          data.Id = a.payload.doc.id;
          return data;
          
        });
      }))
  }

  GetHabitById(habitId: string){
    return this.db.doc(this.collection + '/' + habitId)
    .ref.get().then(function(doc) {
      if (doc.exists) {
          return doc.data();//.Name;
      } else {
          console.log("No such document!");
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
  }

  // GetHabitsWithTracking(){
  //   return this.db.collection(this.collection).snapshotChanges().pipe
  //     (map(actions => {
  //       return actions.map(a => {
  //         const data = a.payload.doc.data() as IHabit;
  //         data.id = a.payload.doc.id;
  //         data.trackings = this.habitTrackingProvider.GetHabitTrackingsByHabitId(a.payload.doc.id);
  //         return data;
          
  //       });
  //     }))


    
  // }

  // DeleteHabit(habitId: string, author: string){
  //   var habitDataDoc = this.db.doc(this.collection + '/' + habitId);
  //   habitDataDoc.collection<IHabit>(this.collection, ref => ref.where('createdBy', '==', author).limit(1)).snapshotChanges().pipe(
  //     first(),
  //     map(docs => docs.map(doc => {
  //       const data = doc.payload.doc.data() as IComplaintLike;
  //       const id = doc.payload.doc.id;
  //       this.db.doc(this.socialDataCollection + '/' + complaintId + '/' + this.likesCollection + '/' + id).delete().then(()=>{
  //         console.log('Deleting like by ' + author + ' for complaint: ' + complaintId);
  //       }).catch(error => {
  //         console.error('Error deleting like: ' + error);
  //       });
  //     }))
  //   ).subscribe();
  // }


  GenerateNewId(collection: string){
    return this.db.collection(collection).ref.doc().id;
  }

  
  
  
}
