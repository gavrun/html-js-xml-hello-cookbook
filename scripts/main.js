// load recipes from xml file
async function loadRecipes() {
    
    // Fetch API (returns a promise), fetch XML file from specified path
    const response = await fetch('data/recipes.xml'); 
    
    // read response as plain text
    const text = await response.text(); 
    
    // create a DOMParser instance to parse XML content into a DOM Document
    const parser = new DOMParser(); 
    
    // parse string as XML content into a DOM object
    const xmlDoc = parser.parseFromString(text, 'application/xml') // throws if not well-formed
    
    // return all <recipe> elements from XML document with tag name
    return xmlDoc.getElementsByTagName('recipe');
}

// display recipes list
async function displayRecipes() {
    
    // load recipes by resolving promise after loading
    const recipes = await loadRecipes();  
    
    // select the first matching <ul> element within the #recipe-list section in the DOM
    const recipeList = document.querySelector('#recipe-list ul');  
    
    // clear content in the list by inner HTML structure of an element
    recipeList.innerHTML = '';
    
    // iterate through recipes and create list items for each one
    // converts an array-like object to a real array
    Array.from(recipes).forEach((recipe, index) => {
        
        // extract title of the recipe
        const title = recipe.querySelector('title').textContent;
        
        // create a new <li> element 
        const listItem = document.createElement('li');
        
        // set the text content of the list item to the recipe title
        listItem.textContent = title;
        
        // store the recipe index as a custom data attribute and append to the recipe list
        listItem.dataset.index = index; // dataset allows storing custom data attributes (data-*)
        recipeList.appendChild(listItem);
    });

    // add click event handler to each recipe list item
    addRecipeClickHandlers(recipes);
}

// add click handler 
function addRecipeClickHandlers(recipes) {
    
    // select all matching <li> elements within the recipe list
    const listItems = document.querySelectorAll('#recipe-list ul li');
    
    // iterates over each element in a list and attach a click event listener to each list item
    listItems.forEach((item) => {
        item.addEventListener('click', () => {
            
            // retrieve index of clicked recipe from the data attribute and display the details
            const index = item.dataset.index;
            displayRecipeDetails(recipes[index]);
        });
    });
}

// display recipe details
function displayRecipeDetails(recipe) {

    // select the #recipe-details section
    const detailsSection = document.querySelector('#recipe-details');
    
    // extract details from the recipe element
    const title = recipe.querySelector('title').textContent;
    const about = recipe.querySelector('about').textContent;
    const ingredients = recipe.querySelectorAll('ingredients ingredient'); // retrieves all matching child elements
    const instructions = recipe.querySelector('instructions').textContent;

    // construct image file path literal based on the recipe title
    const imageName = title.replace(/\s/g, '') + '.jpg'; // remove spaces by replacing substrings using regex
    const imagePath = `images/${imageName}`;

    // populate the #recipe-details section with the recipe information
    // sets the innerHTML structure inside the <li> element
    detailsSection.innerHTML = `
        <h2>${title}</h2>
        <img src="${imagePath}" alt="${title}" />
        <p><strong>About:</strong> ${about}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${Array.from(ingredients).map((ing) => `<li>${ing.textContent}</li>`).join('')} <!-- generate an <li> for each ingredient -->
        </ul>
        <h3>Instructions:</h3>
        <p>${instructions}</p>
    `;
}

// initialize by displaying the recipes when DOM is loaded
document.addEventListener('DOMContentLoaded', displayRecipes);