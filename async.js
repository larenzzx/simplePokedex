const container = document.querySelector(".pokemon-grid");
let pageInfo = document.getElementById("pageInfo");

let page = 1;
pageInfo.textContent = `Page ${page}`;
let allPokemonData = [];
let offset = 0;
let limit = 12;

const input = document.querySelector(".search-input");
const prev = document.getElementById("prevBtn");
const next = document.getElementById("nextBtn");

prev.addEventListener("click", () => {
  offset -= limit;
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  getPokemon();
});

next.addEventListener("click", () => {
  offset += limit;
  page++;
  pageInfo.textContent = `Page ${page}`;
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  getPokemon();
});

input.addEventListener("input", (e) => {
  const search = e.target.value.trim().toLowerCase();
  const filtered = allPokemonData.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search)
  );
  renderPokemon(filtered);
});

function renderPokemon(pokeApi) {
  container.innerHTML = "";
  pokeApi.forEach((pokemon) => {
    const pokemonCard = document.createElement("div");
    pokemonCard.className = "pokemon-card";

    //HEADER
    const pokemonId = document.createElement("div");
    pokemonId.className = "pokemon-id";
    pokemonId.innerHTML = pokemon.id;

    const pokemonHeader = document.createElement("div");
    pokemonHeader.className = "pokemon-card-header";
    const pokemonImg = document.createElement("img");
    pokemonImg.className = "pokemon-image";
    pokemonImg.src = pokemon.sprites.other["official-artwork"].front_default;
    pokemonHeader.appendChild(pokemonImg);

    //BODY
    const pokemonBody = document.createElement("div");
    pokemonBody.className = "pokemon-card-body";
    const pokemonName = document.createElement("h3");
    pokemonName.className = "pokemon-name";
    pokemonName.textContent = pokemon.name;

    const pokemonTypes = document.createElement("div");
    pokemonTypes.className = "pokemon-types";
    const types = pokemon.types.map((type) => type.type.name);

    types.forEach((type) => {
      const pokemonType = document.createElement("span");
      pokemonType.classList.add("pokemon-type", type);
      pokemonType.textContent = type;
      pokemonTypes.appendChild(pokemonType);
    });

    const pokemonStats = document.createElement("div");
    pokemonStats.className = "pokemon-stats";
    const height = pokemon.height / 10 + "m";
    const weight = pokemon.weight / 10 + "kg";
    const hp = pokemon.stats[0].base_stat;

    const stats = [
      { label: "Height:", value: height },
      { label: "Weight:", value: weight },
      { label: "Hp:", value: hp },
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

      pokemonStat.append(pokemonStatLabel, pokemonStatValue);
      pokemonStats.appendChild(pokemonStat);
    });

    pokemonBody.append(pokemonName, pokemonTypes, pokemonStats);
    pokemonCard.append(pokemonId, pokemonHeader, pokemonBody);
    container.appendChild(pokemonCard);
  });
}

async function getPokemon() {
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await res.json();
    const pokemonPromises = data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      return res.json();
    });
    const pokemonList = await Promise.all(pokemonPromises);

    allPokemonData = pokemonList;
    renderPokemon(allPokemonData);
  } catch (error) {
    console.error("cannot fetch pokemon", error);
  }
}

getPokemon();
