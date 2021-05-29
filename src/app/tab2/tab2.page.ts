import { Component, OnInit, ViewChild, ElementRef, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { HabitTrackingProvider } from 'src/providers/habitTracker/habitTracker';
import { HabitProvider } from 'src/providers/habits/habits';
import { ModalController, ToastController } from '@ionic/angular';
import { IHabit, IHabitTracker } from 'src/interface/habit.interface';
import { ToastService } from '../common/util';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  private toastService: ToastService;
  isLoading:boolean = true;
  isApp: boolean = false;
  habits: IHabit;//AngularFirestoreCollection<IHabit>;
  habitTrackings: IHabitTracker;//AngularFirestoreCollection<IHabitTracker>;
  myChart;
  myChart2;
  selectedPoint;

  constructor(private modalCtrl: ModalController,private toastCtrl: ToastController, private habitProvider: HabitProvider, private habitTrackingProvider: HabitTrackingProvider) {
      //this.getHabitTrackings();
      this.getHabits();

  }

  getHabits(){
    this.habitProvider.GetHabits()
    .subscribe((data : any) => {
        if (data){
        try{
            this.habits = data;
            console.log('habits: ' + this.habits)
            // const observables = []
            // for(let idx in this.habits){
            //     var habit = this.habits[idx];
            //     observables.push(this.habitTrackingProvider.GetHabitTrackingsByHabitId(habit.Id))
            //     this.habitTrackingProvider.GetHabitTrackingsByHabitId(habit.Id).subscribe((data2: any) => {
            //         habit.Trackings = data2;
            //         console.log(habit)
            //     })

            // }
            // console.log(observables)
            // zip(...observables)
            // .subscribe(trackings => {
            //     console.log(trackings)
            //     for (let idx in trackings){
            //         this.habits[idx].Trackings = trackings[idx];
            //     }
            //     this.getGaugeChartData(this.habits)
            //     // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
            // });
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
}
