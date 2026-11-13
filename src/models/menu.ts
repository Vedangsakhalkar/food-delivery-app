export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string;
  pricePaise: number;
  isVeg: boolean;
  isAvailable: boolean;
  imagePath: string | null;
  imageUrl: string | null;
}
