import React from 'react';
import { Link } from 'react-router-dom';

const CampaignCard = ({ campaign }) => {
  const progress = Math.min(100, (campaign.raisedAmount / campaign.goalAmount) * 100);

  return (
    <div className="campaign-card">
      <div className="card-image">
        <img 
          src={campaign.imageUrl || '/default-campaign.jpg'} 
          alt={campaign.title}
          onError={(e) => {
            e.target.src = '/default-campaign.jpg';
          }}
        />
        <span className="category-badge">{campaign.category}</span>
      </div>
      <div className="card-content">
        <h3>{campaign.title}</h3>
        <p className="description">{campaign.description.substring(0, 100)}...</p>
        
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="stats">
          <span>${campaign.raisedAmount.toLocaleString()} raised</span>
          <span>{progress.toFixed(0)}% funded</span>
        </div>
        
        <Link to={`/campaign/${campaign.id}`} className="view-button">
          View Project
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;
