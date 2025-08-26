export interface IUser {
    id: number;
    email: string;
    name: string;
    lastReadNotificationsAt: Date | null;
}