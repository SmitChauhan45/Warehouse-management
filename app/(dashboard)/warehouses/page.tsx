'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { Plus, Warehouse as WarehouseIcon, Search, MapPin } from 'lucide-react'
import { GET_WAREHOUSES } from '@/lib/graphql/queries'
import { Warehouse } from '@/types'
import Button from '@/components/common/Button'
import CreateWarehouseModal from '@/components/warehouses/CreateWarehouseModal'
import { useAuth } from '@/contexts/AuthContext'

export default function WarehousesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { loading, error, data, refetch } = useQuery(GET_WAREHOUSES)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const filteredWarehouses = data?.warehouses?.filter((warehouse: Warehouse) => {
    return (
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }) || []

  const calculateCapacityPercentage = (warehouse: Warehouse) => {
    return ((warehouse.totalCapacity - warehouse.availableSpace) / warehouse.totalCapacity) * 100
  }

  const getCapacityColorClass = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500'
    if (percentage > 60) return 'bg-amber-500'
    return 'bg-green-500'
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">Warehouses</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          {(isAdmin || user?.role === 'staff') && (
            <Button 
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add Warehouse
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Warehouses list */}
      {loading ? (
        <div className="text-center py-8">
          <p>Loading warehouses...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>Error loading warehouses: {error.message}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWarehouses.length > 0 ? (
            filteredWarehouses.map((warehouse: Warehouse) => {
              const capacityPercentage = calculateCapacityPercentage(warehouse)
              const capacityColorClass = getCapacityColorClass(capacityPercentage)

              return (
                <Link
                  key={warehouse.id}
                  href={`/warehouses/${warehouse.id}`}
                  className="group bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <WarehouseIcon className="h-10 w-10 text-blue-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {warehouse.name}
                        </h2>
                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span className="truncate">{warehouse.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Capacity
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {capacityPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className={`h-2.5 rounded-full ${capacityColorClass}`} 
                          style={{ width: `${capacityPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Capacity
                        </span>
                        <span className="block mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {warehouse.totalCapacity}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Available
                        </span>
                        <span className="block mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {warehouse.availableSpace}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Storage Types
                      </span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {warehouse.storageTypes.map((type, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                          >
                            {type.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      View details
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-3 text-center py-8 bg-white dark:bg-gray-800 shadow rounded-lg">
              <WarehouseIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No warehouses found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? `No results match "${searchTerm}"` : 'Get started by creating a new warehouse.'}
              </p>
              {(isAdmin || user?.role === 'staff') && (
                <div className="mt-6">
                  <Button 
                    variant="primary" 
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Add Warehouse
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CreateWarehouseModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}