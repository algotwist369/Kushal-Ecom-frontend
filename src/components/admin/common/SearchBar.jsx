import React from 'react';

const SearchBar = ({ 
    value, 
    onChange, 
    placeholder = "Search...", 
    label = "Search",
    className = "" 
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
        </div>
    );
};

export default SearchBar;

