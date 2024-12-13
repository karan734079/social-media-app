import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Searchbar = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const navigate = useNavigate();
    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            setIsNotFound(false);
            return;
        }

        const handleSearch = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/users/search?query=${debouncedQuery}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (response.data.length === 0) {
                    setSearchResults([]);
                    setIsNotFound(true);
                } else {
                    setSearchResults(response.data);
                    setIsNotFound(false);
                }
                console.log(response.data);
            } catch (err) {
                console.error('Search error:', err.message);
                setSearchResults([]);
                setIsNotFound(true);
            }
        };

        handleSearch();
    }, [debouncedQuery]);

    const viewUserProfile = (userId) => {
        navigate(`/user/${userId}`);
    };

    return (
        <div className="p-4">
            <div className="relative right-40">
                <div className="flex w-full max-w-lg ml-96 border rounded-full shadow focus:outline-none">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for a user..."
                        className="w-full max-w-lg rounded-full focus:outline-none p-3"
                    />
                    <i className="fa-solid fa-search text-red-600 m-4 mt-4 cursor-pointer"></i>
                </div>

                {query.trim() && (
                    <div className="absolute left-0 right-0 mt-2 w-full max-w-lg ml-96 bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
                        {searchResults.length > 0 ? (
                            searchResults.map((user) => (
                                <div
                                    key={user._id}
                                    className="cursor-pointer p-3 hover:bg-gray-200 flex items-center"
                                    onClick={() => viewUserProfile(user._id)}
                                >
                                    <img
                                        src={user.profilePhoto}
                                        alt={`${user.username}'s profile`}
                                        className="w-10 h-10 object-contain rounded-full mr-4"
                                    />
                                    <div>
                                        <h3 className="text-sm font-semibold">{user.name}</h3>
                                        <p className="text-xs text-gray-600">@{user.username}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            isNotFound && (
                                <div className="p-4 text-center text-gray-600">
                                    User not found
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Searchbar;
