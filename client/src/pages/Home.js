import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CampaignCard from '../components/CampaignCard';
import Footer from '../components/Footer';
import './Home.css';

// Mock data directly in component
const mockCampaigns = [
  {
    id: 1,
    title: "School Building Project",
    description: "Help us build a school in rural Kenya",
    category: "Education",
    goalAmount: 50000,
    raisedAmount: 32000,
    backers: 128,
    imageUrl: "/default-campaign.jpg"
  },
  {
    id: 2,
    title: "Tech Hub Lagos",
    description: "Funding for new tech incubator",
    category: "Technology",
    goalAmount: 100000,
    raisedAmount: 45000,
    backers: 89,
    imageUrl: "/default-campaign.jpg"
  }
];

const mockStats = {
  totalRaised: 150000,
  totalBackers: 1024,
  totalProjects: 56
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';

  // Filter campaigns
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesCategory = category === 'All' || campaign.category === category;
    const matchesSearch = campaign.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="home-container">
      <Navbar />
      
      <section className="hero-section">
        <h1>Funding Dreams, Building Africa</h1>
        <Link to="/explore" className="cta-button">Explore Projects</Link>
      </section>

      <div className="stats-section">
        <div className="stat-box">
          <h3>${mockStats.totalRaised.toLocaleString()}</h3>
          <p>Total Raised</p>
        </div>
        <div className="stat-box">
          <h3>{mockStats.totalBackers.toLocaleString()}</h3>
          <p>Backers</p>
        </div>
        <div className="stat-box">
          <h3>{mockStats.totalProjects.toLocaleString()}</h3>
          <p>Projects</p>
        </div>
      </div>

      <div className="campaigns-grid">
        {filteredCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
