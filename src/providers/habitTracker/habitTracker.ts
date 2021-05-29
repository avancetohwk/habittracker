import { Injectable } from '@angular/core';
import * as firebaseApp from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { IHabit, IHabitTracker } from '../../interface/habit.interface';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { HabitType } from '../../enums'

/*
  Generated class for the ComplaintsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HabitTrackingProvider {

  collection: string ='habitTrackersss';


  constructor(private db: AngularFirestore,private afStorage: AngularFireStorage) {
  }

  AddHabitTracking(tracking: IHabitTracker){
    return this.db.collection(this.collection).doc(this.GenerateNewId(this.collection)).set(tracking).then(res => {});
  }

  GetHabitTrackings(){
    return this.db.collection(this.collection).snapshotChanges().pipe
      (map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as IHabitTracker;
          data.Id = a.payload.doc.id;
          return data;
          
        });
      }))
  }

  GetHabitTrackingById(id: string){
    return this.db.doc(this.collection + '/' + id)
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

  GetHabitTrackingsByHabitId(id: string){
    console.log('inside')
    var habitTrackings: IHabitTracker[];
    return this.db.collection(this.collection, ref => {
      return ref.where('HabitId','==', id).orderBy('Date','asc');
    }).snapshotChanges().pipe
      (map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as IHabitTracker;
          data.Id = a.payload.doc.id;
       
          return data;
          
        })}))}
      // })).subscribe((data : any) => {
      //   console.table(data)
      //   if (data){
      //     try{
      //       habitTrackings = data;
      //       console.log(habitTrackings)
      //       return habitTrackings;
      //     }catch(Exception){
      //       habitTrackings= [];
      //       return habitTrackings
      //     }
      //   }
        // this.highlights = data.content as IWiseInfoTVHighlights[];
      // },
      // (error) => {
      //   // this.loadError = true;
      //   //this.presentToast(error.message);
        
      // },()=>{
      //   return habitTrackings;
      //});
      // console.log(habitTrackings)
      // return habitTrackings;
  //})

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

  UpdateHabitTrackingFrequency(habitId: string, tracking: IHabitTracker){
    return this.db
       .collection(this.collection)
       .doc(habitId)
       .set(tracking);
  }


  GenerateNewId(collection: string){
    return this.db.collection(collection).ref.doc().id;
  }

  
  
  
}
