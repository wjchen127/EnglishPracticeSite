import React, { ReactElement, useState } from "react"
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube'
import { Play, Pause, SkipBack, SkipForward } from 'react-feather'
const PlayPanel = (): ReactElement => {

    const [videoTarget, setVideoTarget] = useState(null)
    const [ playing, setPlaying ] = useState(true)
    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        setVideoTarget(event.target)
    }
    const opts: YouTubeProps['opts'] = {
        height: '390',
        width: '640',
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 1,
        },
    }
    function start(){
        if(videoTarget !== null){
            (videoTarget as YouTubePlayer).playVideo()
            setPlaying(!playing)
        }
    }
    function stop(){
        if(videoTarget !== null){
            (videoTarget as YouTubePlayer).pauseVideo()
            setPlaying(!playing)
        }
    }
    return (
        <>
            <div className="fixed top-0 left-0 right-0 bottom-0 grid content-center justify-center">
                <div className="flex items-center w-full">
                    <YouTube videoId="_ByOpd3WK1w" opts={opts} onReady={onPlayerReady} style={{display: "inline-block", margin: "auto"}} />
                </div>
                <div id="controlBar" className="flex justify-evenly my-3">
                    <div>
                        <SkipBack/>
                    </div>
                    <div>
                        {
                            playing ? <Pause onClick={stop}/> : <Play onClick={start}/>
                        }
                    </div>
                    <div>
                        <SkipForward/>
                    </div>
                </div>
                <div id="typingArea">
                    
                </div>
            </div>
        </>
    )
}
export default PlayPanel