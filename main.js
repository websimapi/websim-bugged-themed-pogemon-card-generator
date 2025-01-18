document.getElementById('generateBtn').addEventListener('click', generateCard);

async function getPokemonDescription() {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a creative description for a unique Pogemon inspired by BUGGED, the legendary Gathering Master of Brighter Shores. The name should reflect gathering, exploration, or coastal themes, derived from clever combinations like:
        - "Harvestide" (from harvest + tide)
        - "Shellfinder" (from shell + finder)
        - "Coastweaver" (from coast + weaver)
        
        The description should incorporate elements of gathering, exploration, and the coastal world of Brighter Shores. Include references to gathering skills, discovered treasures, or coastal environments. Each response should capture the spirit of adventure and discovery that BUGGED embodies.

        interface Response {
          name: string;
          description: string;
          type: string;
          height: string;
          weight: string;
        }

        Example response (generate something completely different):
        {
          "name": "Gathermist",
          "description": "A mystical Water/Ground Pogemon that glides along shorelines at dawn, using its crystalline antennae to detect precious resources beneath the sand. Known to share its discoveries with fellow adventurers, much like the legendary gathering master BUGGED.",
          "type": "Water/Ground",
          "height": "1.2m",
          "weight": "35kg"
        }`,
        data: ""
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pogemon description:', error);
    return {
      name: 'Error',
      description: 'Failed to generate Pogemon description',
      type: 'Unknown',
      height: 'Unknown',
      weight: 'Unknown'
    };
  }
}

async function generatePokemonImage(description) {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a unique image URL for a cartoon Pogemon based on this description: "cartoon Pogemon ${description}". Each response should be different and creative. Return a URL to an image that matches the description.

        interface Response {
          imageUrl: string;
        }

        Example response (generate something different):
        {
          "imageUrl": "https://example.com/pogemon-image.jpg"
        }`,
        data: description
      }),
    });
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating Pogemon image:', error);
    return null;
  }
}

