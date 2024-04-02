export interface individualBusinessProfileReturnType {
  id: string;
  state: string;
  name: string;
  liked: boolean;
  profilePictureUrl?: string;
  description?: string;
  address?: string;
  website?: string;
  operatingHours?: Array<{
    dayOfWeek: string;
    opens: string;
    closes: string;
  }>;
  contactInfo?: {
    email: string;
    phoneNumber: string;
  };
  tags?: Array<string>;
  album?: Array<string>;
}

export interface individualReviewReturnType {
  businessId: string;
  userId: string;
  rating: number;
  text: string;
  updatedAt: number;
  id: string;
}
