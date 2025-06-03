// excel.service.ts
import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  exportToExcel(sections: { headers: string[], data: any[], heading?: string[] }[], fileName: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    // Function to add a section with data and a gap after each section
    const addSection = (section: { headers: string[], data: any[], heading?: string[] }) => {
      //Heading of Section 
      if (section?.heading?.length) {
        const heading = worksheet.addRow(section.heading);
        heading.font = { bold: true, size: 16, color: { argb: 'ff000000' } };
      }
      // Header Row
      const headerRow = worksheet.addRow(section.headers);
      headerRow.font = { bold: true, size: 12, color: { argb: 'ff000000' } };
      // Data Rows
      section.data.forEach(row => {
       const dataRow =  worksheet.addRow(row);
      });
      worksheet.addRow([]);
    };

    // Add sections with data
    sections.forEach(section => {
      addSection(section);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName + '.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
interface ExportSheet {
  headers: string[];
  data: any[];
  heading: string[];
  headStyles?: {
    columnWidth?: number;
    fontSize?: number;
    color?: string;
    fill?: string;
  };
  dataStyles?: {
    columnWidth?: number;
    fontSize?: number;
    color?: string;
    fill?: string;
  };
}

export interface IExcelExportData {
  sheets: ExportSheet[];
  fileName: string;
}
