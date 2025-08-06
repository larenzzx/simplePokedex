const pokemonContainer = document.querySelector(".pokemon-grid");

fetch("https://pokeapi.co/api/v2/pokemon?limit=10&offset=0")
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
    pokemonDataList.forEach((data) => {
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
      pokemonImage.src = data.sprites.other.dream_world.front_default;
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

      // pokemonType.className = "pokemon-type";
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
  });
