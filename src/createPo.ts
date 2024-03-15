// @ts-nocheck
import PDFDocument from "pdfkit";
import * as fs from "fs";
// Constants for normal text styling
const textColor = "#000000";
const textLineHeight = 13;
const X_left = 20;
const X_right = 420;
let tableRowY;
let totalPages = 1;
let vendorId;

interface SendPurchaseOrderResponse {
  success: boolean;
  message: string;
  filePath?: string;
}

function createInvoice(
  path: string,
  purchaseOrderData
): Promise<SendPurchaseOrderResponse> {
  return new Promise<SendPurchaseOrderResponse>((resolve, reject) => {
    let doc = new PDFDocument({ size: "A4", margin: 30 });
    const headerLastY = generateHeader(doc, purchaseOrderData);
    const purchaseOrderLastY = generatePurchaseOrderHistory(
      doc,
      purchaseOrderData,
      headerLastY
    );
    const supplierAndDeliveryY = generateSupplierAndDeliveryInfo(
      doc,
      purchaseOrderData,
      purchaseOrderLastY
    );
    const tableHeaderY = generateTableHeader(
      doc,
      purchaseOrderData,
      supplierAndDeliveryY
    );
    tableRowY = tableHeaderY;
    // const data = new Array(20).fill(0);
    const data = purchaseOrderData.items;

    let counter = 0;

    let total = (data.length - 23) / 30;

    totalPages = totalPages + Math.ceil(total);

    const generateTableBorder = (Y, rowNo) => {
      doc
        .fillColor("black")
        .rect(X_left + 0, Y, 135, 25 * rowNo)
        .stroke();
      doc
        .fillColor("black")
        .rect(X_left + 135, Y, 252, 25 * rowNo)
        .stroke();
      doc
        .fillColor("black")
        .rect(X_left + 135 + 252, Y, 80, 25 * rowNo)
        .stroke();
      doc
        .fillColor("black")
        .rect(X_left + 135 + 252 + 80, Y, 80, 25 * rowNo)
        .stroke();
    };

    doc.text(`${1} / ${totalPages}`, X_right, 800, { align: "right" });

    //add border for first page

    if (data.length <= 23) {
      // generateTableBorder(tableRowY, data.length + 1);
    } else {
      // generateTableBorder(tableRowY, 24);
    }

    data.forEach((item, index) => {
      const { start, count } = doc.bufferedPageRange();
      counter++;
      if (start === 0 && data.length <= 15) {
        generateTableRow(doc, item, index, purchaseOrderData);
        return;
      } else if (counter === 14 && start === 0) {
        counter = 0;
        doc.addPage();
        doc.text(`${start + 2} / ${totalPages}`, X_right, 800, {
          align: "right",
        });
        const tableHeaderY2 = generateTableHeader(doc, purchaseOrderData, 0);
        tableRowY = tableHeaderY2;
        // generateTableBorder(tableRowY, 31);
      } else if (start !== 0 && counter % 15 === 0) {
        doc.addPage();
        doc.text(`${start + 2} / ${totalPages}`, X_right, 800, {
          align: "right",
        });
        const tableHeaderY2 = generateTableHeader(doc, purchaseOrderData, 0);
        tableRowY = tableHeaderY2;

        let itemsWithoutFirstPage = data.length - 23;
        let pageNumberWithoutFirstPage = Math.floor(itemsWithoutFirstPage / 30);

        //find last page item
        let lastPageItems =
          itemsWithoutFirstPage - pageNumberWithoutFirstPage * 30;

        if (start + 2 === totalPages) {
          // generateTableBorder(tableRowY, lastPageItems + 2);
        } else {
          // generateTableBorder(tableRowY, 31);
        }
      }

      generateTableRow(doc, item, index, purchaseOrderData);
    });

    //comments
    if (data.length > 10 && data.length < 24) {
      doc.addPage();
    }

    doc.fillColor("#fff").rect(X_left, 700, 200, 20).fill();
    doc.fillColor("black").rect(X_left, 700, 200, 20).stroke();

    doc
      .font("Helvetica")
      .fontSize(10)
      .text("Comments", X_left + 80, 700 + 5)
      .moveDown();
    doc
      .fillColor("#fff")
      .rect(X_left, 700 + 20, 200, 100)
      .fill();
    doc
      .fillColor("black")
      .rect(X_left, 700 + 20, 200, 100)
      .stroke();

    doc.end();
    doc
      .pipe(fs.createWriteStream(path))
      .on("finish", () =>
        resolve({
          success: true,
          message: "Invoice created successfully",
          filePath: path,
        })
      )
      .on("error", (error) =>
        reject({
          success: false,
          message: `Error creating invoice: ${error.message}`,
          filePath: path,
        })
      );
  });
}
//Generate header
function generateHeader(doc, purchaseOrderData: TPurchaseOrderData) {
  let Y = 40;
  //First Section
  doc.image("./assets/allgreen-logo.png", X_left, Y, { width: 180 });
  doc
    .fontSize(10)
    .text("ABN: 14 423 819 778", X_right, Y + textLineHeight * 0, {
      align: "right",
    });
  doc.text("130 Old Geelong Road", X_right, Y + textLineHeight * 1, {
    align: "right",
  });
  doc.text("Hoppers Crossing VIC 3029", X_right, Y + textLineHeight * 2, {
    align: "right",
  });
  doc.text("Phone: 03 9749 1688", X_right, Y + textLineHeight * 3, {
    align: "right",
  });
  doc.text("Fax: 03 9749 5135", X_right, Y + textLineHeight * 4, {
    align: "right",
  });
  doc.text("Email: info@allgreen.com.au", X_right, Y + textLineHeight * 5, {
    align: "right",
  });

  return Y + textLineHeight * 5;
}
const generatePurchaseOrderHistory = (
  doc,
  purchaseOrderData: TPurchaseOrderData,
  Y: number
) => {
  //2nd section
  Y = Y + 20;
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(textColor)
    .text("Purchase Order", X_right - 50, Y, {
      bold: true,
      fontSize: 20,
      align: "right",
    });

  //table
  Y = Y + 20 + 10;
  //1st column
  doc.rect(X_left, Y, 65, 20).stroke();
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Po No", X_left + 5, Y + 5, {
      bold: false,
      fontSize: 10,
    });
  doc.rect(X_left + 65, Y, 100, 20).stroke();
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(purchaseOrderData.po_Id, X_left + 65 + 5, Y + 5, {
      bold: false,
      fontSize: 10,
    });

  //2nd column
  doc.rect(X_left + 180, Y, 65, 20).stroke();
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Date", X_left + 180 + 5, Y + 5, {
      bold: false,
      fontSize: 10,
    });

  doc.rect(X_left + 245, Y, 125, 20).stroke();
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(purchaseOrderData.orderDate, X_left + 245 + 5, Y + 5, {
      bold: false,
      fontSize: 10,
    });

  //3rd column
  doc.rect(X_left + 385, Y, 60, 20).stroke();
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Ordered By ", X_left + 385 + 5, Y + 5, {
      bold: false,
      fontSize: 10,
    });

  doc.rect(X_left + 445, Y, 100, 20).stroke();
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(purchaseOrderData.orderBy, X_left + 445 + 5, Y + 5, {
      bold: false,
      fontSize: 10,
    });

  return Y;
};

