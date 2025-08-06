import { IEnum } from '@/interfaces/IEnum';

/**
 * Returns the available statuses for an order, preventing backward status changes.
 * If the current status is not in the hierarchy, allows all except 'PENDING'.
 */
export function getAvailableStatuses(currentStatus: string, orderStatusEnumData?: { data: IEnum[] }) {
  const statusHierarchy = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
  ];
  const currentIndex = statusHierarchy.indexOf(currentStatus);
  if (currentIndex === -1) {
    return (
      orderStatusEnumData?.data?.filter((status: IEnum) => status.value !== 'PENDING') || []
    );
  }
  return (
    orderStatusEnumData?.data?.filter((status: IEnum) => {
      const statusIndex = statusHierarchy.indexOf(status.value);
      return statusIndex >= currentIndex && status.value !== 'PENDING';
    }) || []
  );
}