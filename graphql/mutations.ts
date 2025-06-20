import { gql } from "@apollo/client";

// Auth Mutations
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      user {
        id
        name
        email
      }
    }
  }
`;

// Warehouse Mutations
export const CREATE_WAREHOUSE = gql`
  mutation CreateWarehouse(
    $name: String!
    $location: String!
    $storageTypes: [StorageTypeInput!]!
    $totalCapacity: Float!
  ) {
    createWarehouse(
      name: $name
      location: $location
      storageTypes: $storageTypes
      totalCapacity: $totalCapacity
    ) {
      id
      name
      location
      totalCapacity
      availableSpace
      storageTypes {
        type
        capacity
      }
    }
  }
`;

export const UPDATE_WAREHOUSE = gql`
  mutation UpdateWarehouse(
    $id: ID!
    $name: String
    $location: String
    $storageTypes: [StorageTypeInput!]
    $totalCapacity: Float
  ) {
    updateWarehouse(
      id: $id
      name: $name
      location: $location
      storageTypes: $storageTypes
      totalCapacity: $totalCapacity
    ) {
      id
      name
      location
      totalCapacity
      availableSpace
      storageTypes {
        type
        capacity
      }
    }
  }
`;

export const DELETE_WAREHOUSE = gql`
  mutation DeleteWarehouse($id: ID!) {
    deleteWarehouse(id: $id)
  }
`;

// Item Mutations
export const CREATE_ITEM = gql`
  mutation CreateItem(
    $warehouseId: ID!
    $name: String!
    $description: String
    $quantity: Int!
    $storageType: String!
    $size: Float!
  ) {
    createItem(
      warehouseId: $warehouseId
      name: $name
      description: $description
      quantity: $quantity
      storageType: $storageType
      size: $size
    ) {
      id
      name
      description
      quantity
      storageType
      size
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem(
    $id: ID!
    $name: String
    $description: String
    $quantity: Int
    $storageType: String
    $size: Float
  ) {
    updateItem(
      id: $id
      name: $name
      description: $description
      quantity: $quantity
      storageType: $storageType
      size: $size
    ) {
      id
      name
      description
      quantity
      storageType
      size
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id)
  }
`;
