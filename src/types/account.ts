export interface Device {
  id: string;
  imei: string | null | undefined;
  deviceType: string;
}

export interface LineUser {
  userId: string;
  displayName: string | null | undefined;
  pictureUrl: string | null;
}

export interface FisherUser {
  id: string;
  name: string;
  nickname: string;
  encryptedPassword: string;
  tenants: Array<{
    id: string;
    name: string;
  }>;
  devices: {
    devices: Device[];
  };
  lineUsers: LineUser[] | null;
}
