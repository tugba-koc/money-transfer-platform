const state = {
  userList: [],
  transfer: {},
};

// WARNING START

let warningArea = document.getElementById("warning-area");

function warning(type) {
  return `<div class="alert alert-warning alert-dismissible fade show " role="alert">
  <strong>Dikkat!</strong>
  ${type == "warning" ? "Tüm Bilgileri Girdiğinizden Emin Olun!" : type == "warning-transfer-empty" ? "Boş Bir Alan Bırakmadığınızdan Emin Olun!" : type=="warning-amount" && "Kullanıcının Bakiyesinden Fazla Para Transferi Gerçekleştirilemez!" }  

  <button type="button" class="btn-close p-0 m-3" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}

// WARNING END

// USER LIST START

// id defined as global variable
let id = 0;

// add new user
function submitHandler(event) {
  // prevent default behavior (refresh)
  event.preventDefault();
  let name = document.getElementById("name").value;
  let money = document.getElementById("money").value;

  if (name && money) {
    //  if input is not empty, add new user to list with id
    id++;
    setState("userList", [{ name, money, id }]);
    renderUserList();
    renderTransferSend();
    renderHistoryList(state.userList, "add");
  } else {
    // if input is empty, show warning
    warningArea.innerHTML = warning("warning");
  }
  document.getElementById("name").value = "";
  document.getElementById("money").value = "";
}

function setState(type, arguments) {
  // set new state
  if (type == "userList") {
    state.userList.push(...arguments);
  } else if (type == "transfer") {
    state.transfer = arguments;
  }
}

let outputArea = document.getElementById("output-area");

// create user list element and append to output area (render)
function renderUserList() {
  outputArea.innerHTML = "";
  state.userList.forEach(function (el) {
    let newRow = document.createElement("tr");
    let newName = document.createElement("td");
    let newMoney = document.createElement("td");
    let deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", `btn btn-danger`);
    deleteButton.setAttribute("id", el.id);
    deleteButton.setAttribute("onclick", `deleteUser(${el.id})`);
    deleteButton.innerText = "Sil";
    newName.innerText = el.name;
    newMoney.innerText = el.money;
    newRow.appendChild(newName);
    newRow.appendChild(newMoney);
    newRow.appendChild(deleteButton);
    outputArea.appendChild(newRow);
  });
}

// user delete function
function deleteUser(id) {
  let user = state.userList.filter((user) => user.id === id);

  // send to history function to show delete operation
  renderHistoryList(user, "delete");

  // delete user from list
  state.userList = state.userList.filter((user) => user.id !== id);

  // delete user from output area
  renderUserList(state.userList);

  // delete user from transfer-send list
  renderTransferSend();
}

// USER LIST END

// TRANSFER PART START

// input areas for transfer
let whoSend = document.getElementById("who-send");
let whoReceive = document.getElementById("who-receive");

// transfer-send list function (render)
function renderTransferSend() {
  whoSend.innerHTML = `<option selected>Kimden...</option>`;
  state.userList.forEach(function (element) {
    let newOption = document.createElement("option");
    newOption.setAttribute("value", element.name);
    newOption.innerText = element.name;
    whoSend.appendChild(newOption);
  });
}

// values for transfer equation
let selectedSend = "";
let selectedReceive = "";

// when user select a user from transfer-send list
whoSend.addEventListener("change", (event) => {
  selectedSend = whoSend.selectedOptions[0].value;

  // if user select a user from transfer-send list, set default value to transfer-receive list
  whoReceive.innerHTML = `<option selected>Kime...</option>`;

  // create rest options for transfer-receive list
  let restUserList = state.userList.filter((el) => el.name != selectedSend);

  // prevent showing same user in transfer-receive list
  renderTransferReceive(restUserList);
});

// when user select a user from transfer-receive list
whoReceive.addEventListener("change", (event) => {
  selectedReceive = whoReceive.selectedOptions[0].value;
});

// transfer-receive list function (render)
function renderTransferReceive(restUserList) {
  restUserList.forEach((el) => {
    let newOption = document.createElement("option");
    newOption.setAttribute("value", el.name);
    newOption.innerText = el.name;
    whoReceive.appendChild(newOption);
  });
}

let transferList = document.getElementById("transfer-list");

function renderHistoryList(user, type) {
  let userLi = document.createElement("li");
  // if user added, send to history list
  if (type == "add") {
    userLi.classList.add("text-end", "text-secondary");
    userLi.innerHTML = `${user[user.length - 1].name} kullanıcısı ${
      user[user.length - 1].money
    } TL bakiyesi ile kullanıcı listemize eklendi. ---`;
  }
  // if money transfered, send to history list
  else if (type == "transfer") {
    userLi.classList.add("text-success");
    userLi.innerText = `${user.selectedSend} kullanıcısından, ${user.selectedReceive} kullanıcısına ${user.amount} TL aktarıldı.`;
  }
  // if user deleted, send to history list
  else {
    userLi.classList.add("text-end", "text-danger");
    userLi.innerHTML = `${user[0].name} kullanıcısı silindi. ---`;
  }
  // append to history list
  let divElement = document.createElement("div");
  divElement.setAttribute("class", "py-3 bg-light");
  divElement.appendChild(userLi);

  transferList.prepend(divElement);
}

function submitToHistory(event) {
  // prevent default behavior (refresh)
  event.preventDefault();

  // if user points the amount field
  let amount = document.getElementById("amount-of-money").value;

  // if user points the amount more than user's money
  if (
    Number(amount) > Number(state.userList[1].money) 
  ) {
    warningArea.innerHTML = warning("warning-amount");
  } else {
    if (selectedSend && selectedReceive && amount) {
      setState("transfer", { selectedSend, selectedReceive, amount });
    } 
    // if user doesn't select a field, show warning
    else {
      warningArea.innerHTML = warning("warning-transfer-empty");
      return false;
    }

    // send to history function
    renderHistoryList(state.transfer, "transfer");

    // user list update
    state.userList.forEach(function (element) {
      if (element.name == selectedSend) {
        element.money = element.money - parseInt(amount);
      }
      if (element.name == selectedReceive) {
        element.money = Number(element.money) + Number(amount);
      }
    });

    // transfer value reset
    setState("transfer", {});

    // render user list according to updated values
    renderUserList();

    document.getElementById("amount-of-money").value = "";
  }
}
