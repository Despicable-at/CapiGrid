import React from 'react';

const Home = () => {
  // Sample data arrays
  const categories = [
    { 
      id: 1,
      title: "Education",
      icon: "fa-graduation-cap",
      link: "/project-category/education/"
    },
    { 
      id: 2,
      title: "Design",
      icon: "fa-dice-d20",
      link: "/project-category/design/"
    },
    { 
      id: 3,
      title: "Film & Video",
      icon: "fa-film",
      link: "/project-category/film-video/"
    }
  ];

  const slides = [
    {
      title: "Ultimate Crowdfunding WordPress Theme",
      subtitle: "Raising Money Has Never Been Easy",
      buttonText: "Explore Projects"
    },
    {
      subtitle: "Reach More. Raise More. Do More.",
      content: "Raising money has never been so easy. We are here to help your cause starting today!",
      buttonText: "Explore Projects"
    }
  ];

  return (
    <div className="home wp-singular progression-studios-page-title-center progression-studios-header-shadow">
      {/* Header Section */}
      <div id="progression-studios-header-position">
        <div id="funlin-progression-header-top" className="on-pro">
          <div id="progression-studios-header-top-border-bottom">
            <div className="width-container-pro">
              <div className="progression-studios-header-left">
                <ul className="progression-studios-header-social-icons">
                  <li><a href="https://www.facebook.com/progressionstudios/" target="_blank" rel="noopener noreferrer" className="progression-studios-facebook"><i className="fab fa-facebook-f"></i></a></li>
                  <li><a href="https://twitter.com/progression_S" target="_blank" rel="noopener noreferrer" className="progression-studios-twitter"><i className="fab fa-twitter"></i></a></li>
                  <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="progression-studios-instagram"><i className="fab fa-instagram"></i></a></li>
                  <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="progression-studios-pinterest"><i className="fab fa-pinterest"></i></a></li>
                </ul>
              </div>

              <div className="progression-studios-header-right">
                <ul className="sf-menu">
                  <li><a href="/dashboard/"><i className="fas fa-user-circle"></i>Dashboard</a></li>
                  <li><a href="/start-a-project/"><i className="far fa-file-alt"></i>Start a Project</a></li>
                  <li><a href="/logout/"><i className="fas fa-sign-out-alt"></i>Logout</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div id="progression-studios-header-width">
          <header id="masthead-pro" className="progression-studios-site-header">
            <div id="logo-nav-pro">
              <div className="width-container-pro progression-studios-logo-container">
                <div id="logo-pro">
                  <a href="/">
                    <img src="https://funlin.progressionstudios.com/wp-content/themes/funlin-progression/images/logo.png" alt="Funlin" />
                  </a>
                </div>

                <nav id="site-navigation" className="main-navigation">
                  <ul className="sf-menu">
                    <li><a href="/">Home</a></li>
                    <li className="menu-item-has-children">
                      <a href="/explore/">Explore</a>
                      <ul className="sub-menu">
                        <li><a href="/project-category/education/"><i className="fas fa-graduation-cap"></i>Education</a></li>
                        <li><a href="/project-category/film-video/"><i className="fas fa-film"></i>Film & Video</a></li>
                        <li><a href="/project-category/food/"><i className="fas fa-utensils"></i>Food</a></li>
                        <li><a href="/project-category/games/"><i className="fas fa-gamepad"></i>Games</a></li>
                        <li><a href="/project-category/technology/"><i className="fas fa-cloud-download-alt"></i>Technology</a></li>
                      </ul>
                    </li>
                    <li><a href="/news/">News</a></li>
                    <li><a href="/contact/">Contact</a></li>
                  </ul>
                </nav>

                <div id="progression-studios-header-search-icon">
                  <form className="search-form">
                    <input type="search" placeholder="Search Projects..." />
                    <button type="submit">Search</button>
                  </form>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Main Content Sections */}
      <div id="content-pro">
        <div className="width-container-pro">
          {/* Hero Slider */}
          <section className="elementor-section">
            <div className="elementor-container">
              <div className="elementor-column">
                <div className="boosted-elements-slider-loader-height">
                  <div className="boosted-elements-progression-slider-container">
                    <div className="boosted-elements-slider-main">
                      <ul className="boosted-elements-slides">
                        {slides.map((slide, index) => (
                          <li key={index} className="bosted_animate_out">
                            <div className="boosted-elements-slider-background">
                              <div className="boosted-elements-slider-display-table">
                                <div className="boosted-elements-slider-content-container">
                                  <div className="boosted-elements-slider-content">
                                    <div className="bosted-element-content-margin">
                                      {slide.title && <h2 className="boosted-elements-slide-title"><span>{slide.title}</span></h2>}
                                      <div className="boosted-elements-slide-sub-title">
                                        <span>{slide.subtitle}</span>
                                      </div>
                                      {slide.content && <div className="boosted-elements-slide-content"><span>{slide.content}</span></div>}
                                      <a href="/explore/" className="boosted-elements-slide-button-main">
                                        {slide.buttonText}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                <div className="boosted-elements-slider-gradient-overlay"></div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="elementor-section">
            <div className="elementor-container">
              <div className="elementor-column">
                <h2 className="elementor-heading-title">Browse by Categories</h2>
                <p>Discover projects just for you and get great recommendations when you select your interests.</p>
                
                <div className="elementor-container elementor-column-gap-default">
                  {categories.map(category => (
                    <div key={category.id} className="elementor-column">
                      <div className="boosted-elements-progression-flip-box-container">
                        <a href={category.link}>
                          <div className="boosted-elements-flip-box-flip-card">
                            <div className="boosted-elements-flip-box-front-container">
                              <div className="boosted-elements-slider-display-table">
                                <div className="boosted-elements-flip-box-vertical-align">
                                  <div className="boosted-elements-flip-box-padding">
                                    <div className="boosted-elements-flip-box-icon-image">
                                      <i className={`fas ${category.icon}`}></i>
                                    </div>
                                    <h2 className="boosted-elements-flip-box-heading">
                                      <span>{category.title}</span>
                                    </h2>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="boosted-elements-flip-box-rear-container">
                              <div className="boosted-elements-slider-display-table">
                                <div className="boosted-elements-flip-box-vertical-align">
                                  <div className="boosted-elements-flip-box-padding">
                                    <div className="boosted-elements-flip-box-icon-image">
                                      <i className={`fas ${category.icon}`}></i>
                                    </div>
                                    <h2 className="boosted-elements-flip-box-heading">
                                      <span>{category.title}</span>
                                    </h2>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
