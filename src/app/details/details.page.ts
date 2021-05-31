import { Component, Inject, LOCALE_ID, OnInit, ViewChild, ɵɵsetComponentScope } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHabit } from 'src/interface/habit.interface';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more.src';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { CalendarComponent } from 'ionic2-calendar';
import { isToday, parseDate } from '../common/util';
import { JsonProvider } from 'src/providers/json/json';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';



HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  
  private habit: IHabit;
  isLoading:boolean = true;
  gaugeChart;
  streaks;
  constructor(private route: ActivatedRoute, private router: Router, private jsonProvider: JsonProvider, private popoverController:PopoverController) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.habit= this.router.getCurrentNavigation().extras.state.habit;
        // this.getGaugeChartData();
        // this.getCalendarData();
      }else{
        //this.router.navigateByUrl('/tabs');

        //get from JSON during dev
        this.habit = this.jsonProvider.GetHabitWithTrackingsByHabitId("1");
        // this.getGaugeChartData();
        // this.getCalendarData();
      }
      this.getStreak();
    });
    
  }


  

  ngOnInit() {  
  }

  ionViewDidEnter(){
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        console.log("My width is:", (document.getElementById('gaugeChartContainer') as HTMLFormElement).clientWidth);
        this.getGaugeChartData();
        this.getCalendarData();
      }
    };
  }
  
  getGaugeChartData(){
    var habit = this.habit;
    var gaugeSeries = [];

    //Gauge Series
    var progress = Math.min(100,Math.ceil(habit.CurrStreak/habit.TargetDays * 100));
    var data = {
        'type': 'solidgauge',
        'name': habit.Name,
        'data': [{
            'color': Highcharts.getOptions().colors[0],
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
    this.buildCharts(gaugeSeries);
  }

  buildCharts(gaugeSeries){
    
    var parent = this;
    const charts = new Promise<void>((resolve,reject) =>{
        this.gaugeChart = Highcharts.chart('gaugeChartContainer', { 

            chart: {
                height: '90%',
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
                backgroundColor: 'none',
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
                endAngle: 360
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
                    rounded: true
                }
            },
            series: gaugeSeries
        });

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
      console.log(this.habit);
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
      this.eventSource = events;
    }

  addFrequency(selectedDate){
    //   selectedDate.events.push({
    //     title: this.habit.Name,
    //     startTime: new Date,
    //     endTime: new Date,
    //     allDay: false,
    // });
    // console.log(selectedDate);

    this.selectedDateEventsCount++;
  }

  removeFrequency(selectedDate){
    if(this.selectedDateEventsCount>0){
        this.selectedDateEventsCount--;
    }
  }

  resetFrequency(selectedDate){
      this.selectedDateEventsCount = selectedDate.events.length;
  }

  saveFrequency(selectedDate){
      //check if more or less.. get difference and add to firebase
      
  }

  //streak
  getStreak(){
    this.streaks = this.habit.Trackings.sort((elemA, elemB) => {
      if (elemA.Streak > elemB.Streak) {
        return -1;
      } else if (elemB.Streak > elemA.Streak) {
        return 1;
      }
      return 0;
    }).slice(0, 5).map(s=>{
      return {
        "Streak":s.Streak,
        "EndDate": moment(parseDate(s.Date)).format("MMM Do"),
        "StartDate":moment(parseDate(s.Date)).subtract(s.Streak,"days").format("MMM Do")
      }
    });

  }
}
