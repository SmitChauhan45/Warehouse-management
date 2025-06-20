'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Package, 
  Warehouse as WarehouseIcon, 
  MapPin,
  AlertTriangle
} from 'lucide-react'
import { GET_WAREHOUSE, GET_ITEMS } from '@/lib/graphql/queries'
import { DELETE_WAREHOUSE } from '@/lib/graphql/mutations'
import { Item } from '@/types'
import Button from '@/components/common/Button'
import UpdateWarehouseModal from '@/components/warehouses/UpdateWarehouseModal'
import CreateItemModal from '@/components/items/CreateItemModal'
import { useAuth } from '@/contexts/AuthContext'
import Alert from '@/components/common/Alert'

export default function WarehouseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const id = params.id as string

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: warehouseData, loading: warehouseLoading, error: warehouseError, refetch } = useQuery(GET_WAREHOUSE, {
    variables: { id },
    fetchPolicy: 'network-only'
  })

  const { data: itemsData, loading: itemsLoading, error: itemsError } = useQuery(GET_ITEMS, {
    variables: { warehouseId: id },
    fetchPolicy: 'network-only'
  })

  const [deleteWarehouse, { loading: deleteLoading }] = useMutation(DELETE_WAREHOUSE, {
    onCompleted: () => {
      router.push('/warehouses')
    },
    onError: (error) => {
      setErrorMessage(error.message)
      setConfirmDelete(false)
    }
  })

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  if (warehouseLoading || itemsLoading) return <p className="text-center py-8">Loading warehouse details...</p>
  if (warehouseError || itemsError) return <p className="text-center py-8 text-red-500">Error loading warehouse: {warehouseError?.message || itemsError?.message}</p>
  
  const warehouse = warehouseData?.warehouse
  const items = itemsData?.items || []

  if (!warehouse) return <p className="text-center py-8">Warehouse not found</p>
  
  const handleDeleteWarehouse = () => {
    if (items.length > 0) {
      setErrorMessage('Cannot delete warehouse with items. Please remove all items first.')
      return
    }

    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    deleteWarehouse({ variables: { id } })
  }

  const capacityUsage = ((warehouse.totalCapacity - warehouse.availableSpace) / warehouse.totalCapacity) * 100
  
  return (
    <div>
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-200 dark:border-gray-700 mb-6">
        <div>
          <button
            onClick={() => router.push('/warehouses')}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 mb-2 sm:mb-0"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to warehouses
          </button>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white flex items-center">
            {warehouse.name}
          </h1>
          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span>{warehouse.location}</span>
          </div>
        </div>
        
        {(isAdmin || user?.role === 'staff') && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              icon={<Edit className="h-4 w-4" />}
              onClick={() => setIsUpdateModalOpen(true)}
            >
              Edit
            </Button>
            {isAdmin && (
              <Button
                variant="danger"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={handleDeleteWarehouse}
                loading={deleteLoading}
              >
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <Alert 
          type="error"
          className="mb-6"
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          type="success"
          className="mb-6"
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Warehouse details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Warehouse Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Warehouse Information
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Capacity
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {warehouse.totalCapacity.toFixed(1)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Available Space
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {warehouse.availableSpace.toFixed(1)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Capacity Usage
                  </dt>
                  <dd className="mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {capacityUsage.toFixed(1)}%
                      </span>
                      {capacityUsage > 80 && (
                        <span className="flex items-center text-xs text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Low space
                        </span>
                      )}
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          capacityUsage > 80 ? 'bg-red-500' : 
                          capacityUsage > 60 ? 'bg-amber-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${capacityUsage}%` }}
                      ></div>
                    </div>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Storage Types
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <ul className="space-y-2">
                      {warehouse.storageTypes.map((type, index) => {
                        const typeUsage = 100 - ((type.capacity / type.capacity) * 100)
                        return (
                          <li key={index} className="py-2">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{type.type}</span>
                              <span>{type.capacity.toFixed(1)} available</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  typeUsage > 80 ? 'bg-red-500' : 
                                  typeUsage > 60 ? 'bg-amber-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${typeUsage}%` }}
                              ></div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right column - Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Inventory Items
              </h3>
              {(isAdmin || user?.role === 'staff') && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setIsCreateItemModalOpen(true)}
                >
                  Add Item
                </Button>
              )}
            </div>
            <div className="px-4 py-5 sm:p-6">
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total Space
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {items.map((item: Item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              {item.storageType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.size.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                            {item.totalSpaceUsed.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by adding a new item to this warehouse.
                  </p>
                  {(isAdmin || user?.role === 'staff') && (
                    <div className="mt-6">
                      <Button 
                        variant="primary"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsCreateItemModalOpen(true)}
                      >
                        Add Item
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isUpdateModalOpen && (
        <UpdateWarehouseModal 
          warehouse={warehouse}
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={() => {
            setIsUpdateModalOpen(false)
            setSuccessMessage('Warehouse updated successfully')
            refetch()
          }}
        />
      )}

      {isCreateItemModalOpen && (
        <CreateItemModal 
          warehouseId={id}
          storageTypes={warehouse.storageTypes}
          isOpen={isCreateItemModalOpen}
          onClose={() => setIsCreateItemModalOpen(false)}
          onSuccess={() => {
            setIsCreateItemModalOpen(false)
            setSuccessMessage('Item added successfully')
            refetch()
          }}
        />
      )}
    </div>
  )
}