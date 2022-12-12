import React, { ReactElement, useEffect, useState, useRef } from "react"
interface IMyProps{
    captionText: string
}

const TestPanel = (props: IMyProps): ReactElement => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [randomWordsObj, setRandomWordsObj] = useState<Array<{word: string, order: number}>>([])
    // const mounted = useRef(false)

    useEffect(()=>{
        let btnArr = props.captionText.split(" ").map((word,i)=>{
            return {
                word:word,
                order: i
            }
        })
        shuffleArray(btnArr)
        setRandomWordsObj(btnArr)
        return ()=>{
            setRandomWordsObj([])
            setCurrentWordIndex(0)
        }
    },[props.captionText])

    

    function handleBtnClick(e: React.MouseEvent<HTMLButtonElement>){
        if(parseInt((e.target as HTMLButtonElement).name, 10) === currentWordIndex){
            setCurrentWordIndex(currentWordIndex+1)
        }
    }

    function shuffleArray(array: Array<{word: string, order: number}>) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    return(
        <>
            <span>currentWordIndex:{currentWordIndex}</span>
            <div id="displayAnswerArea">
                <div className="flex flex-wrap justify-center my-5">
                    {
                        props.captionText.split(" ").map((word,i) => {
                            if(i < currentWordIndex){
                                return (
                                    <div key={i} className="text-gray-600 font-medium text-lg mx-1 border-solid  border-b-[2px] border-green-600 px-0.5"><span className="text-green-600">{word}</span></div>
                                )
                            }else{
                                return (
                                    <div key={i} className="text-gray-900 font-medium text-lg mx-1 border-solid  border-b-[2px] border-gray-900 px-0.5 dark:border-white"><span className="invisible">{word}</span></div>
                                )
                            }
                        })
                    }
                </div>
            </div>
            <div className="flex flex-wrap justify-center">
                {   
                    randomWordsObj.map(obj=>{
                        if(obj.order < currentWordIndex){
                            return <button disabled  onClick={(e)=>handleBtnClick(e)} name={obj.order.toString()} key={obj.order} type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 font-medium rounded-md text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 disabled:opacity-50">{obj.word}</button>
                        }else{
                            return <button onClick={(e)=>handleBtnClick(e)} name={obj.order.toString()} key={obj.order} type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 font-medium rounded-md text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">{obj.word}</button>
                        }
                    })
                }
            </div>
        </>
    )
}
export default TestPanel