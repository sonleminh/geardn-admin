import { IOrder, IOrderItem } from "./IOrder";
import { IUser } from "./IUser";

interface IOrderReturnItem {
  id: number
  returnRequestId: number
  orderItemId: number
  quantity: number

  returnRequest: IOrderReturnRequest
  orderItem: IOrderItem
}

export interface IOrderReturnRequest {
  id: number;
  orderId: number;
  status: string;
  type: string
  reasonCode: string
  reasonNote: string
  createdById: number
  approvedById: number

  completedAt: Date
  createdAt: Date

  order: IOrder

  createdBy: IUser
  approvedBy: IUser

  orderReturnItems: IOrderReturnItem[]
}

export interface IUpdateOrderReturnRequestStatus{
  id: number;
  oldStatus: string;
  newStatus: string;
}

export interface ICompleteReturnRequest{
  id: number;
  skuWarehouseMapping: {
      skuId: number;
      warehouseId: number;
  }[]
}