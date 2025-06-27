export interface ShippingOrder {
  id?: number;
  userId: number;
  quoteId: number;
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
  origin: string;
  destination: string;
  recipient: {
    name: string;
    phone: string;
    address: string;
  };
  price: number;
  status: ShippingStatus;
  trackingNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ShippingStatus = 'En espera' | 'En tránsito' | 'Entregado';

export interface ShippingStatusHistory {
  id?: number;
  orderId: number;
  status: ShippingStatus;
  description: string;
  location?: string;
  createdAt: Date;
} 