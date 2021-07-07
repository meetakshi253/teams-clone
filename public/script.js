
const socket = io('/')  //root path
const newguy = new Peer(undefined, {
    host: '/',
    port: '5000'
})  //server takes care of generating our own id
//now we can use this id to connect with other people

const videoSet = document.getElementById("bunch-of-videos")
const hostVideo = document.createElement("video")
const peopleinchat = {}
hostVideo.muted = true   //my own video should be muted!
let hostVideoStream;
var friendsCall;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
    .then(stream => {
        addNewUserVideoStream(hostVideo, stream)
        hostVideoStream = stream
        newguy.on('call', newcall => {
            const friendsvideo = document.createElement('video')
            newcall.answer(stream)   //send our  stream to the callee
            newcall.on('stream', friendsvideoStream => {
                addNewUserVideoStream(friendsvideo, friendsvideoStream)
            })
        })

        socket.on('user-joinedin', userId => {
            //a new user has joined the room. so we have to send our stream to that user 
            addNewUserToCall(userId, stream)
            console.log("user connected" + userId)
        })
    })

socket.on('user-left', userId => {
    console.log(userId + " left")
    if (peopleinchat[userId]) {
        peopleinchat[userId].close()

    }
})

newguy.on('open', userid => {
    socket.emit('join-room', ROOM_ID, userid)
})


function addNewUserToCall(userId, stream) {
    const calluser = newguy.call(userId, stream)   //call a user and send them your video
    const video = document.createElement('video')   //when they  send back the video stream, add it to video element on our page
    calluser.on('stream', videoStream => {    
        addNewUserVideoStream(video, videoStream, "yes")
    })
    calluser.on('close', () => {
        video.remove()
    })
    peopleinchat[userId] = calluser;
    console.log(peopleinchat)
}

function addNewUserVideoStream(video, stream, chk="no") //add a new video stream
{
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    if(chk==="yes")
    {
        friendsCall = video;
    }
    if (!videoSet.contains(video)) 
        videoSet.append(video)
}

function mute_unmute() {
    const enabled = hostVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        hostVideoStream.getAudioTracks()[0].enabled = false;
        unmute_mic()
    }
    else {
        hostVideoStream.getAudioTracks()[0].enabled = true;
        mute_mic()
    }
}

function play_pause()
{
    const enabled = hostVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        hostVideoStream.getVideoTracks()[0].enabled = false;
        turnon_video()
    }
    else {
        hostVideoStream.getVideoTracks()[0].enabled = true;
        turnoff_video()
    } 
}

// function share_screen()
// {
//     async ()=>
//     {

//     }
// }

function deafen_undeafen()
{
    console.log(friendsCall)
    if(friendsCall)
    {
        friendsCall.muted =true;
    }
}

function mute_mic() {
    const newmic = `<i class="fas fa-microphone fa-lg control"></i>
    <span>Mute</span>`
    document.querySelector('.incall_controls_mute').innerHTML = newmic;
  
}

function unmute_mic() {
    const newmic = `<i class="fas fa-microphone-slash fa-lg control"></i>
    <span>Unmute</span>`
    document.querySelector('.incall_controls_mute').innerHTML = newmic;
}

function turnoff_video()
{
    const newcam = `<i class="fas fa-video fa-lg control"></i>
    <span>Stop Video</span>`
    document.querySelector('.incall_controls_video').innerHTML = newcam;
}

function turnon_video()
{
    const newcam = `<i class="fas fa-video-slash fa-lg control"></i>
    <span>Start Video</span>`
    document.querySelector('.incall_controls_video').innerHTML = newcam;
}


 