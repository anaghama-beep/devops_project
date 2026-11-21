const addEventBtn = document.getElementById('addEventBtn');
const sr=ScrollReveal ({
  distance:'70px',
  duration:2700,
  reset:true
});
sr.reveal('.try1',{delay:200,origin:'right'});
sr.reveal('.conimg',{delay:200,origin:'left'});
sr.reveal('.ro',{delay:200,origin:'left'});
sr.reveal('.to',{delay:200,origin:'right'});












let selectedOption = null;
var flag = 0;

function selectOption(option) {
  flag=1;
  if (selectedOption) {
    selectedOption.classList.remove("active");
    // console.log(selectedOption.innerHTML);
  }
  option.classList.add("active");
  selectedOption = option;
  document.getElementById("selectBtn").disabled = false;
  if (addEventBtn) addEventBtn.textContent = "-";
}

document.getElementById("foots").addEventListener("click", function(event){
  console.log("hello"+event);
  flag=0;
  if (selectedOption) {
    selectedOption.classList.remove("active");
    selectedOption = null;
  }
  document.getElementById("selectBtn").disabled = true;
  if (addEventBtn) addEventBtn.textContent = "+";
});



document.getElementById("selectBtn").addEventListener("click", function() {
  alert("You selected: " + selectedOption.textContent.trim());
  window.location.href="https://docs.google.com/forms/d/e/1FAIpQLSfiv2wy4p2tK4iUaity0ZlwiBIB8by_XmLSYu9_F07yMcviFw/viewform?vc=0&c=0&w=1&flr=0";
});


const optionsList = document.getElementById('optionsList');

const cardList = document.querySelector('.card-list');
// const addButton = document.getElementById('add-card');

const cc = document.querySelector('.card-list-container')
const dragging = (e) => {
  cc.scrollLeft = e.pageX;
}

cc.addEventListener("mousemove", dragging);


// Club admins can add and remove events. Changes are saved through the API, so they
// persist for every visitor; the page reloads to show the updated list.
const clubId = document.body.dataset.club;

async function callApi(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
}

if (addEventBtn) {
  addEventBtn.addEventListener("click", async function () {
    try {
      if (flag == 1 && selectedOption) {
        const name = selectedOption.textContent.trim();
        if (!confirm(`Remove "${name}"?`)) return;
        await callApi("DELETE", `/events/${clubId}/${selectedOption.dataset.id}`);
      } else {
        const eventName = prompt("Enter the name of the new event:");
        if (!eventName) return;
        const eventDesc = prompt("Enter event description:");
        if (!eventDesc) return;
        await callApi("POST", `/events/${clubId}`, { eventName, eventDesc });
      }
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });
}


const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const list = document.getElementById("list");

searchBtn.addEventListener("click", function() {
  const searchValue = searchInput.value.toLowerCase();
  const listItems = document.querySelectorAll("li");
  
  for (let i = 0; i < listItems.length; i++) {
    const item = listItems[i];
    const itemValue = item.innerHTML.toLowerCase();
    if (itemValue.indexOf(searchValue) !== -1) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  }
});


function myfunc(){
  let s=document.getElementById("subMenu");
  s.classList.toggle("open-menu");
  s.style.background = 'black';
}

function myF() {
  var c1=document.getElementById("card1");
  var c2=document.getElementById("card2");
  if(c1.style.display !== "none") {
    c1.style.display="none";
    c2.style.display="block";
  }
  else if(c2.style.display !== "none") {
    c2.style.display="none";
    c1.style.display="block";
  }
  
}




function myfunc(){
  let s=document.getElementById("subMenu");
  s.classList.toggle("open-menu");
  s.style.background = 'black';
}


