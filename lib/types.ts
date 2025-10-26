// Core data types for offline POS

export type ID = number

export type Product = {
  id?: ID
  name: string
  price: number
  is_active: boolean
  image_url?: string
  category?: string // new optional category
  created_at?: string
  updated_at?: string
}

export type RawMaterial = {
  id?: ID
  name: string
  unit: string
  stock_quantity: number
  min_stock?: number
  created_at?: string
  updated_at?: string
}

export type ProductMaterial = {
  id?: ID
  product_id: ID
  material_id: ID
  quantity_needed: number
}

export type TransactionStatus = "pending" | "paid" | "canceled"

export type Transaction = {
  id?: ID
  total_amount: number
  payment_method: string
  cashier_name: string
  transaction_date: string
  receipt_number: string
  status: TransactionStatus
}

export type TransactionItem = {
  id?: ID
  transaction_id: ID
  product_id: ID
  quantity: number
  unit_price: number
  total_price: number
}

export type AvailabilityResult = {
  ok: boolean
  missing?: Array<{ material_id: ID; name: string; required: number; available: number; unit: string }>
}
