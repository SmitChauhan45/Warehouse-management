import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { CREATE_ITEM } from '../../graphql/mutations';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { StorageType, ItemInput } from '../../types';

interface CreateItemModalProps {
  warehouseId: string;
  storageTypes: StorageType[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateItemModal = ({ warehouseId, storageTypes, isOpen, onClose, onSuccess }: CreateItemModalProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ItemInput>({
    defaultValues: {
      warehouseId,
      name: '',
      description: '',
      quantity: 1,
      storageType: storageTypes[0]?.type || '',
      size: 1
    }
  });
  
  const selectedStorageType = watch('storageType');
  const quantity = watch('quantity');
  const size = watch('size');
  
  // Get the capacity of the selected storage type
  const selectedTypeCapacity = storageTypes.find(type => type.type === selectedStorageType)?.capacity || 0;
  
  // Calculate total space this item will use
  const totalSpaceNeeded = quantity * size;
  
  // Check if there's enough space in the selected storage type
  const hasEnoughSpace = totalSpaceNeeded <= selectedTypeCapacity;
  
  const [createItem, { loading }] = useMutation(CREATE_ITEM, {
    onCompleted: () => {
      reset();
      onSuccess();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    }
  });

  const onSubmit = (data: ItemInput) => {
    if (!hasEnoughSpace) {
      setErrorMessage(`Not enough space in the selected storage type. Available: ${selectedTypeCapacity}, Needed: ${totalSpaceNeeded}`);
      return;
    }
    
    setErrorMessage(null);
    createItem({ 
      variables: {
        warehouseId: data.warehouseId,
        name: data.name,
        description: data.description || '',
        quantity: parseInt(data.quantity.toString()),
        storageType: data.storageType,
        size: parseFloat(data.size.toString())
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Add New Item
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {errorMessage && (
                  <Alert 
                    type="error" 
                    className="mt-4"
                    onClose={() => setErrorMessage(null)}
                  >
                    {errorMessage}
                  </Alert>
                )}

                <form className="mt-4 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Item Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter item name"
                      {...register('name', { required: 'Item name is required' })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter item description"
                      {...register('description')}
                    ></textarea>
                  </div>

                  {/* Storage Type */}
                  <div>
                    <label htmlFor="storageType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Storage Type
                    </label>
                    <select
                      id="storageType"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...register('storageType', { required: 'Storage type is required' })}
                    >
                      {storageTypes.map((type, index) => (
                        <option key={index} value={type.type}>
                          {type.type} ({type.capacity} available)
                        </option>
                      ))}
                    </select>
                    {errors.storageType && (
                      <p className="mt-1 text-sm text-red-600">{errors.storageType.message}</p>
                    )}
                  </div>

                  {/* Quantity and Size in a row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...register('quantity', { 
                          required: 'Quantity is required',
                          min: { value: 1, message: 'Must be at least 1' },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Size Per Unit
                      </label>
                      <input
                        type="number"
                        id="size"
                        min="0.1"
                        step="0.1"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        {...register('size', { 
                          required: 'Size is required',
                          min: { value: 0.1, message: 'Must be positive' },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.size && (
                        <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Space calculation */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Space Required:
                      </span>
                      <span className={`text-sm font-semibold ${hasEnoughSpace ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {totalSpaceNeeded.toFixed(1)} units
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Available in {selectedStorageType}:
                      </span>
                      <span className={`text-sm font-semibold ${hasEnoughSpace ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedTypeCapacity.toFixed(1)} units
                      </span>
                    </div>
                    
                    {!hasEnoughSpace && (
                      <p className="mt-2 text-sm text-red-600">
                        Not enough space available in this storage type
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        reset();
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      loading={loading}
                      disabled={!hasEnoughSpace}
                    >
                      Add Item
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateItemModal;