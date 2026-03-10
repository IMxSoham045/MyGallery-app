import { Heart, Image, Moon, Search, Sun } from "lucide-react";
import Loading from "./components/Loading";
import { useEffect, useRef, useState } from "react";
import { albumData, allPhotosAlbum } from "./galleryData";
import { motion, AnimatePresence } from "framer-motion";
import pageChange from "./audio/page_changing.mp3";

import * as ColorThief from "colorthief";

function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(allPhotosAlbum);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 20;

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const [themeColor, setThemeColor] = useState("#2563eb");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(allPhotosAlbum.photos.map((photo) => photo.category)),
  ];

  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  const changePageAudio = useRef(new Audio(pageChange));

  const filteredPhotos = selectedAlbum.photos.filter((photo) => {
    const text = search.toLowerCase();

    const matchesSearch =
      photo.title.toLowerCase().includes(text) ||
      photo.photographer.toLowerCase().includes(text);

    const matchesCategory = category === "All" || photo.category === category;

    return matchesSearch && matchesCategory;
  });

  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;

  const currentPhotos = filteredPhotos.slice(
    indexOfFirstPhoto,
    indexOfLastPhoto,
  );

  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);

  const handleDownload = async (url, title) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title}.jpg`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download Failed", error);
    }
  };

  const handlePhotoOpen = (photo) => {
    setSelectedPhoto(photo);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = `${photo.imageUrl}?w=800`;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const dominant = colorThief.getColor(img);

        const rgb = `rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})`;
        setThemeColor(rgb);
      } catch (err) {
        console.log("Color extraction failed", err);
      }
    };
  };

  useEffect(() => {
    if (!selectedPhoto) return;

    let isCancelled = false;
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = selectedPhoto.imageUrl;

    img.onload = () => {
      if (isCancelled) return;
      const colorThief = new ColorThief();
      const dominant = colorThief.getColor(img);
      setThemeColor(`rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})`);
    };

    return () => {
      isCancelled = true;
    };
  }, [selectedPhoto]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Recommendation: Separate the effect for color extraction

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(1);
  }, [search, selectedAlbum, category]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <main
        className={`flex flex-col md:flex-row min-h-screen font-sans overflow-hidden
