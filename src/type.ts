export interface TPurchaseOrderData {
  po_Id: string;
  orderDate: Date;
  orderBy: string;
  vendor_id: string;
  vendor_name: string;
  vendor_address: string;
  vendor_phone: string;
  vendor_email: string;
  shipping_name?: string;
  shipping_address: string;
  shipping_phone?: string;
  shipping_email?: string;
  items: any[]; 
}
