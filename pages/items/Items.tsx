import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Filter, Package, Search, Warehouse, ArrowUpDown } from 'lucide-react';
import { GET_WAREHOUSES, GET_ITEMS } from '../../graphql/queries';
import { Item, Warehouse as WarehouseType } from '../../types';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

type SortField = 'name' | 'quantity' | 'size' | 'warehouse';
type SortOrder = 'asc' | 'desc';

const Items = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [allItems, setAllItems] = useState<Item[]>([]);

  // Fetch warehouses
  const { data: warehousesData, loading: warehousesLoading } = useQuery(GET_WAREHOUSES);
  
  // Get all items from all warehouses
  const [fetchedWarehouses, setFetchedWarehouses] = useState<string[]>([]);
  
  // Track which warehouses we've already queried
  useEffect(() => {
    if (warehousesData?.warehouses) {
      const warehouseIds = warehousesData.warehouses.map((w: WarehouseType) => w.id);
      // Only fetch for warehouses we haven't fetched yet
      const remainingWarehouses = warehouseIds.filter(id => !fetchedWarehouses.includes(id));
      setFetchedWarehouses(prevIds => [...prevIds, ...remainingWarehouses]);
    }
  }, [warehousesData, fetchedWarehouses]);
  
  // Fetch items for each warehouse
  const { loading: itemsLoading, error: itemsError } = useQuery(GET_ITEMS, {
    variables: { warehouseId: selectedWarehouse === 'all' ? fetchedWarehouses[0] : selectedWarehouse },
    skip: !fetchedWarehouses.length,
    onCompleted: (data) => {
      if (data?.items) {
        if (selectedWarehouse === 'all') {
          // Add items from this warehouse to our complete list
          const newItems = data.items.filter((item: Item) => 
            !allItems.some(existingItem => existingItem.id === item.id)
          );
          setAllItems(prev => [...prev, ...newItems]);
          
          // Get the next warehouse to fetch
          const currentIndex = fetchedWarehouses.indexOf(fetchedWarehouses[0]);
          if (currentIndex < fetchedWarehouses.length - 1) {
            setFetchedWarehouses(prev => {
              const newArr = [...prev];
              newArr.splice(0, 1); // Remove the warehouse we just fetched
              return newArr;
            });
          }
        } else {
          // Just showing items for one warehouse
          setAllItems(data.items);
        }
      }
    }
  });

  const isLoading = warehousesLoading || itemsLoading || (selectedWarehouse === 'all' && fetchedWarehouses.length > 0);

  // Filter and sort items
  const filteredItems = allItems
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storageType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse?.id === selectedWarehouse;
      
      return matchesSearch && matchesWarehouse;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch(sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'warehouse':
          comparison = (a.warehouse?.name || '').localeCompare(b.warehouse?.name || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return (
      <ArrowUpDown className={`h-4 w-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
    );
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 dark:border-gray-700 mb-6">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">Inventory</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
          View and manage all inventory items across your warehouses.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="w-full sm:w-1/2 lg:w-2/3">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search items by name, description, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Warehouse Filter */}
            <div className="w-full sm:w-1/2 lg:w-1/3">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  <option value="all">All Warehouses</option>
                  {warehousesData?.warehouses.map((warehouse: WarehouseType) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading inventory items...</p>
          </div>
        ) : itemsError ? (
          <div className="text-center py-8 text-red-500">
            <p>Error loading items: {itemsError.message}</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      Name {renderSortIcon('name')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('quantity')}
                  >
                    <div className="flex items-center">
                      Quantity {renderSortIcon('quantity')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('size')}
                  >
                    <div className="flex items-center">
                      Size {renderSortIcon('size')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('warehouse')}
                  >
                    <div className="flex items-center">
                      Warehouse {renderSortIcon('warehouse')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                      {item.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.warehouse ? (
                        <Link 
                          to={`/warehouses/${item.warehouse.id}`}
                          className="flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                          <Warehouse className="h-4 w-4 mr-1" />
                          {item.warehouse.name}
                        </Link>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? `No results match "${searchTerm}"` : 'No items available.'}
            </p>
            {(user?.role === 'admin' || user?.role === 'staff') && selectedWarehouse !== 'all' && (
              <div className="mt-6">
                <Link to={`/warehouses/${selectedWarehouse}`}>
                  <Button 
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Item to Warehouse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;