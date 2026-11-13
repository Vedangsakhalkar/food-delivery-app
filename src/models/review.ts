export interface Review {
  id: string;
  orderId: string;
  restaurantId: string;
  rating: number;
  comment: string | null;
  /** First name only: reviewers' emails and full names are never exposed. */
  reviewerName: string;
  createdAt: Date;
}
