let calorieGoal = 2500;
let proteinGoal = 160;
let waterGoal = 2;

const savedProfile = JSON.parse(localStorage.getItem("profile"));

if (savedProfile) {
    calorieGoal = savedProfile.calorieGoal || 2500;
    proteinGoal = savedProfile.proteinGoal || 160;
    waterGoal = savedProfile.waterGoal || 2;
}

const foodsContainer = document.getElementById("foodsContainer");
const mealList = document.getElementById("mealList");
const searchInput = document.getElementById("searchInput");

let meals = JSON.parse(localStorage.getItem("meals")) || [];

renderFoods(foods);
renderMeals();
updateDashboard();
updateLabCard();

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const filtered = foods.filter(food =>
            food.name.toLowerCase().includes(searchInput.value.toLowerCase())
        );

        renderFoods(filtered);
    });
}

function renderFoods(list) {
    if (!foodsContainer) return;

    foodsContainer.innerHTML = "";

    list.forEach(food => {
        foodsContainer.innerHTML += `
            <div class="food">
                <h3>${food.emoji} ${food.name}</h3>
                <p>${food.calories} kcal</p>
                <p>💪 ${food.protein || 0}g proteína</p>

                <button onclick="addMeal('${food.name}')">
                    ➕ Agregar
                </button>
            </div>
        `;
    });
}

function addMeal(name) {
    const food = foods.find(f => f.name === name);
    if (!food) return;

    const existing = meals.find(m => m.name === name);

    if (existing) {
        existing.quantity++;
    } else {
        meals.push({
            ...food,
            protein: food.protein || 0,
            quantity: 1
        });
    }

    saveData();
    renderMeals();
    updateDashboard();

    showToast(`${food.emoji} ${food.name}<br>+${food.calories} kcal`);
}

function renderMeals() {
    if (!mealList) return;

    mealList.innerHTML = "";

    if (meals.length === 0) {
        mealList.innerHTML = `<p class="empty">Todavía no agregaste comidas.</p>`;
        return;
    }

    meals.forEach(meal => {
        const calories = meal.calories * meal.quantity;
        const protein = (meal.protein || 0) * meal.quantity;

        mealList.innerHTML += `
            <div class="meal">
                <div>
                    ${meal.emoji} ${meal.name}
                    <br>
                    <small>${calories} kcal</small>
                    <br>
                    <small>💪 ${protein}g proteína</small>
                </div>

                <div class="counter">
                    <button onclick="changeQty('${meal.name}', -1)">-</button>
                    <span>${meal.quantity}</span>
                    <button onclick="changeQty('${meal.name}', 1)">+</button>
                </div>
            </div>
        `;
    });
}

function changeQty(name, value) {
    const meal = meals.find(m => m.name === name);
    if (!meal) return;

    meal.quantity += value;

    if (meal.quantity <= 0) {
        meals = meals.filter(m => m.name !== name);
    }

    saveData();
    renderMeals();
    updateDashboard();
}

function resetDay() {
    if (confirm("¿Borrar todas las comidas de hoy?")) {
        meals = [];
        saveData();
        renderMeals();
        updateDashboard();
        showToast("🗑 Día reiniciado");
    }
}

function saveData() {
    localStorage.setItem("meals", JSON.stringify(meals));
}

function updateDashboard() {
    let totalCalories = 0;
    let totalProtein = 0;

    meals.forEach(meal => {
        totalCalories += meal.calories * meal.quantity;
        totalProtein += (meal.protein || 0) * meal.quantity;
    });

    const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
    const proteinPercent = Math.min((totalProtein / proteinGoal) * 100, 100);

    const calorieBar = document.getElementById("calorieBar");
    const proteinBar = document.getElementById("proteinBar");
    const calorieText = document.getElementById("calorieText");
    const proteinText = document.getElementById("proteinText");

    if (calorieBar) calorieBar.style.width = caloriePercent + "%";
    if (proteinBar) proteinBar.style.width = proteinPercent + "%";

    if (calorieText) {
        calorieText.innerText = `${Math.round(totalCalories)} / ${calorieGoal} kcal`;
    }

    if (proteinText) {
        proteinText.innerText = `${Math.round(totalProtein)} / ${proteinGoal}g`;
    }
}

