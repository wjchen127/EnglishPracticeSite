import React, { useState, useEffect, useRef } from "react"
import getCaptionFromYT from "../../helper/getcaptionfromyt"
import YouTube from "react-youtube"
import { SkipBack, SkipForward, Repeat, Trash2, Edit, CheckSquare } from "react-feather"
import crypto from "crypto"

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

    //紀錄答錯的字
    const [wrongWords, setWrongWords] = useState(new Map())

    //紀錄於修改模式的錯字index
    const [wrongWordModifyIndex, setWrongWordModifyIndex] = useState(new Set())

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
        if (e.key === "Backspace" || e.key === "Enter" || (e.ctrlKey && e.key === "a")) {
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

                if (input.dataset.answer) {
                    input.value = input.dataset.answer
                    if (input.dataset.failed === "true") {
                        input.classList.add("border-yellow-400")

                        //修正錯誤後紀錄答錯的字，這邊字可能還要做一點判斷，數字 一些符號可以去掉比如句號
                        storeWrongWord(input.dataset.answer)
                    } else {
                        input.classList.add("border-green-600")
                    }
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
        if (e.key === "Backspace") {
            if (input && input.selectionStart === 0 && input.selectionEnd === 0 && input.dataset.index) {
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
            } else {
                input.classList.add("border-gray-200")
                input.classList.remove("border-green-600")
                input.classList.remove("border-red-500")
                input.classList.remove("border-yellow-400")
            }
        } else if (e.key === "Enter") {
            //重播
            toggleReplay()
        } else if (e.ctrlKey && e.key === "a") {
            if (
                input.dataset.answer &&
                input.dataset.answer.length > 0 &&
                !input.classList.contains("border-green-600")
            ) {
                input.value = input.dataset.answer
                input.dataset.failed = "true"
                // alert("ctrl a")
            }
        }
    }

    //input只允許使用a-z "," "." "'"
    function handleOnInput(e: React.FormEvent<HTMLInputElement>) {
        e.currentTarget.value = e.currentTarget.value.replace(/[^a-z0-9,.*,'*,\,*\-*]/gi, "")
    }

    function changeIndex(number: number) {
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

    function storeWrongWord(wrongWord: string) {
        //將答錯的字紀錄起來
        if (wrongWord) {
            setWrongWords((prevState) => {
                const newMap = new Map(prevState)
                if (newMap.has(wrongWord)) {
                    newMap.set(wrongWord, (newMap.get(wrongWord) as number) + 1)
                } else {
                    newMap.set(wrongWord, 1)
                }
                return newMap
            })
        } else {
            console.log("wrongWordsRef inexist")
        }
    }
    function saveWordsToBackEnd() {
        //wrongWords.size > 0
        if (false) {
            const obj = Object.fromEntries(wrongWords)
            console.log(obj)
            fetch("/api/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj),
            }).then((res) => {
                //如果後端回傳成功，則重置wrongWords
                if (true) {
                    const newMap = new Map()
                    setWrongWords(newMap)
                }
            })
        } else {
            console.log("暫時關閉")
        }
    }
    function handleModifyWord(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const tagName = (e.target as any).tagName
        if (tagName === "svg" || tagName === "path") {
            const parentNode = e.currentTarget.parentNode as HTMLDivElement | null
            if (parentNode && parentNode.dataset.index) {
                const index = parseInt(parentNode.dataset.index)
                if (typeof index === "number") {
                    setWrongWordModifyIndex((prevState) => new Set([...prevState, index]))
                }
            }
        }
    }
    function handleSaveWord(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const tagName = (e.target as any).tagName
        if (tagName === "svg" || tagName === "polyline" || tagName === "path") {
            const parentNode = e.currentTarget.parentNode as HTMLDivElement | null
            if (parentNode && parentNode.dataset.key) {
                const input = parentNode.querySelector("input:nth-child(1)") as HTMLInputElement
                const key = parentNode.dataset.key
                // console.log(`input: ${input}`)
                // console.log(`key: ${key}`)
                if (input && key) {
                    setWrongWords((prevState) => {
                        console.log(prevState)
                        const newMap = new Map(prevState)
                        const arr = Object.entries(newMap)
                        console.log(arr)
                        const newArr = arr.map(([oldKey, value]) => {
                            if (oldKey === key) {
                                return [input.value, value]
                            } else {
                                return [oldKey, value]
                            }
                        })
                        const newObj = Object.fromEntries(newArr)
                        console.log(newObj)
                        return newObj
                    })
                }
            }
            console.log("save")
        }
    }
    // function handleInputOnChange(e: React.ChangeEvent<HTMLInputElement>){

    //     const input = e.target
    //     if(input){
    //         const inputValue = input.value
    //         console.log(inputValue)
    //         input.value = inputValue
    //     }
    // }
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
                    <SkipBack onClick={() => changeIndex(-1)} />
                    <Repeat onClick={toggleReplay} width={22} />
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
            <div className="absolute right-0 w-[300px] h-[400px]">
                <div className="relative w-full h-full">
                    <ul className="w-[300px] h-[400px] absolute text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white  overflow-y-auto">
                        {wrongWords.size > 0 ? (
                            Array.from(wrongWords.keys()).map((key, i) => {
                                return (
                                    <li
                                        className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600"
                                        key={key + i}
                                    >
                                        <div className="flex items-center pl-3" data-index={i} data-key={key}>
                                            <input
                                                type="checkbox"
                                                value=""
                                                className=" w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            />
                                            {wrongWordModifyIndex.has(i) ? (
                                                <>
                                                    <input className="my-3 ml-2 text-sm w-full" defaultValue={key} />
                                                    <div className="w-fit h-fit mr-2 modify">
                                                        <CheckSquare width={16} />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                        {key}
                                                    </span>
                                                    <div className="w-fit h-fit mr-2 modify" onClick={handleModifyWord}>
                                                        <Edit width={16} />
                                                    </div>
                                                </>
                                            )}

                                            <div className="w-fit h-fit mr-5 delete">
                                                <Trash2 width={16} />
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        ) : (
                            <h1 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-neutral-500 text-base whitespace-nowrap">
                                Don&apos;t have any entry.
                            </h1>
                        )}
                    </ul>
                    <button
                        type="button"
                        className=" absolute bottom-[20px] left-[50%] translate-x-[-50%] text-white bg-gradient-to-br from-pink-500 to-orange-400  focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                        onClick={saveWordsToBackEnd}
                    >
                        Save
                    </button>
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
    const mergeObj = []
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
