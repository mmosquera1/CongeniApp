import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export function useApi() {
  const { token } = useAuthContext();

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }

  return api;
}

export interface ReviewPayload {
  buildingId: string;
  type: 'noise' | 'neighbor' | 'amenity' | 'green-space' | 'general';
  title: string;
  body: string;
  rating: number;
  images: string[];
}

export interface ServicePayload {
  buildingId?: string;
  neighborhoodId?: string;
  category: string;
  name: string;
  description: string;
  contact: {
    phone?: string;
    email?: string;
    url?: string;
  };
  tags?: string[];
}

export interface ListingPayload {
  buildingId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: 'new' | 'used';
  imageUrls: string[];
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  address: {
    street: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  };
  unitNumber: string;
  phoneNumber: string;
  displayUnit: string;
  geoPoint?: { lat: number; lng: number };
  buildingId: string;
  verificationMethod: 'geo' | 'document';
}

export const ApiEndpoints = {
  registerUser: '/api/users/register',
  currentUser: '/api/users/me',
  reviews: '/api/reviews',
  reviewRatings: (id: string) => `/api/reviews/${id}/rate`,
  services: '/api/services',
  serviceRatings: (id: string) => `/api/services/${id}/rate`,
  listings: '/api/listings',
  listingStatus: (id: string) => `/api/listings/${id}/status`,
  verificationDocs: '/api/verifications/documents'
} as const;
