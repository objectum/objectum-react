/* eslint-disable no-whitespace-before-property */
/* eslint-disable eqeqeq */

import {saveAs} from "file-saver";
import {loadJS, getStore} from "..";

let reportStyles = {};

function createStyles (font) {
	const border = {
		top: {style: "thin"},
		left: {style: "thin"},
		bottom: {style: "thin"},
		right: {style: "thin"}
	};
	Object.assign (reportStyles, {
		"default": {
			font,
			alignment: {
				vertical: "middle",
				horizontal: "left"
			}
		},
		"border": {
			font, border,
			alignment: {
				vertical: "top",
				horizontal: "left",
				wrapText: true
			}
		},
		"border_center": {
			font, border,
			alignment: {
				vertical: "middle",
				horizontal: "center",
				wrapText: true
			}
		},
		"border_right": {
			font, border,
			alignment: {
				vertical: "middle",
				horizontal: "right",
				wrapText: true
			}
		},
		"border_vsego": {
			font, border,
			alignment: {
				vertical: "middle",
				horizontal: "right"
			}
		},
		"right": {
			font,
			alignment: {
				vertical: "middle",
				horizontal: "right",
				wrapText: true
			}
		},
		"border_vertical": {
			font, border,
			alignment: {
				vertical: "bottom",
				horizontal: "center",
				wrapText: true,
				textRotation: 90
			}
		},
		"top_weight": {
			font,
			border: {
				top: {style: "thin"},
				left: {style: "thin"},
				right: {style: "thin"}
			},
			alignment: {
				vertical: "middle",
				horizontal: "center"
			}
		},
		"bottom_weight": {
			font,
			border: {
				top: {style: "dotted"},
				left: {style: "thin"},
				bottom: {style: "thin"},
				right: {style: "thin"}
			},
			alignment: {
				vertical: "middle",
				horizontal: "center"
			}
		},
		"bottom_empty": {
			font,
			border: {
				left: {style: "thin"},
				bottom: {style: "thin"},
				right: {style: "thin"}
			},
			alignment: {
				vertical: "middle",
				horizontal: "center",
				wrapText: true
			}
		},
		"center": {
			font,
			alignment: {
				vertical: "middle",
				horizontal: "center",
				wrapText: true
			}
		},
		"border_bottom": {
			font,
			border: {
				bottom: {style: "thin"}
			}
		}
	});
};

function getHiddenCells (rows) {
	let result = {};
	let y = 1;
	
	rows.forEach (row => {
		let x = 1;
		
		result [y] = result [y] || {};
		
		row.forEach (cell => {
			if (cell.skip) {
				for (let i = 0; i < cell.skip; i ++) {
					while (1) {
						if (!result [y][x]) {
							break;
						}
						x ++;
					}
					x ++;
				}
				while (1) {
					if (!result [y][x]) {
						break;
					}
					x ++;
				}
			}
			while (1) {
				if (!result [y][x]) {
					break;
				}
				x ++;
			}
			let colSpan = cell.colSpan || 1;
			let rowSpan = cell.rowSpan || 1;
			
			for (let i = 0; i < rowSpan; i ++) {
				for (let j = 0; j < colSpan; j ++) {
					if (i || j) {
						result [y + i] = result [y + i] || {};
						
						while (1) {
							if (!result [y][x]) {
								break;
							}
							x ++;
						}
						result [y + i][x + j] = true;
					}
				}
			}
			x += colSpan;
		});
		y ++;
	});
	return result;
};

async function createReport ({rows, columns, height = {}, font, worksheetName, worksheetOpts, filename}) {
	if (!window.ExcelJS) {
		await loadJS (`${getStore ().getUrl ()}/public/exceljs.js`);
	}
	const hiddenCells = getHiddenCells (rows);
	const wb = new window.ExcelJS.Workbook ();
	const ws = wb.addWorksheet (worksheetName || "Sheet", worksheetOpts || {});
	let y = 1;
	
	createStyles (font || {
		name: "Arial",
		size: 10
	});
	rows.forEach (row => {
		let x = 1;
		
		row.forEach (c => {
			while (1) {
				if (!hiddenCells [y][x]) {
					break;
				}
				x ++;
			}
			if (c.skip) {
				for (let i = 0; i < c.skip; i ++) {
					x ++;
					
					while (1) {
						if (!hiddenCells [y][x]) {
							break;
						}
						x ++;
					}
				}
			}
			let colSpan = c.colSpan || 1;
			let rowSpan = c.rowSpan || 1;
			
			let cell = ws.getCell (y, x);
			
			cell.value = c.text;
			
			let style = reportStyles [c.style || "default"];
			
			if (style) {
				Object.assign (cell, style);
			}
			if (colSpan > 1 || rowSpan > 1) {
				ws.mergeCells (y, x, y + rowSpan - 1, x + colSpan - 1);
			}
			x += colSpan;
		});
		y ++;
	});
	columns.forEach ((column, i) => ws.getColumn (i + 1).width = column);
	
	for (let i in height) {
		let h = height [i];
		
		ws.getRow (i).height = h * 3 / 4;
	}
	const buf = await wb.xlsx.writeBuffer ();
	
	saveAs (new Blob ([buf]), filename || "report.xlsx")
};

export {
	createReport,
	reportStyles
};
