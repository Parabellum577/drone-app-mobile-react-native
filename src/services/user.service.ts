import api from './apiClient';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface UserUpdateData {
  fullName?: string;
  username?: string;
  avatar?: string;
}

interface FollowResponse {
  user: User;
  follower: User;
}

export const userService = {
  getUsers: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  
  getUserProfile: async (userId: string) => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  getCurrentUserProfile: async () => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
  
  updateUserProfile: async (profileData: UserUpdateData) => {
    const response = await api.put<User>('/users/me', profileData);
    return response.data;
  },

  followUser: async (userId: string) => {
    const response = await api.post<FollowResponse>(`/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const response = await api.delete<FollowResponse>(`/users/${userId}/unfollow`);
    return response.data;
  }
};

export default userService; 