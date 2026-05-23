import api from './api';

export interface UserProfileUpdate {
  name: string;
  email: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export const userService = {
  updateProfile: async (data: UserProfileUpdate): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/user/profile', data);
    return response.data;
  },
};

export default userService;
