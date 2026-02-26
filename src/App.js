import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://swapi.dev/api/people/";

function App() {
  const [characters, setCharacters] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [homeworld, setHomeworld] = useState(null);

  // Fetch character image using SWAPI character ID
  // Uses multiple image sources with SWAPI character ID mapping
  const fetchCharacterImage = async (characterUrl) => {
    try {
      const id = getIdFromUrl(characterUrl);
      
      // Try starwars-visualguide.com first (most relevant)
      let imageUrl = `https://starwars-visualguide.com/assets/img/characters/${id}.jpg`;
      let response = await fetch(imageUrl, { method: "HEAD" });
      if (response.ok) return imageUrl;
      
      // Fallback: Use Picsum with character ID for consistent images
      imageUrl = `https://picsum.photos/seed/starwars${id}/300/400`;
      response = await fetch(imageUrl, { method: "HEAD" });
      if (response.ok) return imageUrl;
      
    } catch (err) {
      console.error("Error fetching image:", err);
    }

    return null;
  };

  const fetchCharacters = async (url = API_URL) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(url);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();

      // Fetch images for each character
      const charactersWithImages = await Promise.all(
        data.results.map(async (char) => {
          const imageUrl = await fetchCharacterImage(char.url);
          return { ...char, imageUrl };
        })
      );

      setCharacters(charactersWithImages);
      setNextPage(data.next);
      setPrevPage(data.previous);
    } catch (err) {
      setError("Failed to fetch characters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  // Extract ID from SWAPI URL (matching swapi-gallery approach)
  const getIdFromUrl = (url) => {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1];
  };

  const openModal = async (character) => {
    setSelectedCharacter(character);
    const res = await fetch(character.homeworld);
    const data = await res.json();
    setHomeworld(data);
  };

  const closeModal = () => {
    setSelectedCharacter(null);
    setHomeworld(null);
  };

  return (
    <div className="container">
      <h1>Star Wars Characters</h1>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading characters...</p>
        </div>
      )}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {characters.map((char) => {
          return (
            <div
              key={char.url}
              className="card"
              onClick={() => openModal(char)}
            >
              <div className="card-image-wrapper">
                <img
                  src={
                    char.imageUrl ||
                    "https://via.placeholder.com/200x300/1a1a1a/00ffcc?text=" +
                      encodeURIComponent(char.name)
                  }
                  alt={char.name}
                  loading="lazy"
                  className="card-image"
                />
              </div>
              <h3>{char.name}</h3>
            </div>
          );
        })}
      </div>

      <div className="pagination">
        <button disabled={!prevPage} onClick={() => fetchCharacters(prevPage)}>
          Previous
        </button>
        <button disabled={!nextPage} onClick={() => fetchCharacters(nextPage)}>
          Next
        </button>
      </div>

      {selectedCharacter && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {selectedCharacter.imageUrl && (
              <img
                src={selectedCharacter.imageUrl}
                alt={selectedCharacter.name}
                className="modal-image"
              />
            )}
            <h2>{selectedCharacter.name}</h2>
            <div className="modal-content">
              <p>
                <strong>Height:</strong>{" "}
                {(selectedCharacter.height / 100).toFixed(2)} m
              </p>
              <p>
                <strong>Mass:</strong> {selectedCharacter.mass} kg
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(selectedCharacter.created).toLocaleDateString(
                  "en-GB"
                )}
              </p>
              <p>
                <strong>Films:</strong> {selectedCharacter.films.length}
              </p>
              <p>
                <strong>Birth Year:</strong> {selectedCharacter.birth_year}
              </p>

              {homeworld && (
                <div className="homeworld-info">
                  <h3>Homeworld</h3>
                  <p>
                    <strong>Name:</strong> {homeworld.name}
                  </p>
                  <p>
                    <strong>Terrain:</strong> {homeworld.terrain}
                  </p>
                  <p>
                    <strong>Climate:</strong> {homeworld.climate}
                  </p>
                  <p>
                    <strong>Residents:</strong> {homeworld.residents.length}
                  </p>
                </div>
              )}
            </div>

            <button className="close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;