'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import { LOGIN } from '@/lib/graphql/mutations'
import { useAuth } from '@/contexts/AuthContext'
import { LoginInput } from '@/types'
import Button from '@/components/common/Button'
import Alert from '@/components/common/Alert'

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>()
  
  const [loginMutation, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      login(data.login.token, data.login.user)
      router.push('/dashboard')
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.')
    }
  })

  const onSubmit = (data: LoginInput) => {
    setErrorMessage(null)
    loginMutation({ variables: data })
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Sign in to your account
      </h3>
      
      {errorMessage && (
        <Alert 
          type="error"
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
          >
            Sign in
          </Button>
        </div>
      </form>
      
      <div className="mt-6">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}