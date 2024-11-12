const apiKey = '5e01484a6bda416bb3c073c146e493e4';
const baseUrl = 'https://api.spoonacular.com/recipes';
let currentRecipes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function searchRecipes() {
    const query = document.getElementById('recipe-search').value;
    const url = `${baseUrl}/complexSearch?apiKey=${apiKey}&query=${query}&addRecipeInformation=true&number=12`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        currentRecipes = data.results;
        displayRecipes(currentRecipes);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayRecipes(recipes) {
    const recipesGrid = document.getElementById('recipes-grid');
    recipesGrid.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-info">
                <div class="recipe-title">${recipe.title}</div>
                <div>Ready in: ${recipe.readyInMinutes} minutes</div>
            </div>
        `;
        recipeCard.onclick = () => showRecipeDetails(recipe.id);
        recipesGrid.appendChild(recipeCard);
    });
}

async function showRecipeDetails(recipeId) {
    const url = `${baseUrl}/${recipeId}/information?apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const recipe = await response.json();

        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}" style="width: 300px; float: left; margin-right: 20px;">
            <p>${recipe.summary}</p>
            <h3>Ingredients:</h3>
            <ul>
                ${recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
            </ul>
            <h3>Instructions:</h3>
            <ol>
                ${recipe.analyzedInstructions[0]?.steps.map(step => `<li>${step.step}</li>`).join('') || 'Instructions not available'}
            </ol>
            ${getNutritionalInfo(recipe)}
            <button id="add-to-favorites" onclick="addToFavorites(${recipe.id})">Add to Favorites</button>
        `;

        document.getElementById('recipe-modal').style.display = 'block';

        document.querySelector('.close').onclick = () => {
            document.getElementById('recipe-modal').style.display = 'none';
        };

        const toggleFavoritesButton = document.getElementById('add-to-favorites');
        updateToggleButtonState(toggleFavoritesButton, recipeId);

        toggleFavoritesButton.onclick = () => {
            toggleRecipe(recipeId);
            updateToggleButtonState(toggleFavoritesButton, recipeId);
        };
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleRecipe(recipeId) {
    if (favorites.includes(recipeId)) {
        removeFromFavorites(recipeId);
    } else {
        addToFavorites(recipeId);
    }
}

function updateToggleButtonState(button, movieId) {
    if (favorites.includes(movieId)) {
        button.textContent = 'Remove from Favorites';
        button.classList.add('remove');
        button.classList.remove('add');
    } else {
        button.textContent = 'Add to Favorites';
        button.classList.add('add');
        button.classList.remove('remove');
    }
}


function getNutritionalInfo(recipe) {
    if (recipe.nutrition && recipe.nutrition.nutrients) {
        const calories = recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 'N/A';
        const protein = recipe.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 'N/A';
        const fat = recipe.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 'N/A';
        const carbs = recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 'N/A';

        return `
            <h3>Nutritional Information:</h3>
            <p>Calories: ${calories} kcal</p>
            <p>Protein: ${protein}g</p>
            <p>Fat: ${fat}g</p>
            <p>Carbohydrates: ${carbs}g</p>
        `;
    } else {
        return '<p style="color: #9f9f9f;">No nutritional information available from spoonacular</p>';
    }
}

function addToFavorites(recipeId) {
    if (!favorites.includes(recipeId)) {
        favorites.push(recipeId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavorites();
    }
}

async function updateFavorites() {
    const favoritesContainer = document.getElementById('favorites');
    favoritesContainer.innerHTML = '';

    for (const recipeId of favorites) {
        const url = `${baseUrl}/${recipeId}/information?apiKey=${apiKey}`;
        try {
            const response = await fetch(url);
            const recipe = await response.json();
            const recipeElement = document.createElement('div');
            recipeElement.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" style="width: 100px; float: left; margin-right: 10px;">
                <h3>${recipe.title}</h3>
                <button onclick="removeFromFavorites(${recipe.id})">Remove</button>
            `;
            favoritesContainer.appendChild(recipeElement);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function removeFromFavorites(recipeId) {
    favorites = favorites.filter(id => id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavorites();
}

updateFavorites();

let timeout = null;
document.getElementById('recipe-search').addEventListener('input', function() {
    clearTimeout(timeout);
    timeout = setTimeout(async function() {
        const query = document.getElementById('recipe-search').value;
        if (query.length > 2) {
            const url = `${baseUrl}/autocomplete?apiKey=${apiKey}&query=${query}&number=5`;
            try {
                const response = await fetch(url);
                const suggestions = await response.json();
                displaySuggestions(suggestions);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }, 300);
});

function displaySuggestions(suggestions) {
    const datalist = document.getElementById('recipe-suggestions') || document.createElement('datalist');
    datalist.id = 'recipe-suggestions';
    datalist.innerHTML = suggestions.map(s => `<option value="${s.title}">`).join('');
    document.body.appendChild(datalist);
    document.getElementById('recipe-search').setAttribute('list', 'recipe-suggestions');
}