import { Component, Inject, LOCALE_ID, OnInit, ViewChild, ɵɵsetComponentScope } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHabit } from 'src/interface/habit.interface';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more.src';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { CalendarComponent } from 'ionic2-calendar';
import { formatDate } from '@angular/common';
import { AlertController } from '@ionic/angular';



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
  constructor(private route: ActivatedRoute, private router: Router, private alertCtrl: AlertController,@Inject(LOCALE_ID) private locale: string) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.habit= this.router.getCurrentNavigation().extras.state.habit;
        this.getGaugeChartData();
      }else{
        this.router.navigateByUrl('/tabs');
      }
    });
  }

  ngOnInit() {  
    
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
                backgroundColor: 'transparent',
                events: {
                    //render: renderIcons
                    load: function () {
                    var self = this;
                    // self.reflow ();
                    // self.tooltip.refresh(self.series[0].data[0]);
                    setTimeout (function () {
                        self.reflow ();
                        self.tooltip.refresh(self.series[0].data[0]);
                    }, 10)
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
  eventSource = [];
  viewTitle: string;
  calendar = {
    mode: 'month',
    currentDate: new Date(),
  };
 
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

  async onEventSelected(event) {
    // Use Angular date pipe for conversion
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);
 
    const alert = await this.alertCtrl.create({
      header: event.title,
      subHeader: event.desc,
      message: 'From: ' + start + '<br><br>To: ' + end,
      buttons: ['OK'],
    });
    alert.present();
  }
 
  createRandomEvents() {
    var events = [];
    for (var i = 0; i < 50; i += 1) {
      var date = new Date();
      var eventType = Math.floor(Math.random() * 2);
      var startDay = Math.floor(Math.random() * 90) - 45;
      var endDay = Math.floor(Math.random() * 2) + startDay;
      var startTime;
      var endTime;
      if (eventType === 0) {
        startTime = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + startDay
          )
        );
        if (endDay === startDay) {
          endDay += 1;
        }
        endTime = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + endDay
          )
        );
        events.push({
          title: 'All Day - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: true,
        });
      } else {
        var startMinute = Math.floor(Math.random() * 24 * 60);
        var endMinute = Math.floor(Math.random() * 180) + startMinute;
        startTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + startDay,
          0,
          date.getMinutes() + startMinute
        );
        endTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + endDay,
          0,
          date.getMinutes() + endMinute
        );
        events.push({
          title: 'Event - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: false,
        });
      }
    }
    console.log(events)
    this.eventSource = events;
  }
 
  removeEvents() {
    this.eventSource = [];
  }
}
