import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Service } from '../services/service.service';
export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  Main: {
    screen?: string;
    params?: {
      newService?: Service;
      refresh?: number;
    };
  };
  CreateService: undefined;
  UserProfile: {
    userId: string;
    username: string;
  };
  EditProfile: undefined;
  Inbox: undefined;
};

export type TabParamList = {
  Home: undefined;
  Profile: { refresh?: number };
  Inbox: undefined;
  EditProfile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>; 