const pokemonContainer = document.querySelector(".pokemon-grid");
const input = document.querySelector(".search-input");
const text = document.getElementById("text");
const prev = document.getElementById("prevBtn");
const next = document.getElementById("nextBtn");
let pageInfo = document.getElementById("pageInfo");

let allPokemonData = [];
let offset = 0;
let limit = 12;
let page = 1;
let isSearchMode = false;
let searchResults = [];

pageInfo.textContent = `Page ${page}`;

// Debounce function to prevent too many API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search Pokemon by name via API
async function searchPokemonByName(searchTerm) {
  if (!searchTerm.trim()) {
    isSearchMode = false;
    fetchPokemon();
    updatePaginationVisibility();
    return;
  }

  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  try {
    isSearchMode = true;
    // Try to fetch the specific Pokemon
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`
    );

    if (response.ok) {
      const pokemon = await response.json();
      searchResults = [pokemon];
      renderPokemon(searchResults);
    } else {
      // If exact match fails, search through all Pokemon names
      await searchAllPokemonNames(searchTerm);
    }
  } catch (error) {
    console.error("Search error:", error);
    await searchAllPokemonNames(searchTerm);
  } finally {
    loading.classList.add("hidden");
    updatePaginationVisibility();
  }
}

// Fallback: search through all Pokemon names (cached)
let allPokemonNames = null;

async function searchAllPokemonNames(searchTerm) {
  try {
    // Cache all Pokemon names on first search
    if (!allPokemonNames) {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1500"
      );
      const data = await response.json();
      allPokemonNames = data.results;
    }

    // Filter matching names
    const matches = allPokemonNames.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limit results to prevent lag (show first 20 matches)
    const limitedMatches = matches.slice(0, 20);

    // Fetch detailed data for matches
    const pokemonPromises = limitedMatches.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    searchResults = await Promise.all(pokemonPromises);
    renderPokemon(searchResults);

    if (searchResults.length === 0) {
      pokemonContainer.innerHTML = "<p>No Pokemon found</p>";
    }
  } catch (error) {
    console.error("Error searching all Pokemon:", error);
    pokemonContainer.innerHTML = "<p>Search error occurred</p>";
  }
}

// Debounced search function
const debouncedSearch = debounce(searchPokemonByName, 500);

input.addEventListener("input", (e) => {
  const search = e.target.value.trim();
  debouncedSearch(search);
});

function updatePaginationVisibility() {
  if (isSearchMode) {
    prev.style.display = "none";
    next.style.display = "none";
    pageInfo.textContent = "Search Results";
  } else {
    prev.style.display = "inline-block";
    next.style.display = "inline-block";
    pageInfo.textContent = `Page ${page}`;
  }
}

function renderPokemon(pokemonList) {
  pokemonContainer.innerHTML = "";
  if (pokemonList.length === 0) {
    pokemonContainer.innerHTML = "<p>No pokemon found</p>";
    return;
  }
  pokemonList.forEach((data) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.className = "pokemon-card";

    // id
    const pokemonId = document.createElement("div");
    pokemonId.className = "pokemon-id";
    pokemonId.innerHTML = data.id;

    // img
    const pokemonCardHeader = document.createElement("div");
    pokemonCardHeader.className = "pokemon-card-header";
    const pokemonImage = document.createElement("img");
    pokemonImage.className = "pokemon-image";
    pokemonImage.src =
      data.sprites.other.dream_world.front_default ||
      data.sprites.front_default;
    pokemonCardHeader.appendChild(pokemonImage);

    // card body
    const pokemonCardBody = document.createElement("div");
    pokemonCardBody.className = "pokemon-card-body";

    // pokemon name
    const pokemonName = document.createElement("h3");
    pokemonName.className = "pokemon-name";
    pokemonName.textContent = data.name;

    // pokemon types
    const pokemonTypes = document.createElement("div");
    pokemonTypes.className = "pokemon-types";

    const types = data.types.map((type) => type.type.name);

    types.forEach((type) => {
      const pokemonType = document.createElement("span");
      pokemonType.classList.add("pokemon-type", type);
      pokemonType.textContent = type;
      pokemonTypes.appendChild(pokemonType);
    });

    // pokemon stats
    const pokemonStats = document.createElement("div");
    pokemonStats.className = "pokemon-stats";
    const height = data.height / 10 + "m";
    const weight = data.weight / 10 + "kg";
    const hp = data.stats[0].base_stat;

    const stats = [
      { label: "Height", value: height },
      { label: "Weight", value: weight },
      { label: "Hp", value: hp },
    ];

    stats.forEach((stat) => {
      const pokemonStat = document.createElement("div");
      pokemonStat.className = "pokemon-stat";

      const pokemonStatLabel = document.createElement("div");
      pokemonStatLabel.className = "pokemon-stat-label";
      pokemonStatLabel.textContent = stat.label;

      const pokemonStatValue = document.createElement("div");
      pokemonStatValue.className = "pokemon-stat-value";
      pokemonStatValue.textContent = stat.value;

      pokemonStat.appendChild(pokemonStatLabel);
      pokemonStat.appendChild(pokemonStatValue);
      pokemonStats.appendChild(pokemonStat);
    });

    // append childs
    pokemonCardBody.append(pokemonName, pokemonTypes, pokemonStats);
    pokemonCard.append(pokemonId, pokemonCardHeader, pokemonCardBody);

    pokemonContainer.appendChild(pokemonCard);
  });
}

function fetchPokemon() {
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Can't fetch pokemon data");
      }
      return res.json();
    })
    .then((data) => {
      const pokemonData = data.results.map((pokemon) =>
        fetch(pokemon.url).then((res) => res.json())
      );
      return Promise.all(pokemonData);
    })
    .then((pokemonDataList) => {
      allPokemonData = pokemonDataList;
      renderPokemon(allPokemonData);
    })
    .finally(function () {
      loading.classList.add("hidden");
    });
}

next.addEventListener("click", () => {
  if (isSearchMode) return; // Disable pagination in search mode
  offset += limit;
  page++;
  pageInfo.textContent = `Page ${page}`;
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  fetchPokemon();
});

prev.addEventListener("click", () => {
  if (isSearchMode) return; // Disable pagination in search mode
  if (offset <= 0) return; // Prevent going to negative offset
  offset -= limit;
  page--;
  pageInfo.textContent = `Page ${page}`;
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  fetchPokemon();
});

fetchPokemon();
