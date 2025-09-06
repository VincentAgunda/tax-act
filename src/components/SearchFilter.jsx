import React from 'react';

const SearchFilter = ({ searchTerm, setSearchTerm, filters, setFilters, filterOptions }) => {
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="mb-6 p-4 bg-[#DDDDDD] rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border border-[#AAAAAA] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
        />
        {filterOptions.map(option => (
          <select
            key={option.type}
            value={filters[option.type]}
            onChange={(e) => handleFilterChange(option.type, e.target.value)}
            className="p-2 border border-[#AAAAAA] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#AAAAAA]"
          >
            <option value="">All {option.label}</option>
            {option.values.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
