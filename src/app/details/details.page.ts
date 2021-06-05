import { Component, Inject, LOCALE_ID, OnInit, ViewChild, ɵɵsetComponentScope } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHabit } from 'src/interface/habit.interface';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more.src';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { CalendarComponent } from 'ionic2-calendar';
import { deepCopy, getStreak, getTrackingIdxByDate, isDateBeforeToday, isToday, parseDate, ToastService } from '../common/util';
import { JsonProvider } from 'src/providers/json/json';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { HabitTrackingProvider } from 'src/providers/habitTracker/habitTracker';
import { HabitProvider } from 'src/providers/habits/habits';



HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  
  private habit: IHabit;
  isLoading:boolean = false;
  gaugeChart;
  bubbleChart;
  columnChart;
  streaks;
  parseDate;
  selectedYear = "2021";
  constructor(private route: ActivatedRoute, private router: Router, private popoverController:PopoverController, private toastService: ToastService,
    private habitTrackingProvider: HabitTrackingProvider, private habitProvider: HabitProvider,private jsonProvider: JsonProvider) {
    this.parseDate = parseDate;
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        console.log('router')
        this.habit= this.router.getCurrentNavigation().extras.state.habit;
        this.init();
      }else{
        //this.router.navigateByUrl('/tabs');
        console.log('hardcode')
        //get from JSON during dev
        this.jsonProvider.GetHabitWithTrackingsByHabitId("1").then(res=>{
          this.habit = res;
          this.init();
        })
        //this.jsonProvider.GetHabitWithTrackingsByHabitId("1")
      }
      
      
      
    });
    
  }


  

  ngOnInit() {  
    Highcharts.setOptions({
      chart: {
          backgroundColor: 'transparent',
          height: '80%',
      },
      colors: ['#fff', '#000','#07cdff','#F62366', '#9DFF02', '#0CCDD6'],
      // title: {
      //     style: {
      //         color: 'silver'
      //     }
      // },
      // tooltip: {
      //     style: {
      //         color: 'silver'
      //     }
      // }
  });
  }

  init(){
    // console.log("My bubble width is:", (document.getElementById('bubbleChartContainer') as HTMLFormElement).clientWidth);
    // console.log("My width is:", (document.getElementById('gaugeChartContainer') as HTMLFormElement).clientWidth);
    this.getStreak();
    this.getGaugeChartData();
    this.getCalendarData();
    this.habit.FinalTracking = this.habit.Trackings[(<any>this.habit.Trackings).length -1];
    this.habit.CurrStreak = getStreak(parseDate(this.habit.FinalTracking.Date), new Date() );

  }

  ionViewDidEnter(){
    
  }

  ngAfterViewInit() {
    console.log(this.ngAfterViewInit)
    // if(document.readyState === "complete"){
    //   console.log("document ready")
    //   this.init()
    // }else{
    //   console.log("document Not ready, waiting on state change.")
    //   document.onreadystatechange = () => {
    //     console.log('state changed - ' + document.readyState);
    //     if (document.readyState === 'complete') {
          
    //       this.init()
          
    //     }
    //   };
    // }
 }

  getHabitTrackings(){
    this.isLoading = true;
    this.habitTrackingProvider.GetHabitTrackingsByHabitId(this.habit.Id).subscribe((data : any) => {
        console.table(data)
        if (data){
          this.habit.Trackings = data;
          this.init();
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        console.error(error.Message)
        
      })
  }
  
  getGaugeChartData(){
    var habit = this.habit;
    var gaugeSeries = [];
    console.log(habit)
    //Gauge Series
    var progress = Math.min(100,Math.ceil(habit.CurrStreak/habit.TargetDays * 100));
    var data = {
        'type': 'solidgauge',
        'name': habit.Name,
        'data': [{
            'color': Highcharts.getOptions().colors[0],
            // 'className':'blue-band',
            //'radius': radius+'%',
            'innerRadius': '70%',
            'outerRadius': '100%',
            'y': progress,
            'habitId': habit.Id,
            'streak': habit.CurrStreak,
            'finalTracking':habit.FinalTracking
        }]
    }
    gaugeSeries.push(data);

    //bubbleSeries
    var currYear = new Date().getFullYear();
    // habit.Trackings.filter(t=>parseDate(t.Date).getFullYear() == currYear).forEach(t=>{

    // })
    // var groups = habit.Trackings.filter(t=>parseDate(t.Date).getFullYear() == currYear).reduce((prev, cur)=> {
    //   var date = parseDate(cur.Date);
      
    //   var year = moment(date).format("yyyy");
    //   var month = moment(date).format("MMM");
    //   var key = moment(date).format("MMM yyyy");
    //   (prev[key]?prev[key] = [prev[key][0],prev[key][1]+=1, prev[key][2]+=cur.Frequency]:prev[key]= [date.getMonth()+1,1,cur.Frequency]);

    //   //(prev[key]?prev[key].data.push(cur):prev[key]= {group: String(key), data: [cur],year: year});
    //   return prev;
    // }, {});

    var groups = habit.Trackings.filter(t=>parseDate(t.Date).getFullYear() == currYear).reduce((prev, cur)=> {
      var date = parseDate(cur.Date);
      var key = moment(date).format("MMM");
      (prev[key]?prev[key] = [prev[key][0], prev[key][1]+=cur.Frequency]:prev[key]= [key,cur.Frequency]);

      //(prev[key]?prev[key].data.push(cur):prev[key]= {group: String(key), data: [cur],year: year});
      return prev;
    }, {});
    var result = Object.keys(groups).map(function(k){ return groups[k]; });
    console.log(result);
    this.buildCharts(gaugeSeries, result);
  }

  buildCharts(gaugeSeries, bubbleSeries){
    
    var parent = this;
    const charts = new Promise<void>((resolve,reject) =>{
        this.gaugeChart = Highcharts.chart('gaugeChartContainer', { 

            chart: {
                
                plotBackgroundColor: 'transparent',
                backgroundColor:'transparent',
                events: {
                    //render: renderIcons
                    load: function () {
                      var self = this;
                      // self.reflow ();
                      // self.tooltip.refresh(self.series[0].data[0]);
                      setTimeout (function () {
                        self.reflow ();
                        self.tooltip.refresh(self.series[0].data[0]);
                      }, 0)
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
                backgroundColor: 'transparent',
                
                shadow: false,
                // style: {
                //     fontSize: '12px'
                // },
                valueSuffix: '%',
                pointFormat: '<span style="font-size:1.25em; color: {point.color}; font-weight: bold">{point.y}</span>',
                positioner: function (labelWidth) {
                    return {
                        x: (this.chart.chartWidth - labelWidth) / 2,
                        y: (this.chart.plotHeight / 2) 
                    };
                }
            },
            pane: {
                startAngle: 0,
                endAngle: 360,
                background: [{ // Track for Move
                  outerRadius: '100%',
                  innerRadius: '70%',
                  backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
                          .setOpacity(0.1)
                          .get(),
                      borderWidth: 0
                  
                }]
            },
        
            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: [],
                // plotBands: [{
                //     from: 0,
                //     to: 100,
                //     className: 'blue-band'
                // }]
              },
        
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: false
                    },
                    linecap: 'round',
                    stickyTracking: false,
                    rounded: true
                }
            },
            series: gaugeSeries
        });

        this.columnChart = Highcharts.chart('columnChartContainer', {
          chart: {
              type: 'column',
              backgroundColor: 'transparent',
              events: {
                //render: renderIcons
                load: function () {
                  var self = this;
                  // self.reflow ();
                  // self.tooltip.refresh(self.series[0].data[0]);
                  setTimeout (function () {
                    self.reflow ();
                  }, 0)
                }
            }
          },
          credits: {
            enabled: false
        },
          title: {
              text: null
          },
          subtitle: {
              text: null
          },
          xAxis: {
            gridLineWidth: 0,
              type: 'category',
              labels: {
                  rotation: -45,
                  style: {
                      color:'black',
                      fontSize: '13px',
                      fontFamily: 'Verdana, sans-serif'
                  }
              }
          },
          yAxis: {
            visible: false,
              gridLineWidth: 0,
              min: 0,
              title: {
                  text: null
              }
          },
          legend: {
              enabled: false
          },
          tooltip: {
              pointFormat: 'Population in 2017: <b>{point.y:.1f} millions</b>'
          },
          series: [{
              type:'column',
              name: 'Population',
              color: {
                radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                stops: [
                  [0, '#fff'],
                  [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0.3).get('rgba').toString()]
                ]
              },
              data: bubbleSeries,
              dataLabels: {
                  enabled: true,
                  rotation: -90,
                  
                  align: 'right',
                  format: '{point.y}', // one decimal
                  y: 10, // 10 pixels down from the top
                  style: {
                      fontSize: '13px',
                      fontFamily: 'Verdana, sans-serif'
                  }
              }
          }]
        });

        // this.bubbleChart = Highcharts.chart("bubbleChartContainer",{

        //   chart: {
        //     type: 'bubble',
        //     plotBorderWidth: 0,
        //     zoomType: 'xy',
        //     backgroundColor: 'transparent',
        //     events: {
        //       //render: renderIcons
        //       load: function () {
        //         var self = this;
        //         // self.reflow ();
        //         // self.tooltip.refresh(self.series[0].data[0]);
        //         setTimeout (function () {
        //           self.reflow ();
        //         }, 0)
        //       }
        //   }
        //   },
        //   legend:{
        //     enabled:false,
        //   },
        //   title: {
        //     text: null
        //   },
        
        //   xAxis: {
        //     gridLineWidth: 0,
        //     accessibility: {
        //       rangeDescription: 'Range: 0 to 100.'
        //     },
        //     title:null
        //   },
        
        //   yAxis: {
        //     gridLineWidth: 0,
        //     title:null,
        //     startOnTick: false,
        //     endOnTick: false,
        //     accessibility: {
        //       rangeDescription: 'Range: 0 to 100.'
        //     }
        //   },
        //   series: [{
        //     type:"bubble",
        //     data: bubbleSeries,
        //     marker: {
        //       fillColor: {
        //         radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
        //         stops: [
        //           [0, 'rgba(255,255,255,0.5)'],
        //           [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0.5).get('rgba').toString()]
        //         ]
        //       }
        //     }
        //   }]
          
        
        // });

        resolve();
        
        charts.then(value =>{
          var self = this;
          setTimeout (function () {
              self.isLoading = false;
          }, 1000)
      });
    })
  }


  //calendar
  eventSource = []; //All
  viewTitle: string;
  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };
  selectedDateEventsCount:number = 0;
  selectedDate: Date;
 
  @ViewChild(CalendarComponent) myCal: CalendarComponent;

  // Change current month/week/day
  next() {
    this.myCal.slideNext();
  }
 
  back() {
    this.myCal.slidePrev();
  }

  // Selected date reange and hence title changed
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  async onCurrentDateChanged(eventCount){
      this.selectedDateEventsCount = eventCount
  }

  getCalendarData() {
      var events = [];
      var trackings = this.habit.Trackings;
      trackings.forEach((el)=>{

        var date = parseDate(el.Date); //if data is from json, el.date is a string
        if(isToday(date)){
            this.selectedDateEventsCount = el.Frequency;
        }
        for(var i=1;i<=el.Frequency;i++){
            events.push({
                title: this.habit.Name + '-' + i,
                startTime: date,
                endTime: date,
                allDay: false,
            });
        }
      })
      console.log(events)
      this.eventSource = events;
    }

  addFrequency(){
    this.selectedDateEventsCount++;
  }

  removeFrequency(){
    if(this.selectedDateEventsCount>0){
        this.selectedDateEventsCount--;
    }
  }

  resetFrequency(calendarSelection){
      this.selectedDateEventsCount = calendarSelection.events.length;
  }

  saveFrequency(calendarSelection){
      
      var oriEventsCount:number = calendarSelection.events.length;
      var selectedDate:Date = parseDate(calendarSelection.date);
      if(oriEventsCount == this.selectedDateEventsCount) return;

      this.isLoading = true;
      var tracking = null;
      //return tracking idx instead of tracking obj cause we might need to get the tracking before & after curr tracking.
      //result index == index of tracking that is right after current selected date
      var result = getTrackingIdxByDate(this.habit.Trackings, selectedDate);
      if(result.index > -1 && result.trackingFound) tracking = this.habit.Trackings[result.index];
      if(this.selectedDateEventsCount == 0) this.deleteTracking(tracking);
      else{
        if(tracking == null){
          //create new tracking
          console.log('Creating new tracking')

          var previousTracking = result.index < 1? null: this.habit.Trackings[result.index - 1];
          var nextTracking = result.index < 0? null:this.habit.Trackings[result.index];
          var newTracking = {
              Id: null,
              Date: selectedDate,
              Frequency: this.selectedDateEventsCount,
              HabitId:this.habit.Id,
              Streak: previousTracking == null? 0: getStreak(parseDate(previousTracking.Date), selectedDate)
              //Note: gotta update tracking for both before and after
          };
          
          this.habitTrackingProvider.AddHabitTracking(newTracking).then(res => {
            if(nextTracking){
              console.log("Tracking updated successfully. Updating next tracking.")
              this.updateNextTracking(nextTracking, selectedDate);
            }else{
              console.log("Tracking updated successfully. No update required for next tracking.")
              this.toastService.presentToast("Update success. Retrieving updated trackings.")
              this.getHabitTrackings();
            }
          },
          (error) => {
              // this.loadError = true;
              this.isLoading = false;
              console.error(error.message)
              this.toastService.presentToast(error.message);
              
          });

        }else{
          //update frequency
          tracking.Frequency = this.selectedDateEventsCount;
          console.log('Updating tracking frequency.')
          this.habitTrackingProvider.UpdateHabitTracking(tracking.Id, tracking).then(res =>{
              this.toastService.presentToast("Tracking updated successfully. Retrieving updated trackings.")
              this.getHabitTrackings();
          }
          ,(error) => {
              // this.loadError = true;
              this.isLoading = false;
              console.error(error.message)
              this.toastService.presentToast(error.message);
              
          });
          this.isLoading = false;

        }
      }
  }

  updateNextTracking(nextTracking, previousDate){
    nextTracking.Streak = previousDate == null? 0: getStreak(previousDate, parseDate(nextTracking.Date));

    this.habitTrackingProvider.UpdateHabitTracking(nextTracking.Id, nextTracking).then(res =>{
      console.log("Next tracking updated successfully")
      this.toastService.presentToast("Update success. Retrieving updated trackings.")
      this.getHabitTrackings();
    }
    ,(error) => {
        // this.loadError = true;
        this.isLoading = false;
        console.error(error.message)
        this.toastService.presentToast(error.message);
        
    });
  }

  deleteTracking(tracking){
    //TODO 
    //result index == index of tracking for current selected date
    var result = getTrackingIdxByDate(this.habit.Trackings, parseDate(tracking.Date));
    if(result.index < 0) throw("Can't find tracking in tracking list.")
    var previousTracking = result.index < 1? null: this.habit.Trackings[result.index - 1];
    var nextTracking = result.index == this.habit.Trackings.length -1 ? null:this.habit.Trackings[result.index + 1];

    this.habitTrackingProvider.DeleteHabitTracking(tracking).then(res=>{
      if(nextTracking){
        console.log("Tracking deleted successfully. Updating next tracking.")
        this.updateNextTracking(nextTracking, parseDate(previousTracking?.Date));
      }else{
        console.log("Tracking deleted successfully. No update required for next tracking.")
        this.toastService.presentToast("Delete success. Retrieving updated trackings.")
        this.getHabitTrackings();
      }
    }
    ,(error) => {
        // this.loadError = true;
        this.isLoading = false;
        console.error(error.message)
        this.toastService.presentToast(error.message);
        
    });
  }


  //streak
  getStreak(){

    //gotta use custom deep copy function cause json parse doesnt support dates
    var trackings = deepCopy(this.habit.Trackings) 
    
    this.streaks = trackings.sort((elemA, elemB) => {
      if (elemA.Streak > elemB.Streak) {
        return -1;
      } else if (elemB.Streak > elemA.Streak) {
        return 1;
      }
      return 0;
    }).slice(0, 10).map(s=>{
      console.log(s)
      return {
        "Streak":s.Streak,
        "EndDate": moment(parseDate(s.Date)).format("MMM Do"),
        "StartDate":moment(parseDate(s.Date)).subtract(s.Streak,"days").format("MMM Do")
      }
    });

  }

  //average


}
