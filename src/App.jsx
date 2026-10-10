
import { useState, useEffect } from 'react';
import './App.css';

const recipes = [
  { name: 'Omelette', emoji: '🍳', time: '15 min', ingredients: ['Egg'], optionalIngredients: ['Tomato', 'Onion'], description: 'A quick and delicious breakfast.' },
  { name: 'Potato Fry', emoji: '🥔', time: '20 min', ingredients: ['Potato', 'Onion', 'Oil'], description: 'Crispy homemade potato fry.' },
  { name: 'Potato Tomato Curry', emoji: '🍲', time: '30 min', ingredients: ['Potato', 'Tomato', 'Onion'], description: 'A comforting homemade curry.' },
  { name: 'Paneer Bhurji', emoji: '🧀', time: '20 min', ingredients: ['Paneer', 'Tomato', 'Onion', 'Oil'], description: 'A tasty Indian paneer dish.' },
  { name: 'Palak Paneer', emoji: '🥬', time: '35 min', ingredients: ['Paneer', 'Spinach', 'Onion', 'Tomato'], description: 'Creamy paneer with spinach.' },
  { name: 'Mushroom Pepper Fry', emoji: '🍄', time: '20 min', ingredients: ['Mushroom', 'Onion', 'Pepper', 'Oil'], description: 'Savory mushrooms with pepper.' },
  { name: 'Vegetable Fried Rice', emoji: '🍚', time: '25 min', ingredients: ['Rice', 'Carrot', 'Onion', 'Capsicum'], description: 'A colourful, flavourful meal.' },
  { name: 'Tomato Pasta', emoji: '🍝', time: '20 min', ingredients: ['Pasta', 'Tomato', 'Garlic', 'Onion'], description: 'Comforting pasta with tomato sauce.' },
  { name: 'Banana Pancakes', emoji: '🥞', time: '15 min', ingredients: ['Banana', 'Egg', 'Milk', 'Flour'], description: 'Soft and fluffy homemade pancakes.' },
  { name: 'Chickpea Salad', emoji: '🥗', time: '10 min', ingredients: ['Chickpeas', 'Tomato', 'Onion', 'Lemon'], description: 'A fresh and filling salad.' },
  { name: 'Spinach Dal', emoji: '🍲', time: '30 min', ingredients: ['Spinach', 'Lentils', 'Onion', 'Tomato'], description: 'Wholesome lentils with spinach.' },
  { name: 'Garlic Mushroom Pasta', emoji: '🍝', time: '25 min', ingredients: ['Mushroom', 'Pasta', 'Garlic', 'Oil'], description: 'Pasta tossed with garlic mushrooms.' },
  { name: 'Carrot Soup', emoji: '🥕', time: '25 min', ingredients: ['Carrot', 'Onion', 'Milk'], description: 'A warm, creamy carrot soup.' },
  { name: 'Aloo Paratha', emoji: '🫓', time: '30 min', ingredients: ['Potato', 'Flour', 'Oil'], description: 'Indian flatbread stuffed with potato.' },
  { name: 'Lemon Rice', emoji: '🍋', time: '15 min', ingredients: ['Rice', 'Lemon', 'Oil'], description: 'A bright and tangy rice dish.' }
];

const normalize = item => {
  let value = item.toLowerCase().trim();

  if (value.endsWith('ies')) return value.slice(0, -3) + 'y';
  if (value.endsWith('oes')) return value.slice(0, -2);
  if (value.endsWith('s') && !value.endsWith('ss')) {
    return value.slice(0, -1);
  }

  return value;
};

