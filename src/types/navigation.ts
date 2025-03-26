import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Registration: undefined;
  UserProfile: {
    userId: string;
    name: string;
  };
  Chat: {
    userId: string;
    name: string;
  };
  Inbox: undefined;
};

export type TabParamList = ParamListBase & {
  Home: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>; 