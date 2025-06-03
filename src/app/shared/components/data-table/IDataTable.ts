export interface TableConfig {
  paging?: boolean;
  initSort?: any;
  filter?: any;
  hideTotalRecord?: boolean;
  totalRecordText?: string;
  isLoading?: boolean;
  multiSelect?: boolean;
  multiSelectCoulmnWidth?: number;
  style?: TableStyle;
  hasRowShadow?: boolean;
  infiniteScroll?: InfiniteScroll;
  tableLayout?: string;
}

export interface TableSort {
  column: string | null;
  direction: boolean | 'asc' | 'desc';
}
export interface InfiniteScroll {
  isScroll?:boolean;
  infiniteScrollDistance?: number;
  infiniteScrollThrottle?: number;
  scrollWindow?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  canSort?: boolean;
  dateFormat?: string,
  currency?: Currency,
  placeholder?: string,
  width?: string;
  fixedWidth?: boolean;
  cellStyle?: any;
}

export interface Currency {
  decimalFormat?: string,
  appendText?: string
}
export interface TableStyle {
  header?: TableHeader;
  row?: TableRow;
  otherStyle?: OtherStyle;
}
export interface TableHeader {
  fontSize?: string;
  fontWeight?: string
  padding?: string;
  margin?: string;
  color?: string;
}
export interface TableRow {
  fontSize?: string;
  fontWeight?: string
  padding?: string;
  margin?: string;
  color?: string;
}
export interface OtherStyle {
  height?: string;
  overflowX?: string;
  overflowY?: string;
  overflow?: string;
  margin?: string;
  padding?: string;
}

