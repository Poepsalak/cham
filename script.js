let currentTeam = "";
let budget = 10000000;
let squad = [];
let league = {};
let transferList = [];
let matchday = 0;

const allTeams = [
  "FC Ryan", "Rotterdam Rebels", "FC JJ", "ChampDivisie XI", "Den Haag United",
  "Ajax Reserve", "Oranje FC", "Eindhoven Stars", "Amsterdam Warriors", "Rotterdam Lions",
  "AFC Ajax", "Manchester United", "Bayern München", "Liverpool"
];

const firstNames = ["Noah", "Liam", "Lucas", "Mason", "Ethan", "James"];
const lastNames = ["Silva", "Johnson", "Brown", "Davis", "Martinez", "Taylor"];
const positions = ["GK", "DEF", "MID", "FW"];

const initialRating = () => Math.floor(Math.random() * 20) + 60;
const playerMarketValue = (rating, position) => {
  let base = 5000000;
  if (position === "FW") base += 2000000;
  if (position === "MID") base += 1000000;
  if (position === "DEF") base += 500000;
  return base + rating * 50000;
};

function generatePlayer() {
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const position = positions[Math.floor(Math.random() * positions.length)];
  const rating = initialRating();
  const value = playerMarketValue(rating, position);
  return { name, position, rating, value };
}

document.getElementById("start-btn").onclick = () => {
  currentTeam = document.getElementById("team-selector").value;
  document.getElementById("team-select-section").style.display = "none";
  document.getElementById("game-section").style.display = "block";
  document.getElementById("team-name").innerText = currentTeam;
  startGame();
};

function startGame() {
  budget = 10000000;
  matchday = 0;
  squad = Array.from({ length: 11 }, () => generatePlayer());

  league = {};
  allTeams.forEach(team => {
    league[team] = { MP: 0, W: 0, D: 0, L: 0, Pts: 0, avgRating: 65 };
  });

  updateUI();
  populateTransferMarket();
}

function updateUI() {
  document.getElementById("budget").innerText = budget.toLocaleString();
  document.getElementById("squad-list").innerHTML = squad.map(p =>
    `<li>${p.name} - ${p.position} - Rating: ${p.rating} - Value: $${p.value.toLocaleString()}</li>`
  ).join("");

  const sorted = Object.entries(league).sort((a, b) => b[1].Pts - a[1].Pts);
  document.querySelector("#league-table tbody").innerHTML = sorted.map(([team, data]) =>
    `<tr><td>${team}</td><td>${data.MP}</td><td>${data.W}</td><td>${data.D}</td><td>${data.L}</td><td>${data.Pts}</td><td>${data.avgRating.toFixed(1)}</td></tr>`
  ).join("");

  document.getElementById("next-opponent").innerText = getNextOpponent();
}

function getNextOpponent() {
  const others = allTeams.filter(t => t !== currentTeam);
  return others[matchday % others.length];
}

document.getElementById("simulate-btn").onclick = () => simulateMatchday();

function simulateMatchday() {
  matchday++;

  const matchPairs = [];
  const shuffled = allTeams.slice().sort(() => Math.random() - 0.5);
  while (shuffled.length >= 2) {
    const team1 = shuffled.pop();
    const team2 = shuffled.pop();
    matchPairs.push([team1, team2]);
  }

  matchPairs.forEach(([team1, team2]) => {
    const rating1 = team1 === currentTeam ? getAvgRating(squad) : league[team1].avgRating;
    const rating2 = team2 === currentTeam ? getAvgRating(squad) : league[team2].avgRating;

    const prob1 = rating1 / (rating1 + rating2);
    const score1 = Math.floor(Math.random() * 3 + (prob1 > 0.55 ? 1 : 0));
    const score2 = Math.floor(Math.random() * 3 + (prob1 < 0.45 ? 1 : 0));

    league[team1].MP++;
    league[team2].MP++;

    if (score1 > score2) {
      league[team1].W++; league[team1].Pts += 3;
      league[team2].L++;
      if (team1 === currentTeam) budget += 1000000;
    } else if (score1 < score2) {
      league[team2].W++; league[team2].Pts += 3;
      league[team1].L++;
      if (team1 === currentTeam || team2 === currentTeam) budget += 0;
    } else {
      league[team1].D++; league[team1].Pts += 1;
      league[team2].D++; league[team2].Pts += 1;
      if (team1 === currentTeam || team2 === currentTeam) budget += 500000;
    }

    league[team1].avgRating = team1 === currentTeam ? getAvgRating(squad) : league[team1].avgRating;
    league[team2].avgRating = team2 === currentTeam ? getAvgRating(squad) : league[team2].avgRating;

    if (team1 === currentTeam || team2 === currentTeam) {
      document.getElementById("result").innerText = `Matchday ${matchday} complete.`;
      document.getElementById("commentary").innerText = `${team1} ${score1} - ${score2} ${team2}`;
    }
  });

  updateUI();
}

