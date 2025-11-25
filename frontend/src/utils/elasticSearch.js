/**
 * Elastic Search Utility
 * Implements Elasticsearch-style search functionality for local data
 * 
 * Features:
 * - Partial substring matching
 * - Case-insensitive comparison
 * - Multi-field search
 * - Relevance scoring
 * - Fuzzy matching
 * - Highlighting
 */

/**
 * Normalize text for case-insensitive comparison
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase().trim();
};

/**
 * Calculate relevance score for a match
 * Higher score = better match
 * 
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @returns {number} - Relevance score (0-100)
 */
const calculateRelevanceScore = (text, query) => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedText || !normalizedQuery) return 0;
  
  let score = 0;
  
  // Exact match: highest score
  if (normalizedText === normalizedQuery) {
    score += 100;
  }
  // Starts with query: high score
  else if (normalizedText.startsWith(normalizedQuery)) {
    score += 80;
  }
  // Contains query as whole word: medium-high score
  else if (normalizedText.includes(` ${normalizedQuery} `)) {
    score += 60;
  }
  // Contains query anywhere: medium score
  else if (normalizedText.includes(normalizedQuery)) {
    score += 40;
  }
  
  // Bonus: shorter text with match is more relevant
  const lengthRatio = normalizedQuery.length / normalizedText.length;
  score += lengthRatio * 20;
  
  return Math.min(score, 100);
};

/**
 * Check if text matches query (partial substring, case-insensitive)
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @returns {boolean} - True if matches
 */
const matchesQuery = (text, query) => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedQuery) return true; // Empty query matches everything
  if (!normalizedText) return false;
  
  // Partial substring matching
  return normalizedText.includes(normalizedQuery);
};

/**
 * Highlight matching portions of text
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {Object} - Object with highlighted text and positions
 */
const highlightMatches = (text, query) => {
  if (!text || !query) {
    return {
      original: text,
      highlighted: text,
      matches: []
    };
  }
  
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const matches = [];
  
  let startIndex = 0;
  let index;
  
  // Find all occurrences
  while ((index = normalizedText.indexOf(normalizedQuery, startIndex)) !== -1) {
    matches.push({
      start: index,
      end: index + normalizedQuery.length,
      text: text.substring(index, index + normalizedQuery.length)
    });
    startIndex = index + 1;
  }
  
  // Build highlighted text with markers
  let highlighted = text;
  if (matches.length > 0) {
    // Replace matches with highlighted versions (in reverse to maintain indices)
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const before = text.substring(0, match.start);
      const matchText = text.substring(match.start, match.end);
      const after = text.substring(match.end);
      highlighted = before + `<mark>${matchText}</mark>` + after;
    }
  }
  
  return {
    original: text,
    highlighted,
    matches,
    matchCount: matches.length
  };
};

/**
 * Elasticsearch-style search function
 * Searches through tasks with advanced matching
 * 
 * @param {Array} tasks - Array of task objects
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Array} - Filtered and sorted tasks with relevance scores
 */
export const elasticSearch = (tasks, query, options = {}) => {
  const {
    fields = ['title', 'description'], // Fields to search
    minScore = 0, // Minimum relevance score
    sortByRelevance = true, // Sort by relevance score
    includeHighlights = false // Include highlighted text
  } = options;
  
  // Empty query returns all tasks
  if (!query || !query.trim()) {
    return tasks.map(task => ({
      ...task,
      _score: 0,
      _highlights: {}
    }));
  }
  
  const normalizedQuery = normalizeText(query);
  
  // Search and score each task
  const results = tasks
    .map(task => {
      let maxScore = 0;
      const highlights = {};
      let matched = false;
      
      // Check each field
      fields.forEach(field => {
        const fieldValue = task[field];
        
        if (fieldValue && matchesQuery(fieldValue, normalizedQuery)) {
          matched = true;
          const score = calculateRelevanceScore(fieldValue, normalizedQuery);
          
          // Keep highest score
          if (score > maxScore) {
            maxScore = score;
          }
          
          // Generate highlights if needed
          if (includeHighlights) {
            highlights[field] = highlightMatches(fieldValue, normalizedQuery);
          }
        }
      });
      
      // Return task with metadata if matched
      if (matched) {
        return {
          ...task,
          _score: maxScore,
          _highlights: highlights,
          _matched: true
        };
      }
      
      return null;
    })
    .filter(task => task !== null && task._score >= minScore);
  
  // Sort by relevance if requested
  if (sortByRelevance) {
    results.sort((a, b) => b._score - a._score);
  }
  
  return results;
};

/**
 * Fuzzy search - matches even with typos
 * Uses Levenshtein distance algorithm
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance (lower = more similar)
 */
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }
  
  return dp[m][n];
};

/**
 * Fuzzy match - allows for typos
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @param {number} maxDistance - Maximum edit distance (default: 2)
 * @returns {boolean} - True if fuzzy match
 */
export const fuzzyMatch = (text, query, maxDistance = 2) => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedText || !normalizedQuery) return false;
  
  // Check exact match first
  if (normalizedText.includes(normalizedQuery)) return true;
  
  // Split text into words and check fuzzy match
  const words = normalizedText.split(/\s+/);
  
  return words.some(word => {
    const distance = levenshteinDistance(word, normalizedQuery);
    return distance <= maxDistance;
  });
};

/**
 * Multi-match search across multiple fields with weights
 * @param {Array} tasks - Array of tasks
 * @param {string} query - Search query
 * @param {Object} fieldWeights - Field weights for scoring
 * @returns {Array} - Filtered and scored tasks
 */
export const multiMatchSearch = (tasks, query, fieldWeights = {}) => {
  const defaultWeights = {
    title: 2.0,        // Title matches are more important
    description: 1.0,  // Description matches are standard
    priority: 1.5      // Priority matches are medium importance
  };
  
  const weights = { ...defaultWeights, ...fieldWeights };
  
  if (!query || !query.trim()) {
    return tasks;
  }
  
  return tasks
    .map(task => {
      let totalScore = 0;
      let matched = false;
      
      Object.entries(weights).forEach(([field, weight]) => {
        if (task[field] && matchesQuery(task[field], query)) {
          matched = true;
          const baseScore = calculateRelevanceScore(task[field], query);
          totalScore += baseScore * weight;
        }
      });
      
      if (matched) {
        return {
          ...task,
          _score: totalScore,
          _matched: true
        };
      }
      
      return null;
    })
    .filter(task => task !== null)
    .sort((a, b) => b._score - a._score);
};

/**
 * Search with suggestions (for "did you mean?" feature)
 * @param {string} query - Search query
 * @param {Array} dictionary - List of valid terms
 * @returns {Array} - Suggested terms
 */
export const getSearchSuggestions = (query, dictionary, maxSuggestions = 5) => {
  if (!query || !dictionary || dictionary.length === 0) {
    return [];
  }
  
  const normalizedQuery = normalizeText(query);
  
  // Find terms that are similar to the query
  const suggestions = dictionary
    .map(term => {
      const normalizedTerm = normalizeText(term);
      const distance = levenshteinDistance(normalizedQuery, normalizedTerm);
      const similarity = 1 - (distance / Math.max(normalizedQuery.length, normalizedTerm.length));
      
      return {
        term,
        similarity,
        distance
      };
    })
    .filter(s => s.similarity > 0.5) // Only keep somewhat similar terms
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxSuggestions)
    .map(s => s.term);
  
  return suggestions;
};

export default {
  elasticSearch,
  fuzzyMatch,
  multiMatchSearch,
  highlightMatches,
  getSearchSuggestions,
  calculateRelevanceScore
};
