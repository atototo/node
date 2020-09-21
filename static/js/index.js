var socket = io();

//on : 수신
// emit : 전송, 동일한 이벤트 명끼리만 송/ 수신이 가능하다. 
//      >> 송/ 수신측 모두 이벤트명이 동일해야 한다.


/*  접속 되었을 때 실행 */
socket.on('connect', function() {
    /*이름 입력받기 
      prompt :: alert 입력 창이 뜨게 된다*/
    var name = prompt('반갑습니다!', '')

    if(!name) {
        name = '익명'
    }

    /**서버에 새로운 유저 알림 */
    socket.emit('newUser', name)
})

/**서버로부터 데이터 받은경우 */
socket.on('update', function(data) {

    var chat = document.getElementById('chat')
    var message = document.createElement('div')
    var node = document.createTextNode(`${data.name}: ${data.message}`)

    var className = ''

    // 타입에 따라 적용할 클래스를 다르게 지정
    switch(data.type) {
        case 'message' :
            className = 'other'
            node = document.createTextNode(`  [ ${data.name} ]: ${data.message}`)
            break
        case 'connect' :
            className = 'connect'
            break
        case 'disconnect' :
            className = 'disconnect'
            break        
    }
    
    //message.setAttribute('id', 'oth')
    message.classList.add(className)
    message.appendChild(node)
    chat.appendChild(message)
    chat.scrollTop = chat.scrollHeight
   
})

/* 메시지 전송 함수 */
function send() {
    // 입력되어 있는 데이터 가져오기
    var message = document.getElementById('test').value

    // 가지고 온 후 데이터 비우기
    document.getElementById('test').value = ''

    // 내가 전송할 메시지 클라이언트에게 표시
    var chat = document.getElementById('chat')
    var msg = document.createElement('div')
    var node = document.createTextNode( "  " + message)
    //msg.setAttribute('id', 'own')
    msg.classList.add('me')
    msg.appendChild(node)
    chat.appendChild(msg)
    chat.scrollTop = chat.scrollHeight


    // 서버로 send 이벤트 전달 + 데이터와 함께
    socket.emit('message', {type: 'message', message : message})
}

$(document).ready(function() {
    $('#test').keydown(function(key) {
        if (key.keyCode == 13 && $('#test').val() != '' ) {
            send()
        }
    })
})
