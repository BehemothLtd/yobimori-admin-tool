export interface Tenant {
  id: string;
  name: string;
  address: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface LinkedTenant {
  id: string;
  tenantId: string;
  linkedTenantId: string;
  realtime: boolean;
  createdAt: number;
  createdBy: string;
  tenant: {
    id: string;
    name: string;
    address: string;
    createdAt: number;
    updatedAt: number;
    topicArn: string;
  };
}
