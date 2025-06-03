import {
  AfterContentInit,
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  TemplateRef,
  ContentChildren,
  QueryList,
  ViewChild,
  ElementRef,
  ContentChild,
} from '@angular/core';
import { cloneDeep, get } from 'lodash-es';
import { HttpService } from '../../../core/services/http.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HeadColumnDirective } from './head-column.directive';
import { DataColumnDirective } from './data-column.directive';
import { TableColumn, TableConfig, TableSort } from './IDataTable';
import { AccordionItemDirective } from './accordion-item.directive';
import { TotalRowsDirective } from './total-rows.directives';
import { TableFootDirective } from './table-foot.directives';
@Component({
  selector: 'appDataTable',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements OnInit, AfterContentInit, OnChanges {
  @Input() config: TableConfig = {};
  @Input() loading = false;
  @Input() page: number = 1;
  @Input() pageCount: number = 1;
  @Input() limit: number = 6;
  @Input() total: number = 0;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() otherData = {};
  @Input() sort: TableSort = { column: null, direction: false };
  multiSelect: boolean;
  selectedItems = [];
  @Output() pageUpdated = new EventEmitter<number>();
  @Output() sortUpdated = new EventEmitter();
  @Output() eventData = new EventEmitter();
  @Output() multiSelected = new EventEmitter();
  @Output() tableRowClick = new EventEmitter();
  @ContentChildren(HeadColumnDirective)
  templateHeadColumnRefs!: QueryList<HeadColumnDirective>;
  @ContentChildren(DataColumnDirective)
  templateColumnRefs!: QueryList<DataColumnDirective>;
  @ContentChild(AccordionItemDirective) accItemRef!: AccordionItemDirective;
  @ContentChild(TotalRowsDirective) totalRowsRef: TotalRowsDirective;
  @ContentChild(TableFootDirective) tFoot: TableFootDirective;
  columnTemplates!: { [key: string]: TemplateRef<any> };
  columnHeadTemplates: { [key: string]: TemplateRef<any> } = {};
  accItemTemplate: TemplateRef<any>;
  tempData: any[] = [];
  @ViewChild('inputFile') inputFile: ElementRef;
  tableStyle = {};
  isAllItemSelected: boolean = false;

  constructor(
    private _httpService: HttpService,
    private _datePipe: DatePipe,
    private _decimalPipe: DecimalPipe
  ) { }
  mergeStyles(column: any): { [key: string]: any } {
    return {
      ...(column?.cellStyle || {})
    };
  }
  ngOnInit() {
    if (this.config.initSort) {
      this.sort = this.config.initSort;
    }
    this.applyStyle();
    this.calculateColumnWidth();
  }
  toggleMultiSelection(event) {
    let checked = event.target.checked;
    this.isAllItemSelected = checked;
    if (checked) {
      this.tempData = this.tempData.map((item) => {
        return { ...item, isChecked: true };
      });
      this.selectedItems = this.tempData;
      this.multiSelected.emit({ selectedItems: this.selectedItems });
    } else {
      this.tempData = this.tempData.map((item) => {
        return { ...item, isChecked: false };
      });
      this.selectedItems = [];
      this.multiSelected.emit({ selectedItems: [] });
    }
  }

  handleTrClick(row, i) {
    this.tableRowClick.emit({ row, i });
  }

  handleSelectionChange() {
    let selectedItems = this.tempData.filter((x: any) => x.isChecked);
    this.selectedItems = selectedItems;
    this.multiSelected.emit({ selectedItems });
  }
  ngAfterContentInit() {
    if (this.accItemRef) {
      this.accItemTemplate = this.accItemRef.template;
    }
    this.columnTemplates = this.templateColumnRefs.reduce(
      (acc: any, cur: DataColumnDirective) => {
        acc[cur.name] = cur.template;
        return acc;
      },
      {}
    );
    if (this.templateHeadColumnRefs) {
      for (let item of this.templateHeadColumnRefs) {
        this.columnHeadTemplates[item.name] = item.template;
      }
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.tempData = cloneDeep(this.data || []);
      this.tempData = this.tempData.map((item) => {
        return { ...item, isChecked: this.isAllItemSelected };
      });
    }
    if (changes['otherData']) {
      let currentValue = changes['otherData']?.currentValue;
      if (currentValue?.clearSelectedRow) {
        this.multiSelect = false;
        this.isAllItemSelected = false;
        this.tempData = this.tempData.map((item) => {
          return { ...item, isChecked: false };
        });
        this.selectedItems = [];
        this.multiSelected.emit({ selectedItems: [] });
      }
    }
  }

  onPageChange(page: number) {
    this.pageUpdated.emit(page);
  }

  getItemValue(item: any, key: string, columnIndex: number) {
    let value = get(item, key);
    if (value === undefined || value === null || value === '') {
      if (this.columns[columnIndex]?.placeholder)
        return this.columns[columnIndex]?.placeholder
      else
        return
    }
    if (this.columns[columnIndex]?.dateFormat) {
      return this._datePipe.transform(item[key], this.columns[columnIndex].dateFormat)
    }
    else if (this.columns[columnIndex]?.currency?.decimalFormat) {
      let value = this._decimalPipe.transform(item[key], this.columns[columnIndex].currency.decimalFormat) + (this.columns[columnIndex].currency?.appendText || '');
      return value;
    }
    else {
      return get(item, key);
    }
  }

  getColumnByKey(key: string) {
    return this.columns.find((s) => s.key === key);
  }
  applyStyle() {
    for (let key in this.config.style) {
      if (key == 'header') {
        this.tableStyle[key] = {};
        for (let prop in this.config.style[key]) {
          if (this.config.style[key][prop])
            this.tableStyle[key][prop] = this.config.style[key][prop];
        }
      } else if (key == 'row') {
        this.tableStyle[key] = {};
        for (let prop in this.config.style[key]) {
          if (this.config.style[key][prop])
            this.tableStyle[key][prop] = this.config.style[key][prop];
        }
      } else if (key == 'otherStyle') {
        this.tableStyle[key] = {};
        for (let prop in this.config.style[key]) {
          if (this.config.style[key][prop])
            this.tableStyle[key][prop] = this.config.style[key][prop];
        }
      }
    }
  }
  calculateColumnWidth() {
    let columns = [...this.columns];
    columns.forEach((column: any) => {
      column.width = parseFloat(column?.width || 0);
    });
    let totalFixedWidth = columns.reduce((sum, column) => {
      return column.fixedWidth ? sum + parseFloat(column.width) : sum;
    }, 0);
    let remainingWidth = 100;
    if (totalFixedWidth > 0) {
      remainingWidth = 100 - totalFixedWidth;
    }
    if (this.config.multiSelect) {
      remainingWidth = remainingWidth - this.config.multiSelectCoulmnWidth;
    }
    let flexibleColumns = columns.filter((column) => !column.fixedWidth);
    let flexibleColumnsCount = flexibleColumns.length;
    let newWidthPerFlexibleColumn = remainingWidth / flexibleColumnsCount;
    columns = columns.map((column) => {
      if (!column.fixedWidth) {
        return { ...column, width: `${newWidthPerFlexibleColumn.toFixed(1)}%` };
      }
      return { ...column, width: `${column.width}%` };
    });
    this.columns = columns;
  }
  isSortColumnMatch(column: TableColumn) {
    return this.sort?.column === column.key;
  }

  onSort(column: TableColumn) {
    if (!column.canSort || !this.tempData.length) {
      return;
    }
    if (this.isSortColumnMatch(column)) {
      if (this.sort.direction === 'asc') {
        this.sort.direction = 'desc';
        this.sort.column = column.key;
      } else if (this.sort.direction === 'desc') {
        this.sort.direction = false;
        this.sort.column = null;
      } else {
        this.sort.direction = 'asc';
        this.sort.column = column.key;
      }
    } else {
      this.sort.direction = 'asc';
      this.sort.column = column.key;
    }
    this.sortUpdated.emit(this.sort);
  }
}
