import express from "express";
import createInvoice from "./createPo";
import { TPurchaseOrderData } from "./type";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const purchasedOrder = {
    id: "PO-123",
    createdBy: { name: "John Doe" },
    vendor: {
      id: "VENDOR-456",
      name: "Example Vendor",
      mainAddress: "123 Main Street",
      phone1: "123-456-7890",
      email1: "vendor@example.com",
      name2: "Shipping Vendor",
      phone2: "987-654-3210",
      email2: "shipping@example.com",
    },
    orderDate: new Date(),
    items: [
      {
        item: {
          description:
            "biscuit - Delicious pack of crunchy biscuits, perfect for tea time or snacking on the go.",
          unit: {
            name: "pack",
          },
        },
        quantity: 5,
      },
      {
        item: {
          description:
            "achar - Spicy jar of traditional Indian pickle, made with a blend of aromatic spices and tangy flavors.",
          unit: {
            name: "jar",
          },
        },
        quantity: 3,
      },
      {
        item: {
          description:
            "milk - Fresh gallon of creamy whole milk, sourced from local dairy farms for the highest quality taste.",
          unit: {
            name: "gallon",
          },
        },
        quantity: 2,
      },
      {
        item: {
          description:
            "cheese - Sharp block of aged cheddar cheese, perfect for slicing on sandwiches or grating over pasta dishes.",
          unit: {
            name: "block",
          },
        },
        quantity: 1,
      },
      {
        item: {
          description:
            "tomatoes - Ripe pound of juicy vine-ripened tomatoes, bursting with flavor and ideal for salads or sauces.",
          unit: {
            name: "pound",
          },
        },
        quantity: 3,
      },
    ],
  };

  const orderDate = "Fri Mar 15 2024 16"; // Set the order date to the current date or generate randomly

  // Generate demo data for purchase order
  const purchaseOrderData = {
    po_Id: purchasedOrder.id,
    orderDate,
    orderBy: purchasedOrder.createdBy.name,
    vendor_id: purchasedOrder.vendor.id,
    vendor_name: purchasedOrder.vendor.name,
    vendor_address: purchasedOrder.vendor.mainAddress,
    vendor_phone: purchasedOrder.vendor.phone1,
    vendor_email: purchasedOrder.vendor.email1,
    shipping_name: purchasedOrder?.vendor?.name2,
    shipping_address: purchasedOrder?.vendor?.mainAddress,
    shipping_phone: purchasedOrder?.vendor?.phone2,
    shipping_email: purchasedOrder?.vendor?.email2,
    items: purchasedOrder?.items,
  };
  //create purchase order pdf

  const outputPath = "./public/output.pdf";
  let createPurchaseOrderUrl: string;
  const fn = async () => {
    const invoiceResult = await createInvoice(outputPath, purchaseOrderData);
  };

  fn();

  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
