export const onResize = (camera, renderer) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

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

