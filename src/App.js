import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'education', 'experience', 'certifications', 'projects', 'skills', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false); // Close menu on mobile after clicking
    }
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <i className="fas fa-user-md"></i> OT
          </div>
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </button>
          {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>}
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className={activeSection === 'home' ? 'active' : ''}>Home</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className={activeSection === 'about' ? 'active' : ''}>About</a></li>
            <li><a href="#education" onClick={(e) => { e.preventDefault(); scrollToSection('education'); }} className={activeSection === 'education' ? 'active' : ''}>Education</a></li>
            <li><a href="#experience" onClick={(e) => { e.preventDefault(); scrollToSection('experience'); }} className={activeSection === 'experience' ? 'active' : ''}>Experience</a></li>
            <li><a href="#certifications" onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); }} className={activeSection === 'certifications' ? 'active' : ''}>Certifications</a></li>
            <li><a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }} className={activeSection === 'projects' ? 'active' : ''}>Projects</a></li>
            <li><a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }} className={activeSection === 'skills' ? 'active' : ''}>Skills</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={activeSection === 'contact' ? 'active' : ''}>Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="greeting">Hello, I'm</span>
              <span className="name">OM TANDON</span>
            </h1>
            <p className="hero-subtitle">PharmD Student | University of Toronto | Future Pharmacist</p>
            <p className="hero-description">
              Passionate about pharmaceutical care, patient counseling, and advancing healthcare through evidence-based practice. 
              Dedicated to community service, leadership, and mentoring the next generation.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => scrollToSection('contact')}>
                <i className="fas fa-envelope"></i> Get In Touch
              </button>
              <button className="btn btn-secondary" onClick={() => scrollToSection('projects')}>
                <i className="fas fa-briefcase"></i> View Work
              </button>
            </div>
            <div className="social-links">
              <a href="https://linkedin.com/in/omtandon" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
              <a href="mailto:email@example.com" aria-label="Email"><i className="fas fa-envelope"></i></a>
            </div>
          </div>
          <div className="hero-image">
            <div className="profile-image-container">
              <img 
                src={process.env.PUBLIC_URL + '/profile-photo.jpg'} 
                alt="OM TANDON - PharmD Student"
                className="profile-photo"
                onError={(e) => {
                  // Try alternative image formats
                  const img = e.target;
                  const formats = ['/profile-photo.png', '/profile-photo.jpeg', '/profile-photo.webp'];
                  const currentSrc = img.src;
                  const basePath = process.env.PUBLIC_URL || '';
                  
                  // Check if we've tried all formats
                  const triedFormat = formats.find(f => currentSrc.includes(f));
                  if (triedFormat) {
                    const nextIndex = formats.indexOf(triedFormat) + 1;
                    if (nextIndex < formats.length) {
                      img.src = basePath + formats[nextIndex];
                      return;
                    }
                  } else if (!currentSrc.includes('/profile-photo')) {
                    // First error, try png
                    img.src = basePath + '/profile-photo.png';
                    return;
                  }
                  
                  // All formats failed, show placeholder
                  img.style.display = 'none';
                  const placeholder = img.nextElementSibling;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
              <div className="image-placeholder" style={{display: 'none'}}>
                <i className="fas fa-user-md"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-user"></i> About Me
          </h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I am a dedicated Doctor of Pharmacy (PharmD) candidate at the Leslie Dan Faculty of Pharmacy, University of Toronto, 
                with a strong foundation in Biomedical Science from York University. My journey in pharmacy has been driven by a 
                commitment to excellence in patient care, community service, and leadership.
              </p>
              <p>
                Beyond academics, I am passionate about mentoring and coaching. As an Assistant Coach at Vellore Woods Public School, 
                I mentor junior athletes in basketball and volleyball, developing their leadership and teamwork skills. I also hold a 
                Karate Black Belt (2018) and am actively involved in community outreach through World Vision and Run for Vaughan initiatives.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <i className="fas fa-graduation-cap"></i>
                  <h3>PharmD</h3>
                  <p>Candidate</p>
                </div>
                <div className="stat-item">
                  <i className="fas fa-certificate"></i>
                  <h3>BSc (Honours)</h3>
                  <p>Biomedical Science</p>
                </div>
                <div className="stat-item">
                  <i className="fas fa-trophy"></i>
                  <h3>Black Belt</h3>
                  <p>Karate (2018)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-graduation-cap"></i> Education
          </h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-icon">
                <i className="fas fa-university"></i>
              </div>
              <div className="timeline-content">
                <h3>Doctor of Pharmacy (PharmD)</h3>
                <h4>Leslie Dan Faculty of Pharmacy, University of Toronto</h4>
                <span className="timeline-date"><i className="far fa-calendar"></i> Expected: 20XX</span>
                <p><strong>Status:</strong> Candidate</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="timeline-content">
                <h3>BSc (Honours) - Biomedical Science</h3>
                <h4>York University</h4>
                <span className="timeline-date"><i className="far fa-calendar"></i> Graduated: 20XX</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon">
                <i className="fas fa-school"></i>
              </div>
              <div className="timeline-content">
                <h3>High School Diploma</h3>
                <h4>Tommy Douglas High School</h4>
                <span className="timeline-date"><i className="far fa-calendar"></i> Ontario Scholar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-briefcase"></i> Experience
          </h2>
          <div className="experience-grid">
            <div className="experience-card">
              <div className="card-icon">
                <i className="fas fa-basketball-ball"></i>
              </div>
              <h3>Assistant Coach</h3>
              <h4>Vellore Woods Public School - Canada</h4>
              <span className="card-date"><i className="far fa-calendar"></i> Basketball & Volleyball</span>
              <ul>
                <li>Mentored junior athletes in basketball and volleyball</li>
                <li>Developed leadership and teamwork skills in student athletes</li>
                <li>Created training programs and strategies to enhance team performance</li>
                <li>Fostered a positive and supportive team environment</li>
              </ul>
            </div>
            <div className="experience-card">
              <div className="card-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3>Communications Coordinator</h3>
              <h4>World Vision (York University Chapter)</h4>
              <span className="card-date"><i className="far fa-calendar"></i> Volunteer Position</span>
              <ul>
                <li>Supported campus outreach and awareness campaigns</li>
                <li>Enhanced student engagement through strategic communications</li>
                <li>Organized events to raise awareness for global causes</li>
                <li>Managed social media and promotional materials</li>
              </ul>
            </div>
            <div className="experience-card">
              <div className="card-icon">
                <i className="fas fa-running"></i>
              </div>
              <h3>Youth Outreach Committee Member</h3>
              <h4>Run for Vaughan</h4>
              <span className="card-date"><i className="far fa-calendar"></i> Volunteer Position</span>
              <ul>
                <li>Contributed to organizing community events promoting health, fitness, and charity</li>
                <li>Engaged with youth to promote active lifestyles</li>
                <li>Supported fundraising initiatives for charitable causes</li>
                <li>Coordinated volunteer activities and event logistics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-certificate"></i> Certifications
          </h2>
          <div className="certifications-grid">
            <div className="certification-card">
              <div className="cert-icon">
                <i className="fas fa-syringe"></i>
              </div>
              <h3>Ontario Injection Training</h3>
              <p>Certified to administer injections in Ontario</p>
            </div>
            <div className="certification-card">
              <div className="cert-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3>CPR & First Aid</h3>
              <p>Certified in Cardiopulmonary Resuscitation and First Aid</p>
            </div>
            <div className="certification-card">
              <div className="cert-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Karate Black Belt</h3>
              <p>Achieved Black Belt in Karate (2018)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-flask"></i> Projects & Research
          </h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <h3>High School Community Service Award</h3>
              <p>Recognized for outstanding commitment to community involvement and service. Demonstrated leadership and dedication to making a positive impact in the community.</p>
              <div className="project-tags">
                <span>Leadership</span>
                <span>Community Service</span>
                <span>Award</span>
              </div>
            </div>
            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Student Mentorship Program</h3>
              <p>Developed and implemented mentorship programs for junior athletes, focusing on leadership development, teamwork, and personal growth through sports.</p>
              <div className="project-tags">
                <span>Mentorship</span>
                <span>Leadership</span>
                <span>Youth Development</span>
              </div>
            </div>
            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Community Health & Wellness Initiatives</h3>
              <p>Organized and participated in community events promoting health, fitness, and wellness through Run for Vaughan and World Vision initiatives.</p>
              <div className="project-tags">
                <span>Community Health</span>
                <span>Wellness</span>
                <span>Outreach</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-tools"></i> Skills
          </h2>
          <div className="skills-container">
            <div className="skill-category">
              <h3><i className="fas fa-pills"></i> Pharmacy Skills</h3>
              <div className="skills-grid">
                <div className="skill-item">PharmD Candidate</div>
                <div className="skill-item">Biomedical Science</div>
                <div className="skill-item">Ontario Injection Training</div>
                <div className="skill-item">CPR & First Aid</div>
                <div className="skill-item">Patient Care</div>
                <div className="skill-item">Medication Management</div>
              </div>
            </div>
            <div className="skill-category">
              <h3><i className="fas fa-users"></i> Leadership & Coaching</h3>
              <div className="skills-grid">
                <div className="skill-item">Athletic Coaching</div>
                <div className="skill-item">Mentorship</div>
                <div className="skill-item">Team Leadership</div>
                <div className="skill-item">Communication</div>
                <div className="skill-item">Youth Development</div>
                <div className="skill-item">Event Organization</div>
              </div>
            </div>
            <div className="skill-category">
              <h3><i className="fas fa-heart"></i> Interests & Activities</h3>
              <div className="skills-grid">
                <div className="skill-item">Health & Wellness</div>
                <div className="skill-item">Basketball</div>
                <div className="skill-item">Volleyball</div>
                <div className="skill-item">Soccer</div>
                <div className="skill-item">Martial Arts</div>
                <div className="skill-item">Karate Black Belt</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-envelope"></i> Get In Touch
          </h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <i className="fab fa-linkedin"></i>
                <div>
                  <h3>LinkedIn</h3>
                  <p><a href="https://linkedin.com/in/omtandon" target="_blank" rel="noopener noreferrer" style={{color: '#2c5aa0', textDecoration: 'none'}}>linkedin.com/in/omtandon</a></p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Location</h3>
                  <p>Toronto, Ontario, Canada</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-university"></i>
                <div>
                  <h3>Education</h3>
                  <p>Leslie Dan Faculty of Pharmacy<br />University of Toronto</p>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Subject" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Your Message" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 OM TANDON. All rights reserved.</p>
          <div className="footer-social">
            <a href="https://linkedin.com/in/omtandon" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
            <a href="mailto:email@example.com" aria-label="Email"><i className="fas fa-envelope"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
