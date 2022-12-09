import { ReactElement } from "react"
const SearchBar = (): ReactElement => {
    return (
        <>
            <div id="searchDiv" className="m-auto w-1/3 flex ">
                <input className="mr-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="Youtube連結..."/>
                <button className="bg-blue-500 hover:bg-blue-700 text-white break-keep py-2 px-4 rounded-lg text-sm">
                        搜尋
                </button>
            </div>
        </>
    )
}
export default SearchBar