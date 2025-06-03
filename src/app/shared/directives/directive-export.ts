import { AlphabetOnlyDirective } from "./alphabet-only.directive";
import { ArabicOnlyDirective } from "./arabic-only.directive";
import { EngOnlyDirective } from "./eng-only.directive";
import { DecimalNumberDirective } from "./decimal-number.directive";
import { NumberOnlyDirective } from "./numbers-only.directive";
import { AlphaNumericDirective } from "./alpha-numeric.directive";
import { NonArabicOnlyDirective } from "./nonArabic.directive";
import { NonEnglisOnlyDirective } from "./nonEnglish.directive";
import { HeadColumnDirective } from "../components/data-table/head-column.directive";
import { DataColumnDirective } from "../components/data-table/data-column.directive";
import { AccordionItemDirective } from "../components/data-table/accordion-item.directive";
import { TotalRowsDirective } from "../components/data-table/total-rows.directives";
import { TableFootDirective } from "../components/data-table/table-foot.directives";

export const sharedDirectives = [
  AlphabetOnlyDirective,
  ArabicOnlyDirective,
  EngOnlyDirective,
  DecimalNumberDirective,
  NumberOnlyDirective,
  AlphaNumericDirective,
  NonArabicOnlyDirective,
  NonEnglisOnlyDirective,
  HeadColumnDirective,
  DataColumnDirective,
  AccordionItemDirective,
  TotalRowsDirective,
  TableFootDirective,
];
