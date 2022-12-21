async function showHistory(){
    var root = document.getElementById('root')
    root.innerHTML = ``
    var his_area = document.createElement('div')
    if (verifyLogin()){
        his_area.innerHTML = `
            <h1>Hi, User</h1>
            <button type="button" class="btn btn-outline-secondary" onclick="back_out()">Back</button>
        `
        his_area.innerHTML += `
            <div id="table-area" class="row justify-content-center mt-5">
                <div class="col-sm-2">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        `
        CreateTable();
        his_area.id = 'his'
    }
    else {
      his_area.innerHTML = `
        <h1>Hi, User</h1>
        Cannot find your data, Please login!
        <button type="button" onclick="login()">Login</button>
        `
        his_area.id = 'his'

    }
    
    root.appendChild(his_area)
}
  

async function getHistory() {
    //get user data from lambda 3 and 5
    const token = getCookie('access-token');
    console.log("token is:", token) 
    const response = await fetch('https://ucw66zuax1.execute-api.us-east-1.amazonaws.com/v1/configs', {
        method: 'GET',
        headers: {
            'x-pcbuilder-token': token
        }
    })
    console.log(response)
    return response.json()
}


async function CreateTable() {
    var table = document.createElement('table');
    table.id = 'table'

    table.setAttribute('id', 'empTable');

    const arrHead = ['No.', 'Config_id','CPU', 'GPU', 'RAM', 'SSD', 'HDD','Option'];

    const rests = await getHistory()
    console.log(rests)
    console.log(rests.length)

    if (rests.length == 0){
        var no_reco =document.createElement('div');
        no_reco.innerHTML = `
            <div class="row text-center">
                <h3>No saved configs! Start your build now!<h3>
            </div>
            <div class="row justify-content-center">
                <div class="col-sm text-center">
                    <button type="button" class="btn btn-lg btn-outline-primary" onclick="startBuild(`+0+`)">Go!</button>
                </div>
            </div>
        `
        let tableArea = document.getElementById('table-area')
        tableArea.innerHTML = ``
        tableArea.appendChild(no_reco)
    }
    else{
        var table = document.createElement('table');
        table.id = 'table'

        table.setAttribute('id', 'empTable');
        table.setAttribute("class", "table table-hover");

        const arrHead = ['No.', 'Config_id','CPU', 'GPU', 'RAM', 'SSD', 'HDD','Option'];


        var arrValue = new Array();
        for(var i=0; i <rests.length; i++){
            arrValue.push([i+1, rests[i]['config_id']['S'],rests[i]['cpu']['S'], rests[i]['gpu']['S'], rests[i]['ram']['S'], rests[i]['ssd']['S'], rests[i]['hdd']['S'], '']);
        }

        var tr = table.insertRow(-1);

        for (var h = 0; h < arrHead.length; h++) {
            var th = document.createElement('th');              // TABLE HEADER.
            th.innerHTML = arrHead[h];
            tr.appendChild(th);
        }

        for (var c = 0; c <= arrValue.length - 1; c++) {
            tr = table.insertRow(-1);

            for (var j = 0; j < arrHead.length; j++) {
                var td = document.createElement('td');          // TABLE DEFINITION.
                td = tr.insertCell(-1);
                td.innerHTML = arrValue[c][j];                  // ADD VALUES TO EACH CELL.

            }
            // insert button details
            td = tr.insertCell(-1);
            td.innerHTML = `
                <button type="button" class="btn btn-primary" onclick="showDetails(` + arrValue[c][1] + `)">details</button>
            `
            // insert button change
            td = tr.insertCell(-1);
            td.innerHTML = `
            <button type="button" class="btn btn-primary" onclick="change(`+arrValue[c][1]+`)">change</button>
            `;
            // insert button delete
            td = tr.insertCell(-1);
            item_id =arrValue[c][1];
            td.innerHTML = `
            <button type="button" class="btn btn-outline-danger" onclick="delete_his(`+arrValue[c][1]+`)">detele</button>
            `;
            console.log(arrValue[c][1])
        }

        // FINALLY ADD THE NEWLY CREATED TABLE AND BUTTON TO THE BODY.
        let tableArea = document.getElementById('table-area')
        tableArea.innerHTML = ``
        tableArea.appendChild(table)
    } 
}


function back_out(){
    renderIndex();
}


function change(configId){
    window.configId = configId
    startBuild(1)
}


