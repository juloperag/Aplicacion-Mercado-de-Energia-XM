import React from 'react'

export default function Spinner() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}
