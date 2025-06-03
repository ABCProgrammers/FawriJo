import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddUserComponent } from './add-user/add-user.component';
import { TableColumn, TableConfig } from '../../shared/components/data-table/IDataTable';
import { HeaderService } from '../../core/services/header.service';
import { HttpService } from '../../core/services/http.service';
import { LookupService } from '../../core/services/lookup.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { Status } from '../../shared/enums/enums';
import { AppRoutes } from '../../shared/routes/appRoutes';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
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
    tableLayout: '.75fr 1fr 1fr 1.30fr 1fr 1fr 1fr .70fr .80fr',
  };
  tableColumns: TableColumn[] = [];
  dataList = [];
  statusList = [];
  rolesList = [];
  userTypeList = [];
  filterParams;
  otherData;
  showFilter = false;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    private _modalService: NgbModal,
    public _lookupService: LookupService,
  ) {
    this._headerService.setTitle('Users');
  }
  ngOnInit() {
    this.getDataList();
    this.getLookups();
    this.initFilterForm();
    this.initTableColumns();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      search: [''],
      role: [null],
      userType: [null],
      status: [null],
    });
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
      this.pageNo = 1;
      let formValues = this._httpService._helperService.trim(data);
      this.filterParams = new URLSearchParams(formValues).toString();
      this.getDataList(this.filterParams);
    });
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=1&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const userType$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=41&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([status$, userType$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.statusList = response[0].data.filter(x => x.lookupID == Status.Active || x.lookupID == Status.InActive);;
      this.userTypeList = response[1].data;

    }).add(() => this._httpService._spinnerService.hide());
  }
  toggleFilters() {
    this.showFilter = !this.showFilter;
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
    let APIURL = `${this._httpService.apiUrl.User.GetUsers}?`;
    let defaultParams = `&pageSize=${this.tableConfig.filter.PageSize}&pageNo=${this.pageNo - 1}&sort=${this.tableConfig.filter.Sort}`;
    let url;
    if (params) url = `${APIURL}${params}${defaultParams}`;
    else url = `${APIURL}${defaultParams}`;
    this._httpService._spinnerService.show();
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataList = response?.data;
        this.total = response?.info?.totalRecordsCount;
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  handleAddClick(row = null) {
    const modalRef = this._modalService.open(AddUserComponent, { size: 'lg' });
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
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete User',
      body: 'Are you sure you want to delete this user?',
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
    formData.append('userID', row?.userID);
    this._httpService.post(`${this._httpService.apiUrl.User.DeleteUser}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
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
        case "userNo":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 3 : 2;
          break;
        case "fullNameEN":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 5 : 4;
          break;
        case "userMobile":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 7 : 6;
          break;
        case "userEmail":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 9 : 8;
          break;
        case "userJobTitle":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 11 : 10;
          break;
        case "userType.lookupNameEN":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 13 : 12;
          break;
        case "userLogin":
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
      { key: 'userNo', label: 'User No.', canSort: true, },
      { key: 'fullNameEN', label: 'Full Name', canSort: true, },
      { key: 'userMobile', label: 'Mobile', canSort: true, },
      { key: 'userEmail', label: 'Email', canSort: true, },
      { key: 'userJobTitle', label: 'Job Title', canSort: true, },
      { key: 'userType.lookupNameEN', label: 'User Type', canSort: true },
      { key: 'userLogin', label: 'User Login', canSort: true },
      { key: 'status', label: 'Status', canSort: true, },
      { key: 'action', label: 'Action' },
    ];
  }
  handleMultiSelect(event) {
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