async function generateCard() {
  // Remove existing card and submenu if any
  const existingCard = document.querySelector('.card');
  const existingSubmenu = document.querySelector('.submenu');
  if (existingCard) {
    existingCard.remove();
  }
  if (existingSubmenu) {
    existingSubmenu.remove();
  }

  // Create new card with front and back
  const cardContainer = document.getElementById('cardContainer');
  const card = document.createElement('div');
  card.className = 'card';
  
  // Create card inner structure with initial flipped state
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner flipped';
  
  cardInner.innerHTML = `
    <div class="card-front">
      <h2 class="pokemon-name"></h2>
      <div class="card-image-container"></div>
      <div class="stats-container">
        <div class="type-wrapper"></div>
        <p class="pokemon-stats"></p>
      </div>
      <div class="card-description">
        <p class="pokemon-description"></p>
      </div>
    </div>
    <div class="card-back">
      <div class="card-back-design">
        <svg class="card-back-logo" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="50" cy="50" r="20" fill="currentColor"/>
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="card-back-pattern"></div>
      </div>
    </div>
  `;
  
  card.appendChild(cardInner);
  
  // Create submenu but start hidden
  const submenu = document.createElement('div');
  submenu.className = 'submenu hidden';
  
  // Create submenu content with placeholder data
  submenu.innerHTML = `
    <div class="submenu-grid">
      <div class="stat-box">
        <div class="stat-label">Name</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Type</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Height</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Weight</div>
        <div class="stat-value">???</div>
      </div>
    </div>
    <div class="description-box">
      <div class="description-title">Description</div>
      <div class="full-description">Generate a Pogemon to see its description!</div>
    </div>
  `;
  
  cardContainer.appendChild(submenu);

  // Get Pokemon description from LLM
  const pokemonData = await getPokemonDescription();

  // Update submenu content but keep it hidden
  const statValues = submenu.querySelectorAll('.stat-value');
  statValues[0].textContent = pokemonData.name;
  statValues[1].textContent = pokemonData.type;
  statValues[2].textContent = pokemonData.height;
  statValues[3].textContent = pokemonData.weight;
  
  submenu.querySelector('.full-description').textContent = pokemonData.description;

  // Generate image based on description
  const imageUrl = await generatePokemonImage(`cartoon Pogemon ${pokemonData.description}`);
  
  // Create and append image if URL is available
  if (imageUrl) {
    const pokemonImage = document.createElement('img');
    pokemonImage.id = `pokemon-${Date.now()}`; // Unique ID
    pokemonImage.className = 'pokemon-image hidden'; // Add hidden class initially
    pokemonImage.src = `${imageUrl} cartoon Pogemon`;
    pokemonImage.alt = `cartoon Pogemon ${pokemonData.description} - ${pokemonData.name} cartoon Pogemon`;
    
    // Add load and error event listeners
    pokemonImage.addEventListener('load', function() {
      const actualSrc = this.currentSrc || this.src;
      // Only show if the source isn't our text string
      if (!actualSrc.includes('cartoon Pogemon')) {
        this.classList.remove('hidden');
      }
    });
    
    pokemonImage.addEventListener('error', function() {
      this.classList.add('hidden');
    });
    
    const imageContainer = card.querySelector('.card-image-container');
    imageContainer.appendChild(pokemonImage);
  }
  
  // Create and append Pokemon info elements
  const nameElement = card.querySelector('.pokemon-name');
  nameElement.textContent = pokemonData.name;
  
  // Create stats container with new compact layout
  const statsContainer = card.querySelector('.stats-container');
  
  const types = pokemonData.type.split('/');
  const typeIcons = types.map(type => {
    const typeDiv = document.createElement('div');
    typeDiv.className = `type-icon ${type.toLowerCase().trim()}`;
    typeDiv.innerHTML = getTypeIcon(type.trim());
    typeDiv.title = type.trim();
    return typeDiv;
  });
  
  const typeWrapper = statsContainer.querySelector('.type-wrapper');
  typeIcons.forEach(icon => typeWrapper.appendChild(icon));

  // Add the gradient classes based on both types
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const cardFront = card.querySelector('.card-front');
  
  // Remove any existing gradient classes
  cardFront.className = 'card-front';
  
  // Create custom gradient style
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  cardFront.style.background = `linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%)`;

  const statsElement = statsContainer.querySelector('.pokemon-stats');
  statsElement.textContent = `${pokemonData.height} | ${pokemonData.weight}`;
  
  const descElement = card.querySelector('.pokemon-description');
  descElement.textContent = pokemonData.description;
  
  cardContainer.appendChild(card);

  // Add click handler with submenu toggle
  card.addEventListener('click', (e) => {
    const cardInner = e.currentTarget.querySelector('.card-inner');
    cardInner.classList.toggle('flipped');
    
    // Show/hide submenu based on card flip state
    if (!cardInner.classList.contains('flipped')) {
      setTimeout(() => {
        submenu.classList.remove('hidden');
      }, 400); // Half the flip animation duration
    } else {
      submenu.classList.add('hidden');
    }
  });

  // Add hover effect
  card.addEventListener('mousemove', handleHover);
  card.addEventListener('mouseleave', resetHover);

  // Show card with initial animation
  requestAnimationFrame(() => {
    card.classList.add('show');
  });
}

