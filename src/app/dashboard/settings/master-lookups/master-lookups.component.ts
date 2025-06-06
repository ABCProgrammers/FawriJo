import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderService } from '../../../core/services/header.service';
import { HttpService } from '../../../core/services/http.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { TableColumn, TableConfig } from '../../../shared/components/data-table/IDataTable';
import { ModalMessageComponent } from '../../../shared/components/modal-message/modal-message.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { LookupService } from '../../../core/services/lookup.service';
import { InLargeViewModalComponent } from '../../../shared/components/in-large-view-modal/in-large-view-modal.component';
import { Status } from '../../../shared/enums/enums';
import { AddMasterLookupComponent } from './add-master-lookup/add-master-lookup.component';
@Component({
  selector: 'app-master-lookups',
  templateUrl: './master-lookups.component.html',
  styleUrl: './master-lookups.component.scss'
})
export class MasterLookupsComponent {
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
    tableLayout: '.5fr 1fr 1fr 1fr .80fr .80fr .70fr 1fr .5fr .7fr .8fr',
  };
  tableColumns: TableColumn[] = [];
  lookupList = [];
  statusList = [];
  lookupTypesList = [];
  parentTypeList = [];
  tempLookupList = [];
  isStatic = [{ label: 'Yes', value: true }, { label: 'No', value: false }];
  hasParent = [{ label: 'Yes', value: true }, { label: 'No', value: false }];
  filterParams;
  otherData;
  showFilter = false;
  statusEnum = Status;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    public _modalService: NgbModal,

  ) {
    this._headerService.setTitle('Master Lookups');
  }
  ngOnInit() {
    this.getDataList();
    this.getLookups();
    this.initFilterForm();
    this.initTableColumns();
  }
  toggleFilters() {
    this.showFilter = !this.showFilter;
  }
  getLookups() {
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=1&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const lookupType$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookupTypes}?status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([status$, lookupType$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.statusList = response[0].data.filter(x => x.lookupID == Status.Active || x.lookupID == Status.InActive);
      this.lookupTypesList = response[1].data;
      this.parentTypeList = this.lookupTypesList;
    });
  }
  initFilterForm() {
    this.filterForm = this.fb.group({
      lookupTypeId: [null],
      search: [''],
      parentId: [null],
      lookupStatic: [null],
      //lookupDefault: [null],
      hasParent: [null],
      parentTypeLookup: [null],
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
  handleParentTypeChange(event) {
    this.filterForm.controls['parentId'].setValue(null);
    this.tempLookupList = [];
    if (event) {
      this.getLookupByLookupTypeId(event?.lookupTypeID).pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          this.tempLookupList = res.data;
        }
      })
    }
  }
  getLookupByLookupTypeId(id) {
    return this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=${id}&status=1001&pageSize=1000`);
  }
  getDataList(params?) {
    let APIURL = `${this._httpService.apiUrl.Lookup.GetLookups}?`;
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

  handleViewFullImageClick(row) {
    if (row?.lookupImage) {
      const modalRef = this._modalService.open(InLargeViewModalComponent, { size: 'lg' });
      modalRef.componentInstance.data = { file: row?.lookupImage };
    }
  }
  handleAddClick(row = null) {
    const modalRef = this._modalService.open(AddMasterLookupComponent, { size: 'xl' });
    if (row) {
      modalRef.componentInstance.data = { row, edit: true };
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        modalRef.dismiss();
        this.resetFilterForm();
        this.getDataList();
      }
    });
  }
  confirmDelete(row) {
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete Lookup',
      body: 'Are you sure you want to delete this lookup?',
      confirmText: 'Delete',
    }
    modalRef.componentInstance.eventData.subscribe({
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
    formData.append('lookupId', row?.lookupID);
    this._httpService.post(`${this._httpService.apiUrl.Lookup.DeleteLookup}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data deleted successfully!');
          this.resetFilterForm();
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
  resetForm() {
    this.filterForm.reset();
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
        case "lookupID":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 3 : 2;
          break;
        case "lookupName":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 5 : 4;
          break;
        case "lookupType.lookupTypeName":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 7 : 6;
          break;
        case "lookupValue":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 9 : 8;
          break;
        case "lookStatic":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 11 : 10;
          break;
        case "lookupDefault":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 13 : 12;
          break;
        case "lookupParentObj.lookupName":
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
      { key: 'lookupID', label: 'ID', canSort: true, },
      { key: 'lookupNameEN', label: 'Lookup Name', canSort: true, },
      { key: 'lookupType.lookupTypeName', label: 'Lookup Type', canSort: true, },
      { key: 'lookupValue', label: 'Lookup Value', canSort: true, },
      { key: 'lookStatic', label: 'Static', canSort: true, },
      { key: 'lookupDefault', label: 'Default', canSort: true },
      { key: 'lookupSort', label: 'Sort', },
      { key: 'lookupParentObj.lookupNameEN', label: 'Parent', canSort: true, },
      { key: 'image', label: 'Image', },
      { key: 'status', label: 'Status', canSort: true, },
      { key: 'action', label: 'Action' }, 
    ];
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
