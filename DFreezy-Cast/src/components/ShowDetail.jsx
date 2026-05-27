import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ShowDetail.css";
import { AudioContext } from "./AudioContexts";

const API_BASE_URL = "https://podcast-api.netlify.app";

const ShowDetails = ({ addToFavorites }) => {
  const { showId } = useParams();
  const { togglePlay } = useContext(AudioContext);

  const [show, setShow] = useState(null);
  const [seasonImages, setSeasonImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);

        // Fetch show details
        const { data } = await axios.get(
          `${API_BASE_URL}/id/${showId}`
        );

        setShow(data);

        // Fetch season images
        const imageResults = await Promise.all(
          data.seasons.map(async (season) => {
            try {
              const response = await axios.get(
                `${API_BASE_URL}/seasonImage/${season.id}`
              );

              return {
                id: season.id,
                image: response.data.imageUrl,
              };
            } catch {
              return {
                id: season.id,
                image: "",
              };
            }
          })
        );

        // Convert array into object
        const imagesMap = imageResults.reduce((acc, item) => {
          acc[item.id] = item.image;
          return acc;
        }, {});

        setSeasonImages(imagesMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load show details.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  const handleFavoriteClick = (episode) => {
    addToFavorites({
      ...episode,
      showId: show?.id,
    });
  };

  if (loading) {
    return <p>Loading show details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!show) {
    return <p>No show found.</p>;
  }

  return (
    <div className="ShowDetails">
      <h2>{show.title}</h2>

      <p>
        Genres:{" "}
        {show.genres?.map((genre) => genre.title).join(", ") || "N/A"}
      </p>

      <p>
        Last Updated:{" "}
        {show.lastUpdated
          ? new Date(show.lastUpdated).toLocaleDateString()
          : "N/A"}
      </p>

      <details>
        <summary>Seasons</summary>

        {show.seasons?.map((season, index) => (
          <details key={season.id}>
            <summary>Season {index + 1}</summary>

            {seasonImages[season.id] && (
              <img
                src={seasonImages[season.id]}
                alt={`Season ${index + 1}`}
                className="SeasonImage"
              />
            )}

            <ol>
              {season.episodes?.map((episode) => (
                <li key={episode.id}>
                  <h3>{episode.title}</h3>

                  <p>{episode.description}</p>

                  <button
                    onClick={() =>
                      handleFavoriteClick({
                        ...episode,
                        seasonId: season.id,
                      })
                    }
                  >
                    Add to Favorites
                  </button>

                  <button
                    onClick={() => togglePlay(episode.audioUrl)}
                  >
                    Play
                  </button>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </details>
    </div>
  );
};

export default ShowDetails;