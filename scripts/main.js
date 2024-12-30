// load recipes from xml file
async function loadRecipes() {

    // Fetch API (returns a promise), fetch XML file from specified path
    const response = await fetch('data/recipes.xml');

    // read response as plain text
    const text = await response.text();

    // create a DOMParser instance to parse XML content into a DOM Document
    const parser = new DOMParser();

    // parse string as XML content into a DOM object
    xmlDoc = parser.parseFromString(text, 'application/xml') // save to global variable and throw if not well-formed

    // return all <recipe> elements from XML document with tag name
    return xmlDoc.getElementsByTagName('recipe');
}

// display recipes list
async function displayRecipes() {

    // load recipes by resolving promise after loading
    //const recipes = await loadRecipes();
    const recipes = xmlDoc.getElementsByTagName('recipe'); // from global variable

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

        // store the recipe index as a custom data attribute 
        // dataset allows storing custom data attributes (data-*)
        listItem.dataset.index = index; 

        // create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit';
        // add click event handler to each edit button
        editButton.addEventListener('click', () => {
            loadRecipeToForm(recipe, index); // load recipe data into the form
        });

        // create delete button and event handler
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', () => {
            deleteRecipeXml(index); // delete recipe
        });

        // append buttons to the list item
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        // append to the recipe list
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

    // check if base64 image element exists in XML
    const imageBase64 = recipe.querySelector('image') ? recipe.querySelector('image').textContent : ''; // extract string if true

    // update image source variable as base64 if provided, otherwise use file path
    const imageSrc = imageBase64 ? imageBase64 : imagePath;

    // populate the #recipe-details section with the recipe information
    // sets the innerHTML structure inside the <li> element
    detailsSection.innerHTML = `
        <h2>${title}</h2>
        <img src="${imageSrc}" alt="${title}" />
        <p><strong>About:</strong> ${about}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${Array.from(ingredients).map((ing) => `<li>${ing.textContent}</li>`).join('')} <!-- generate an <li> for each ingredient -->
        </ul>
        <h3>Instructions:</h3>
        <p>${instructions}</p>
    `;
}

// load recipe data to form
function loadRecipeToForm(recipe, index) {
    // filling form with recipe data
    document.querySelector('#recipe-title').value = recipe.querySelector('title').textContent;
    document.querySelector('#recipe-about').value = recipe.querySelector('about').textContent;
    document.querySelector('#recipe-ingredients').value = Array.from(
        recipe.querySelectorAll('ingredients ingredient')
    )
        .map((ing) => ing.textContent.trim()) // get ingredient string
        .join('; ');
    document.querySelector('#recipe-instructions').value = recipe.querySelector('instructions').textContent;

    // change save button logic to be an update button for updating recipe data
    const saveButton = document.querySelector('#save-recipe');
    saveButton.textContent = 'Update';
    saveButton.onclick = async () => {

        const imageInput = document.querySelector('#recipe-image');
        let imageBase64 = recipe.querySelector('image') ? recipe.querySelector('image').textContent : '';

        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            imageBase64 = await getBase64(file);
        }

        editRecipe(
            index,
            document.querySelector('#recipe-title').value,
            document.querySelector('#recipe-about').value,
            document.querySelector('#recipe-ingredients').value,
            document.querySelector('#recipe-instructions').value,
            imageBase64 // new base64 image string
        );

        // reset/change save button logic back
        saveButton.textContent = 'Save';
        saveButton.onclick = addNewRecipe;

        // reset details section
        document.querySelector('#recipe-details').innerHTML = '<p>Select a recipe to see details.</p>'; 
        // clearing form after update recipe data
        clearForm();
    };
}

// clear form
function clearForm() {
    document.querySelector('#recipe-title').value = '';
    document.querySelector('#recipe-about').value = '';
    document.querySelector('#recipe-ingredients').value = '';
    document.querySelector('#recipe-instructions').value = '';
    document.querySelector('#recipe-image').value = '';

    // reset/change save button logic back
    document.querySelector('#save-recipe').textContent = 'Save';
    document.querySelector('#save-recipe').onclick = addNewRecipe;
}

