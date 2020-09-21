/* 설치한 express 모듈 불러오기 */
const express = require('express')

/* 설치한 socket.io  모듈 불러오기  */
const socket = require('socket.io')

/* Node.js 기본 내장 모듈 불러오기*/
const http = require('http')

/* Node.js 기본 내장 모듈 불러오기2
fs : 파일과 관련된 처리
readFile() : 지정된 파일 읽어서 데이터 가져온다 에러 시 에러 내용 담아옴
response(응답) 객체를 통해 읽어온 데이터 전달해야 한다.
wirte() : 헤더 작성 후 데이터 전송
end() : 완료 표시
*/
const fs = require('fs')

/* express 객체 생성 */
const app = express();

/* express http 서버 생성 */
const server = http.createServer(app)

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server);


/** path 모듈 추가 */
const path = require('path')


/* 정적 파일을 제공하기 위해 미들웨어를 사용하는 코드로
    app.use()를 사용하여 원하는 미들웨어를 추가하여 조합 할 수 있다.
    >> 기본적으로 클라이언트가  url/css 접근시 액세스 거부된다
        미들웨어 추가시 액세스 가능해 진다.
*/
app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')))

/* Get 방식으로 /경로에 접속시 실행 */
app.get('/', function(request, response) {
  fs.readFile('./static/index.html', function(err, data) {
      if (err) {
          response.send(err)
      } else {
          response.writeHead(200, {'Conteext-Type' : 'text/html'})
          response.write(data)
          response.end()  //write 후엔 꼭 end를 해주어야 한다.
      }
  })
})


/** on() : 소켓에서 해당 이벤트 받으면 콜백함수 실행
 *  io.sockets :: 접속되는 모든 소켓 의미
 * 접속과 동시에 콜백함수로 전달 되는 소켓은 접속된 해당 소켓
 * 콜백함수 안에서 해당 소켓과 통신할 코드 작성
 * */

io.sockets.on('connection', function(socket) {
    console.log('유저 접속 됨')
    
    //커스텀 이벤트
    socket.on('send', function(data) {
        console.log('전달된 메시지:', data.msg)
    })

    //실시간 채팅
    /** 새로운 유저 접속 시 다른 소켓에게도 전달 */
    socket.on('newUser', function(name) {
        console.log(name + '님이 접속하였습니다.')

        /**소켓에 이름 저장해두기 */
        socket.name = name

        /**모든 소켓에게 전송 */
        io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
        
    })

    /**전송한 메시지 받기
     * io.sockets.emit() : 모든 유저(본인 포함) 전달
     * socket.broadcast.emit() : 본인을 제외한 나머지 모두에게 전달
     */
    socket.on('message', function(data) {
        /** 받은 데이터에 누가 보냈는지 이름 추가 */
        data.name = socket.name
        
        console.log(data);

        /**보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
        socket.broadcast.emit('update', data);
    })

    /**접속종료 */
    socket.on('disconnect', function() {
        console.log(socket.name + '님이 나가셨습니다.')

        /** 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
        socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message:  socket.name + '님이 나가셨습니다.'})
    })
})



/* 서버를 지정한 포트로 listen */
server.listen(8020, function(){
    console.log('서버 실행 중....')
})