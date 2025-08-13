export const onResize = (camera, renderer) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

//   const handleResizeControl = () => {
//     // Use the canvas's client dimensions to set sizes
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
    
//     camera.aspect = width / height;
//     camera.updateProjectionMatrix();

//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// };

export const dbClick=(canvas)=>{
    if(!document.fullscreenElement)
    {
      canvas.requestFullscreen()
    }
    else
    {
      document.exitFullscreen()
    }
  }