// add new recipe data element including image string
function addRecipeXml(title, about, ingredients, instructions, imageBase64) {

    // if (!xmlDoc) {
    //     console.error('XML document is not loaded.');
    //     return;
    // }
    
    const newRecipe = xmlDoc.createElement('recipe');

    const titleElem = xmlDoc.createElement('title');
    titleElem.textContent = title;
    newRecipe.appendChild(titleElem);

    const aboutElem = xmlDoc.createElement('about');
    aboutElem.textContent = about;
    newRecipe.appendChild(aboutElem);

    const ingredientsElem = xmlDoc.createElement('ingredients');
    ingredients.split(';').forEach((ingredient) => {
        const ingElem = xmlDoc.createElement('ingredient');
        ingElem.textContent = ingredient.trim(); // remove trailing spaces
        ingredientsElem.appendChild(ingElem);
    });
    newRecipe.appendChild(ingredientsElem);

    const instructionsElem = xmlDoc.createElement('instructions');
    instructionsElem.textContent = instructions;
    newRecipe.appendChild(instructionsElem);

    // saving image base64 string to xml file
    if (imageBase64) {
        const imageElem = xmlDoc.createElement('image');
        imageElem.textContent = imageBase64; 
        newRecipe.appendChild(imageElem);
    }

    // add new recipe as xml element
    xmlDoc.documentElement.appendChild(newRecipe);

    // refresh recipe list
    displayRecipes();
}

// edit existing recipe element in place, modified replace recipe data element when edit
function editRecipe(index, title, about, ingredients, instructions, imageBase64) {
    
    // current 
    const recipe = xmlDoc.getElementsByTagName('recipe')[index];

    // recipe.querySelector('title').textContent = title;
    // recipe.querySelector('about').textContent = about;

    // const ingredientsElem = recipe.querySelector('ingredients');

    // ingredientsElem.innerHTML = '';

    // // brake down ingredients by and add them one by one
    // ingredients.split(';').forEach((ingredient) => {
    //     const ingElem = xmlDoc.createElement('ingredient');
    //     ingElem.textContent = ingredient.trim();
    //     ingredientsElem.appendChild(ingElem);
    // });

    // recipe.querySelector('instructions').textContent = instructions;

    // const imageElem = recipe.querySelector('image') || xmlDoc.createElement('image');
    // imageElem.textContent = imageBase64;
    // if (!recipe.querySelector('image')) {
    //     recipe.appendChild(imageElem);
    // }

    // delete current
    xmlDoc.documentElement.removeChild(recipe);
    // add new
    addRecipeXml(title, about, ingredients, instructions, imageBase64);
}

// add a new recipe by calling function to add data to xml structure including image element
async function addNewRecipe() {

    const title = document.querySelector('#recipe-title').value.trim();
    const about = document.querySelector('#recipe-about').value.trim();
    const ingredients = document.querySelector('#recipe-ingredients').value.trim();
    const instructions = document.querySelector('#recipe-instructions').value.trim();
    const imageInput = document.querySelector('#recipe-image');

    let imageBase64 = '';

    // check if image file is provided
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        //
        imageBase64 = await getBase64(file); // convert file to base64
    }

    // write to xml
    addRecipeXml(title, about, ingredients, instructions, imageBase64);

    // clearing form after adding recipe data
    clearForm();
}

// transform img file into base64-encoded string
function getBase64(file) { 
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // file content to base64
        reader.onerror = (error) => reject(error); // if file reading fails
        reader.readAsDataURL(file); // file as Data URL
    });
}

// delete recipe from xml file
function deleteRecipeXml(index) { 
    
    const recipe = xmlDoc.getElementsByTagName('recipe')[index];
    
    // delete selected xml recipe element
    xmlDoc.documentElement.removeChild(recipe);

    displayRecipes();
    document.querySelector('#recipe-details').innerHTML = '<p>Select a recipe to see details.</p>'; // reset details section
}

// search recipe 
function searchRecipes(keyword) {
    
    // XPath query to match recipes containing keyword in title or about
    const xpathQuery = `//recipe[contains(title, '${keyword}') or contains(about, '${keyword}')]`;

    // evaluate XPath query and retrieve matching nodes
    const results = document.evaluate(xpathQuery, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    // convert snapshot of results to array
    const recipes = [];
    for (let index = 0; index < results.snapshotLength; index++) {
        recipes.push(results.snapshotItem(index));
    }
    
    return recipes;
}

// filter recipes list by ingredient
function filterRecipesByIngredient(ingredientFilter) {

    // XPath query to find recipes containing specified ingredient
    const xpathQuery = `//recipe[ingredients/ingredient[contains(text(), '${ingredientFilter}')]]`;

    const results = document.evaluate(xpathQuery, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    const recipes = [];
    for (let index = 0; index < results.snapshotLength; index++) {
        recipes.push(results.snapshotItem(index));
    }
    
    return recipes;
} 

// initialize by displaying the recipes when DOM is loaded
let xmlDoc;

document.addEventListener('DOMContentLoaded', async () => {

    await loadRecipes(); // loading existing data to global variable
    displayRecipes(); // loading existing items

    // event handler to clear form before adding new
    document.querySelector('#add-new-recipe').addEventListener('click', () => {
        clearForm(); 
    });
});
