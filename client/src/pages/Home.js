import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // State for all dynamic data
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ 
    totalRaised: 0, 
    totalBackers: 0, 
    totalProjects: 0 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories from your requirements
  const categories = [
    'All', 'Education', 'Film & Video', 'Community', 
    'Food', 'Games', 'Technology', 'Business'
  ];

  // Fetch data from backend
  useEffect(() => {
    // Fetch campaigns
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(err => console.error('Error fetching campaigns:', err));

    // Fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  // Filter campaigns by category/search
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesCategory = selectedCategory === 'All' || 
                          campaign.category === selectedCategory;
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="font-bold text-xl">FundAfrica</Link>
              <div className="hidden md:flex space-x-8">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <div className="relative group">
                  <button className="hover:text-blue-600 flex items-center">
                    Explore ▾
                  </button>
                  <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md p-2 w-48">
                    {categories.slice(1).map(cat => (
                      <Link 
                        key={cat} 
                        to={`/explore/${cat.toLowerCase()}`}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link to="/news" className="hover:text-blue-600">News</Link>
                <Link to="/contact" className="hover:text-blue-600">Contact</Link>
              </div>
            </div>
            <div className="flex items-center">
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="border rounded-l py-1 px-3 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white rounded-r px-4 py-1"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="bg-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Funding Dreams, Building Africa
          </h1>
          <p className="text-xl mb-8">
            Join thousands of backers supporting innovative African projects
          </p>
          <Link 
            to="/explore" 
            className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100"
          >
            Explore Projects
          </Link>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <h3 className="text-4xl font-bold text-blue-600">${stats.totalRaised.toLocaleString()}</h3>
            <p className="text-gray-600">Total Raised</p>
          </div>
          <div className="p-6">
            <h3 className="text-4xl font-bold text-blue-600">{stats.totalBackers.toLocaleString()}</h3>
            <p className="text-gray-600">Backers</p>
          </div>
          <div className="p-6">
            <h3 className="text-4xl font-bold text-blue-600">{stats.totalProjects.toLocaleString()}</h3>
            <p className="text-gray-600">Projects Funded</p>
          </div>
        </div>
      </section>

      {/* --- CAMPAIGNS SECTION --- */}
      <section className="py-12 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Campaigns</h2>
          <select 
            className="border rounded px-4 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <p className="italic mb-4">"This platform changed my life! I raised funds for my tech startup and now we're operating in 3 countries."</p>
                <p className="font-bold">- Jane D., Tech Entrepreneur</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Get Started</h3>
            <ul className="space-y-2">
              {['News', 'Explore', 'FAQs', 'About', 'Shopping Cart'].map(item => (
                <li key={item}><Link to={`/${item.toLowerCase()}`} className="hover:text-blue-400">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Dashboard</h3>
            <ul className="space-y-2">
              {['Dashboard', 'Login', 'Edit Profile', 'Start a Project', 'Contact'].map(item => (
                <li key={item}><Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-blue-400">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              {['Education', 'Film & Video', 'Food', 'Games', 'Technology'].map(item => (
                <li key={item}><Link to={`/explore/${item.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} className="hover:text-blue-400">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

// CampaignCard component (should be in separate file)
function CampaignCard({ campaign }) {
  const progress = Math.min(100, (campaign.raisedAmount / campaign.goalAmount) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={campaign.imageUrl || '/placeholder-campaign.jpg'} 
          alt={campaign.title}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs rounded">
          {campaign.category}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2">{campaign.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
        
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>{progress.toFixed(0)}% funded</span>
            <span>${campaign.raisedAmount.toLocaleString()} raised</span>
          </div>
        </div>
        
        <Link 
          to={`/campaign/${campaign._id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
        >
          View Project
        </Link>
      </div>
    </div>
  );
}