function getAvgRating(players) {
  return players.reduce((sum, p) => sum + p.rating, 0) / players.length;
}

function populateTransferMarket() {
  transferList = Array.from({ length: 10 }, () => generatePlayer());
  document.getElementById("transfer-market").innerHTML = transferList.map((p, i) =>
    `<li>${p.name} - ${p.position} - Rating: ${p.rating} - Value: $${p.value.toLocaleString()}
     <button onclick="buyPlayer(${i})">Buy</button></li>`
  ).join("");
}

function buyPlayer(index) {
  const p = transferList[index];
  if (budget >= p.value) {
    squad.push(p);
    budget -= p.value;
    transferList.splice(index, 1);
    populateTransferMarket();
    updateUI();
  } else {
    alert("Not enough funds!");
  }
}

document.getElementById("training-btn").onclick = () => {
  document.getElementById("game-section").style.display = "none";
  document.getElementById("training-section").style.display = "block";
  populateTraining();
};

document.getElementById("market-btn").onclick = () => {
  document.getElementById("game-section").style.display = "none";
  document.getElementById("market-section").style.display = "block";
  populateTransferMarket();
};

document.getElementById("packs-btn").onclick = () => {
  document.getElementById("game-section").style.display = "none";
  document.getElementById("packs-section").style.display = "block";
};

function populateTraining() {
  document.getElementById("training-list").innerHTML = squad.map(p =>
    `<li>${p.name} - Rating: ${p.rating}
     <button onclick="trainPlayer('${p.name}')">Train</button></li>`
  ).join("");
}

function trainPlayer(name) {
  const p = squad.find(x => x.name === name);
  if (budget >= 500000 && p.rating < 100) {
    p.rating++;
    budget -= 500000;
    p.value = playerMarketValue(p.rating, p.position);
    populateTraining();
    updateUI();
  }
}

function openPack(type) {
  const isSpecial = type === "special";
  const cost = isSpecial ? 1000000 : 500000;
  const rating = isSpecial
    ? Math.floor(Math.random() * 20) + 70
    : Math.floor(Math.random() * 15) + 55;

  if (budget < cost) return alert("Not enough money!");

  const player = {
    name: generatePlayer().name,
    position: positions[Math.floor(Math.random() * positions.length)],
    rating,
    value: playerMarketValue(rating, positions[Math.floor(Math.random() * positions.length)])
  };

  squad.push(player);
  budget -= cost;
  document.getElementById("pack-result").innerText = `You got ${player.name} - ${player.position} - Rating: ${player.rating}`;
  updateUI();
}

function goBack() {
  document.getElementById("training-section").style.display = "none";
  document.getElementById("market-section").style.display = "none";
  document.getElementById("packs-section").style.display = "none";
  document.getElementById("game-section").style.display = "block";
}

document.getElementById("save-btn").onclick = () => {
  const data = { currentTeam, budget, squad, league, matchday };
  localStorage.setItem("fm_save", JSON.stringify(data));
};

document.getElementById("load-btn").onclick = () => {
  const save = JSON.parse(localStorage.getItem("fm_save"));
  if (save) {
    currentTeam = save.currentTeam;
    budget = save.budget;
    squad = save.squad;
    league = save.league;
    matchday = save.matchday || 0;
    document.getElementById("team-select-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    document.getElementById("team-name").innerText = currentTeam;
    updateUI();
  }
};

document.getElementById("reset-btn").onclick = () => {
  // Clear save
  localStorage.removeItem("fm_save");

  // Clear game variables
  currentTeam = "";
  budget = 10000000;
  matchday = 0;
  squad = [];
  league = {};
  transferList = [];

  // Hide all sections
  document.getElementById("game-section").style.display = "none";
  document.getElementById("training-section").style.display = "none";
  document.getElementById("market-section").style.display = "none";
  document.getElementById("packs-section").style.display = "none";

  // Show team select screen
  document.getElementById("team-select-section").style.display = "block";
};
