const socket = io('/')  //root path
const newguy = new Peer(undefined, {
    host: '/',
    port: '5000'
})  //server takes care of generating our own id
//now we can use this id to connect with other people

const videoSet = document.getElementById("bunch-of-videos")
const hostVideo = document.createElement("video")
const peopleinchat = {}
hostVideo.muted = true   //my own mic should be muted!

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
.then(stream => {
    addNewUserVideoStream(hostVideo, stream)

    newguy.on('call', newcall => {
        const friendsvideo = document.createElement('video')
        newcall.answer(stream)
        newcall.on('stream', friendsvideoStream => {
            addNewUserVideoStream(friendsvideo, friendsvideoStream)
        })
    })

    socket.on('user-joinedin', userId => {
        //a new user has joined the room. so we have to send our stream to that user 
        addNewUserToCall(userId, stream)
        console.log("here"+ROOM_ID)
    })  
})

socket.on('user-left', userId => {
    console.log(userId+" left")
    if (peopleinchat[userId]) {
        peopleinchat[userId].close()

    }
})

newguy.on('open', userid => {
    socket.emit('join-room', ROOM_ID, userid)
})


function addNewUserToCall(userId, stream) {
    const calluser = newguy.call(userId, stream)   //call a user and send them your video
    const video = document.createElement('video') //add to our ow
    calluser.on('stream', videoStream => {
        addNewUserVideoStream(video, videoStream)
    }) 
    calluser.on('close', () => {
        video.remove()
    })
    peopleinchat[userId] = calluser;
    console.log(peopleinchat)
}

function addNewUserVideoStream(video, stream) //add a new video stream
{
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    if(!videoSet.contains(video))
        videoSet.append(video)
}