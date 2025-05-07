import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CampaignCard from '../components/CampaignCard';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `/api/campaigns?category=${category}`;
        if (search) url += `&search=${search}`;
        
        const [campaignsRes, statsRes] = await Promise.all([
          fetch(url),
          fetch('/api/campaigns/stats')
        ]);
        
        const campaignsData = await campaignsRes.json();
        const statsData = await statsRes.json();
        
        if (campaignsData.success) setCampaigns(campaignsData.data);
        if (statsData.success) setStats(statsData.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, search]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-container">
      <Navbar />
      
      <section className="hero-section">
        <h1>Funding Dreams, Building Africa</h1>
        <p>Join thousands supporting innovative African projects</p>
        <Link to="/explore" className="cta-button">Explore Projects</Link>
      </section>

      {stats && (
        <div className="stats-section">
          <div className="stat-item">
            <h3>${stats.totalRaised.toLocaleString()}</h3>
            <p>Total Raised</p>
          </div>
          <div className="stat-item">
            <h3>{stats.totalBackers.toLocaleString()}</h3>
            <p>Backers</p>
          </div>
          <div className="stat-item">
            <h3>{stats.totalProjects.toLocaleString()}</h3>
            <p>Projects Funded</p>
          </div>
        </div>
      )}

      <div className="campaigns-header">
        <h2>Featured Campaigns</h2>
        <select 
          value={category}
          onChange={(e) => window.location.search = `?category=${e.target.value}`}
        >
          {['All', 'Education', 'Film & Video', 'Food', 'Games', 'Technology'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="campaigns-grid">
        {campaigns.length > 0 ? (
          campaigns.map(campaign => (
            <CampaignCard key={campaign._id} campaign={campaign} />
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
