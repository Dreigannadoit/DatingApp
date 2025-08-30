"use client"
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Home() {

  return (
    <div className="relative h-full w-full">
      <main className="h-full w-full flex justify-center align-middle">
        <div className="h-full w-full absolute top-0 left-0">
          <div className="h-full w-full absolute top-0 left-0 bg-gradient-to-r from-red-900 to-pink-900 opacity-50"></div>
          <img
            className="h-full w-full object-cover"
            src="./landingImg.jpg"
            alt=""
          />
        </div>

        <div className="h-full w-full absolute top-0 left-0 flex flex-col justify-center items-center">
          
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Pag-ibig na hatid ng <mark className="px-2 text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-sm">Tadhana</mark></h1>

          <p className="text-lg font-normal text-gray-100 lg:text-xl dark:text-gray-100 underline underline-offset-4">Two hearts, one destiny — guided by Tadhana.</p>
        </div>
      </main>
    </div> 
  );
}
