import { Component, OnInit, ViewChild, ElementRef, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more.src';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { HabitTrackingProvider } from 'src/providers/habitTracker/habitTracker';
import { HabitProvider } from 'src/providers/habits/habits';
import { ModalController, ToastController } from '@ionic/angular';
import { IHabit, IHabitTracker } from 'src/interface/habit.interface';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { finalize } from "rxjs/operators";
import { Observable, forkJoin, zip } from 'rxjs';
import * as firebase from "firebase/app";
import { AngularFirestore } from '@angular/fire/firestore';

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
}) 
export class Tab1Page {
    isLoading:boolean = true;
    isApp: boolean = false;
    habits: IHabit;//AngularFirestoreCollection<IHabit>;
    habitTrackings: IHabitTracker;//AngularFirestoreCollection<IHabitTracker>;
    myChart;
    myChart2;
    selectedPoint;

    constructor(private modalCtrl: ModalController,private toastCtrl: ToastController, private habitProvider: HabitProvider, private habitTrackingProvider: HabitTrackingProvider) {
        this.getHabitTrackings();
        this.getHabits();

    }

    ngAfterViewInit(){
        

        
                
    }

    buildCharts(gaugeSeries, lineSeries){
        var parent = this;
        const charts = new Promise<void>((resolve,reject) =>{
            this.myChart = Highcharts.chart('container', { 

                chart: {
                    height: '70%',
                    events: {
                        //render: renderIcons
                        load: function () {
                        var self = this;
                        setTimeout (function () {
                            self.reflow ();
                            self.tooltip.refresh(self.series[0].data[0]);
                            parent.selectedPoint = self.series[0].data[0];
                            //Highcharts.fireEvent(self.series[0].data[0], 'click');
                        }, 1000)
                    }
                    }
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: null,
                },
            
                tooltip: {
                    borderWidth: 0,
                    backgroundColor: 'none',
                    shadow: false,
                    style: {
                        fontSize: '12px'
                    },
                    valueSuffix: '%',
                    pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
                    positioner: function (labelWidth) {
                        return {
                            x: (this.chart.chartWidth - labelWidth) / 2,
                            y: (this.chart.plotHeight / 2) - 20
                        };
                    }
                },
                pane: {
                    startAngle: 0,
                    endAngle: 360,
                    // background: [{ // Track for Move
                    //     outerRadius: '112%',
                    //     innerRadius: '88%',
                    //     backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
                    //         .setOpacity(0.3)
                    //         .get(),
                    //     borderWidth: 0
                    // }, { // Track for Exercise
                    //     outerRadius: '87%',
                    //     innerRadius: '63%',
                    //     backgroundColor: Highcharts.color(Highcharts.getOptions().colors[1])
                    //         .setOpacity(0.3)
                    //         .get(),
                    //     borderWidth: 0
                    //}]
                },
            
                yAxis: {
                    min: 0,
                    max: 100,
                    lineWidth: 0,
                    tickPositions: []
                },
            
                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            enabled: false
                        },
                        linecap: 'round',
                        stickyTracking: false,
                        rounded: true,
                        point: {
                            events: {
                                click: function () {
                                    var currSelection = this;
                                    parent.selectedPoint = currSelection;
                                }
                            }
                        }
                    }
                },
            
                series: gaugeSeries
            
            
            
            });
                
