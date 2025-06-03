import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, of, catchError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderService } from '../../../core/services/header.service';
import { HttpService } from '../../../core/services/http.service';
import { TableColumn, TableConfig } from '../../../shared/components/data-table/IDataTable';
import { ModalMessageComponent } from '../../../shared/components/modal-message/modal-message.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { LookupService } from '../../../core/services/lookup.service';
import { Status } from '../../../shared/enums/enums';
import { AddMasterLookupTypeComponent } from './add-master-lookup-type/add-master-lookup-type.component';
@Component({
  selector: 'app-master-lookup-types',
  templateUrl: './master-lookup-types.component.html',
  styleUrl: './master-lookup-types.component.scss'
})
export class MasterLookupTypesComponent {
  destroy$ = new Subject<void>;
  filterForm: FormGroup;
  pageNo = 1;
  total = 0;
  limit = 6;
  tableConfig: TableConfig = {
    paging: true,
    hideTotalRecord: true,
    filter: {
      Sort: 1,
      PageSize: this.limit,
    },
    tableLayout: '.4fr 1.2fr 1fr 1fr 1fr 1fr 1fr .7fr .7fr',
  };
  tableColumns: TableColumn[] = [];
  lookupList = [];
  statusList = [];
  filterParams;
  otherData;
  statusEnum = Status;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    public _modalService: NgbModal,
  ) {
    this._headerService.setTitle('Master Lookup Types');
  }
  ngOnInit() {
    this.getDataList();
    this.getLookups();
    this.initFilterForm();
    this.initTableColumns();
  }
  getLookups() {
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=1&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([status$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.statusList = response[0].data.filter(x => x.lookupID == Status.Active || x.lookupID == Status.InActive);
    });
  }
  initFilterForm() {
    this.filterForm = this.fb.group({
      name: [''],
      status: [null],
    });
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
      this.pageNo = 1;
      let formValues = this._httpService._helperService.trim(data);
      this.filterParams = new URLSearchParams(formValues).toString();
      this.getDataList(this.filterParams);
    });
  }
  resetFilterForm() {
    this.pageNo = 1;
    this.filterForm.reset(null, { emitEvent: false });
    this.filterParams = "";
  }
  handleChangePageSize(event) {
    let value = +event.target.value;
    this.tableConfig.filter.PageSize = value;
    this.limit = value;
    this.pageNo = 1;
    this.getDataList();
  }
  getDataList(params?) {
    let APIURL = `${this._httpService.apiUrl.Lookup.GetLookupTypes}?`;
    let defaultParams = `&pageSize=${this.tableConfig.filter.PageSize}&pageNo=${this.pageNo - 1}&sort=${this.tableConfig.filter.Sort}`;
    let url;
    if (params) url = `${APIURL}${params}${defaultParams}`;
    else url = `${APIURL}${defaultParams}`;
    this._httpService._spinnerService.show();
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.lookupList = response.data;
        this.total = response?.info?.totalRecordsCount;
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  handleAddClick(row = null) {
    this.resetFilterForm();
    const modalRef = this._modalService.open(AddMasterLookupTypeComponent, { size: 'lg' });
    if (row) {
      modalRef.componentInstance.data = { row, edit: true };
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        modalRef.dismiss();
        this.pageNo = 1;
        this.getDataList();
      }
    });
  }
  confirmDelete(row) {
    this.resetFilterForm();
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete Lookup Type',
      body: 'Are you sure you want to delete this lookup type?',
      confirmText: 'Delete',
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.deleteRow(row);
        }
      }
    });
  }
  deleteRow(row) {
    this._httpService._spinnerService.show();
    const formData = new FormData();
    formData.append('lookupTypeId', row?.lookupTypeID);
    this._httpService.post(`${this._httpService.apiUrl.Lookup.DeleteLookupType}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data deleted successfully!');
          this.pageNo = 1;
          this.getDataList();
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  responseModal(type, message) {
    const modalRef = this._modalService.open(ModalMessageComponent);
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.message = message;
  }
  resetControlValue(control) {
    this.filterForm.get(control).setValue('');
  }
  clearSelectedRow() {
    this.otherData = { ...this.otherData, clearSelectedRow: true }
  }
  onPageChange(page: number) {
    this.pageNo = page;
    this.getDataList(this.filterParams);
  }
  onSortChange(sort: any) {
    if (sort?.direction && sort?.column) {
      switch (sort.column) {
        case "lookupTypeID":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 3 : 2;
          break;
        case "lookupTypeName":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 5 : 4;
          break;
        case "lookupsCount":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 7 : 6;
          break;
        case "enterUser.fullName":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 9 : 8;
          break;
        case "enterDate":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 11 : 10;
          break;
        case "modUser.fullName":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 13 : 12;
          break;
        case "modDate":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 15 : 14;
          break;
        case "status":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 17 : 16;
          break;
        default:
          break;
      }
    } else {
      this.tableConfig.filter.Sort = 1;
    }
    this.getDataList(this.filterParams);
  }
  initTableColumns() {
    this.tableColumns = [
      { key: 'lookupTypeID', label: 'ID', canSort: true, },
      { key: 'lookupTypeName', label: 'Lookup Type Name', canSort: true, },
      { key: 'lookupsCount', label: 'Lookups Count', canSort: true, },
      { key: 'enterUser.fullName', label: 'Created By', canSort: true, },
      { key: 'enterDate', label: 'Created At', canSort: true, dateFormat: 'dd/MM/yyyy', },
      { key: 'modUser.fullName', label: 'Modified By', canSort: true },
      { key: 'modDate', label: 'Modified At', canSort: true, dateFormat: 'dd/MM/yyyy', },
      { key: 'status', label: 'Status', canSort: true, },
      { key: 'action', label: 'Action' },
    ];
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
