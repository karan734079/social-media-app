import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Searchbar = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const navigate = useNavigate();

    // Debouncing the input query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200); // 200ms debounce time

        return () => clearTimeout(timer); // Cleanup on change
    }, [query]);

    // Trigger search when debouncedQuery changes
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]); // Clear results if query is empty
            return;
        }

        const handleSearch = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/users/search?query=${debouncedQuery}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (response.data.length === 0) {
                    setSearchResults([]); // Clear results if no matches
                } else {
                    setSearchResults(response.data); // Update search results
                }
                console.log(response.data);
            } catch (err) {
                console.error('Search error:', err.message);
                setSearchResults([]); // Clear results on error
            }
        };

        handleSearch(); // Perform search on debounced query change
    }, [debouncedQuery]);

    const viewUserProfile = (userId) => {
        navigate(`/user/${userId}`); // Navigate to the user's profile page
    };

    return (
        <div className="p-4">
            <div className="relative">
                <div className="flex w-full max-w-lg ml-96 border rounded-full shadow focus:outline-none">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for a user..."
                        className="w-full max-w-lg rounded-full focus:outline-none p-3"
                    />
                    <i className='fa-solid fa-search text-red-600 m-4 mt-4 cursor-pointer'></i>
                </div>

                {/* Display search results as suggestions */}
                {searchResults.length > 0 && query.trim() && (
                    <div className="absolute left-0 right-0 mt-2 w-full max-w-lg ml-96 bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                            <div
                                key={user._id}
                                className="cursor-pointer p-3 hover:bg-gray-200 flex items-center"
                                onClick={() => viewUserProfile(user._id)} // Navigate to user profile
                            >
                                <img
                                    src={user.profilePhoto}
                                    alt={`${user.username}'s profile`}
                                    className="w-10 h-10 rounded-full mr-4"
                                />
                                <div>
                                    <h3 className="text-sm font-semibold">{user.name}</h3>
                                    <p className="text-xs text-gray-600">@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Searchbar;
