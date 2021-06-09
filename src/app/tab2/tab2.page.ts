import { Component, OnInit, ViewChild, ElementRef, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { HabitTrackingProvider } from 'src/providers/habitTracker/habitTracker';
import { HabitProvider } from 'src/providers/habits/habits';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { IHabit, IHabitTracker } from 'src/interface/habit.interface';
import { ToastService, isDateBeforeToday, parseDate, getStreak } from '../common/util';
import { Observable, forkJoin, zip } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  
  isLoading:boolean = true;
  isAddingTracking: boolean = false;
  isApp: boolean = false;
  habits: IHabit;//AngularFirestoreCollection<IHabit>;
  habitTrackings: IHabitTracker;//AngularFirestoreCollection<IHabitTracker>;
  parseDate;
  loading;

  constructor(private modalCtrl: ModalController,private toastCtrl: ToastController, private loadingCtrl: LoadingController,
             private habitProvider: HabitProvider, private habitTrackingProvider: HabitTrackingProvider,
             private toastService: ToastService, private router:Router) {
      //this.getHabitTrackings();
      this.presentLoadingWithOptions();
      this.parseDate = parseDate;
      this.getHabits();

  }

  async presentLoadingWithOptions() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading...',
      translucent: true,
      cssClass: 'loading',
      spinner:'crescent'
    });
    await this.loading.present();

    // const { role, data } = await loading.onDidDismiss();
    // console.log('Loading dismissed with role:', role);
  }

  getHabits(){
    this.habitProvider.GetHabits()
    .subscribe((data : any) => {
        if (data){
            try{
                this.habits = data;
                const observables = []
                for(let idx in this.habits){
                    var habit = this.habits[idx];
                    observables.push(this.habitTrackingProvider.GetHabitTrackingsByHabitId(habit.Id))
                    // this.habitTrackingProvider.GetHabitTrackingsByHabitId(habit.Id).subscribe((data2: any) => {
                    //     habit.Trackings = data2;
                    // })
                }
                zip(...observables)
                .subscribe(trackings => {
                    for (let idx in trackings){
                        var currTrackings = trackings[idx];
                        this.habits[idx].Trackings = currTrackings;
                        this.habits[idx].FinalTracking = currTrackings[(<any>currTrackings).length -1];
                        this.habits[idx].CurrStreak = getStreak(parseDate(this.habits[idx].FinalTracking.Date), new Date() );
                        this.habits[idx].Completed = this.habits[idx].CurrStreak/this.habits[idx].TargetDays;
                        this.habits[idx].TotalFrequency = (<any>currTrackings).reduce((sum,t)=>{return sum+t.Frequency},0)
                    }
                    console.log('finally')
                    this.loading.dismiss();
                    this.isLoading = false;

                });
            }catch(Exception){
                this.habits = null;
            }finally{
                
                //this.loading.dismiss();
                this.isAddingTracking = false;
            }
        }
    },
    (error) => {
        // this.loadError = true;
        this.toastService.presentToast(error.message);
        
    },()=>{
    });
  }


  addTracking(habit:IHabit){
    console.log('adding tracking')
    this.isAddingTracking = true;
    if(habit.FinalTracking != null && !isDateBeforeToday((<any>habit.FinalTracking.Date).toDate())){
        //latestDate is today, just update frequency
        var finalTracking = habit.FinalTracking;
        finalTracking.Frequency++;
        this.habitTrackingProvider.UpdateHabitTracking(finalTracking.Id, finalTracking).then(res =>{
            this.toastService.presentToast("success")
            this.getHabits();
        }
        ,(error) => {
            // this.loadError = true;
            this.isAddingTracking = false;
            this.toastService.presentToast(error.message);
            
        });
    }else{
        var newHabit = {
            Id: null,
            Date: new Date(),
            Frequency: 1,
            HabitId:habit.Id,
            Streak: 0
        };
        this.habitTrackingProvider.AddHabitTracking(newHabit).then(res => {
            
            this.toastService.presentToast('success');
            this.getHabits();
            // this.hhabitighlights = data.content as IWiseInfoTVHighlights[];
        },
        (error) => {
            // this.loadError = true;
            this.isAddingTracking = false;
            this.toastService.presentToast(error.message);
            
        });
    }
    
    console.log(habit)
    
}


  goToDetailsPage(habit:IHabit){
    console.log(habit);
    let navigationExtras: NavigationExtras = { state: { habit: habit } };
    this.router.navigateByUrl('/details', navigationExtras);
    //this.toastService.presentToast("should route")
    // console.log(this.toastService)
    // this.toastService.presentToast(msg);
  }
}