const generateSupplierAndDeliveryInfo = (
  doc,
  purchaseOrderData: TPurchaseOrderData,
  Y
) => {
  Y = Y + 50;
  //left

  doc.rect(X_left, Y, 265, 85).stroke();

  doc.text("Supplier:", X_left + 5, Y + 5);
  //right text
  doc.text(
    purchaseOrderData.vendor_name,
    X_left + 55 + 5,
    Y + textLineHeight * 0 + 5
  );

  doc.text(
    purchaseOrderData.vendor_address,
    X_left + 55 + 5,
    Y + textLineHeight * 1 + 5,
    { width: 150 }
  );

  doc.text("Ph:", X_left + 5, Y + textLineHeight * 5 + 5);
  //right text
  doc.text(
    purchaseOrderData.vendor_phone,
    X_left + 55 + 5,
    Y + textLineHeight * 5 + 5
  );

  //right
  doc.rect(X_left + 285, Y, 262, 85).stroke();

  doc.text("Ship To:", X_left + 285 + 5, Y + 5);
  //right text
  doc.text(
    purchaseOrderData.shipping_name,
    X_left + 285 + 55 + 5,
    Y + textLineHeight * 0 + 5
  );

  doc.text(
    purchaseOrderData.shipping_address,
    X_left + 285 + 55 + 5,
    Y + textLineHeight * 1 + 5,
    { width: 150 }
  );

  return Y + 50;
};

const generateTableHeader = (doc, purchaseOrderData: TPurchaseOrderData, Y) => {
  Y = Y + 50;
  let po = 0;
  const cell = (text, width, align = "left") => {
    doc
      .fillColor("#ddd")
      .rect(X_left + po, Y, width, 20)
      .fill();
    doc
      .fillColor("black")
      .rect(X_left + po, Y, width, 20)
      .stroke();
    let textX = X_left + po + 5;
    if (align === "right") {
      const textWidth = doc.widthOfString(text);
      textX = X_left + po + width - textWidth - 5;
    }
    if (align === "center") {
      const textWidth = doc.widthOfString(text);
      textX = X_left + po + width / 2;
      textX = textX - textWidth / 2;
    }
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(text, textX, Y + 5.5)
      .moveDown();

    po = po + width;
  };

  cell("Supplier Code", 135);
  cell("Description", 252);
  cell("Unit", 80, "right");
  cell("UOM", 80, "center");
  return Y;
};

const generateTableRow = (
  doc,
  item: PurchaseOrderItem,
  index,
  purchaseOrderData: TPurchaseOrderData
) => {
  let Y: number;
  if (Y === 20) {
    Y = 20;
  }
  let lineBreak = false;
  Y = tableRowY + 20;
  let po = 0;
  const cell = (text, width, align = "left") => {
    let textX = X_left + po + 5;
    if (doc.widthOfString(text) > 250) {
      lineBreak = true;
    }
    if (doc.widthOfString(text) > 500) {
      text = text.slice(0, 100) + " ...";
    }

    if (align === "right") {
      const textWidth = doc.widthOfString(text);
      textX = X_left + po + width - textWidth - 5;
    }
    if (align === "center") {
      const textWidth = doc.widthOfString(text);
      textX = X_left + po + width / 2;
      textX = textX - textWidth / 2;
    }
    doc
      .font("Helvetica")
      .fillColor("black")
      .fontSize(10)
      .text(text, textX, Y + 5, { width: 250, lineGap: 0.5, ellipsis: true })
      .moveDown();

    po = po + width;
  };
  if (index === 0) {
    cell(purchaseOrderData.vendor_id, 135);
  } else {
    cell("", 135);
  }
  cell(`${item.item.description || ""}`, 252);
  cell(`${item.quantity || ""}`, 80, "right");
  cell(`${item.item.unit.name || ""}`, 80, "center");
  if (lineBreak) {
    tableRowY = Y + 5;
  } else {
    tableRowY = Y;
  }
};

export default createInvoice;
