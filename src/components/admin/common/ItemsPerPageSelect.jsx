import React from 'react';

const ItemsPerPageSelect = ({ value, onChange, label = "Show:" }) => {
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
            >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
                <option value="100">100</option>
            </select>
        </div>
    );
};

export default ItemsPerPageSelect;

