import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';


/**Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked Recipes
 */

const state = {};

/**
 * SEARCH CONTROLLER 
 */

const controlSearch = async () => {
    // 1- Get query from view
    const query = searchView.getInput();
    //console.log(query);

    if (query) {
        // 2- New search object and add to state
        state.search = new Search(query);

        // 3- Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResult);

        try {
        // 4- Search for and parse ingredients 
       await state.search.getResults();
            
       // 5- Render search results on the UI
       clearLoader();
       searchView.renderResults(state.search.result);

         } catch (error) {
             alert('Search result not found. Try again...');
             clearLoader();
         }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResultPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        }
});


/**
 * RECIPE CONTROLLER 
 */
const controlRecipe = async () => {
    // Get ID from the URL
    const id = window.location.hash.replace('#', '');

    if (id) {

        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe); 

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {

        // Get recipe data
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        // Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        // Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        } catch(error) {
            alert('Error while processing recipe. Try again!')
        }
        
    }
};

// ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

const eventArray = ['hashchange', 'load'];
eventArray.forEach(event => window.addEventListener(event, controlRecipe));


/**
 * LIST CONTROLLER 
 */
const controlList = () => {
    // Create a new list IF there is none yet
    if (!state.list) state.list = new List;

    // Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {

        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);

        // Handle update count
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        if (val > 0) {
            state.list.updateCount(id, val);
        }
    }
});


/**
 * LIKE CONTROLLER 
 */

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;

    // User has NOT yet liked the recipe
    if (!state.likes.isLiked(currentID)) {
        // Add the like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
        );

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);
        
        //User HAS liked the recipe
    } else {
        // Remove like from state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikesMenu(state.likes.getNumLikes());
};


//Restore likes recipe on page load
window.addEventListener('load', () => {
 state.likes = new Likes();

 // Restore likes
 state.likes.readStorage();

 // Toggle like button
 likesView.toggleLikesMenu(state.likes.getNumLikes());

 // Render the existing likes in the like menu
 state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-dec, .btn-dec *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }        
    } else if (e.target.matches('.btn-inc, .btn-inc *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);        
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Likes controller
        controlLike();
    }
});