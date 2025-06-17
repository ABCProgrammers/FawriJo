import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { curveBumpX } from 'd3-shape';
@Component({
  selector: 'app-registered-drivers',
  templateUrl: './registered-drivers.component.html',
  styleUrl: './registered-drivers.component.scss'
})
export class RegisteredDriversComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  lineChartData;
  year = new FormControl(new Date().getFullYear());
  yearsList = [];
  colorScheme = {
    domain: ['#25A7E0']
  };
  curve = curveBumpX;
  ngOnInit() {
    this.yearsList = [];
    let currentYear = new Date().getFullYear();
    for (let i = 2000; i <= currentYear; i++) {
      this.yearsList.push({ text: i, value: i })
    }
    this.year.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(x => {
      this.eventData.emit({ year: x })
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      let currentValue = changes['data']?.currentValue;
      this.populateChart(currentValue);
    }
  }
  populateChart(arg) {
    if (arg?.registrations) {
      let series = [];
      Object.entries(arg?.registrations).map(([key, value]) => {
        series.push({ name: key.slice(0, 3), value });
      });
      this.lineChartData = [{ name: 'Drivers', series }];
    }
    else {
      // Just to remain UI same in case of no data from API
      this.lineChartData = this.initialChartData();
    }
  }
  initialChartData() {
    return [
      {
        name: 'Drivers',
        series: [
          { name: 'Jan', value: 0 },
          { name: 'Feb', value: 0 },
          { name: 'Mar', value: 0 },
          { name: 'Apr', value: 0 },
          { name: 'May', value: 0 },
          { name: 'Jun', value: 0 },
          { name: 'Jul', value: 0 },
          { name: 'Aug', value: 0 },
          { name: 'Sep', value: 0 },
          { name: 'Oct', value: 0 },
          { name: 'Nov', value: 0 },
          { name: 'Dec', value: 0 },
        ]
      }
    ];
  }
  yAxisTicks = (value: number): string => {
    return Number.isInteger(value) ? value.toString() : '';
  };
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
