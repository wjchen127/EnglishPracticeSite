import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import SearchBar from '../components/SearchBar/SearchBar'
import { useState } from 'react'
export default function Home() {
  
  const [VideoMode, setVideoMode] = useState(false)
  return (
    <div id={"main"} className="flex h-screen">
      {
        VideoMode ? <div>video</div> : <SearchBar></SearchBar>
      }      
    </div>
  )
}