            this.myChart2 = Highcharts.chart('container2', {
                chart: {
                type: 'spline',
                height: '80%',
                events: {
                    //render: renderIcons
                    load: function () {
                        var self = this;
                        setTimeout (function () {
                            self.reflow ();
                        }, 1000)
                    }
                }
            },
            credits: {
                enabled: false
            },
                title: {
                    text: 'Habits Tracker'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    },
                    title: {
                        text: 'Date'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Streak'
                    },
                    min: 0
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
                },
            
                plotOptions: {
                    series: {
                        marker: {
                            enabled: true
                        },
                        showInLegend: false
                    }
                },
            
                colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
            
                // Define the data points. All series have a dummy year
                // of 1970/71 in order to be compared on the same x axis. Note
                // that in JavaScript, months start at 0 for January, 1 for February etc.
                series: lineSeries,
            
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            plotOptions: {
                                series: {
                                    marker: {
                                        radius: 2.5
                                    }
                                }
                            }
                        }
                    }]
                }
            });
            resolve();
            
        })
        
        charts.then(value =>{
            var self = this;
            setTimeout (function () {
                console.log(self.isLoading)
                self.isLoading = false;
            }, 1000)
        });
    }

    getHabits(){
        this.habitProvider.GetHabits()
        .subscribe((data : any) => {
            if (data){
            try{
                console.log('sda')
                this.habits = data;
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
                    console.log(trackings)
                    for (let idx in trackings){
                        this.habits[idx].Trackings = trackings[idx];
                    }
                    this.getGaugeChartData(this.habits)
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
            this.presentToast(error.message);
            
        },()=>{
            console.log(this.habits)
        });
    }

    getHabitTrackings(){
        this.habitTrackingProvider.GetHabitTrackings().subscribe((data : any) => {
            if (data){
            try{
                this.habitTrackings = data.response.groups[0].items;
            }catch(Exception){
                this.habitTrackings = null;
            }
            }
            // this.highlights = data.content as IWiseInfoTVHighlights[];
        },
        (error) => {
            // this.loadError = true;
            this.presentToast(error.message);
            
        },()=>{
            console.log(this.habitTrackings)
        });
    }

    getGaugeChartData(habits){
        var gaugeSeries = [];
        let lineSeries = [];
        var innerRadius = 63;
        var radiusSize = 24;
        var radius = innerRadius + radiusSize;
        let streak = 0

        habits.forEach((el,i) => {
            let lineSeriesData =
                el.Trackings.map(t=>{
                    let currDate = t.Date.toDate();
                    return [Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()), t.Frequency]
                });
            
            

            let finalTracking = el.Trackings[el.Trackings.length - 1];
            if(finalTracking != null){
                if (this.isDateBeforeToday(finalTracking.Date.toDate())){
                    var todaysDate = new Date();
                    lineSeriesData.push([Date.UTC(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate()), 0])
                }
                streak = this.getCurrentStreak(finalTracking);
            }
            

            lineSeries.push(
                {
                    name: el.Name,
                    type: 'spline',
                    data: lineSeriesData
                }
            )

            //Gauge Series
            
            var progress = Math.min(100,Math.ceil(streak/el.TargetDays * 100));
            var data = {
                'type': 'solidgauge',
                'name': el.Name,
                'data': [{
                    'color': Highcharts.getOptions().colors[i],
                    'radius': radius+'%',
                    'innerRadius': innerRadius+'%',
                    'y': progress,
                    'habitId': el.Id,
                    'streak': streak,
                    'finalTracking':finalTracking
                }]
            }
            innerRadius = radius + 1;
            radius = innerRadius + radiusSize;
            gaugeSeries.push(data);
        });

        this.buildCharts(gaugeSeries,lineSeries);
        console.log(gaugeSeries);
        console.log(lineSeries)


    }

    getCurrentStreak(latest){
        var latestDate = latest.Date.toDate();
        if (this.isDateBeforeToday(latestDate)){
            var todaysDate = new Date();
            const utc1 = Date.UTC(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
            const utc2 = Date.UTC(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate());
            return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)) - 1; //minus 1 to exclude current day
        }else{
            return 0;//latest.Streak;
        }
    }

    isDateBeforeToday(date){
        return new Date(date.toDateString()) < new Date(new Date().toDateString());
    }

    async presentToast(msg) {
        const toast = await this.toastCtrl.create({
        message: msg,
        position: 'middle',
        duration: 2000
        });
        toast.present();
    }

    updateStatus(){
        console.log('updateing)')
        this.isLoading = false;
    }

    addTracking(){
        console.log(this.selectedPoint);
        if(this.selectedPoint.finalTracking != null && !this.isDateBeforeToday(this.selectedPoint.finalTracking.Date.toDate())){
            //latestDate is today, just update frequency
            var finalTracking = this.selectedPoint.finalTracking;
            finalTracking.Frequency++;
            this.habitTrackingProvider.UpdateHabitTrackingFrequency(finalTracking.Id, finalTracking).then(res =>{
                this.presentToast('success');
                this.getHabits();
            }
            ,(error) => {
                // this.loadError = true;
                this.presentToast(error.message);
                
            });
        }else{
            var habit = {
                Id: null,
                Date: new Date(),
                Frequency: 1,
                HabitId: this.selectedPoint.habitId,
                Streak: this.selectedPoint.streak
            };
            this.habitTrackingProvider.AddHabitTracking(habit).then(res => {
                
                this.presentToast('success');
                this.getHabits();
                // this.highlights = data.content as IWiseInfoTVHighlights[];
            },
            (error) => {
                // this.loadError = true;
                this.presentToast(error.message);
                
            });
        }
        
        console.log(habit)
        
    }
}
