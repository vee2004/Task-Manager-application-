import React from 'react';
import Select from './Select';

/**
 * TaskFilter Component - Filter and search tasks
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Search change handler
 */
const TaskFilter = ({ filters, onFilterChange, searchQuery, onSearchChange }) => {
  const [isSearching, setIsSearching] = React.useState(false);

  /**
   * Show searching indicator briefly when user types
   */
  React.useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Priority filter options
  const priorityOptions = [
    { value: 'All', label: 'All Priorities' },
    { value: 'Low', label: 'Low Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'High', label: 'High Priority' }
  ];

  // Status filter options
  const statusOptions = [
    { value: 'All', label: 'All Tasks' },
    { value: 'Pending', label: 'Pending Only' },
    { value: 'Completed', label: 'Completed Only' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'dueDate-asc', label: 'Due Date (Earliest First)' },
    { value: 'dueDate-desc', label: 'Due Date (Latest First)' },
    { value: 'priority-high', label: 'Priority (High to Low)' },
    { value: 'priority-low', label: 'Priority (Low to High)' },
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' }
  ];

  /**
   * Handle filter dropdown changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  /**
   * Reset all filters
   */
  const handleReset = () => {
    onFilterChange({
      priority: 'All',
      status: 'All',
      sort: 'dueDate-asc'
    });
    onSearchChange({ target: { value: '' } });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔍 Filter & Search
      </h2>

      {/* Search Bar with Debouncing */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Tasks
          {isSearching && (
            <span className="ml-2 text-xs text-blue-600 animate-pulse">
              🔍 Searching...
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search tasks by title or description... (case-insensitive)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <svg
            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          💡 Search uses 300ms debouncing for optimal performance
        </p>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Priority Filter */}
        <Select
          name="priority"
          label="Filter by Priority"
          value={filters.priority}
          onChange={handleFilterChange}
          options={priorityOptions}
        />

        {/* Status Filter */}
        <Select
          name="status"
          label="Filter by Status"
          value={filters.status}
          onChange={handleFilterChange}
          options={statusOptions}
        />

        {/* Sort Options */}
        <Select
          name="sort"
          label="Sort by"
          value={filters.sort}
          onChange={handleFilterChange}
          options={sortOptions}
        />
      </div>

      {/* Reset Button */}
      <div className="mt-4">
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          🔄 Reset All Filters
        </button>
      </div>

      {/* Active Filters Display */}
      {(filters.priority !== 'All' || filters.status !== 'All' || searchQuery) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.priority !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Priority: {filters.priority}
              </span>
            )}
            {filters.status !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Status: {filters.status}
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                Search: "{searchQuery}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
