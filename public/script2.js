var peer = require('simple-peer')
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(gotMedia).catch(() => {})
  
  function gotMedia (stream) {
    var peer1 = new Peer({ initiator: true, stream: stream })
    var peer2 = new Peer()
  
    peer1.on('signal', data => {
      peer2.signal(data)
    })
  
    peer2.on('signal', data => {
      peer1.signal(data)
    })
  
    peer2.on('stream', stream => {
      // got remote video stream, now let's show it in a video tag
      var video = document.querySelector('video')
  
      if ('srcObject' in video) {
        video.srcObject = stream
      } else {
        video.src = window.URL.createObjectURL(stream) // for older browsers
      }
  
      video.play()
    })
  }
