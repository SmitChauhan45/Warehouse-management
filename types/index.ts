// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Warehouse related types
export interface StorageType {
  type: string;
  capacity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  storageTypes: StorageType[];
  totalCapacity: number;
  availableSpace: number;
  items?: Item[];
}

export interface WarehouseInput {
  name: string;
  location: string;
  storageTypes: StorageType[];
  totalCapacity: number;
}

// Item related types
export interface Item {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  storageType: string;
  size: number;
  totalSpaceUsed: number;
  warehouse?: {
    id: string;
    name: string;
  };
}

export interface ItemInput {
  warehouseId: string;
  name: string;
  description?: string;
  quantity: number;
  storageType: string;
  size: number;
}
