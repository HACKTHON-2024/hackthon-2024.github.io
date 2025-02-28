import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function Home() {
  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  };

  return (
    <div className="font-sans text-gray-200 bg-black">
      {/* Header */}
      <header className="site-header fixed top-0 left-0 w-full h-16 bg-white bg-opacity-90 backdrop-blur-md shadow-lg z-50 flex justify-between items-center px-6">
        {/* Logo Section (Left Side) */}
        <div className="logo-container flex items-center gap-4">
          <img src="logo.png" alt="Logo" className="logo-img w-10 h-10 border-2 border-green-600 rounded-full" />
          <div className="logo-text flex flex-col">
            <span className="brand-name text-xl font-bold text-green-600">LabourField</span>
            <span className="tagline text-sm text-gray-600">Connecting Farms & Labor</span>
          </div>
        </div>
        {/* Hamburger Menu Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-black focus:outline-none">
            <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'} text-2xl`} />
          </button>
        </div>
        {/* Navigation for larger screens */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {[
              { href: "#home", icon: "home", label: "Home" },
              { href: "#team_section", icon: "info-circle", label: "About Us" },
              { href: "#features", icon: "tractor", label: "Services" },
              { href: "#help-support", icon: "headset", label: "Help & Support" },
            ].map((item, index) => (
              <motion.li
                key={index}
                className="nav-item"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a href={item.href} className="nav-link flex items-center gap-2 text-black hover:text-green-800 hover:underline transition">
                  <i className={`fas fa-${item.icon}`} />
                  <span>{item.label}</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Sidebar Navigation */}
      <nav className={`fixed top-16 left-0 h-full w-64 bg-white bg-opacity-90 backdrop-blur-md shadow-lg z-40 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <ul className="flex flex-col items-start p-4">
          {[
            { href: "#home", icon: "home", label: "Home" },
            { href: "#team_section", icon: "info-circle", label: "About Us" },
            { href: "#features", icon: "tractor", label: "Services" },
            { href: "#help-support", icon: "headset", label: "Help & Support" },
          ].map((item, index) => (
            <motion.li
              key={index}
              className="nav-item mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a href={item.href} className="nav-link flex items-center gap-2 text-black hover:text-green-800 hover:underline transition">
                <i className={`fas fa-${item.icon}`} />
                <span>{item.label}</span>
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Overlay for the sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-30" onClick={toggleMenu}></div>
      )}

      {/* Hero Section */}
      <section className="hero relative flex items-center justify-center text-center h-screen bg-cover bg-center" 
  style={{ backgroundImage: "url('background.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50" style={{opacity: 0.5}}></div>
        <div className="relative z-10 p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">Connecting Landlords & Laborers</h1>
          <p className="text-lg md:text-xl text-green-100 mb-8">Find the right labor for your needs or post your job requirements and get help in no time.</p>
          <div className="space-x-4">
            <a href="#" className="bg-white text-green-600 px-6 py-3 rounded-full shadow-lg hover:bg-green-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105">
              Sign up
            </a>
            <a href="#" className="bg-white text-green-600 px-6 py-3 rounded-full shadow-lg hover:bg-green-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105">
              Log In
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features bg-white py-16 px-4" id="features">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="text-center">
            <i className="fas fa-file-alt mx-auto mb-4 text-3xl text-green-600"></i>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Easy Job Posting</h3>
            <p className="mt-2 text-gray-600">Post jobs quickly and easily with our user-friendly interface.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-users mx-auto mb-4 text-3xl text-green-600"></i>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Wide Labor Network</h3>
            <p className="mt-2 text-gray-600">Access a large network of laborers across various fields and locations.</p>
          </div>
          <div className="text-center">
            <i className="fas fa-check-circle mx-auto mb-4 text-3xl text-green-600"></i>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Instant Confirmations</h3>
            <p className="mt-2 text-gray-600">Get quick confirmations on job applications and availability.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section bg-black-600 py-16 px-4">
        <h2 className="text-center text-3xl font-bold text-white" id="service">Our Services</h2>
        <div className="mt-8 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { icon: 'briefcase', title: 'Active Jobs', link: '#' },
            { icon: 'list', title: 'Job Listings', link: '#' },
            { icon: 'user-check', title: 'Labour Request', link: '#' },
          ].map((service, index) => (
            <a href={service.link} key={index} className="block">
              <motion.div
                className="bg-white text-green-600 p-6 rounded-lg shadow-lg text-center hover:bg-green-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <i className={`fas fa-${service.icon} mx-auto mb-4 text-4xl`}></i>
                <h3 className="text-xl font-semibold">{service.title}</h3>
              </motion.div>
            </a>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <div className="bg-white py-16 px-4" id="team_section">
        <center>
          <p className="text-4xl font-bold text-gray-800 mb-8">We're the Creators</p>
        </center>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Muthu Manickam M',
              imgSrc: 'https://labourfieldtest.onrender.com/frontend/static/Images/Manickam.jpg',
              quote: 'The future of agriculture is not about growing more but about growing better.',
              link: 'https://www.linkedin.com/in/muthu-manickam-m-1bba17257/',
              borderColor: 'border-green-600',
            },
            {
              name: 'Melvin Jones P',
              imgSrc: 'https://labourfieldtest.onrender.com/frontend/static/Images/melvin.jpg',
              quote: 'The greatest threat to our planet is the belief that someone else will save it.',
              link: '#',
              borderColor: 'border-blue-600',
            },
            {
              name: 'Jothika R M',
              imgSrc: 'https://labourfieldtest.onrender.com/frontend/static/Images/jothika.jpg',
              quote: 'We must plant the seeds of change, and nurture them daily through our actions and choices.',
              link: '#',
              borderColor: 'border-purple-600',
            },
          ].map((creator, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-lg border-2 ${creator.borderColor} shadow-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl flex flex-col justify-between`}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <motion.img
                src={creator.imgSrc}
                alt={creator.name}
                className="mx-auto rounded-full h-32 w-32 mb-4 transition duration-300 ease-in-out hover:scale-110"
                whileHover={{ scale: 1.1 }}
              />
              <div className="mt-4 text-xl font-semibold text-gray-800">{creator.name}</div>
              <p className="mt-2 text-gray-600">{`"${creator.quote}"`}</p>
              <div className="mt-auto">
                <a href={creator.link} target="_blank" rel="noopener noreferrer">
                  <button className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105">
                    Follow +
                  </button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Help & Support Section */}
      <section id="help-support" className="bg-black-600 py-16 px-4">
        <h2 className="text-center text-3xl font-bold text-white">Help & Support</h2>
        <p className="text-center text-green-100 mt-4">If you have any questions or need assistance, feel free to contact us using the form below:</p>
        <form className="max-w-2xl mx-auto mt-8 space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-green-100">Name:</label>
            <input type="text" id="name" name="name" placeholder="Your Name" required className="p-2 rounded bg-white text-black" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-green-100">Email:</label>
            <input type="email" id="email" name="email" placeholder="Your Email" required className="p-2 rounded bg-white text-black" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="subject" className="text-green-100">Subject:</label>
            <input type="text" id="subject" name="subject" placeholder="Subject" required className="p-2 rounded bg-white text-black" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="message" className="text-green-100">Message:</label>
            <textarea id="message" name="message" rows="5" placeholder="How can we assist you?" required className="p-2 rounded bg-white text-black"></textarea>
          </div>
          <button type="submit" className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-700 hover:text-white transition duration-300 ease-in-out transform hover:scale-105">
            Submit
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-black">
        <p>&copy; 2024 LabourField. All rights reserved. <a href="#" className="text-green-600 hover:underline">Privacy Policy</a></p>
      </footer>
    </div>
  );
}

export default Home;