export interface Shipment {
  id?: number;
  userId: number;
  origin: string;
  destination: string;
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
  quotedPrice: number;
  status: ShippingStatus;
  trackingNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ShippingStatus = 'waiting' | 'in_transit' | 'delivered';

export interface ShipmentStatusHistory {
  id?: number;
  shipmentId: number;
  status: ShippingStatus;
  description: string;
  location?: string;
  createdAt: Date;
}
