import { ReactElement } from "react"

interface IMyProps{
    handleFunc: () => void
}
const SearchBar = (props: IMyProps): ReactElement<IMyProps> => {
    return (
        <>
            <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center">
                <div id="searchDiv" className="m-auto w-1/3 flex ">
                    <input className="mr-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none  dark:bg-neutral-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Youtube連結..."/>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white break-keep py-2 px-4 rounded-lg text-sm dark:bg-neutral-800 dark:border-gray-600" onClick={props.handleFunc}>
                            搜尋
                    </button>
                </div>
            </div>
        </>
    )
}
export default SearchBar