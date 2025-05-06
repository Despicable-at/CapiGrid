import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Isotope from 'isotope-layout';
import imagesLoaded from 'imagesloaded';
import './Home.css';

function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const masonryRef = useRef(null);
  const iso = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [campRes, statsRes] = await Promise.all([
          axios.get('/api/campaigns'),
          axios.get('/api/campaigns/stats')
        ]);
        setCampaigns(campRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!masonryRef.current) return;
    imagesLoaded(masonryRef.current, () => {
      iso.current = new Isotope(masonryRef.current, {
        itemSelector: '.masonry-item',
        layoutMode: 'masonry',
        percentPosition: true
      });
    });
    return () => iso.current && iso.current.destroy();
  }, [campaigns]);

  useEffect(() => {
    if (iso.current) {
      const filter = selectedCategory === 'All'
        ? '*'
        : `.${selectedCategory.toLowerCase().replace(/ & /g, '-')}`;
      iso.current.arrange({ filter });
    }
  }, [selectedCategory]);

  const categories = [
    { key: 'All', label: 'All', icon: '⭐' },
    { key: 'Education', label: 'Education', icon: '🎓' },
    { key: 'Design', label: 'Design', icon: '🎨' },
    { key: 'Film & Video', label: 'Film & Video', icon: '🎥' },
    { key: 'Food', label: 'Food', icon: '🍔' },
    { key: 'Games', label: 'Games', icon: '🎮' },
    { key: 'Technology', label: 'Technology', icon: '💻' }
  ];

  const slides = [
    {
      id: 1,
      title: 'Ultimate Crowdfunding WordPress Theme',
      subtitle: 'Raising Money Has Never Been Easy',
      background: '/images/slider1.jpg',
      cta: { text: 'Explore Projects', link: '/explore' }
    },
    {
      id: 2,
      title: 'Reach More. Raise More. Do More.',
      subtitle: 'Raising money has never been so easy. We are here to help your cause starting today!',
      background: '/images/slider2.jpg',
      cta: { text: 'Explore Projects', link: '/explore' }
    }
  ];

  return (
    <div className="home">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="social-icons">
          <a href="#"><i className="fab fa-facebook-f" /></a>
          <a href="#"><i className="fab fa-twitter" /></a>
          <a href="#"><i className="fab fa-instagram" /></a>
        </div>
        <div className="user-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/start-a-project">Start Project</a>
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
            <a className="search-icon" href="#"><i className="fas fa-search" /></a>
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <section className="hero">
        <div className="slider-container">
          {slides.map(slide => (
            <div key={slide.id} className="slide" style={{ backgroundImage: `url(${slide.background})` }}>
              <div className="slide-overlay" />
              <div className="slide-content">
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-subtitle">{slide.subtitle}</p>
                <a href={slide.cta.link} className="btn-primary slide-button">{slide.cta.text}</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Flip Boxes */}
      <section className="categories">
        <h2>Browse by Categories</h2>
        <p>Discover projects just for you and get great recommendations when you select your interests.</p>
        <div className="flip-box-grid">
          {categories.map(cat => (
            <div
              key={cat.key}
              className={`flip-box ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              <div className="flip-card">
                <div className="flip-front">
                  <div className="icon">{cat.icon}</div>
                  <h3>{cat.label}</h3>
                </div>
                <div className="flip-back">
                  <div className="icon">{cat.icon}</div>
                  <h3>{cat.label}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Masonry */}
      <section className="projects">
        <h2>Explore Our Projects</h2>
        <p>Discover campaigns just for you and get great recommendations when you select your interests.</p>
        <div ref={masonryRef} className="masonry-grid">
          {campaigns.map(c => (
            <div
              key={c._id}
              className={`masonry-item ${c.category.toLowerCase().replace(/ & /g, '-')}`}
            >
              {/* Project card content can go here */}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="stats-yellow">
          <div className="stats-container">
            <div className="stat-item">
              <h3>{stats.totalCampaigns}</h3>
              <p>Projects Completed</p>
            </div>
            <div className="stat-item">
              <h3>${(stats.totalRaised / 1000).toFixed(1)}k</h3>
              <p>Funds Raised</p>
            </div>
            <div className="stat-item">
              <h3>{stats.categoriesServed}</h3>
              <p>Categories Served</p>
            </div>
            <div className="stat-item">
              <h3>{stats.happyCustomers}</h3>
              <p>Happy Customers</p>
            </div>
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
          {[1, 2, 3].map(i => (
            <div key={i} className="testi-card">
              <p>“Lorem ipsum dolor sit amet, consectetur adipiscing elit...”</p>
              <h4>Jane Smith</h4>
              <p>Donor</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Green */}
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
            <a href="/start-a-project">Start Project</a>
            <a href="/profile">Profile</a>
          </div>
          <div>
            <h4>Explore</h4>
            {categories.filter(c => c.key !== 'All').map(c => (
              <a key={c.key} href={`/explore/${c.key.toLowerCase().replace(/ & /g, '-')}`}>
                {c.label}
              </a>
            ))}
          </div>
        </div>
        <div className="copyright">© 2025 Funlin. All Rights Reserved.</div>
      </section>
    </div>
  );
}

export default Home;
