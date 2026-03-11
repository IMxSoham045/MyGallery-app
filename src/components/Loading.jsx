// import { Image } from "lucide-react";
// import React, { useEffect, useState } from "react";

// const Loading = () => {
//   const getInitialTheme = () => {
//     const savedTheme = localStorage.getItem("theme");

//     if (savedTheme) {
//       return savedTheme === "dark";
//     }

//     return window.matchMedia("(prefers-color-scheme: dark)").matches;
//   };

//   const [darkMode, setDarkMode] = useState(getInitialTheme);

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [darkMode]);

//   return (
//     <div
//       className={`h-screen flex items-center justify-center bg-white transition-colors duration-500 ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"}`}
//     >
//       <div className="flex flex-col items-center gap-4">
//         <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
//           <Image size={18} className="text-white" />
//         </div>

//         <p
//           className={`text-gray-700 font-semibold text-lg ${darkMode ? "text-zinc-200" : "text-gray-700"}`}
//         >
//           Loading Photos...
//         </p>

//         <div
//           className={`w-40 h-1 rounded-full overflow-hidden ${
//             darkMode ? "bg-zinc-700" : "bg-gray-200"
//           }`}
//         >
//           <div className="h-full bg-red-500 animate-loadingBar"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Loading;

import React, { useEffect, useState } from "react";
import { photos } from "../galleryData";
import spiderMan from "../assets/Spider-Man.png";

const Loading = () => {
  const [randomPhotos, setRandomPhotos] = useState([]);

  useEffect(() => {
    const shuffled = [...photos].sort(() => 0.5 - Math.random());
    setRandomPhotos(shuffled.slice(0, 6));
  }, []);

  return (
    <div className="spider-loader">
      {/* Web background */}
      <div className="web-background"></div>

      {/* Spider-Man Sticker */}
      <img src={spiderMan} alt="spiderman" className="spiderman-sticker" />

      <h1 className="spider-title">MY GALLERY</h1>

      {/* Hanging Photos */}
      <div className="photo-grid">
        {randomPhotos.map((photo) => (
          <div key={photo.id} className="photo-item">
            <div className="photo-web"></div>

            <img
              src={`${photo.imageUrl}?w=500&auto=format&fit=crop`}
              alt={photo.title}
            />
          </div>
        ))}
      </div>

      <p className="loading-text">Entering the MI-Verse...</p>
    </div>
  );
};

export default Loading;
