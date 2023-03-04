import React, { useState, useEffect, useRef } from "react"
import getCaptionFromYT from "../../helper/getcaptionfromyt"
import YouTube from "react-youtube"
import { SkipBack, SkipForward, Repeat, Grid, Type } from "react-feather"
const crypto = require("crypto")

interface Icaption {
    text: string
    start: number
    duration: number
}
interface Iprops {
    caption: Icaption[]
    captionLen: number
    url: string
    id: string
}

export default function MyPage(props: Iprops) {
    //目前caption的index
    const [currenIndex, setCurrentIndex] = useState(0)
    //replay變化就會重播，不管true or false
    const [replay, setReplay] = useState(true)
    const playerRef = useRef<YouTube>(null)
    //youtube player設定
    const opts = {
        height: "390",
        width: "640",
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 1,
            mute: 0,
            controls: 0,
            rel: 0,
            iv_load_policy: 3,
        },
    }
    const timerRef = useRef<ReturnType<typeof setTimeout>>()
    useEffect(() => {
        if (playerRef.current) {
            const player = playerRef.current.getInternalPlayer()
            player.seekTo(props.caption[currenIndex].start, "seconds")
            player.playVideo()
        }

        return () => {
            clearTimeout(timerRef.current)
        }
    }, [currenIndex, replay])

    function handleOnPlay() {
        console.log("onplay")
        if (playerRef.current) {
            const player = playerRef.current.getInternalPlayer()
            timerRef.current = setTimeout(() => {
                player.pauseVideo()
            }, props.caption[currenIndex].duration * 1000)
        }
    }

    //產生hash值用在react的key
    function generateHash(str: string) {
        const hash = crypto.createHash("sha256")
        hash.update(str)
        return hash.digest("hex")
    }

    function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
        //目前輸入的input
        const input = e.currentTarget
        const inputValue = input.value
        const answer = input.dataset.answer && input.dataset.answer.length > 0 ? input.dataset.answer : ""
        let correct = false
        //避免keydown的backspace被干擾
        if (e.key === "Backspace" || e.key === "Enter") {
            e.preventDefault()
        } else if (
            (correct =
                inputValue.toLowerCase().replace(/[^a-z0-9]/gi, "") ===
                answer.toLowerCase().replace(/[^a-z0-9]/gi, "")) ||
            inputValue.length === input.maxLength
        ) {
            //答案匹配
            if (correct) {
                //添加正確的css，需判斷是一次正確還是修正後正確，css不一樣
                input.classList.remove("border-gray-200")
                if (input.dataset.failed === "true") {
                    input.classList.add("border-yellow-400")
                } else {
                    input.classList.add("border-green-600")
                }
                if (input.dataset.answer) {
                    input.value = input.dataset.answer
                }
                //focus下一個input
                if (input.dataset.index) {
                    //取得下一個input
                    const nextInputIndex = parseInt(input.dataset.index) + 2
                    const nextInput = document.querySelector(
                        `#typingArea > input:nth-child(${nextInputIndex})`
                    ) as HTMLInputElement
                    if (nextInput) {
                        nextInput.focus()
                    }
                }
            } else {
                input.classList.remove("border-gray-200")
                input.classList.add("border-red-500")
                input.dataset.failed = "true"
            }
        } else {
            if (!input.classList.contains("border-gray-200")) {
                input.classList.add("border-gray-200")
                input.classList.remove("border-green-600")
                input.classList.remove("border-red-500")
                input.classList.remove("border-yellow-400")
            }
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        //目前輸入的input
        const input = e.currentTarget
        const inputValue = input.value
        if (e.key === "Backspace") {
            if (input && input.selectionStart === 0 && input.dataset.index) {
                const prevInputIndex = parseInt(input.dataset.index)
                const prevInput = document.querySelector(
                    `#typingArea > input:nth-child(${prevInputIndex})`
                ) as HTMLInputElement
                if (prevInput) {
                    prevInput.focus()
                    //回到上一個input時可以focus在最尾端
                    const prevInputValue = prevInput.value
                    prevInput.selectionStart = prevInputValue.length
                    prevInput.selectionEnd = prevInputValue.length
                    e.preventDefault()
                }
            }else{
              input.classList.add("border-gray-200")
              input.classList.remove("border-green-600")
              input.classList.remove("border-red-500")
              input.classList.remove("border-yellow-400")
            }
        } else if (e.key === "Enter") {
            //重播
            toggleReplay()
        }
    }

    //input只允許使用a-z "," "." "'"
    function handleOnInput(e: React.FormEvent<HTMLInputElement>) {
        e.currentTarget.value = e.currentTarget.value.replace(/[^a-z0-9,.*,'*,\,*\-*]/gi, "")
    }

    function changeIndex(number: Number) {
        if (number === 1 && currenIndex < props.captionLen - 1) {
            console.log("+1")
            setCurrentIndex(currenIndex + 1)
        } else if (number === -1 && currenIndex > 0) {
            console.log("-1")
            setCurrentIndex(currenIndex - 1)
        }
    }

    function toggleReplay() {
        setReplay(!replay)
    }

    function handleOnReady() {
        console.log("on ready")
        toggleReplay()
    }

    return (
        <div className="flex flex-col items-center mt-[10%] absolute top-0 left-0 right-0 bottom-0">
            <div className="w-[640px]">
                <YouTube
                    opts={opts}
                    videoId={props.id}
                    ref={playerRef}
                    className=""
                    onReady={handleOnReady}
                    onPlay={handleOnPlay}
                />
                <div className="flex justify-evenly my-3">
                    <SkipBack onClick={() => changeIndex(-1)}/>
                    <Repeat onClick={toggleReplay}  width={22}/>
                    <SkipForward onClick={() => changeIndex(1)} />
                </div>
                <div className="flex flex-wrap justify-center" id="typingArea">
                    {props.caption
                        ? props.caption[currenIndex]["text"].split(" ").map((word, i) => {
                              return (
                                  <input
                                      data-index={i}
                                      autoFocus={i === 0}
                                      key={generateHash(`${word}${i}${currenIndex}`)}
                                      onKeyUp={handleKeyUp}
                                      onKeyDown={handleKeyDown}
                                      onInput={handleOnInput}
                                      maxLength={word.length}
                                      size={word.length}
                                      data-answer={word}
                                      className="text-lg text-center py-0.5 block mx-1 px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0  border-gray-200"
                                      spellCheck={false}
                                  />
                              )
                          })
                        : "something went wrong"}
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context: any) {
    const { videoid } = context.params
    const res = (await getCaptionFromYT(videoid)) as string | false
    const result = res ? JSON.parse(res) : false
    //整理caption，讓斷在中間的句子合併成一個obj，例如 {text: this is} {text: a book.} => {text: this is a book.}
    let start = 0
    let duration = 0
    let phrase = ""
    let mergeObj = []
    if (result) {
        for (let i = 0; i < result.length; i++) {
            const trimText = result[i].text.replaceAll(/\n/g, " ").replaceAll(/ +(?= )/g, "")
            if (trimText.slice(-1) !== ".") {
                //代表遇到句點後第一個斷句
                if (phrase === "") {
                    start = result[i].start
                    duration = result[i].duration
                    phrase += trimText
                } else {
                    duration += result[i].duration
                    phrase += " " + trimText
                }
            } else {
                //一個完整不用剪接的句子
                if (phrase === "") {
                    mergeObj.push({
                        start: result[i].start,
                        duration: result[i].duration,
                        text: trimText,
                    })
                } else {
                    //利用下一句的開頭字母是否大寫來避免句尾有"."卻不是句末的例外
                    if (result[i + 1] && result[i + 1].text[0] === result[i + 1].text[0].toUpperCase()) {
                        phrase += " " + trimText
                        duration += result[i].duration
                        mergeObj.push({
                            text: phrase,
                            start: start,
                            duration: duration,
                        })
                        phrase = ""
                    }
                }
            }
        }
    }

    return {
        props: {
            caption: mergeObj,
            captionLen: mergeObj.length,
            url: `https://www.youtube.com/watch?v=${videoid}`,
            id: videoid,
        },
    }
}
