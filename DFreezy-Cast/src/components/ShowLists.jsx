import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ShowList.css';

const API_BASE_URL = 'https://podcast-api.netlify.app';
const GENRE_IDS = {
  1: 'Personal Growth',
  2: 'Investigative Journalism',
  3: 'History',
  4: 'Comedy',
  5: 'Entertainment',
  6: 'Business',
  7: 'Fiction',
  8: 'News',
  9: 'Kids and Family'
};

const ShowList = ({ addToFavorites }) => {
  const [shows, setShows] = useState([]); // State to hold list of shows
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [sortBy, setSortBy] = useState('title'); // State for sorting criteria
  const [sortDirection, setSortDirection] = useState('asc'); // State for sorting direction
  const [filterText, setFilterText] = useState(''); // State for filtering text
  const [descriptions, setDescriptions] = useState({}); // State to hold show descriptions

  useEffect(() => {
    // Effect to fetch shows and descriptions from API on component mount
    const fetchShows = async () => {
      try {
        const showsResponse = await axios.get(`${API_BASE_URL}/shows`);
        setShows(showsResponse.data); // Set shows state with fetched data
        setLoading(false); // Set loading to false after data is fetched

        // Fetch descriptions for each show
        const descriptionsResponse = await axios.get(`${API_BASE_URL}/descriptions`);
        const descriptionsMap = descriptionsResponse.data.reduce((acc, cur) => {
          acc[cur.id] = cur.description;
          return acc;
        }, {});
        setDescriptions(descriptionsMap); // Set descriptions state
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchShows(); // Invoke fetchShows function on component mount
  }, []);

  const handleSortChange = (e) => {
    const { value } = e.target;
    if (value === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); // Toggle sort direction if same criteria selected
    } else {
      setSortBy(value); // Set new sort criteria
      setSortDirection('asc'); // Reset sort direction to ascending
    }
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value); // Update filter text state on input change
  };

  // Function to filter and sort shows based on current criteria
  const filteredAndSortedShows = [...shows]
    .filter((show) =>
      show.title.toLowerCase().includes(filterText.toLowerCase()) // Filter shows by title based on filterText
    )
    .sort((a, b) => {
      // Sort shows based on sortBy and sortDirection
      if (sortBy === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'titleDesc') {
        return sortDirection === 'asc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      } else if (sortBy === 'updated') {
        return sortDirection === 'asc'
          ? new Date(a.updated) - new Date(b.updated)
          : new Date(b.updated) - new Date(a.updated);
      } else if (sortBy === 'updatedDesc') {
        return sortDirection === 'asc'
          ? new Date(b.updated) - new Date(a.updated)
          : new Date(a.updated) - new Date(b.updated);
      }
      return a.title.localeCompare(b.title); // Default to sort by title
    });

  // Slider settings for react-slick carousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(5, filteredAndSortedShows.length), // Show maximum of 5 slides or the number of shows available
    slidesToScroll: 1,
    autoplay: true, // Enable automatic sliding
    autoplaySpeed: 500, // Time between slides (in milliseconds)
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, filteredAndSortedShows.length),
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, filteredAndSortedShows.length),
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <div className="ShowList">
      <div className="carousel-container">
        <Slider {...sliderSettings}>
          {filteredAndSortedShows.map((show) => (
            <div key={show.id}>
              <Link to={`/shows/${show.id}`} className="CarouselCard">
                <img src={show.image} alt={show.title} className="CarouselImage" />
                <div className="CarouselDetails">
                  <h3>{show.title}</h3>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter shows..."
          value={filterText}
          onChange={handleFilterChange}
        />
        <select value={sortBy} onChange={handleSortChange}>
          <option value="title">Sort by Title A-Z</option>
          <option value="titleDesc">Sort by Title Z-A</option>
          <option value="updated">Sort by Newest Updated</option>
          <option value="updatedDesc">Sort by Furthest Back Updated</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="ShowGrid">
          {filteredAndSortedShows.map((show) => (
            <Link to={`/shows/${show.id}`} className="ShowCard" key={show.id}>
              <img src={show.image} alt={show.title} className="ShowImage" />
              <div className="ShowDetails">
                <h3>{show.title}</h3>
                <p>Seasons: {show.seasons}</p>
                <p>
  Genres:{" "}
  {show.genres
    ?.map((id) => GENRE_IDS[id])
    .join(", ")}
</p>
                <p>
                  Last Updated:{' '}
                  {show.updated
                    ? new Date(show.updated).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p>Description: {descriptions[show.id]}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowList;
