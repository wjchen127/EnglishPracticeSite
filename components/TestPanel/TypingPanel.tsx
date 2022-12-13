import React, { ReactElement, useEffect, useRef, useState } from "react"

interface IMyProps{
    captionText: string
    replayFunc: ()=>void
    captionIndex: number
}

const TypingPanel = (props: IMyProps): ReactElement => {

    const inputsRef = useRef<Array<HTMLInputElement>>([])
    const [inputArr, setInputArr] = useState<Array<string>>()
    useEffect(()=>{
        setInputArr(()=>props.captionText.split(" "))
    },[props.captionText])
    //記得要取得input的數量
    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const currentTarget = e.currentTarget
        const index = parseInt((currentTarget.dataset.index as string))
        
        //可以偷懶不打標點符號，所以在比對正確性時會把符號去掉再比對
        const correct = currentTarget.dataset.answer ? currentTarget.dataset.answer.toLowerCase().replace(/[^a-z0-9]/gi, '') === currentTarget.value.toLowerCase().replace(/[^a-z0-9]/gi, '') : false
        
        //字數達到input上限，開始檢查輸入內容是否錯誤
        if(correct || (currentTarget.dataset.answer && currentTarget.dataset.answer.length === currentTarget.value.length)){
            if(correct){
                //驗證正確就用正確答案替換使用者輸入的答案
                if(currentTarget.dataset.answer){
                    currentTarget.value  = currentTarget.dataset.answer
                }

                //將正確的input顏色變成綠色底線
                inputsRef.current[index].classList.remove("border-gray-200")
                inputsRef.current[index].classList.add("border-green-600")
                //一旦輸入正確就跳到下一個input
                if(inputsRef.current[index+1]){
                    inputsRef.current[index+1].focus()
                }
            }else{
                //輸入錯誤紅色底線
                inputsRef.current[index].classList.add("border-red-500")
                props.replayFunc()
            }
            
        }else{
            //字數介於0以及input長度之間
            //代表答案還沒輸入完
            inputsRef.current[index].classList.remove("border-green-600")
            inputsRef.current[index].classList.remove("border-red-500")
        }

        if(currentTarget.value !== ""){
            //用來讓backspece判斷是否該回去上一個input
            currentTarget.dataset.oldvalue = currentTarget.value
        }
    }

    //input只允許使用a-z "," "." "'"
    function handleOnInput(e: React.FormEvent<HTMLInputElement>){
        e.currentTarget.value = e.currentTarget.value.replace(/[^a-z0-9,.*,'*,\,*\-*]/gi, '')
    }

    function handleBackSpace(e: React.KeyboardEvent<HTMLInputElement>){
        //利用e.currentTarget.dataset.oldvalue來避免清空input會馬上跳回上一個input
        if(e.key === "Backspace" && e.currentTarget.dataset.oldvalue === ""){
            const index = parseInt((e.currentTarget.dataset.index as string))
            if(inputsRef.current[index-1]){
                inputsRef.current[index-1].focus()
            }
        }else if(e.key === "Backspace" && e.currentTarget.value === ""){
            e.currentTarget.dataset.oldvalue = ""
        }
    }

    return (
        <>
            <div className="flex flex-wrap px-2 justify-center">
                {
                    inputArr ? inputArr.map((word,i)=>{
                         return <input key={word+i+props.captionIndex} type="text" maxLength={word.length} data-index={i} data-oldvalue={""} data-answer={word} size={word.length}  onChange={(e)=>handleChange(e)} onInput={(e)=>handleOnInput(e)} onKeyUp={(e)=>handleBackSpace(e)}  ref={(ref: HTMLInputElement) => inputsRef.current[i] = ref} className=" text-lg text-center py-0.5 block mx-1 px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0  border-gray-200" />
                    }) : <></>
                }       
            </div>
        </>
    )
}
export default TypingPanel