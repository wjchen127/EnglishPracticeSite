import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import SearchBar from '../components/SearchBar/SearchBar'
import { useState } from 'react'
import PlayPanel from '../components/PlayPanel/PlayPanel'
export default function Home() {
    const [ytURL, setYtURL] = useState('')
    function searchYTAndProcess(inputValue: string) {
        if (inputValue) {
            setYtURL(inputValue)
        }
    }
    return (
        <div id="main" className="h-screen w-full dark:bg-neutral-900">
            {ytURL ? <PlayPanel ytURL={ytURL} /> : <SearchBar handleFunc={searchYTAndProcess}></SearchBar>}
        </div>
    )
}
