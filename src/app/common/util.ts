import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";

export const isDateBeforeToday= (date):boolean =>{
  return new Date(date.toDateString()) < new Date(new Date().toDateString());
}

export const getCurrentStreak = (latest):number =>{
  var latestDate = latest.Date.toDate();
  if (isDateBeforeToday(latestDate)){
      var todaysDate = new Date();
      const utc1 = Date.UTC(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
      const utc2 = Date.UTC(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate());
      return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)) - 1; //minus 1 to exclude current day
  }else{
      return 0;//latest.Streak;
  }
}

export const parseDate=(input)=>{
  return (input instanceof Date)? input:(<any>input).toDate()
}

export const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
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


