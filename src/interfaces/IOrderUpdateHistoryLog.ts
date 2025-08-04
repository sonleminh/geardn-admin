import { IOrder } from "./IOrder";
import { IUser } from "./IUser";

export interface IOrderUpdateHistoryLog {
  id: string;
  order: IOrder;
  user: IUser;
  oldStatus: string;
  newStatus: string;
  note: string;
  createdAt: Date;
}