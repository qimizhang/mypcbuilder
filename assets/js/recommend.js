const ratios = {
    'gamer': {
        'CPU': 0.24,
        'GPU': 0.60,
        'RAM': 0.10,
        'SSD': 0.08,
        'HDD': 0.05
    },
    'student': {
        'CPU': 0.40,
        'GPU': 0.35,
        'RAM': 0.10,
        'SSD': 0.10,
        'HDD': 0.05
    },
    'common': {
        'CPU': 0.55,
        'GPU': 0.10,
        'RAM': 0.18,
        'SSD': 0.11,
        'HDD': 0.06
    }
}

function getOption(hardware) {
    var price = window.prices[hardware]
    return `<option value='${hardware}'> ${hardware} $ ${price} </option>`
}

function logValue(selectElement) {
    const index = selectElement.selectedIndex;
    const newOption = selectElement.options[index].value
    const urlElement = document.getElementById(selectElement.id + 'url');
    urlElement.setAttribute("href", window.modelUrls[newOption])
    calculatePrice()
}


function recommend(hardwareData) {
    const root = document.getElementById('root');
    const waiting = document.getElementById("waiting")
    waiting.innerHTML = ''
    root.innnerHTML = ''
    const hardwareCategories = ['CPU', 'GPU', 'RAM', 'SSD', 'HDD'] //'CPU', 'GPU', 'RAM', 'SSD', 'HDD'

    if (!verifyLogin()) {
        const loginBotton = document.createElement('div');
        loginBotton.setAttribute("class", "col-sm-2 text-center")
        loginBotton.innerHTML = `<button type="button" class="btn btn-lg btn-outline-secondary" onclick="login()">Login</button>`
        root.appendChild(loginBotton)
    }

    var recommendHead = document.createElement('div')
    recommendHead.style.height = "170px"
    recommendHead.style.marginTop = "50px"
    recommendHead.style.marginBottom = "50px"
    recommendHead.style.marginLeft = "100px"
    recommendHead.style.marginRight = "100px"
    recommendHead.style.background = "gray"
    var recommendHeadHTML = "<div style='padding-top: 10px; padding-left: 30px'>Our suggestion is:</div>"
    for (var index in hardwareCategories) {
        let category = hardwareCategories[index]
        recommendHeadHTML += `<div style="padding-left: 30px">${category}: ${hardwareData[category][0]}</div>`
    }
    recommendHead.innerHTML = recommendHeadHTML

    let recommendResultHTML = "";
    for (let i = 0; i < hardwareCategories.length; i++) {
        const category = hardwareCategories[i];

        let selectHTML = `<div style="margin-left:150px;margin-bottom: 10px">`;
        selectHTML += `<div class='col-sm-2 text-center' style='margin-right: 100px;display:inline;font-size: 22px'>${category}</div>`
        selectHTML += `<select id='${category}' style='width:270px;height: 50px;border: 2px solid;box-shadow: 3px 3px gray;border-radius: 3px 3px 3px 3px' onchange='logValue(this)'>`
        for (let j = 0; j < hardwareData[category].length; j++) {
            selectHTML += getOption(hardwareData[category][j])
        }
        selectHTML += "</select>"
        selectHTML += "<div style='display:inline;margin-left: 40px;font-size: 18px'>Amazon purchase url: </div>"
        selectHTML += `<a id='${category}url' style='display:inline;font-size: 18px' href=${modelUrls[hardwareData[category][0]]}>Click Here </a>`
        selectHTML += "</div>"
        recommendResultHTML += selectHTML
    }

    root.appendChild(recommendHead)

    var recommendArea = document.createElement('div')
    recommendArea.id = "recommendBody"
    recommendArea.innerHTML = recommendResultHTML
    root.appendChild(recommendArea)
    // console.log(root)

    var submitButton = document.createElement('div')
    submitButton.id = "bottomElements"
    submitButton.style.marginTop = '50px'
    submitButton.innerHTML = "<div id='price' style='margin-left:250px;height:50px;width:100px;font-size: 25px; display:inline;'>Total $ 0</div>"
    // submitButton.innerHTML += "<div id='benchmark' style='margin-left:30px;height:50px;width:100px;font-size: 25px; display:inline;'>Bechmark: 0 </div>"
    submitButton.innerHTML += `<input type='button' id='saveConfig' class='btn btn-lg btn-outline-secondary' style='margin-left:50px;height:40px;width:130px;font-size: 18px;' value ='Save' onclick='saveConfig()'>`
    root.appendChild(submitButton)

    const backButton = document.createElement("input");
    // backButton.setAttribute("type", "button")
    backButton.type = "button"
    backButton.id = "backButton"
    backButton.setAttribute("onClick", "renderIndex()")
    backButton.setAttribute("class", "btn btn-lg btn-outline-secondary")
    backButton.value = "back"
    backButton.style = 'margin-left:25px;height:40px;width:130px;font-size: 18px;'
    const bottomElements = document.getElementById("bottomElements");
    bottomElements.appendChild(backButton)

    const markElement = document.createElement("div");
    markElement.id = "benchmark"
    markElement.style = 'margin-left:100px;margin-top:50px;height:300px;width:1000px;font-size: 25px;'
    markElement.innerHTML = "<div id='benchmark' style='margin-left:30px;height:50px;width:500px;font-size: 25px;'>Bechmark: </div>"
    bottomElements.appendChild(markElement)
    calculatePrice(prices)
    // var ramSelect = document.getElementById('RAM')
    // console.log(ramSelect.options[0].text)
}

