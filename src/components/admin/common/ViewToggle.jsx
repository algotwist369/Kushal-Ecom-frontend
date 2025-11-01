import React from 'react';

const ViewToggle = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => onViewModeChange('card')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === 'card'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-[#5c2d16]'
                }`}
            >
                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
            </button>
            <button
                onClick={() => onViewModeChange('table')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === 'table'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-[#5c2d16]'
                }`}
            >
                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Table
            </button>
        </div>
    );
};

export default ViewToggle;