async function delete_his(config_id_sp){
    configid = config_id_sp
    const token = getCookie('access-token');
    const response = await fetch('https://ucw66zuax1.execute-api.us-east-1.amazonaws.com/v1/configs/' + configid.toString(), {
        method: 'delete',
        headers: {
            'x-pcbuilder-token': token,
            'config-id':configid
        }
    })
    w = document.getElementById('root');
    w.innerHTML = ''
    showHistory();
    return response
}


async function showDetails(configId) {
    var token = getCookie('access-token');
    if (!verifyLogin()) {
        alert("Login status has expired. Please login again!")
        renderIndex()
    }

    var root = document.getElementById("root")
    root.innerHTML = ``
    var detail = document.createElement("div")
    var head = document.createElement("div")
    head.innerHTML = `
        <h1>Details for `+configId+`:</h1>
    `
    detail.appendChild(head)
    let tableArea = document.createElement("div")
    tableArea.id = "detail-table"
    tableArea.innerHTML = `
        <div class="row justify-content-center mt-5 mb-5">
            <div class="col-sm-2">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    `
    detail.append(tableArea)
    var price = document.createElement("div")
    price.setAttribute("class", "row")
    price.id = "price-area"
    detail.append(price)
    var buttons = document.createElement("div")
    buttons.innerHTML = `
        <div class="row justify-content-start">
            <div class="col-sm-1 text-center">
                <button type="button" class="btn btn-outline-primary" onclick="showHistory()">Configs</button>
            </div>
            <div class="col-sm-1 text-center">
                <button type="button" class="btn btn-outline-primary" onclick="renderIndex()">Home</button>
            </div>
            <div class="col-sm-1 text-center">
                <button type="button" class="btn btn-outline-danger" onclick="delete_his(`+configId+`)">Delete</button>
            </div>
        </div>
    `
    detail.appendChild(buttons)
    root.appendChild(detail)

    const response = await fetch('https://ucw66zuax1.execute-api.us-east-1.amazonaws.com/v1/configs/'+configId, {
        method: "GET",
        headers: {
            'x-pcbuilder-token': token
        }
    })
    renderDetail(await response.json())
}


function renderDetail(config) {
    console.log(config)
    var detail = document.getElementById("detail-table")
    detail.innerHTML = ``

    var table = document.createElement("table")
    table.setAttribute("class", "table table-hover")
    var thead = document.createElement("thead")
    thead.innerHTML = `
        <tr>
            <th scope="col">Part</th>
            <th scope="col">Brand</th>
            <th scope="col">Model</th>
            <th scope="col">Benchmark</th>
            <th scope="col">Price($)</th>
            <th scope="col">Link</th>
        </tr>
    `
    table.appendChild(thead)
    var tbody = document.createElement("tbody")

    var namelist = ["CPU", "GPU", "RAM", "SSD", "HDD"]
    var detailList = ["brand", "model", "benchmark", "price"]
    var detailTypeList = ["S", "S", "N", "N"]
    var totalPrice = 0

    for (let j = 0; j < 5; j++) {
        var category = namelist[j]
        var tr = document.createElement("tr")
        var th = document.createElement("th")
        th.setAttribute("scope", "row")
        th.innerHTML = category
        tr.appendChild(th)
        if (config[category] == undefined)
            continue
        var categoryObj = config[category]
        for (let i = 0; i < 4; i++) {
            let detailCat = detailList[i]
            let detailType = detailTypeList[i]
            let td = document.createElement("td")
            if (detailType === 'N')
                td.innerHTML = Math.round(categoryObj[detailCat][detailType] * 100) / 100
            else
                td.innerHTML = categoryObj[detailCat][detailType]
            tr.appendChild(td)
        }
        let td = document.createElement("td")
        td.innerHTML = `
            <a href="`+categoryObj.amazon_url.S+`">Amazon</a>
        `
        tr.appendChild(td)
        tbody.appendChild(tr)
        totalPrice += parseFloat(categoryObj.price.N)
    }
    table.appendChild(tbody)
    detail.appendChild(table)
    detail.setAttribute("class", "container")
    document.getElementById("price-area").innerHTML = `
        <h4>Total Price: $`+ Math.round(totalPrice * 100) / 100 +`</h4>
    `
}


function show_about(){
    console.log('Choose hardwares for your personal computer!')
}


function show_contact(){
    console.log('6998 PC builder Team')
}