function getTypeIcon(type) {
  const icons = {
    'Fire': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M328.7 256c0-44.8 20.3-81.1-81.1-81.1s-81.1 36.3-81.1 81.1c0 44.8 36.3 81.1 81.1 81.1s81.1-36.3 81.1-81.1zM256 307.5c-35.3 0-64-28.7-64-64 0-23.5 12.7-44.1 31.5-55.3-35.3 12.7-53.5 36.3-53.5 67.8 0 39.6 32.1 71.7 71.7 71.7 31.5 0 55.1-18.2 67.8-53.5C298.1 294.8 277.5 307.5 256 307.5z"/></svg>`,
    
    'Water': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-41.7 0-96 94.1-96 192 0 53 43 96 96 96s96-43 96-96c0-97.9-54.3-192-96-192zm0 256c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"/></svg>`,
    
    'Grass': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Electric': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M296 160L256 32l-40 128h-88l72 88-40 168 136-120 40-168h-80zm-40 168l-40 88 72-88-32-56 32-56-72-88 40 88 32 56-32 56z"/></svg>`,
    
    'Ice': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M384 256c0 70.7-57.3 128-128 128s-128-57.3-128-128 57.3-128 128-128 128 57.3 128 128zm-224 0l96-96 96 96-96 96-96-96zm96-160l96 96-96 96-96-96 96-96zm-160 160l96-96 96 96-96 96-96-96z"/></svg>`,
    
    'Fighting': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Poison': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 256c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm32-128c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Ground': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M384 256H128l128-224 128 224zm-256 0l128 224 128-224H128zm256-32l-128-224L128 224h256z"/></svg>`,
    
    'Flying': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 32l-96 160h192L256 32zm0 192l-96 160h192L256 224zm0 192l-96 96h192l-96-96z"/></svg>`,
    
    'Psychic': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 256c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm48-96c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z"/></svg>`,
    
    'Bug': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64l-96 96v192l96 96 96-96V160l-96-96zm0 384l-64-64V192l64-64 64 64v192l-64 64zm32-192c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32zm-32 96c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"/></svg>`,
    
    'Rock': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Ghost': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160v128h320V224c0-88.4-71.6-160-160-160zm64 256H192v-96c0-35.3 28.7-64 64-64s64 28.7 64 64v96zm-32-96c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Dragon': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 32L128 160l128 128 128-128L256 32zm0 384l128-128-128-128-128 128 128 128zm0-256l64 64-64 64-64-64 64-64z"/></svg>`,
    
    'Dark': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 256c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm48-96c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z"/></svg>`,
    
    'Steel': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32zm-32 96c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"/></svg>`,
    
    'Fairy': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64l64 64-64 64-64-64 64-64zm0 384l64-64-64-64-64 64 64 64zm0-192l64 64-64 64-64-64 64-64zm-128-64l64 64-64 64-64-64 64-64zm256 0l64 64-64 64-64-64 64-64z"/></svg>`
  };
  
  return icons[type] || `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96z"/></svg>`;
}

function getTypeColor(type) {
  const colors = {
    'fire': '#FF4422',
    'water': '#3399FF',
    'grass': '#77CC55',
    'electric': '#FFCC33',
    'ice': '#66CCFF',
    'fighting': '#BB5544',
    'poison': '#AA5599',
    'ground': '#DDBB55',
    'flying': '#8899FF',
    'psychic': '#FF5599',
    'bug': '#AABB22',
    'rock': '#BBAA66',
    'ghost': '#6666BB',
    'dragon': '#7766EE',
    'dark': '#775544',
    'steel': '#AAAABB',
    'fairy': '#EE99EE'
  };
  
  return colors[type] || '#999999';
}

function handleHover(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = (y - centerY) / 20; // Reduced intensity
  const rotateY = -(x - centerX) / 20; // Reduced intensity
  
  card.style.transform = `
    perspective(2000px) 
    rotateX(${rotateX}deg) 
    rotateY(${rotateY}deg) 
    scale3d(1.02, 1.02, 1.02)
  `;
}

function resetHover(e) {
  const card = e.currentTarget;
  card.style.transform = 'perspective(2000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  card.style.transition = 'transform 0.5s ease';
  
  // Remove transition after it's complete
  setTimeout(() => {
    card.style.transition = '';
  }, 500);
}

function setupPrintButton() {
  const printBtn = document.getElementById('printBtn');
  printBtn.addEventListener('click', () => {
    // Add print class to all visible cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.classList.add('print-section');
      
      // Ensure the current visible side is shown in print
      const cardInner = card.querySelector('.card-inner');
      const cardFront = card.querySelector('.card-front');
      const cardBack = card.querySelector('.card-back');
      
      if (cardInner.classList.contains('flipped')) {
        cardBack.style.visibility = 'visible';
        cardFront.style.visibility = 'hidden';
      } else {
        cardFront.style.visibility = 'visible';
        cardBack.style.visibility = 'hidden';
      }
    });

    // Print
    window.print();

    // Remove print classes and restore visibility after printing
    setTimeout(() => {
      cards.forEach(card => {
        card.classList.remove('print-section');
        const cardFront = card.querySelector('.card-front');
        const cardBack = card.querySelector('.card-back');
        cardFront.style.visibility = '';
        cardBack.style.visibility = '';
      });
    }, 100);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const initialCard = document.querySelector('.card');
  if (initialCard) {
    initialCard.addEventListener('click', (e) => {
      const cardInner = e.currentTarget.querySelector('.card-inner');
      cardInner.classList.toggle('flipped');
    });
  }
  
  setupPrintButton();
});