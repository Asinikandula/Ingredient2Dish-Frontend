import { useState } from 'react';
import './App.css';

const recipes = [
  { name: 'Omelette', emoji: '🍳', time: '15 min', ingredients: ['Egg'],optionalIngredients: ['Tomato', 'Onion'], description: 'A quick and delicious breakfast.' },
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

function App() {
  const [pantry, setPantry] = useState(['Tomato', 'Onion', 'Egg']);
  const [ingredient, setIngredient] = useState('');
  const [activeTab, setActiveTab] = useState('Discover');
  const [favorites, setFavorites] = useState([]);

  const addIngredient = () => {
    const value = ingredient.trim();
    if (value && !pantry.some(item => item.toLowerCase() === value.toLowerCase())) {
      setPantry([...pantry, value]);
      setIngredient('');
    }
  };

  const matchedRecipes = recipes
  .map(recipe => {
    const normalize = item => item.toLowerCase().trim();
    const available = pantry.map(normalize);
    const required = recipe.ingredients;
    const optional = recipe.optionalIngredients || [];

    const matched = [...required, ...optional].filter(item =>
      available.includes(normalize(item))
    );

    const missing = required.filter(item =>
      !available.includes(normalize(item))
    );

    const total = required.length + optional.length;

    return {
      ...recipe,
      matched,
      missing,
      score: required.length > 0
  ? Math.round(
      (required.filter(item =>
        available.includes(normalize(item))
      ).length / required.length) * 100
    )
  : 0
    };
  })
  .filter(recipe => recipe.missing.length === 0)
  .sort((a, b) => b.score - a.score);

  const toggleFavorite = name => {
    setFavorites(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
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
            {pantry.map(item => (
              <span className="chip" key={item}>
                {item}
                <button aria-label={`Remove ${item}`} onClick={() => setPantry(pantry.filter(p => p !== item))}>×</button>
              </span>
            ))}
            {pantry.length === 0 && <p className="muted">Add ingredients to discover recipes.</p>}
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
            {matchedRecipes.every(r => r.missing.length === 0) && <p>You're all set! No missing ingredients.</p>}
          </section>
        ) : activeTab === 'Favorites' ? (
          <section className="recipes-section">
            <p className="eyebrow">SAVED FOR LATER</p>
            <h2>Your favorite recipes</h2>
            <RecipeGrid recipes={matchedRecipes.filter(r => favorites.includes(r.name))} favorites={favorites} toggleFavorite={toggleFavorite} />
            <p style={{ color: 'red', fontWeight: 'bold' }}>TEST BUTTON AREA</p>
          </section>
        ) : activeTab === 'My Pantry' ? (
          <section className="recipes-section">
            <p className="eyebrow">YOUR INGREDIENTS</p>
            <h2>Pantry overview</h2>
            <p className="muted">You're tracking {pantry.length} ingredients. Add or remove items above to update your pantry.</p>
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
            <RecipeGrid recipes={matchedRecipes} favorites={favorites} toggleFavorite={toggleFavorite} />
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
            <button className="heart" onClick={() => toggleFavorite(recipe.name)} aria-label="Toggle favorite">
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
            {recipe.missing.length === 0 && <div className="ready">✓ All ingredients available</div>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default App;
