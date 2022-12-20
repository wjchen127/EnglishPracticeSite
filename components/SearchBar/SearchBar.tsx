import { ReactElement, useState, useRef } from 'react'

interface IMyProps {
    handleFunc: (inputValue: string) => void
}
const SearchBar = (props: IMyProps): ReactElement<IMyProps> => {
    const input = useRef<HTMLInputElement>(null)
    // const [inputValue, setInputValue] = useState("")
    function sendReq() {
        if (input.current) {
            //?v={11個英數字元}
            if (input.current.value.match(/^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}$/)) {
                props.handleFunc(input.current.value)
            } else {
                alert('輸入格式錯誤，請重新輸入！')
            }
        }
    }
    return (
        <>
            <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
                <div id="searchDiv" className="m-auto w-1/3 flex ">
                    <input
                        ref={input}
                        className="mr-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none  dark:bg-neutral-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Youtube連結..."
                        id="myInput"
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white break-keep py-2 px-4 rounded-lg text-sm dark:bg-neutral-800 dark:border-gray-600"
                        onClick={sendReq}
                    >
                        搜尋
                    </button>
                </div>
            </div>
        </>
    )
}
export default SearchBar
