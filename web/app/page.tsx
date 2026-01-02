"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-6 animate-fade-in">
          Manage Your Daily Tasks Easily 🚀
        </h1>
        <p className="text-lg mb-8 text-blue-100">
          Ek simple aur powerful To-Do App jo aapke tasks ko organize karne mein madad karta hai. 
          Abhi join karein aur apni productivity badhayein!
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-lg transform hover:scale-105">
              Get Started
            </button>
          </Link>
          
          <Link href="/login">
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all">
              Login
            </button>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-10 text-blue-200 text-sm">
        Built with Next.js & Node.js
      </footer>
    </div>
  );
}