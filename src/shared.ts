export const TASK_QUEUE_NAME = 'levity-case-delivery-delays';
export const DELAY_THRESHOLD_IN_MINUTES = 2;

export type DeliveryOrder = {
  name: string;
  email: string;
  phone: string;
  latitude: string;
  longitude: string;
  radius: number;
  locationReferencing: string;
};

export const orders: Array<DeliveryOrder> = [
  {
    name: 'Tadious',
    email: 'tadious@gmail.com',
    phone: '+46702010094',
    latitude: '52.50811',
    longitude: '13.47853',
    radius: 2000,
    locationReferencing: 'olr',
  },
];
