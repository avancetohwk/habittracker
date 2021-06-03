import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";
import * as moment from "moment";

export const isDateBeforeToday= (date):boolean =>{
  return new Date(date.toDateString()) < new Date(new Date().toDateString());
}

export const getTrackingIdxByDate = (trackings, selectedDate): {index:number,trackingFound:boolean}=>{
  var index = -1;
  var trackingFound = false;
  if(trackings == null || trackings.length == 0)return {index, trackingFound};
  trackings.some((t,idx)=>{
    var trackingDate = parseDate(t.Date);
    if(moment(trackingDate).isSame(selectedDate, 'day')){
      index = idx;
      trackingFound = true;
      return true;
    }else if(moment(trackingDate).isAfter(selectedDate,'day')){
      index = idx;
      return true;
    }
    
  });
  return {index, trackingFound};
}

export const getStreak = (startDate, endDate):number =>{
  if(moment(startDate).isAfter(endDate,"day")) return null;
  if(moment(startDate).isSame(endDate,"day")) return 0
  const utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const utc2 = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)) - 1; //minus 1 to exclude current day
}

export const parseDate=(input)=>{
  var result = null;
  if(input == null) throw("Input is null");
  try{
    result = (input instanceof Date)? input:(<any>input).toDate();
  }catch(e){
    console.log((e as Error));
    console.log(input)
  }
  return result;
}

export const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}

export const deepCopy = (inObject) => {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value)
  }

  return outObject
}

@Injectable()
export class ToastService{
    constructor(public toastController: ToastController) {}

    async presentToast(message:string) {
    

        const toast = await this.toastController.create({
          message: message,
          duration: 2000
        });
        toast.present();
      }
    
};


