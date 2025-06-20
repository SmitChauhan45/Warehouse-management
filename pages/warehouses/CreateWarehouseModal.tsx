import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { useForm, useFieldArray } from 'react-hook-form';
import { CREATE_WAREHOUSE } from '../../graphql/mutations';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { WarehouseInput } from '../../types';

interface CreateWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateWarehouseModal = ({ isOpen, onClose, onSuccess }: CreateWarehouseModalProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm<WarehouseInput>({
    defaultValues: {
      name: '',
      location: '',
      totalCapacity: 0,
      storageTypes: [{ type: '', capacity: 0 }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'storageTypes',
  });

  const totalCapacity = watch('totalCapacity');
  const storageTypes = watch('storageTypes');
  const totalStorageCapacity = storageTypes.reduce((sum, type) => sum + (type.capacity || 0), 0);
  const isStorageCapacityValid = totalStorageCapacity <= totalCapacity;
  
  const [createWarehouse, { loading }] = useMutation(CREATE_WAREHOUSE, {
    onCompleted: () => {
      reset();
      onSuccess();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    }
  });

  const onSubmit = (data: WarehouseInput) => {
    if (!isStorageCapacityValid) {
      setErrorMessage('Total storage type capacity cannot exceed the warehouse total capacity.');
      return;
    }
    
    setErrorMessage(null);
    createWarehouse({ 
      variables: {
        name: data.name,
        location: data.location,
        totalCapacity: parseFloat(data.totalCapacity.toString()),
        storageTypes: data.storageTypes.map(type => ({
          type: type.type,
          capacity: parseFloat(type.capacity.toString())
        }))
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
                    Create New Warehouse
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
                      Warehouse Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter warehouse name"
                      {...register('name', { required: 'Warehouse name is required' })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter warehouse location"
                      {...register('location', { required: 'Location is required' })}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>

                  {/* Total Capacity */}
                  <div>
                    <label htmlFor="totalCapacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Capacity
                    </label>
                    <input
                      type="number"
                      id="totalCapacity"
                      min="0"
                      step="0.1"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter total capacity"
                      {...register('totalCapacity', { 
                        required: 'Total capacity is required',
                        min: { value: 0, message: 'Capacity must be positive' },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.totalCapacity && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalCapacity.message}</p>
                    )}
                  </div>

                  {/* Storage Types */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Storage Types
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => append({ type: '', capacity: 0 })}
                      >
                        Add Type
                      </Button>
                    </div>
                    
                    <div className="mt-2 space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex space-x-2">
                          <div className="w-1/2">
                            <input
                              type="text"
                              placeholder="Type name"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              {...register(`storageTypes.${index}.type` as const, {
                                required: 'Type is required'
                              })}
                            />
                            {errors.storageTypes?.[index]?.type && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.storageTypes[index]?.type?.message}
                              </p>
                            )}
                          </div>
                          <div className="w-1/2">
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Capacity"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                {...register(`storageTypes.${index}.capacity` as const, {
                                  required: 'Capacity is required',
                                  min: { value: 0, message: 'Must be positive' },
                                  valueAsNumber: true,
                                })}
                              />
                              {fields.length > 1 && (
                                <button
                                  type="button"
                                  className="ml-2 text-red-500 hover:text-red-700"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                            {errors.storageTypes?.[index]?.capacity && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.storageTypes[index]?.capacity?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Storage capacity validation message */}
                    {!isStorageCapacityValid && (
                      <p className="mt-2 text-sm text-red-600">
                        Total storage type capacity ({totalStorageCapacity}) exceeds warehouse capacity ({totalCapacity})
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
                      disabled={!isStorageCapacityValid}
                    >
                      Create Warehouse
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

export default CreateWarehouseModal;