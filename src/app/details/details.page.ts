import { Component, OnInit, ɵɵsetComponentScope } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHabit } from 'src/interface/habit.interface';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more.src';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';


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
  selectedPoint;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.habit= this.router.getCurrentNavigation().extras.state.habit;
        console.log(this.habit);
        this.getGaugeChartData();
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
            'innerRadius': '80%',
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
                height: '70%',
                events: {
                    //render: renderIcons
                    load: function () {
                    var self = this;
                    setTimeout (function () {
                        self.reflow ();
                        self.tooltip.refresh(self.series[0].data[0]);
                        console.log(self.series[0].data[0])
                        parent.selectedPoint = self.series[0].data[0];
                        Highcharts.fireEvent(self.series[0].data[0], 'click');
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

        resolve();
        
        charts.then(value =>{
          var self = this;
          setTimeout (function () {
              console.log(self.isLoading)
              self.isLoading = false;
          }, 1000)
      });
    })
  }
}
