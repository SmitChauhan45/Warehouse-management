import { gql } from '@apollo/client'

export const CURRENT_USER = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`

export const GET_WAREHOUSES = gql`
  query GetWarehouses {
    warehouses {
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
`

export const GET_WAREHOUSE = gql`
  query GetWarehouse($id: ID!) {
    warehouse(id: $id) {
      id
      name
      location
      totalCapacity
      availableSpace
      storageTypes {
        type
        capacity
      }
      items {
        id
        name
        description
        quantity
        storageType
        size
        totalSpaceUsed
      }
    }
  }
`

export const GET_ITEMS = gql`
  query GetItems($warehouseId: ID!) {
    items(warehouseId: $warehouseId) {
      id
      name
      description
      quantity
      storageType
      size
      totalSpaceUsed
      warehouse {
        id
        name
      }
    }
  }
`