export interface CreateShipmentRequestDto {
  origin: string;
  destination: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  quotedPrice: number;
}

export interface CreateShipmentResponseDto {
  id: number;
  trackingNumber: string;
  status: string;
  message: string;
}

export interface ShipmentDetailsResponseDto {
  id: number;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
  quotedPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingResponseDto {
  shipmentId: number;
  trackingNumber: string;
  currentStatus: string;
  history: Array<{
    status: string;
    description: string;
    location?: string;
    timestamp: Date;
  }>;
} 