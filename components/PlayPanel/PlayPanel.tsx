import React, { ReactElement, useState, useEffect, useRef } from "react"
import ReactPlayer from 'react-player/youtube'
import { Play, Pause, SkipBack, SkipForward } from 'react-feather'

interface IMyProps{
    ytURL: string
}

type ICaptionArr = Array<Caption>
class Caption{
    'text': string
    'start': number
    'duration': number
}

const PlayPanel = (props: IMyProps): ReactElement => {
    
    const [caption, setCaption] = useState([{text:"",start:0,duration:0}])
    const [playing, setPlaying ] = useState(true)
    const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0)

    const ref = React.useRef<ReactPlayer>(null)

    function switchPlaying(){
        setPlaying(!playing)
    }
    
    
    const mounted = useRef(false)
    useEffect(()=>{
        if(mounted.current === false){
            mounted.current = true
            const getCaptionFromYT = async () => {
                //searchBar傳來的網址，要取出yt網址後面的videoID，v=?{videoID}
                const videoID = props.ytURL.split("v=")[1]
                const res = await fetch(`/api/getytcaptions/${videoID}`)
                const result = await res.json()
                const resultobj: ICaptionArr = JSON.parse(result)

                //整理caption，讓斷在中間的句子合併成一個obj，例如 {text: this is} {text: a book.} => {text: this is a book.}
                let start = 0
                let duration = 0
                let phrase = ""
                let mergeObj = []
                for(let i=0; i<resultobj.length; i++){
                   if(resultobj[i].text.slice(-1) !== "."){
                        //代表遇到句點後第一個斷句
                        if(phrase === ""){
                            start = resultobj[i].start
                            duration = resultobj[i].duration
                            phrase += resultobj[i].text
                        }else{
                            duration += resultobj[i].duration
                            phrase += (" "+resultobj[i].text)
                        }
                   }else{
                        //一個完整不用剪接的句子
                        if(phrase === ""){
                            mergeObj.push(resultobj[i])
                        }else{
                            //利用下一句的開頭字母是否大寫來避免句尾有"."卻不是句末的例外
                            if(resultobj[i+1].text[0] === resultobj[i+1].text[0].toUpperCase()){
                                phrase += (" "+resultobj[i].text)
                                duration += resultobj[i].duration
                                mergeObj.push({
                                    text: phrase,
                                    start: start,
                                    duration: duration
                                })
                                phrase = ""
                            }
                        }
                   }
                }
                //最後將整理好的obj送進caption
                setCaption(mergeObj)
            }
            getCaptionFromYT()
        }
        
    },[props.ytURL])

    useEffect(()=>{
        let timer: ReturnType<typeof setTimeout>;
        if(caption){
            //控制影片在特定時間開始並播放特定一段時間後停止
            ref.current?.seekTo(caption[currentCaptionIndex].start)

            
            timer = setTimeout(()=>{
                setPlaying(false)
            },caption[currentCaptionIndex].duration*1000)
            
        }
        return () => {
            //當currentCaptionIndex之前要清掉timer，不然會下一個會被上一個timer影響
            clearTimeout(timer);
        }
    },[currentCaptionIndex])

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bottom-0 grid content-center justify-center">
                <div className="flex items-center w-full">
                    {/* <YouTube videoId={props.ytURL.split("v=")[1]} opts={opts} onReady={onPlayerReady} style={{display: "inline-block", margin: "auto"}} /> */}
                    <ReactPlayer url={props.ytURL} playing={playing} ref={ref}/>
                </div>
                <div id="controlBar" className="flex justify-evenly my-3">
                    <div>
                        <SkipBack onClick={
                            ()=>{
                                if(currentCaptionIndex>0){
                                    setPlaying(true)
                                    setCurrentCaptionIndex(currentCaptionIndex-1)
                                }
                            }
                        }/>
                    </div>
                    <div>
                        {
                            playing ? <Pause onClick={switchPlaying}/> : <Play onClick={switchPlaying}/>
                        }
                    </div>
                    <div>
                        <SkipForward onClick={()=>{
                            if(currentCaptionIndex<caption.length-1){
                                setPlaying(true)
                                setCurrentCaptionIndex(currentCaptionIndex+1)
                            }
                        }}/>
                    </div>
                </div>
                <div id="typingArea">
                    { caption[currentCaptionIndex].text }
                </div>
            </div>
        </>
    )
}
export default PlayPanel