function calculateProfile() {
    const gender = document.getElementById("gender").value;
    const age = Number(document.getElementById("age").value);
    const weight = Number(document.getElementById("weight").value);
    const height = Number(document.getElementById("height").value);
    const activity = Number(document.getElementById("activity").value);
    const goal = document.getElementById("goal").value;

    if (!age || !weight || !height) {
        alert("Completá edad, peso y altura.");
        return;
    }

    let bmr;

    if (gender === "male") {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    const maintenance = bmr * activity;

    if (goal === "cut") {
        calorieGoal = Math.round(maintenance - 400);
    } else if (goal === "bulk") {
        calorieGoal = Math.round(maintenance + 300);
    } else {
        calorieGoal = Math.round(maintenance);
    }

    proteinGoal = Math.round(weight * 2);
    waterGoal = Number((weight * 0.035).toFixed(1));

    localStorage.setItem("profile", JSON.stringify({
        calorieGoal,
        proteinGoal,
        waterGoal
    }));

    updateDashboard();
    updateLabCard();

    showToast(`
        🎯 Objetivos actualizados<br>
        🔥 ${calorieGoal} kcal<br>
        💪 ${proteinGoal}g proteína
    `);
}

function openUniverse(category) {
    const universeGrid = document.querySelector(".universe-grid");
    const universePage = document.getElementById("universePage");
    const universeTitle = document.getElementById("universeTitle");
    const labPage = document.getElementById("labPage");
    const foodsContainer = document.getElementById("foodsContainer");

    if (universeGrid) universeGrid.style.display = "none";
    if (universePage) universePage.style.display = "block";

    if (category === "Lab") {
        if (universeTitle) universeTitle.innerText = "🧬 Calorie Lab";
        if (labPage) labPage.style.display = "block";
        if (foodsContainer) foodsContainer.style.display = "none";
        return;
    }

if (category === "Progress") {

    if (universeTitle) universeTitle.innerText = "🏆 Progress Center";

    if (labPage) labPage.style.display = "none";

    if (foodsContainer) foodsContainer.style.display = "block";

    foodsContainer.innerHTML = `
        <div class="profile-card">

            <h2>🏆 Tu progreso</h2>

            <p>🔥 Calorías objetivo: ${calorieGoal} kcal</p>
            <p>💪 Proteína objetivo: ${proteinGoal}g</p>
            <p>💧 Agua objetivo: ${waterGoal}L</p>

            <hr>

            <p>📋 Comidas registradas hoy: ${meals.length}</p>
            <p>⭐ Nivel actual: 1</p>
            <p>⚡ XP: ${meals.length * 10} / 100</p>

        </div>
    `;

    return;
}

    if (labPage) labPage.style.display = "none";
    if (foodsContainer) foodsContainer.style.display = "block";

    if (universeTitle) universeTitle.innerText = getUniverseName(category);

    const filtered = foods.filter(food => food.category === category);
    renderFoods(filtered);
}

function closeUniverse() {
    const universeGrid = document.querySelector(".universe-grid");
    const universePage = document.getElementById("universePage");
    const labPage = document.getElementById("labPage");
    const foodsContainer = document.getElementById("foodsContainer");

    if (universeGrid) universeGrid.style.display = "grid";
    if (universePage) universePage.style.display = "none";
    if (labPage) labPage.style.display = "none";
    if (foodsContainer) foodsContainer.style.display = "block";
}

function getUniverseName(category) {
    const names = {
        Desayunos: "☀️ Morning Galaxy",
        Almuerzos: "🔥 Energy Core",
        Snacks: "🍫 Sweet Zone",
        Bebidas: "💧 Hydro World",
        Fitness: "💪 Protein Dimension"
    };

    return names[category] || category;
}

function showToast(text) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.innerHTML = text;
    toast.style.opacity = 1;

    setTimeout(() => {
        toast.style.opacity = 0;
    }, 2500);
}
function updateLabCard(){

    const labInfo =
    document.getElementById("labInfo");

    if(!labInfo) return;

    const profile =
    JSON.parse(
        localStorage.getItem("profile")
    );

    if(!profile){

        labInfo.innerHTML = `
            <p>
                Calculá tus metas personalizadas
            </p>

            <span>
                Explorar →
            </span>
        `;

        return;
    }

    labInfo.innerHTML = `

        <p>
            🎯 Objetivo actual
        </p>

        <p>
            🔥 ${profile.calorieGoal} kcal
        </p>

        <p>
            💪 ${profile.proteinGoal}g
        </p>

        <p>
            💧 ${profile.waterGoal}L
        </p>

    `;

}