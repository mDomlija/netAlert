function addMaster() {
    const input_field = document.getElementById('masterInp')
    const input_field_value = input_field.value
    let id = input_field_value.split(':')[1]
    id = parseInt(id)
    let type = null

    if (input_field_value.startsWith('dcim.device')) {
        type = 'device'
    }
    else if (input_field_value.startsWith('ipam.ipaddress')) {
        type = 'ip'
    }
    else if (input_field_value.startsWith('ipam.iprange')) {
        type = 'range'
    }

    add2(type, id)
    input_field.value=''
    
    console.log(input_field_value)
}

function add2(type, id) {

    const url = 'https://localhost:8080/add/' + type

    fetch(url, {
        method: 'POST',
        headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id})
    }).then(res => res.json())
      .then(res => {
        console.log(res.status)
        if (res.status == 'success'){
            let list = document.getElementById(type + 'List')
            //newEl.firstChild.textContent = id
            //newEl.firstChild.setAttribute('id',type + '-li-' + id)
            //newEl.lastChild.setAttribute('onClick','delete(' + id + ')')
            list.appendChild(createListElement(type,id))
        }
      });

}

function add(type){

    console.log('hello from add')

    const url = 'https://localhost:8080/add/' + type
    const input_id = type + 'Inp'
    
    const inputField = document.getElementById(input_id)
    const id = inputField.value;

    fetch(url, {
        method: 'POST',
        headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id})
    }).then(res => res.json())
      .then(res => {
        console.log(res.status)
        if (res.status == 'success'){
            inputField.value = ''
            let list = document.getElementById(type + 'List')
            //newEl.firstChild.textContent = id
            //newEl.firstChild.setAttribute('id',type + '-li-' + id)
            //newEl.lastChild.setAttribute('onClick','delete(' + id + ')')
            list.appendChild(createListElement(type,id))
        }
      });

}

function logout() {
    url = 'https://localhost:8080/logout'
    fetch(url, {
        method: 'GET',
        headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
    }).then(res => {
        window.location.href = "https://localhost:8080/login";
    })
}

async function deleteElem(type, id) {
    let list = document.getElementById(type + 'List')
    //list.removeChild(id)
    const tbd = id + '-li-' + type
    await filterAndDelete(list.childNodes, type, id, tbd)
    // list.childNodes.forEach(element =>{
    //     console.log(element)
    //     console.log(id)
    //     if (element.id == tbd){
    //         const status = await sendDeleteRequest(type, id)
    //         element.remove()
    //     }
    // });

}

async function filterAndDelete(childNodes, type, id, tbd) {
    for (const element of childNodes) {
        console.log(element)
        console.log(id)
        if (element.id == tbd){
            const status = await sendDeleteRequest(type, id)
            console.log(status)
            if (status == 'success'){
            
                element.remove()
            }
        }
    }
}

async function sendDeleteRequest(type, id) {
    url = 'https://localhost:8080/remove'
    const status = await fetch(url, {
        method: 'DELETE',
        headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id, type: type})
    })
    let ret = 'failed'
    if (status.status == '200') {ret = 'success'}
    return ret
}

function createListElement(type, id) {
    let li = document.createElement('li')
    li.className = 'list-group-item d-flex justify-content-between'
    li.id = id + '-li-' + type

    let content = document.createElement('div')
    content.className = 'w-75 text-center d-flex my-auto'
    content.textContent = id

    let button = document.createElement('button')
    button.className = 'btn btn-danger btn-sm'
    button.type = 'button'
    button.title = 'Delete'
    button.setAttribute("onclick",'deleteElem(\'' + type + '\',\'' + id + '\')');

    let icon = document.createElement('i')
    icon.className = 'bi bi-trash fa-2x'
    button.appendChild(icon)

    li.appendChild(content)
    li.appendChild(button)

    return li
}