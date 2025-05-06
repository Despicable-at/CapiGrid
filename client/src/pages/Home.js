import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, statsRes] = await Promise.all([
          axios.get('/api/campaigns'),
          axios.get('/api/campaigns/stats')
        ]);
        
        setCampaigns(campaignsRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { name: 'All', emoji: '🌟' },
    { name: 'Education', emoji: '🎓' },
    { name: 'Design', emoji: '🎨' },
    { name: 'Film & Video', emoji: '🎥' },
    { name: 'Food', emoji: '🍔' },
    { name: 'Games', emoji: '🎮' },
    { name: 'Technology', emoji: '💻' }
  ];

  return (
    <div className="home">

          {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo">CapiGrid</div>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/projects">Projects</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </nav>
    
      <section className="hero">
        <div className="overlay">
          <h1>Reach More.<br />Raise More.<br />Do More.</h1>
          <p>Raising money has never been so easy. We're here to help your cause starting today.</p>
          <button className="cta-button">Explore Projects</button>
        </div>
      </section>

      <section className="categories">
        <h2>Browse by Categories</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <div 
              key={category.name}
              className={`category ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.emoji} {category.name}
            </div>
          ))}
        </div>
      </section>

      <section className="projects">
        <h2>Explore Our Projects</h2>
        <div className="project-grid">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="project-card">
              <div 
                className="project-image"
                style={{ backgroundImage: `url(${campaign.imageUrl})` }}
              />
              <h3>{campaign.title}</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(campaign.pledged / campaign.goal * 100).toFixed(2)}%` 
                  }}
                />
              </div>
              <div className="project-stats">
                <span>${campaign.pledged.toLocaleString()} raised</span>
                <span>${campaign.goal.toLocaleString()} goal</span>
                <span>{campaign.daysRemaining} days left</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {stats && (
        <section className="stats">
          <div className="stat-item">
            <h3>{stats.totalCampaigns}+</h3>
            <p>Projects</p>
          </div>
          <div className="stat-item">
            <h3>${(stats.totalRaised / 1000).toFixed(1)}k+</h3>
            <p>Raised Funds</p>
          </div>
          <div className="stat-item">
            <h3>{stats.activeCampaigns}+</h3>
            <p>Active Campaigns</p>
          </div>
          <div className="stat-item">
            <h3>{stats.activeBackers}+</h3>
            <p>Supporters</p>
          </div>
        </section>
      )}

      <section className="footer-cta">
        <h2>Your Story Starts Here</h2>
        <button className="cta-button">Start a Project</button>
      </section>


      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CapiGrid</h4>
            <p>Transforming ideas into reality through community support</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/about">About Us</a>
            <a href="/blog">Blog</a>
            <a href="/faq">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
