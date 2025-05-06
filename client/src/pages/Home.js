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
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { key: 'Education', label: 'Education', icon: '🎓' },
    { key: 'Design',    label: 'Design',    icon: '🎨' },
    { key: 'Film & Video', label: 'Film & Video', icon: '🎥' },
    { key: 'Food',      label: 'Food',      icon: '🍔' },
    { key: 'Games',     label: 'Games',     icon: '🎮' },
    { key: 'Technology', label: 'Technology', icon: '💻' }
  ];

  const filtered = selectedCategory === 'All'
    ? campaigns
    : campaigns.filter(c => c.category === selectedCategory);

  return (
    <div className="home">

      {/* Top-bar social links */}
      <div className="top-bar">
        <div className="social-icons">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
        <div className="user-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/start">Start Project</a>
          <a href="/login">Login</a>
        </div>
      </div>

      {/* Navbar */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo">Funlin</div>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/explore">Explore</a>
            <a href="/pages">Pages</a>
            <a href="/news">News</a>
            <a href="/contact">Contact</a>
            <a className="search-icon" href="#"><i className="fas fa-search"></i></a>
          </div>
        </div>
      </nav>

      {/* Hero Slider (static single slide) */}
      <section className="hero">
        <div className="hero-slide">
          <img src="/images/hero-bg.jpg" alt="Hero" className="hero-bg" />
          <div className="hero-content">
            <h1>Reach More.<br/>Raise More.<br/>Do More.</h1>
            <p>Raising money has never been so easy. We're here to help your cause starting today!</p>
            <button className="btn-primary">Explore Projects</button>
          </div>
          <button className="hero-prev">&larr;</button>
          <button className="hero-next">&rarr;</button>
        </div>
      </section>

      {/* Browse by Categories */}
      <section className="categories">
        <h2>Browse by Categories</h2>
        <p>Discover projects in the categories you love. Select your interest:</p>
        <div className="category-grid">
          <div className={`category all ${selectedCategory==='All'?'active':''}`} onClick={()=>setSelectedCategory('All')}>
            <i className="fas fa-star"></i> All
          </div>
          {categories.map(cat => (
            <div key={cat.key}
                 className={`category ${selectedCategory===cat.key?'active':''}`}
                 onClick={()=>setSelectedCategory(cat.key)}>
              <span className="cat-icon">{cat.icon}</span> {cat.label}
            </div>
          ))}
        </div>
      </section>

      {/* Explore Our Projects */}
      <section className="projects">
        <h2>Explore Our Projects</h2>
        <p>Discover campaigns tailored for you and get recommendations based on your interests.</p>
        <div className="project-grid">
          {filtered.map(c => (
            <div key={c._id} className="project-card">
              <div className="ribbon">{c.status==='active'?'Active':c.status}</div>
              <div className="project-img" style={{backgroundImage:`url(${c.imageUrl})`}} />
              <div className="project-info">
                <div className="author">
                  <img src={c.creator.avatarUrl||'/images/avatar.png'} alt="avatar"/>
                  <span>{c.creator.name||'Unknown'}</span>
                </div>
                <h3>{c.title}</h3>
                <div className="progress-bar">
                  <div className="progress" style={{width:`${(c.pledged/c.goal)*100}%`}} />
                </div>
                <div className="stats-row">
                  <span>${c.pledged.toLocaleString()}</span>
                  <span>${c.goal.toLocaleString()}</span>
                </div>
                <div className="meta-row">
                  <span>{c.backers} Backers</span>
                  <span>{c.daysRemaining} Days Left</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-secondary">More Projects</button>
      </section>

      {/* Stats counters */}
      {stats && (
        <section className="stats-yellow">
          <div className="stats-container">
            <div className="stat-item"><h3>{stats.totalCampaigns}</h3><p>Projects Completed</p></div>
            <div className="stat-item"><h3>${(stats.totalRaised/1000).toFixed(1)}k</h3><p>Funds Raised</p></div>
            <div className="stat-item"><h3>{stats.categoriesServed}</h3><p>Categories Served</p></div>
            <div className="stat-item"><h3>{stats.happyCustomers}</h3><p>Happy Customers</p></div>
          </div>
        </section>
      )}

      {/* Concept to Market */}
      <section className="concept-market">
        <div className="text-block">
          <h2>We Help at Every Step from Concept to Market</h2>
          <p>Discover projects that support every stage of your fundraising journey.</p>
          <ul>
            <li>Brainstorm with our expert campaigners</li>
            <li>Extend your campaign with on-demand support</li>
            <li>Fast track to the global market</li>
          </ul>
          <button className="btn-primary">All the Right Experts to Help Your Business</button>
        </div>
        <div className="image-block">
          <img src="/images/concept.jpg" alt="Concept to Market" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Our Testimonials</h2>
        <p>Discover what our users say about their experience.</p>
        <div className="testi-grid">
          {[1,2,3].map(i=>(
            <div key={i} className="testi-card">
              <p>“Lorem ipsum dolor sit amet, consectetur adipiscing elit...”</p>
              <h4>Jane Smith</h4>
              <p>Donor</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA green */}
      <section className="cta-green">
        <h2>Your Story Starts Here</h2>
        <p>Find a cause you believe in and make great things happen.</p>
        <button className="btn-primary">Start a Project</button>
      </section>

      {/* Newsletter + Footer */}
      <section className="newsletter-footer">
        <div className="newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to get latest updates and news.</p>
          <input type="email" placeholder="Enter your email" />
          <button>Sign Up</button>
        </div>
        <div className="footer-links">
          <div>
            <h4>Get Started</h4>
            <a href="/news">News</a>
            <a href="/pages">Pages</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
          <div>
            <h4>Dashboard</h4>
            <a href="/dashboard">Dashboard</a>
            <a href="/start">Start Project</a>
            <a href="/profile">Profile</a>
          </div>
          <div>
            <h4>Explore</h4>
            {categories.map(c=><a key={c.key} href={`/explore/${c.key.toLowerCase()}`}>{c.label}</a>)}
          </div>
        </div>
        <div className="copyright">© 2025 Funlin. All Rights Reserved.</div>
      </section>

    </div>
  );
}

export default Home;
