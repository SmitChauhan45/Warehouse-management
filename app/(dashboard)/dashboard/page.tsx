'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_WAREHOUSES } from '@/lib/graphql/queries'
import { Warehouse, Package, AlertTriangle, BarChart4 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Warehouse as WarehouseType } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    totalItems: 0,
    totalCapacity: 0,
    availableSpace: 0,
    lowCapacityWarehouses: 0
  })

  const { data, loading, error } = useQuery(GET_WAREHOUSES)

  useEffect(() => {
    if (data?.warehouses) {
      const warehouses = data.warehouses
      const itemsCount = warehouses.reduce((sum: number, warehouse: WarehouseType) => sum + (warehouse.items?.length || 0), 0)
      const totalCapacity = warehouses.reduce((sum: number, warehouse: WarehouseType) => sum + warehouse.totalCapacity, 0)
      const availableSpace = warehouses.reduce((sum: number, warehouse: WarehouseType) => sum + warehouse.availableSpace, 0)
      const lowCapacityCount = warehouses.filter((warehouse: WarehouseType) => {
        const usagePercentage = ((warehouse.totalCapacity - warehouse.availableSpace) / warehouse.totalCapacity) * 100
        return usagePercentage > 80
      }).length

      setStats({
        totalWarehouses: warehouses.length,
        totalItems: itemsCount,
        totalCapacity,
        availableSpace,
        lowCapacityWarehouses: lowCapacityCount
      })
    }
  }, [data])

  if (loading) return <p className="text-center py-8">Loading dashboard...</p>
  if (error) return <p className="text-center py-8 text-red-500">Error loading dashboard: {error.message}</p>

  const capacityPercentage = stats.totalCapacity ? ((stats.totalCapacity - stats.availableSpace) / stats.totalCapacity) * 100 : 0

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 dark:border-gray-700 mb-6">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
          Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user?.name}</span>!
          Here's an overview of your warehouse operations.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Warehouses */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Warehouse className="h-10 w-10 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Warehouses
                  </dt>
                  <dd>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalWarehouses}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link href="/warehouses" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                View all
              </Link>
            </div>
          </div>
        </div>

        {/* Total Items */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Items
                  </dt>
                  <dd>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalItems}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link href="/items" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                View inventory
              </Link>
            </div>
          </div>
        </div>

        {/* Capacity Usage */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart4 className="h-10 w-10 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Capacity Usage
                  </dt>
                  <dd>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {capacityPercentage.toFixed(1)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className={`h-3 rounded-full ${
                  capacityPercentage > 80 ? 'bg-red-500' : 
                  capacityPercentage > 60 ? 'bg-amber-500' : 'bg-green-500'
                }`} 
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-500 dark:text-gray-400">
                {stats.availableSpace.toFixed(1)} units available
              </span>
            </div>
          </div>
        </div>

        {/* Low Capacity Warning */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Low Capacity Warehouses
                  </dt>
                  <dd>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {stats.lowCapacityWarehouses}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              {stats.lowCapacityWarehouses > 0 ? (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Requires attention
                </span>
              ) : (
                <span className="font-medium text-green-600 dark:text-green-400">
                  All warehouses have sufficient capacity
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          <div className="p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Activity feed coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}