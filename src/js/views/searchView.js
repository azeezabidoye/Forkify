import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
     elements.searchInput.value = '';
};

 export const limitRecipeTitle = (title, limit = 17) => {

    if (title.length > limit) {
        const newTitle = [];
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        //return the result
        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResultPages.innerHTML = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    if (document.querySelector(`.result__link[href*="#${id}"]`)) {
        el.classList.remove('results__link--active');
        document.querySelector(`.result__link[href*="#${id}"]`).classList.add('results__link--active');
    }
    //document.querySelector(`a[href*="#${id}"]`).classList.add('results__link--active');
};

const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButtons = (page, numResults, resultPerPage) => {
    const pages = Math.ceil(numResults / resultPerPage);

    let button;
    if (page === 1 && pages > 1) {
        // Only button to the next page
        button = createButton(page, 'next');
    } else if (page < pages) {
        // Both buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    } else if (page === pages && pages > 1) {
        // Only button to the prev page
        button = createButton(page, 'prev');
    }

    elements.searchResultPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resultPerPage = 10) => {
    // Render results per page
    const start = (page - 1) * resultPerPage;
    const end = page * resultPerPage;

    recipes.slice(start, end).forEach(renderRecipe);

    // Render pagination buttons
    renderButtons(page, recipes.length, resultPerPage);
};