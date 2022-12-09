import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import SearchBar from '../components/SearchBar/SearchBar'
import Loading from '../components/Loading/Loading'
import { useState } from 'react'
import PlayPanel from '../components/PlayPanel/PlayPanel'
export default function Home() {
  
  const [VideoMode, setVideoMode] = useState(false)
  const [loading, setLoading] = useState(false)
  async function searchYTAndProcess(){
    //切換到Loading頁面
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setVideoMode(true)
    }, 2000);
  }
  return (
    <div id="main" className="h-screen w-full dark:bg-neutral-900">
      {
        loading ? <Loading/> : (VideoMode ? <PlayPanel/> : <SearchBar handleFunc={searchYTAndProcess}></SearchBar>)
      }      
    </div>
  )
}
