import React from 'react';
import './src/Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="overlay">
          <h1>Reach More.<br />Raise More.<br />Do More.</h1>
          <p>Raising money has never been so easy. We're here to help your cause starting today.</p>
          <button>Explore Projects</button>
        </div>
      </section>

      <section className="categories">
        <h2>Browse by Categories</h2>
        <div className="category-grid">
          <div className="category">🎓 Education</div>
          <div className="category">🎨 Design</div>
          <div className="category">🎥 Film & Video</div>
          <div className="category">🍔 Food</div>
          <div className="category">🎮 Games</div>
          <div className="category">💻 Technology</div>
        </div>
      </section>

      <section className="projects">
        <h2>Explore Our Projects</h2>
        <div className="project-grid">
          <div className="project-card">Project 1</div>
          <div className="project-card">Project 2</div>
          <div className="project-card">Project 3</div>
          <div className="project-card">Project 4</div>
        </div>
      </section>

      <section className="stats">
        <div>0k+ Projects</div>
        <div>0k+ Raised Funds</div>
        <div>0k+ Campaigns</div>
        <div>0k+ Happy Customers</div>
      </section>

      <section className="footer">
        <h2>Your Story Starts Here</h2>
        <button>Start a Project</button>
      </section>
    </div>
  );
}

export default Home;
