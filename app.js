let calorieGoal = 2500;
let proteinGoal = 160;
let waterGoal = 2;

let waterToday = Number(localStorage.getItem("waterToday")) || 0;
let currentWeight = Number(localStorage.getItem("currentWeight")) || 0;
let goalWeight = Number(localStorage.getItem("goalWeight")) || 0;
let startWeight = Number(localStorage.getItem("startWeight")) || 0;

let weightHistory = JSON.parse(localStorage.getItem("weightHistory")) || [];

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
updateHydroCard();

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
    const goalWeightInput = Number(document.getElementById("goalWeight").value);

    if (!age || !weight || !height) {
        alert("Completá edad, peso y altura.");
        return;
    }

    currentWeight = weight;
    goalWeight = goalWeightInput || weight;

if (!startWeight) {
    startWeight = weight;
}

localStorage.setItem("currentWeight", currentWeight);
localStorage.setItem("goalWeight", goalWeight);
localStorage.setItem("startWeight", startWeight);

if (
    weightHistory.length === 0 ||
    weightHistory[weightHistory.length - 1] !== weight
) {
    weightHistory.push(weight);
    localStorage.setItem("weightHistory", JSON.stringify(weightHistory));
}

    if (!startWeight) {
        startWeight = weight;
    }

    localStorage.setItem("currentWeight", currentWeight);
    localStorage.setItem("goalWeight", goalWeight);
    localStorage.setItem("startWeight", startWeight);

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
        💪 ${proteinGoal}g proteína<br>
        💧 ${waterGoal}L agua
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

if (category === "Bebidas") {
    if (universeTitle) universeTitle.innerText = "💧 Hydro World";
    if (labPage) labPage.style.display = "none";
    if (foodsContainer) foodsContainer.style.display = "block";

    renderHydroWorld();
    return;
}

if (category === "Progress") {

    if (universeTitle)
        universeTitle.innerText = "🏆 Progress Center";

    if (labPage)
        labPage.style.display = "none";

    if (foodsContainer)
        foodsContainer.style.display = "block";

    let progress = 0;

    if (
        startWeight &&
        goalWeight &&
        startWeight !== goalWeight
    ) {

        progress =
            ((startWeight - currentWeight) /
            (startWeight - goalWeight)) * 100;

        progress =
            Math.max(
                0,
                Math.min(progress, 100)
            );
    }

    if (category === "Scanner") {
    if (universeTitle) universeTitle.innerText = "📷 Food Scanner";
    if (labPage) labPage.style.display = "none";
    if (foodsContainer) foodsContainer.style.display = "block";

    renderFoodScanner();
    return;
}
    
    foodsContainer.innerHTML = `
    <div class="profile-card">

        <h2>🏆 Tu progreso</h2>

        <p>⚖️ Peso inicial: ${startWeight}kg</p>
        <p>📍 Peso actual: ${currentWeight}kg</p>
        <p>🎯 Objetivo: ${goalWeight}kg</p>

        <div class="progress-label">
            📈 ${Math.round(progress)}%
        </div>

        <div class="progress-track">
            <div
                class="progress-fill"
                style="width:${progress}%">
            </div>
        </div>

        <p style="margin-top:15px; color:#00d4ff; font-weight:700;">

            🚀 ${
                progress < 25
                ? "Despegando"
                : progress < 50
                ? "Tomando ritmo"
                : progress < 75
                ? "Imparable"
                : "Casi lo lográs"
            }

        </p>

        <br>

        <h3>📋 Historial</h3>

        ${
            weightHistory.length
            ? weightHistory.map(
                w => `<p>⚖️ ${w}kg</p>`
            ).join("")
            : "<p>Todavía no hay historial.</p>"
        }

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
function addWater(amount) {
    waterToday += amount;

    if (waterToday < 0) {
        waterToday = 0;
    }

    waterToday = Number(waterToday.toFixed(2));

    localStorage.setItem("waterToday", waterToday);

    updateDashboard();
    showToast(`💧 Agua: ${waterToday}L / ${waterGoal}L`);
}

function renderHydroWorld() {
    const percent = Math.min((waterToday / waterGoal) * 100, 100);

    foodsContainer.innerHTML = `
        <div class="profile-card">
            <h2>💧 Hydro World</h2>
            <p>Registrá tu hidratación diaria.</p>

            <h3>${waterToday.toFixed(2)}L / ${waterGoal}L</h3>

            <div class="progress-track">
                <div class="progress-fill" style="width:${percent}%"></div>
            </div>

            <br>

            <button onclick="addWater(0.25)">+ 250ml</button>
            <button onclick="addWater(-0.25)">- 250ml</button>
        </div>
    `;
}

function renderProgressCenter() {
    let progress = 0;

    if (startWeight && goalWeight && startWeight !== goalWeight) {
        progress =
            ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;

        progress = Math.max(0, Math.min(progress, 100));
    }

    foodsContainer.innerHTML = `
        <div class="profile-card">
            <h2>🏆 Progress Center</h2>

            <p>⚖️ Peso inicial: ${startWeight || "-"}kg</p>
            <p>📍 Peso actual: ${currentWeight || "-"}kg</p>
            <p>🎯 Objetivo: ${goalWeight || "-"}kg</p>

            <h3>📈 Progreso: ${Math.round(progress)}%</h3>

            <div class="progress-track">
                <div class="progress-fill protein" style="width:${progress}%"></div>
            </div>

            <br>

            <h3>📋 Historial</h3>

            <div class="history">
                ${
                    weightHistory.length
                    ? weightHistory.map(w => `<p>⚖️ ${w}kg</p>`).join("")
                    : "<p>Todavía no hay historial.</p>"
                }
            </div>
        </div>
    `;
}
function addWater(amount) {
    waterToday += amount;

    if (waterToday < 0) {
        waterToday = 0;
    }

    waterToday = Number(waterToday.toFixed(2));

    localStorage.setItem("waterToday", waterToday);

    renderHydroWorld();
    updateHydroCard();

    showToast(`💧 Agua: ${waterToday}L / ${waterGoal}L`);
}
function updateHydroCard() {
    const hydroInfo = document.getElementById("hydroInfo");

    if (!hydroInfo) return;

    hydroInfo.innerHTML = `
        <p>💧 ${waterToday}L / ${waterGoal}L</p>
        <span>Explorar →</span>
    `;
}
function renderFoodScanner() {
    foodsContainer.innerHTML = `
        <div class="profile-card">
            <h2>📷 Food Scanner</h2>
            <p>Sacá o subí una foto de tu comida.</p>

            <input 
                type="file" 
                id="foodImageInput" 
                accept="image/*" 
                capture="environment"
                onchange="previewFoodImage(event)"
            >

            <div id="imagePreview"></div>

            <h3>¿Qué comida es?</h3>

            <select id="scannerFoodSelect">
                ${foods.map(food => `
                    <option value="${food.name}">
                        ${food.emoji} ${food.name} - ${food.calories} kcal
                    </option>
                `).join("")}
            </select>

            <button onclick="addScannedFood()">
                ➕ Agregar comida detectada
            </button>
        </div>
    `;
}

function previewFoodImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("imagePreview");

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    preview.innerHTML = `
        <img 
            src="${imageUrl}" 
            class="scanner-preview"
            alt="Comida escaneada"
        >
    `;
}

function addScannedFood() {
    const selectedName = document.getElementById("scannerFoodSelect").value;

    addMeal(selectedName);

    showToast("📷 Comida agregada desde scanner");
}