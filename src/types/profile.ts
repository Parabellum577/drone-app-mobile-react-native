export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  videos: Video[];
  services: Service[];
  products: Product[];
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  image: string;
}

export interface Product {
  id: string;
  price: string;
  image: string;
  category: string;
  title: string;
  description: string;
} 