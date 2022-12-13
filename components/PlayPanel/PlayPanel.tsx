import React, { ReactElement, useState, useEffect, useRef } from "react"
import ReactPlayer from 'react-player/youtube'
import { SkipBack, SkipForward, Repeat, Grid, Type } from 'react-feather'
import TestPanel from "../TestPanel/TestPanel"
import TypingPanel from "../TestPanel/TypingPanel"
interface IMyProps{
    ytURL: string
}
type ICaptionArr = Array<CaptionObj>
class CaptionObj{
    'text': string
    'start': number
    'duration': number
}

const PlayPanel = (props: IMyProps): ReactElement => {
    
    const [caption, setCaption] = useState([{text:"",start:0,duration:0}])
    const [playing, setPlaying ] = useState(false)
    const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0)
    //testMode true => 打字模式, false => 按鈕模式
    const [testMode, setTestMode] = useState(true)
    //只要切換就是要repeat，並不是開啟或關閉repeat
    const [repeat, setRepeat] = useState(true)

    const ref = React.useRef<ReactPlayer>(null)

    function switchRepeat(){
        setRepeat(!repeat)
    }
    
    function switchMode(){
        setTestMode(!testMode)
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
                   const trimText = resultobj[i].text.replaceAll(/\n/g," ").replaceAll(/ +(?= )/g,'')
                   if(trimText.slice(-1) !== "."){
                        //代表遇到句點後第一個斷句
                        if(phrase === ""){
                            start = resultobj[i].start
                            duration = resultobj[i].duration
                            phrase += trimText
                        }else{
                            duration += resultobj[i].duration
                            phrase += (" "+trimText)
                        }
                   }else{
                        //一個完整不用剪接的句子
                        if(phrase === ""){
                            mergeObj.push({
                                start: resultobj[i].start,
                                duration: resultobj[i].duration,
                                text: trimText
                            })
                        }else{
                            //利用下一句的開頭字母是否大寫來避免句尾有"."卻不是句末的例外
                            if(resultobj[i+1] && resultobj[i+1].text[0] === resultobj[i+1].text[0].toUpperCase()){
                                phrase += (" "+trimText)
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
            setPlaying(true)
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
    },[currentCaptionIndex,caption,repeat])

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bottom-0 grid content-center justify-center">
                <div style={{width:"640px"}}>                   
                    <ReactPlayer url={props.ytURL} playing={playing} ref={ref}/>
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
                            { testMode ? <Grid onClick={switchMode}  size={24}/> : <Type onClick={switchMode}  size={24}/>}
                        </div>
                        <div>
                            {
                                <Repeat onClick={()=>{switchRepeat()}} size={22}/>
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
                        {
                            testMode ? <TypingPanel captionText={caption[currentCaptionIndex].text} replayFunc={switchRepeat} captionIndex={currentCaptionIndex}/> : <TestPanel captionText={caption[currentCaptionIndex].text}/>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
export default PlayPanel