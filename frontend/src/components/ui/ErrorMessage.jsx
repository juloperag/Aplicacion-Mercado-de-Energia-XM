import React from 'react'

export default function ErrorMessage({ message = 'No pudimos obtener los datos. Intenta de nuevo más tarde.' }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="max-w-md bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z" />
        </svg>
        <p className="text-red-700 font-medium">{message}</p>
      </div>
    </div>
  )
}
