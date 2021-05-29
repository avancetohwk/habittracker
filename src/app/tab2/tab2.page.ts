import { Component, OnInit, ViewChild, ElementRef, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { HabitTrackingProvider } from 'src/providers/habitTracker/habitTracker';
import { HabitProvider } from 'src/providers/habits/habits';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { IHabit, IHabitTracker } from 'src/interface/habit.interface';
import { ToastService } from '../common/util';
import { Observable, forkJoin, zip } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  
  isLoading:boolean = true;
  isApp: boolean = false;
  habits: IHabit;//AngularFirestoreCollection<IHabit>;
  habitTrackings: IHabitTracker;//AngularFirestoreCollection<IHabitTracker>;
  myChart;
  myChart2;
  selectedPoint;

  constructor(private modalCtrl: ModalController,private toastCtrl: ToastController,
             private habitProvider: HabitProvider, private habitTrackingProvider: HabitTrackingProvider,
             private toastService: ToastService, private router:Router) {
      //this.getHabitTrackings();
      this.getHabits();

  }

  getHabits(){
    this.habitProvider.GetHabits()
    .subscribe((data : any) => {
        if (data){
        try{
            this.habits = data;
            console.log('habits: ')
            console.log(this.habits)
            const observables = []
            for(let idx in this.habits){
                var habit = this.habits[idx];
                observables.push(this.habitTrackingProvider.GetHabitTrackingsByHabitId(habit.Id))
                this.habitTrackingProvider.GetHabitTrackingsByHabitId(habit.Id).subscribe((data2: any) => {
                    habit.Trackings = data2;
                    console.log(habit)
                })

            }
            console.log(observables)
            zip(...observables)
            .subscribe(trackings => {
                // let finalTracking = el.Trackings[el.Trackings.length - 1];
                // if(finalTracking != null){
                //     if (this.isDateBeforeToday(finalTracking.Date.toDate())){
                //         var todaysDate = new Date();
                //         lineSeriesData.push([Date.UTC(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate()), 0])
                //     }
                //     streak = this.getCurrentStreak(finalTracking);
                // }
                
                for (let idx in trackings){
                    var currTrackings = trackings[idx];
                    this.habits[idx].Trackings = currTrackings;
                    this.habits[idx].FinalTracking = currTrackings[(<any>currTrackings).length -1];
                }
                console.log(this.habits)
                //this.getGaugeChartData(this.habits)
                // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
            });
        }catch(Exception){
            this.habits = null;
        }finally{
            
        }
        }
        // this.highlights = data.content as IWiseInfoTVHighlights[];
    },
    (error) => {
        // this.loadError = true;
        this.toastService.presentToast(error.message);
        
    },()=>{
        console.log(this.habits)
    });
  }

  addTracking(item:any){
    console.log(item);
  }

  test(habit:IHabit){
    console.log(habit);
    let navigationExtras: NavigationExtras = { state: { habit: habit } };
    this.router.navigateByUrl('/details', navigationExtras);
    // console.log(this.toastService)
    // this.toastService.presentToast(msg);
  }
}
