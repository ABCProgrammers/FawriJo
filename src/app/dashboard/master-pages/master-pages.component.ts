import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, catchError, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderService } from '../../core/services/header.service';
import { HttpService } from '../../core/services/http.service';
import { LookupService } from '../../core/services/lookup.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { TableColumn, TableConfig } from '../../shared/components/data-table/IDataTable';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { Status, LanguageEnum } from '../../shared/enums/enums';
import { AppRoutes } from '../../shared/routes/appRoutes';
@Component({
  selector: 'app-master-pages',
  templateUrl: './master-pages.component.html',
  styleUrl: './master-pages.component.scss'
})
export class MasterPagesComponent {
  destroy$ = new Subject<void>;
  filterForm: FormGroup;
  pageNo = 1;
  total = 0;
  limit = 10;
  tableConfig: TableConfig = {
    paging: true,
    multiSelect: false,
    hideTotalRecord: true,
    filter: {
      Sort: 1,
      PageSize: this.limit,
    },
    tableLayout: '.3fr 1fr 1fr .40fr .25fr',
  };
  tableColumns: TableColumn[] = [];
  dataList = [];
  statusList = [];
  countryList = [];
  filterParams;
  statusEnum = Status;
  languageEnum = LanguageEnum;
  appRoutes = AppRoutes;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    public _modalService: NgbModal,
    public _lookupService: LookupService,

  ) {
    this._headerService.setTitle('Master Pages');
  }
  ngOnInit() {
    this.initFilterForm();
    this.getLookups();
    this.initTableColumns();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      status: [null],
      countries: [null],
      masterPagesIdentifier: [''],
    });
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
      this.pageNo = 1;
      let formValues = this._httpService._helperService.trim({ ...data });
      this.filterParams = new URLSearchParams(formValues).toString();
      this.getDataList(this.filterParams);
    });
  }
  handleActionClick(row, action) {
    localStorage.setItem('masterPageDetails', JSON.stringify({ ...row }));
    this._httpService._helperService.navigateToRouteWithQueryString(AppRoutes.MasterPages.Add, { queryParams: { id: row?.masterPageID, action } });
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=1&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([status$, country$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.statusList = response[0].data.filter(x => x.lookupID == Status.Active || x.lookupID == Status.InActive);
      this.countryList = response[1].data;
      this.getDataList();
    })
  }
  getDataList(params?) {
    this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.MasterPages.GetMasterPages}?`;
    let defaultParams = `&pageSize=${this.limit}&pageNo=${this.pageNo - 1}`;
    let url = params && `${APIURL}${params}${defaultParams}` || `${APIURL}${defaultParams}`;
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataList = response.data;
        this.total = response?.info?.totalRecordsCount;
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  handlePageChange(pageNo) {
    !this.filterParams && this._httpService._spinnerService.show();
    this.pageNo = pageNo;
    this.getDataList();
  }
  confirmDelete(row) {
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete Master Page',
      body: 'Are you sure you want to delete this page?',
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
    formData.append('masterPagesID', row?.masterPageID);
    this._httpService.post(`${this._httpService.apiUrl.MasterPages.DeleteMasterPages}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
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
  onPageChange(page: number) {
    this.pageNo = page;
    this.getDataList(this.filterParams);
  }
  handleChangePageSize(event) {
    let value = +event.target.value;
    this.tableConfig.filter.PageSize = value;
    this.limit = value;
    this.pageNo = 1;
    this.getDataList();
  }
  onSortChange(sort: any) {
    if (sort?.direction && sort?.column) {
      switch (sort.column) {
        case "lookupNameEN":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 3 : 2;
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
      { key: 'masterPageID', label: 'ID' },
      { key: 'country', label: 'Country' },
      { key: 'masterPageIdentifier', label: 'Page Identifier' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
