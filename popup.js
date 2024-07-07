const firebaseConfig = {
    apiKey: "AIzaSyDd8qte_3nFCzorfYXcLpahSyc66zDKdso",
    authDomain: "byt-extension.firebaseapp.com",
    projectId: "byt-extension",
    storageBucket: "byt-extension.appspot.com",
    messagingSenderId: "538888979425",
    appId: "1:538888979425:web:35800ae5f0bb8e528148a0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const mainContainer = document.getElementById("main-container");
const loginContainer = document.getElementById("login_container");
const ticketContainer = document.getElementById("ticket-container");
let userDetails = "";
let ticketArr = [];
document.getElementById("login_btn").addEventListener("click", handleSignIn);
document.getElementById("logout_btn").addEventListener("click", handleSignOut);
document.getElementsByClassName("search-bar")[0].addEventListener("input", handleSearch);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        userDetails = user;
        onLogin();
    } else {
        userDetails = "";
        onLogout();
    }
});

function handleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            console.log(result.user);
        }).catch((error) => {
            console.log(error);
        });
}

function handleSignOut() {
    firebase.auth().signOut().then(() => {
        console.log("signed out");
    }).catch((error) => {
        console.error(error);
    });
}

async function onLogin() {
    mainContainer.style.display = "block";
    loginContainer.style.display = "none";
    ticketArr = await fetchTickets(userDetails.uid)
    displayTickets(ticketArr);
}

function onLogout() {
    mainContainer.style.display = "none";
    loginContainer.style.display = "flex";
}

async function fetchTickets(uid) {
    const url = `https://byt-portal.herokuapp.com/api/all-tickets/${uid}`;
    try {
        let json = await fetch(url);
        let data = await json.json();
        if (data.message === "ok") {
            return data.data;
        }
    } catch (error) {
        console.error(error);
    }
}

function displayTickets(ticketArr) {
    ticketContainer.innerHTML = "";
    if (ticketArr.length === 0) {
        ticketContainer.innerHTML = `<div id="no-ticket-prompt-wrapper">
                                        <h3>It seems you don't have any tickets</h3>
                                        <br>
                                        <p> <a href="https://byt-portal.herokuapp.com/ticket" target="_blank">Click Here</a> to create tickets </p>
                                    </div>`;
        return;
    }
    ticketArr.forEach((elem, idx) => {
        ticketContainer.innerHTML += `<div class="ticket-card">
                                        <div>
                                        <a href="https://byt-portal.herokuapp.com/form/${elem._id}" target="_blank" class="ticket_name">
                                            <span class="ticket_name">${elem.ticketName}</span></a> <b>·</b>
                                            <span>${new Date(elem.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <abbr title="Click to fill form">
                                            <img src="./static/add_icon.svg" alt="add_icon" class="add_icon" id=${idx}>
                                        </abbr>
                                    </div>`;
    })
    let addIcon = document.getElementsByClassName("add_icon");
    Array.from(addIcon).forEach(e => {
        e.addEventListener("click", handleAdd);
    })
}

async function handleAdd(e) {
    let data = await fetchTickets(userDetails.uid);
    let formData = data[e.target.id];
    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
        chrome.tabs.sendMessage(activeTabs[0].id, formData);
    });
}

function handleSearch(e) {
    let searchQuery = e.target.value.toLowerCase();
    const newArr = ticketArr.filter(elem => elem.ticketName.toLowerCase().includes(searchQuery));
    if (newArr.length !== 0) {
        displayTickets(newArr);
    } else {
        ticketContainer.innerHTML = `<div class="no-search-found">
                                        No ticket named "${searchQuery}"
                                    </div>`
    }
}