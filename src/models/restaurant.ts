export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  cuisine: string;
  address: string;
  /** "HH:MM" in IST */
  opensAt: string;
  closesAt: string;
  imagePath: string | null;
  imageUrl: string | null;
  deliveryTimeMin: number;
  isDisabled: boolean;
  disabledReason: string | null;
  avgRating: number;
  ratingCount: number;
  createdAt: Date;
}
