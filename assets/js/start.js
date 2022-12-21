var cat, budget, wsid, socket


function renderIndex(){
  var root = document.getElementById("root");
  root.innerHTML = ``
  var index = document.createElement("div");
  index.innerHTML = `
    <div class="row g-5">
      <h1 class="display-1 text-center">My PC Builder</h1>
    </div>
  `
  var buttons = document.createElement("div")
  buttons.setAttribute("class", "row justify-content-center g-3")
  buttons.innerHTML += `
    <div class="col-sm-2 text-center">
      <button type="button" class="btn btn-lg btn-primary" onclick="startBuild(0)">Start Your Build</button>
    </div>
  `
  if (verifyLogin())
    buttons.innerHTML += `
        <div class="col-sm-2 text-center">
          <button type="button" class="btn btn-lg btn-primary" onclick="showHistory()">Saved Configs</button>
        </div>
        <div class="col-sm-2 text-center">
          <button type="button" class="btn btn-lg btn-outline-secondary" onclick="logout()">Log out</button>
        </div>
    `
  else
    buttons.innerHTML += `
        <div class="col-sm-2 text-center">
          <button type="button" class="btn btn-lg btn-outline-success" onclick="login()">Login</button>
        </div>
    `
  index.id = 'index'
  index.setAttribute("class", "row align-items-center")
  index.appendChild(buttons)
  root.appendChild(index)
}


function login(){
      location.href = "https://mypcbuilder.auth.us-east-1.amazoncognito.com/login?client_id=bg2ikb0pic2v20gjoig9m12rk&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://coms6998-final-frontend.s3.amazonaws.com/login.html"
}


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function deleteCookie(name, path) {
  if(getCookie(name)) {
    document.cookie = name + "=" +
      ((path) ? ";path="+path:"")+
      ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
}


function logout() {
  deleteCookie("access_token", "/index.html");
  deleteCookie("login-time", "/index.html");
  renderIndex();
}



function startBuild(mode) {
  if (mode === 0)
    window.configId = new Date().getTime()
  renderCategory()
}


function renderCategory(){
  var root = document.getElementById("root");
  root.innerHTML = ``
  var cat = document.createElement("div");
  cat.innerHTML = `
    <div class="row text-center g-5">
      <h1>What describes you most?</h1>
    </div>
    <div class="row g-2">
      <div class="col align-self-center text-center">
        <button type="button" class="btn btn-primary btn-lg" onclick="handleCat(0)">Students</button>
      </div>
    </div>
    <div class="row g-2">
      <div class="col align-self-center text-center">
        <button type="button" class="btn btn-primary btn-lg" onclick="handleCat(1)">Gamers</button>
      </div>
    </div>
    <div class="row g-2">
      <div class="col align-self-center text-center">
        <button type="button" class="btn btn-primary btn-lg" onclick="handleCat(2)">Common Users</button>
      </div>
    </div>
    <br><br>
    <div class="row g-2">
      <div class="col align-self-center text-center">
        <button type="button" class="btn btn-secondary" onclick="renderIndex()">Back</button>
      </div>
    </div>
  `
  cat.id = 'category'
  cat.setAttribute("class", "row align-items-center")
  root.appendChild(cat)
}


function handleCat(category){
  if (category === 0)	{//student
    console.log("student")
    cat = 'student'
  }
  else if (category === 1) {//gamer
    console.log("gamer")
    cat = 'gamer'
    
  }
  else if (category === 2) {//common user
    console.log("common user")
    cat = 'common_user'
  }
  renderBudget()
}


function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


function validateRecommend() {
  if (!isNumeric(budget) || parseFloat(budget) <= 0) {
    document.getElementById("errorMessage").innerHTML = `
      <div class="alert alert-danger col-sm-4">
        Please enter a positive number
      </div>
    `
    return false
  }
  return true
}


function renderBudget(){
  var root = document.getElementById("root");
  root.innerHTML = ``
  var budget = document.createElement("div");
  budget.innerHTML = `
    <div class="row text-center g-5">
      <h1>What is your budget?</h1>
    </div>
    <div class="row text-center g-3">
      <form action="javascript:handleRecommend()" onsubmit="return validateRecommend()">
        <div class="row justify-content-center">
          <label for="budget" class="col-sm-1 col-form-label">Budget:</label>
          <div class="col-sm-2">
            <div class="input-group">
              <span class="input-group-text" id="dollar-symb">$</span>
              <input type="text" class="form-control" id="budget" aria-describedby="dollar-symb" onchange="changeBudget(this.value)">
            </div>
          </div>
        </div>
        <div id="errorMessage" class="row justify-content-center mt-1">
        </div>
        <div class="row justify-content-center mt-3">
          <div class="col-sm-1">
            <button type="submit" class="btn btn-outline-primary">Confirm</button>
          </div>
          <div class="col-sm-1">
            <button type="button" class="btn btn-secondary" onclick="renderIndex()">Back</button>
          </div>
        </div>
      </form>
    </div>
  `
  budget.id = 'budget'
  budget.setAttribute("class", "row align-items-center")
  root.appendChild(budget)
}


function changeBudget(x) {
  budget = x
}


function socketMessageListener(e) {
  console.log(e.data)
}


async function startSocket() {
  socket = new WebSocket("wss://bw6jp4efqf.execute-api.us-east-1.amazonaws.com/test")
  socket.onopen = function(e) {
    socket.send("")
  }
  await new Promise(resolve => socket.onmessage = (e) => {
    let obj = JSON.parse(e.data)
    console.log(obj)
    if (obj.connectionId != undefined) {
      wsid = obj.connectionId
    }
    resolve()
  })
  socket.onmessage = socketMessageListener
}


async function postRecommend() {
  const response = await fetch('https://ucw66zuax1.execute-api.us-east-1.amazonaws.com/v1/recommend', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      level: cat,
      budget: budget,
      connectionId: wsid
    })
  })
  return response.json()
}


function renderWaiting() {
  var root = document.getElementById("root");
  root.innerHTML = ``
  var waiting = document.createElement("div");
  waiting.innerHTML = `
    <div class="row g-5 text-center">
      <h1> Waiting for results... </h1>
    </div>
    <div class="row g-2 justify-content-center">
      <div class="col col-sm-2 text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `
  waiting.id = 'waiting'
  waiting.setAttribute("class", "row align-items-center")
  root.appendChild(waiting)
}


async function handleRecommend() {
  console.log('budget = '+budget)
  console.log('level = '+cat)

  await startSocket()
  
  const res = await postRecommend()
  console.log(res)

  renderWaiting()

  await new Promise(resolve => socket.onmessage = (e) => {
    let obj = JSON.parse(e.data)
    console.log(obj)
    
    //render recommendation here
    //var root = document.getElementById("root")
    //root.innerHTML = `` + e.data
    window.modelUrls = obj['URL']
    window.prices = obj['Price']
    window.benchmarks = obj['benchmark']
    console.log(window.modelUrls)
    console.log(window.prices)
    recommend(obj['models'])
    
    resolve()
  })
  socket.onmessage = socketMessageListener
  socket.close()
}