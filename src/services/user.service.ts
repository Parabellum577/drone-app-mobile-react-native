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
  email?: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

interface FollowResponse {
  userId: string;
  followerId: string;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

interface GetUsersParams {
  searchParam?: string;
  location?: string;
}

export const userService = {
  getUsers: async (params?: GetUsersParams) => {
    const queryParams = new URLSearchParams();
    if (params?.searchParam) {
      queryParams.append('searchParam', params.searchParam);
    }
    if (params?.location) {
      queryParams.append('location', params.location);
    }
    const query = queryParams.toString();
    const response = await api.get<User[]>(`/users${query ? `?${query}` : ''}`);
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