function App() {
  const [pantry, setPantry] = useState([]);
  const [ingredient, setIngredient] = useState('');
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [activeTab, setActiveTab] = useState('Discover');
  const [favorites, setFavorites] = useState([]);
  const [backendRecipes, setBackendRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  useEffect(() => {
    fetch('https://ingredient2dish-backend.onrender.com/api/recipes')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load recipes');
        return response.json();
      })
      .then(data => {
        setBackendRecipes(
          data.map(recipe => ({
            ...recipe,
            emoji: '🍽️',
            time: `${recipe.cookingTime || 15} min`,
            ingredients: Array.isArray(recipe.ingredients)
              ? recipe.ingredients
              : (recipe.ingredients || '')
                  .split(',')
                  .map(item => item.trim())
                  .filter(Boolean),
            description: recipe.description || 'A simple recipe made with everyday ingredients.'
          }))
        );
      })
      .catch(error => {
        console.error('Error loading recipes:', error);
      })
      .finally(() => setLoadingRecipes(false));
  }, []);

  useEffect(() => {
    fetch('https://ingredient2dish-backend.onrender.com/api/pantry')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load pantry');
        return response.json();
      })
      .then(data => {
        setPantry(data.map(item => item.name));
      })
      .catch(error => {
        console.error('Error loading pantry:', error);
      })
      .finally(() => setLoadingPantry(false));
  }, []);

  const addIngredient = async () => {
    const value = ingredient.trim();

    if (
      !value ||
      pantry.some(item => normalize(item) === normalize(value))
    ) {
      return;
    }

    try {
      const response = await fetch('https://ingredient2dish-backend.onrender.com/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: value,
          quantity: 1,
          unit: 'pieces'
        })
      });

      if (!response.ok) throw new Error('Failed to save ingredient');

      const savedItem = await response.json();
      setPantry(prev => [...prev, savedItem.name]);
      setIngredient('');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Could not save ingredient. Please check that the backend is running.');
    }
  };

  const removeIngredient = async item => {
    try {
      const response = await fetch('https://ingredient2dish-backend.onrender.com/api/pantry');

      if (!response.ok) throw new Error('Could not load pantry');

      const items = await response.json();
      const pantryItem = items.find(
        entry =>
          entry.name.trim().toLowerCase() === item.trim().toLowerCase()
      );

      if (!pantryItem) throw new Error('Ingredient not found');

      const deleteResponse = await fetch(
        `https://ingredient2dish-backend.onrender.com/api/pantry/${pantryItem.id}`,
        { method: 'DELETE' }
      );

      if (!deleteResponse.ok) throw new Error('Could not delete ingredient');

      setPantry(prev => {
        const index = prev.indexOf(item);
        if (index === -1) return prev;
        return prev.filter((value, i) => i !== index);
      });
    } catch (error) {
      console.error('Error removing ingredient:', error);
      alert('Could not remove ingredient. Please check the backend.');
    }
  };
  const matchedRecipes = recipes
  .map(recipe => {
    const available = pantry.map(item => item.toLowerCase().trim());
    const required = recipe.ingredients || [];
    const optional = recipe.optionalIngredients || [];

    const matched = [...required, ...optional].filter(item =>
      available.includes(item.toLowerCase().trim())
    );

    const missing = required.filter(item =>
      !available.includes(item.toLowerCase().trim())
    );

    const score = required.length > 0
      ? Math.round(
          (required.filter(item =>
            available.includes(item.toLowerCase().trim())
          ).length / required.length) * 100
        )
      : 0;

    return {
      ...recipe,
      matched,
      missing,
      score
    };
  })
  .filter(recipe => recipe.matched.length > 0)
  .sort((a, b) => b.score - a.score);


  const toggleFavorite = name => {
    setFavorites(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span>🥑</span> Ingredient2Dish</div>
        <p className="side-label">YOUR KITCHEN</p>

        {['Discover', 'My Pantry', 'Shopping List', 'Favorites'].map(tab => (
          <button
            key={tab}
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {({ Discover: '⌂', 'My Pantry': '▦', 'Shopping List': '🛒', Favorites: '♡' })[tab]}
            <span>{tab}</span>
          </button>
        ))}

        <div className="sidebar-note">
          <span>🌱</span>
          <strong>Waste less, eat better.</strong>
          <p>Make the most of every ingredient in your kitchen.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="breadcrumb">Your kitchen / <strong>{activeTab}</strong></span>
          <span className="profile">👩🏻‍🍳 Home Chef</span>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR PERSONAL KITCHEN ASSISTANT</p>
            <h1>Good food starts<br />with <span>what you have.</span></h1>
            <p className="subtitle">Discover delicious recipes hiding in your pantry.</p>
          </div>
          <div className="welcome-art">🥗</div>
        </section>

        <section className="pantry-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WHAT'S IN YOUR KITCHEN?</p>
              <h2>My pantry <span className="count">{pantry.length} items</span></h2>
            </div>
          </div>

          <div className="ingredient-form">
            <input
              value={ingredient}
              onChange={e => setIngredient(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addIngredient()}
              placeholder="Add an ingredient, e.g. Potato..."
            />
            <button onClick={addIngredient} className="add-button">+ Add ingredient</button>
          </div>

          <div className="chips">
            {loadingPantry ? (
              <p className="muted">Loading pantry...</p>
            ) : (
              pantry.map((item, index) => (
                <span className="chip" key={`${item}-${index}`}>
                  {item}
                  <button
                    aria-label={`Remove ${item}`}
                    onClick={() => removeIngredient(item)}
                  >
                    ×
                  </button>
                </span>
              ))
            )}

            {!loadingPantry && pantry.length === 0 && (
              <p className="muted">Add ingredients to discover recipes.</p>
            )}
          </div>
        </section>

        {activeTab === 'Shopping List' ? (
          <section className="recipes-section">
            <p className="eyebrow">YOUR NEXT GROCERY RUN</p>
            <h2>Shopping list</h2>
            <p className="muted">Missing ingredients from recipes you can almost make:</p>
            {Array.from(new Set(matchedRecipes.flatMap(r => r.missing))).map(item => (
              <p className="shopping-item" key={item}>🛒 {item}</p>
            ))}
            {matchedRecipes.length === 0 && (
              <p className="muted">Add pantry ingredients to find recipes and their missing ingredients.</p>
            )}
          </section>
        ) : activeTab === 'Favorites' ? (
          <section className="recipes-section">
            <p className="eyebrow">SAVED FOR LATER</p>
            <h2>Your favorite recipes</h2>
            <RecipeGrid
              recipes={matchedRecipes.filter(r => favorites.includes(r.name))}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          </section>
        ) : activeTab === 'My Pantry' ? (
          <section className="recipes-section">
            <p className="eyebrow">YOUR INGREDIENTS</p>
            <h2>Pantry overview</h2>
            <p className="muted">
              You're tracking {pantry.length} ingredients. Add or remove items above to update your pantry.
            </p>
          </section>
        ) : (
          <section className="recipes-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">MADE FOR YOUR PANTRY</p>
                <h2>Recipes for you <span className="count">{matchedRecipes.length} ideas</span></h2>
              </div>
              <span className="match-label">✦ Ingredient matches</span>
            </div>

            {loadingRecipes ? (
              <p className="muted">Loading recipes...</p>
            ) : (
              <RecipeGrid
                recipes={matchedRecipes}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}
          </section>
        )}

        <footer>Made with ♡ to help you cook smarter and waste less.</footer>
      </main>
    </div>
  );
}

function RecipeGrid({ recipes, favorites, toggleFavorite }) {
  if (recipes.length === 0) {
    return <p className="empty">No recipes to show yet. Add more pantry ingredients or explore Discover.</p>;
  }

  return (
    <div className="recipe-grid">
      {recipes.map(recipe => (
        <article className="recipe-card" key={recipe.name}>
          <div className="recipe-art">
            <span className="food-emoji">{recipe.emoji}</span>
            <span className="time">{recipe.time}</span>
            <button
              className="heart"
              onClick={() => toggleFavorite(recipe.name)}
              aria-label="Toggle favorite"
            >
              {favorites.includes(recipe.name) ? '♥' : '♡'}
            </button>
          </div>

          <div className="recipe-info">
            <div className="recipe-title-row">
              <h3>{recipe.name}</h3>
              <span className="score">{recipe.score}% match</span>
            </div>

            <p>{recipe.description}</p>

            <div className="ingredient-status">
              <strong>Have: </strong>{recipe.matched.join(', ') || 'None'}
            </div>

            {recipe.missing.length > 0 && (
              <div className="ingredient-status missing">
                <strong>Need: </strong>{recipe.missing.join(', ')}
              </div>
            )}

            {recipe.missing.length === 0 && (
              <div className="ready">✓ All ingredients available</div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default App;
