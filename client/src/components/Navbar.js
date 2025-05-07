import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">FundAfrica</Link>
        
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <div className="dropdown">
            <button className="dropbtn">Explore ▾</button>
            <div className="dropdown-content">
              {['Education', 'Film & Video', 'Food', 'Games', 'Technology'].map(item => (
                <Link key={item} to={`/explore/${item.toLowerCase().replace(' & ', '-')}`}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/news">News</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