function calculatePrice() {
    const hardwareCategories = ['CPU', 'GPU', 'RAM', 'SSD', 'HDD'];
    let totalPrice = 0;
    let totalGMark = 0;
    let totalCMark = 0;
    let totalSMark = 0;
    for (let i in hardwareCategories) {
        let category = hardwareCategories[i];
        const selectElement = document.getElementById(category);
        const index = selectElement.selectedIndex;
        totalPrice += window.prices[selectElement.options[index].value];
        totalGMark += window.benchmarks[selectElement.options[index].value]*ratios['gamer'][category];
        totalSMark += window.benchmarks[selectElement.options[index].value]*ratios['student'][category];
        totalCMark += window.benchmarks[selectElement.options[index].value]*ratios['common'][category];
    }
    totalPrice = Math.round(totalPrice);
    totalCMark = Math.round(totalCMark);
    totalSMark = Math.round(totalSMark);
    totalGMark = Math.round(totalGMark);
    console.log(totalPrice);
    document.getElementById("price").innerText = "Total $" + totalPrice.toString();
    const markElement = document.getElementById("benchmark");
    // .innerText = "Benchmark: " + totalMark.toString()
    markElement.innerHTML = '';
    const gMarkElement = document.createElement("div");
    const sMarkElement = document.createElement("div");
    const cMarkElement = document.createElement("div");
    gMarkElement.id = "gBenchmark";
    sMarkElement.id = "sBenchmark";
    cMarkElement.id = "cBenchmark";
    const markStyle = 'margin-left:20px;height:50px;width:200px;font-size: 20px;display:inline;';
    gMarkElement.style = markStyle;
    sMarkElement.style = markStyle;
    cMarkElement.style = markStyle;
    gMarkElement.innerText = "Gaming benchmark: " + totalGMark.toString();
    sMarkElement.innerText = "Workstation benchmark: " + totalSMark.toString();
    cMarkElement.innerText = "Desktop benchmark: " + totalCMark.toString();
    markElement.appendChild(gMarkElement);
    markElement.appendChild(sMarkElement);
    markElement.appendChild(cMarkElement);
}

async function saveConfig() {
    const hardwareCategories = ['CPU', 'GPU', 'RAM', 'SSD', 'HDD']
    let savedModels = {}
    for (let i in hardwareCategories) {
        let category = hardwareCategories[i];
        const selectElement = document.getElementById(category);
        const index = selectElement.selectedIndex;
        savedModels[category] = selectElement.options[index].value;
    }
    savedModels.category = cat;

    // console.log(savedModels);
    const token = getCookie('access-token');
    // console.log("token is:", token)
    if (!verifyLogin()) {
        alert("Please login first to save config!");
        return;
    }

    // const timestamp = new Date().getTime();
    await fetch('https://ucw66zuax1.execute-api.us-east-1.amazonaws.com/v1/configs/' + window.configId.toString(), {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'x-pcbuilder-token': token
        },
        body: JSON.stringify({
            config: savedModels
        })
    }).then(function (response) {
        if (response.status === 200) {
            const saveButton = document.getElementById("saveConfig");
            // console.log(saveButton)
            saveButton.setAttribute("value", "Saved!")
            saveButton.setAttribute("onclick", "")
            saveButton.setAttribute("class", "btn btn-success")
            console.log("saved!");
        }
    })
}

function verifyLogin(){
    const loginTime = getCookie('login-time')
    if (loginTime === "") {
        console.log("no login time")
        return false
    }
    const currentTime = new Date().getTime();
    console.log("difference is:", currentTime - parseInt(loginTime))
    return currentTime - parseInt(loginTime) < 3600000;
}