transition-colors duration-500 ease-in-out
${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-stone-100 text-zinc-900"}`}
      >
        {/* Mobile top bar */}
        <div
          className={`md:hidden flex items-center justify-between px-5 py-3.5 border-b sticky top-0 z-30 transition-colors duration-300 ${
            darkMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-200"
          }`}
        >
          <span className="text-lg font-extrabold tracking-tight">Photos</span>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors ${
              darkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
            }`}
          >
            ☰
          </button>
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && !isDesktop && (
            <motion.div
              className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || isDesktop) && (
            <motion.div
              initial={isDesktop ? false : { x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed md:fixed md:top-0 md:left-0 w-56 flex flex-col h-screen z-20 border-r duration-300 ${
                darkMode
                  ? "bg-zinc-900/80 backdrop-blur-xl border-zinc-800"
                  : "bg-white/80 backdrop-blur-xl border-zinc-200"
              }`}
            >
              <div className="px-5 pt-7 pb-4">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                    <Image size={14} className="text-white" />
                  </div>
                  <span
                    className={`text-xl font-extrabold tracking-tight ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                  >
                    Photos
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="search"
                    name="album_search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    id="album_search"
                    placeholder="Search Here..."
                    className={`w-full px-4 pr-9 py-2.5 rounded-full text-sm border outline-none transition-all duration-200
                                focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                                    ${
                                      darkMode
                                        ? "bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-500"
                                        : "bg-white border-zinc-300 text-zinc-700 placeholder-zinc-400"
                                    }`}
                  />
                  <Search
                    size={18}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${
                      darkMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 px-3 pb-6 overflow-y-auto flex-1">
                {[allPhotosAlbum, ...albumData].map((album, index) => (
                  <div
                    key={album.id}
                    onClick={() => {
                      if (selectedAlbum.id !== album.id) {
                        changePageAudio.current.currentTime = 0;
                        changePageAudio.current.play().catch(() => {});
                      }

                      setSelectedAlbum(album);

                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    style={{ animationDelay: `${index * 0.08}s` }}
                    className={`flex items-center gap-2 justify-between cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-0.5 select-none
              ${
                selectedAlbum.id === album.id
                  ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                  : darkMode
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
                  >
                    <div className="text-md font-bold">{album.albumTitle}</div>
                    <div className="text-sm font-semibold">
                      {album.photos.length}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto md:ml-56">
          <div className="flex items-center gap-2">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-3xl font-extrabold tracking-tight mb-7"
            >
              {selectedAlbum.albumTitle}
            </motion.h1>
            <p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-md font-semibold tracking-tight mb-5"
            >
              {selectedAlbum.photos.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
        ${
          category === cat
            ? "bg-indigo-600 text-white shadow-md"
            : darkMode
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
              >
                {cat} 
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAlbum.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {currentPhotos.map((photo) => (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handlePhotoOpen(photo)}
                  className="rounded-2xl group overflow-hidden max-w-3xl w-full text-white shadow-2xl cursor-pointer"
                  style={{
                    background: ` linear-gradient(120deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05)),
                                  linear-gradient(160deg, ${themeColor}30, ${themeColor}10)`,
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: `0 10px 40px ${themeColor}40`,
                  }}
                >
                  <div className="overflow-hidden">
                    <img
                      src={`${photo.imageUrl}?w=600&q=80`}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div
                    className={`p-3.5 transition-colors duration-300 ${darkMode ? "bg-zinc-900" : "bg-white"}`}
                  >
                    <p
                      className={`text-sm font-bold tracking-tight truncate transition-colors group-hover:text-indigo-500 ${
                        darkMode ? "text-zinc-100" : "text-zinc-900"
                      }`}
                    >
                      {photo.title}
                    </p>
                    <p
                      className={`text-xs mt-1 ${darkMode ? "text-zinc-100" : "text-zinc-600"}`}
                    >
                      By {photo.photographer || "Unknown"}
                    </p>

                    <p
                      className={`text-xs mt-1 flex items-center justify-end gap-0.5 ${
                        darkMode ? "text-zinc-100" : "text-zinc-600"
                      }`}
                    >
                      <Heart
                        size={16}
                        className="text-red-500 hover:text-red-800"
                      />
                      {photo.likes ?? 0}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                <button
                  onClick={() =>
                    setCurrentPage((p) => (p === 1 ? totalPages : p - 1))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    darkMode
                      ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : darkMode
                          ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => (p === totalPages ? 1 : p + 1))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    darkMode
                      ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Photo modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl overflow-hidden max-w-3xl w-full text-white shadow-2xl"
                style={{
                  background: `linear-gradient(160deg, ${themeColor}20, ${themeColor}80)`,
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={`${selectedPhoto.imageUrl}?w=1200`}
                  alt={selectedPhoto.title}
                  className="w-full max-h-[70vh] object-cover"
                />

                <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                  <h2
                    className={`text-lg font-extrabold text-gray-100 tracking-tight`}
                  >
                    {selectedPhoto.title}
                  </h2>

                  <button
                    onClick={() =>
                      handleDownload(
                        `${selectedPhoto.imageUrl}?w=2000&q=100`,
                        selectedPhoto.title,
                      )
                    }
                    className="bg-white/15 border border-white/25 text-white text-sm font-medium px-5 py-2.5 rounded-full backdrop-blur-sm hover:bg-white/25 hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    Download Image
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setDarkMode(!darkMode)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full border shadow-lg flex items-center justify-center transition-colors duration-300 cursor-pointer ${
            darkMode
              ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-yellow-400/40 border-gray-900"
              : "bg-gray-800 text-yellow-300 hover:bg-gray-700 shadow-gray-800/40 border-gray-300"
          }`}
          style={{ width: "52px", height: "52px" }}
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <AnimatePresence mode="wait">
            {darkMode ? (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun size={20} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon size={22} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </main>
    </div>
  );
}

export default App;
