import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CampaignCard from '../components/CampaignCard';
import Footer from '../components/Footer';
import { mockCampaigns, mockStats } from '../data/mockData';
import './Home.css';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalBackers: 0,
    totalProjects: 0
  });
  const [loading, setLoading] = useState(false); // Changed to false since we're using mock data
  const [searchParams] = useSearchParams();
  
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    
    // Filter mock data based on category and search
    let filteredCampaigns = mockCampaigns;
    
    if (category && category !== 'All') {
      filteredCampaigns = filteredCampaigns.filter(
        campaign => campaign.category === category
      );
    }
    
    if (search) {
      filteredCampaigns = filteredCampaigns.filter(
        campaign => campaign.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setCampaigns(filteredCampaigns);
    setStats(mockStats);
    setLoading(false);
  }, [category, search]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-container">
      <Navbar />
      
      <section className="hero-section">
        <h1>Funding Dreams, Building Africa</h1>
        <Link to="/explore" className="cta-button">Explore Projects</Link>
      </section>

      <div className="stats-section">
        <div className="stat-box">
          <h3>${stats.totalRaised.toLocaleString()}</h3>
          <p>Total Raised</p>
        </div>
        <div className="stat-box">
          <h3>{stats.totalBackers.toLocaleString()}</h3>
          <p>Backers</p>
        </div>
        <div className="stat-box">
          <h3>{stats.totalProjects.toLocaleString()}</h3>
          <p>Projects</p>
        </div>
      </div>

      <div className="category-filter">
        <select 
          value={category}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set('category', e.target.value);
            window.location.search = params.toString();
          }}
        >
          {['All', 'Education', 'Film & Video', 'Food', 'Games', 'Technology'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="campaigns-grid">
        {campaigns.length > 0 ? (
          campaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        ) : (
          <p className="no-results">No campaigns found. Try a different search.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
