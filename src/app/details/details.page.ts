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
  bubbleChart;
  streaks;
  parseDate;
  constructor(private route: ActivatedRoute, private router: Router, private jsonProvider: JsonProvider, private popoverController:PopoverController) {
    this.parseDate = parseDate;
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        console.log('router')
        this.habit= this.router.getCurrentNavigation().extras.state.habit;
        console.log(this.habit)
        // this.getGaugeChartData();
        // this.getCalendarData();
      }else{
        //this.router.navigateByUrl('/tabs');
        console.log('hardcode')
        //get from JSON during dev
        this.habit = this.jsonProvider.GetHabitWithTrackingsByHabitId("1");
        // this.getGaugeChartData();
        // this.getCalendarData();
      }
      if(document.readyState === "complete"){
        console.log("document ready")
        this.init()
      }else{
        console.log("document Not ready, waiting on state change.")
        document.onreadystatechange = () => {
          console.log('state changed - ' + document.readyState);
          if (document.readyState === 'complete') {
            
            this.init()
            
          }
        };
      }
      this.getStreak();
      
    });
    
  }


  

  ngOnInit() {  
    Highcharts.setOptions({
      chart: {
          //backgroundColor: 'black'
      },
      colors: ['#fff', '#0000ff','#F62366', '#9DFF02', '#0CCDD6'],
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
    console.log("My width is:", (document.getElementById('gaugeChartContainer') as HTMLFormElement).clientWidth);
    this.getGaugeChartData();
    this.getCalendarData();
  }

  ionViewDidEnter(){
    
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
            'color': '#fff',
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
    habit.Trackings.filter(t=>parseDate(t.Date).getFullYear() == currYear).forEach(t=>{

    })
    var groups = habit.Trackings.filter(t=>parseDate(t.Date).getFullYear() == currYear).reduce((prev, cur)=> {
      var date = parseDate(cur.Date);
      
      var year = moment(date).format("yyyy");
      var month = moment(date).format("MMM");
      var key = moment(date).format("MMM yyyy");
      console.log(key);

      //[Month, Count, Sum(Frequency)]
      // if(prev[year]){
      //   //(prev[year][month]?prev[year][month].data.push(cur):prev[year][month]= {group: String(month), data: [cur]});
      // }else{
      //   prev[year] = {group: String(year), data: {String(month): [cur]}}
      //   console.log(prev)
      // }
      // (prev[year]?prev[month].data.push(cur)
      
      // :prev[month]= {group: String(month), data: [cur]});
      (prev[key]?prev[key] = [prev[key][0],prev[key][1]+=1, prev[key][2]+=cur.Frequency]:prev[key]= [date.getMonth()+1,1,cur.Frequency]);

      //(prev[key]?prev[key].data.push(cur):prev[key]= {group: String(key), data: [cur],year: year});
      return prev;
    }, {});
    var result = Object.keys(groups).map(function(k){ return groups[k]; });
    console.log(result)
    console.log(groups)
    // habit.Trackings.map(t=>{
    //   return [t.Date.get]
    // }

    
    this.buildCharts(gaugeSeries, result);
  }

  buildCharts(gaugeSeries, bubbleSeries){
    
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

        this.bubbleChart = Highcharts.chart("bubbleChartContainer",{

          chart: {
            type: 'bubble',
            plotBorderWidth: 0,
            zoomType: 'xy',
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
          legend:{
            enabled:false,
          },
          title: {
            text: null
          },
        
          xAxis: {
            gridLineWidth: 0,
            accessibility: {
              rangeDescription: 'Range: 0 to 100.'
            },
            title:null
          },
        
          yAxis: {
            gridLineWidth: 0,
            title:null,
            startOnTick: false,
            endOnTick: false,
            accessibility: {
              rangeDescription: 'Range: 0 to 100.'
            }
          },
          series: [{
            type:"bubble",
            data: bubbleSeries,
            marker: {
              fillColor: {
                radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                stops: [
                  [0, 'rgba(255,255,255,0.5)'],
                  [1, Highcharts.color(Highcharts.getOptions().colors[1]).setOpacity(0.5).get('rgba').toString()]
                ]
              }
            }
          }]
          
        
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

  //average


}
