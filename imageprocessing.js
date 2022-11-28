function openCvReady() {
  cv['onRuntimeInitialized']=()=>{
    let video = document.getElementById("videoInput");
    if( /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
      video.width = 600;
      video.height = 800;
    } else {
      video.width = 800;
      video.height = 600;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: false, video:{facingMode: 'environment'}})
      .then(function(stream) {
      video.srcObject = stream;
      video.play();

    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat();
    let mini = new cv.Mat();
    let mini2 = new cv.Mat();
    let nobackground = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let cap = new cv.VideoCapture(video);

    const FPS = 30;
    function processVideo() {
      try {
        let begin = Date.now();
        // start processing.
        cap.read(src);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        let ksize = new cv.Size(17, 17);
        cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
        mini = src;
        mini2 = src;

        let circles = new cv.Mat;
        cv.HoughCircles(dst, circles, cv.HOUGH_GRADIENT, 1.2, 100, 150, 30, 50, 400);

        let counter = 0;
        for (let i = 0; i < circles.cols; ++i) {
          //console.log(i);
          let x = circles.data32F[i * 3];
          let y = circles.data32F[i * 3 + 1];
          let radius = circles.data32F[i * 3 + 2];
          let center = new cv.Point(x, y);
            try {
              
              let rect = new cv.Rect((x - radius), (y - radius), (2 * radius), (2 * radius));

              //console.log(counter);

              if (x*y > 100000) {
                mini = src.roi(rect);
                let dsize = new cv.Size(300, 300);
                cv.resize(mini, mini, dsize, 0, 0, cv.INTER_AREA);
                counter = counter + 1;
              } else {
                mini2 = src.roi(rect);
                let dsize = new cv.Size(300, 300);
                cv.resize(mini2, mini2, dsize, 0, 0, cv.INTER_AREA);  
              }
              
              cv.circle(src, center, (radius * 1.1), [255, 0, 0, 255], 2);

              //console.log(center)
              //console.log(radius)
            } catch (err) {
            }
        }


        cv.imshow("canvasOutput", src);
        cv.imshow("miniOutput", mini)
        cv.imshow("miniOutput2", mini2)

        
        // schedule the next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
      } catch (err) {
        console.error(err);
      }
    }

    // schedule the first frame.
    setTimeout(processVideo, 0);
  })
  .catch(function(err) {
    console.log("Oh no! An error occurred! " + err);
  });


  }

}
