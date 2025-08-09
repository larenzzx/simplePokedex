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
let isSearching = false;
let searchResults = [];

pageInfo.textContent = `Page ${page}`;

input.addEventListener("input", async (e) => {
  const search = e.target.value.trim().toLowerCase();

  if (search === "") {
    // If search is empty, return to normal pagination
    isSearching = false;
    togglePaginationButtons(true);
    fetchPokemon();
    return;
  }

  isSearching = true;
  togglePaginationButtons(false); // Disable pagination during search

  try {
    await searchPokemon(search);
  } catch (error) {
    console.error("Search error:", error);
    pokemonContainer.innerHTML = "<p>Error searching Pokemon</p>";
  }
});

async function searchPokemon(searchTerm) {
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  try {
    // First, try to search by exact name
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchTerm}`
      );
      if (response.ok) {
        const pokemon = await response.json();
        searchResults = [pokemon];
        renderPokemon(searchResults);
        pageInfo.textContent = `Search: "${searchTerm}" (1 result)`;
        return;
      }
    } catch (err) {
      // Pokemon not found by exact name, continue with partial search
    }

    // If exact search fails, get all Pokemon and filter
    const allPokemonResponse = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1010"
    );
    const allPokemonList = await allPokemonResponse.json();

    // Filter Pokemon names that contain the search term
    const filteredNames = allPokemonList.results.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );

    if (filteredNames.length === 0) {
      pokemonContainer.innerHTML = "<p>No Pokemon found</p>";
      pageInfo.textContent = `Search: "${searchTerm}" (0 results)`;
      return;
    }

    // Limit results to avoid too many API calls (max 20)
    const limitedResults = filteredNames.slice(0, 20);

    // Fetch detailed data for filtered Pokemon
    const pokemonDataPromises = limitedResults.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    searchResults = await Promise.all(pokemonDataPromises);
    renderPokemon(searchResults);
    pageInfo.textContent = `Search: "${searchTerm}" (${searchResults.length} results)`;
  } catch (error) {
    console.error("Error in search:", error);
    pokemonContainer.innerHTML = "<p>Error searching Pokemon</p>";
    pageInfo.textContent = `Search error`;
  } finally {
    loading.classList.add("hidden");
  }
}

function togglePaginationButtons(enabled) {
  prev.disabled = !enabled;
  next.disabled = !enabled;
  prev.style.opacity = enabled ? "1" : "0.5";
  next.style.opacity = enabled ? "1" : "0.5";
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
  if (isSearching) return; // Don't fetch if currently searching

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
  if (isSearching) return; // Don't paginate during search

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
  if (isSearching || page <= 1) return; // Don't go to previous page if on first page or searching

  offset -= limit;
  page--;
  pageInfo.textContent = `Page ${page}`;
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  fetchPokemon();
});

// Initialize
fetchPokemon();
