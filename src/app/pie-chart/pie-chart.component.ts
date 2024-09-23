import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnChanges {
  @Input() data: { label: string; value: number }[] = [];
  total: number = 0;
  tooltipIndex: number | null = null; // Track which tooltip to show

  ngOnChanges() {
    this.total = this.data.reduce((acc, item) => acc + item.value, 0);
  }

  showTooltip(index: number) {
    this.tooltipIndex = index; // Show tooltip for this index
  }

  hideTooltip() {
    this.tooltipIndex = null; // Hide tooltip
  }

  getPercentage(value: number): number {
    return (value / this.total) * 100;
  }

  getPieSectionStyle(index: number, value: number) {
    const percentage = this.getPercentage(value);
    const offset = this.data.slice(0, index).reduce((acc, item) => acc + this.getPercentage(item.value), 0);
    const rotation = offset * 3.6; // Convert percentage to degrees

    return {
      'background-color': this.getColor(index),
      'transform': `rotate(${rotation}deg)`,
      'clip-path': 'polygon(50% 50%, 100% 0%, 100% 100%)', // Triangle shape
      'position': 'absolute',
      'width': '100%',
      'height': '100%',
      'border-radius': '50%',
      'transform-origin': '50% 50%',
      'z-index': index,
    };
  }

  getColor(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    return colors[index % colors.length];
  }
}
