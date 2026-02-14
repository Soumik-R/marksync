// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }


//TEMP

"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  //FetchBookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) setBookmarks(data);
  }, [user]);

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks();
  };

  // UseEffect -> Updating stuff, supabaseAuth listner
  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data.user);
        
        if (data.user) fetchBookmarks();
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      if (mounted) {
        setUser(currentUser);
        
        if (currentUser) fetchBookmarks();
      }
    });

    // Channel Function
    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          if (mounted) fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchBookmarks]);


  const login = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addBookmark = async () => {
    if (!title || !url) return alert("Fill all fields");
    if (!user) return alert("User not found");

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    if (error) alert(error.message);
    else {
      setTitle("");
      setUrl("");
      fetchBookmarks();
    }
  };

  //UI changes
  return (
    <>
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(147, 51, 234, 0.3),
                         0 0 20px rgba(147, 51, 234, 0.2),
                         0 0 30px rgba(147, 51, 234, 0.1);
            filter: brightness(1);
          }
          50% {
            text-shadow: 0 0 20px rgba(147, 51, 234, 0.8),
                         0 0 40px rgba(147, 51, 234, 0.6),
                         0 0 60px rgba(147, 51, 234, 0.4);
            filter: brightness(1.3);
          }
        }
        .glow-1 {
          animation: glow 2s ease-in-out infinite;
          animation-delay: 0s;
        }
        .glow-2 {
          animation: glow 2s ease-in-out infinite;
          animation-delay: 0.7s;
        }
        .glow-3 {
          animation: glow 2s ease-in-out infinite;
          animation-delay: 1.4s;
        }
      `}</style>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-[#77fcef] to-pink-50 flex items-center p-8">
      {/* Left Section - Project Name */}
      <div className="flex-1 flex items-start justify-center px-8">
        <div className="flex flex-col items-center">
          <h1 className="text-8xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MARKSYNC
          </h1>
          <div className="w-64 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mt-4"></div>
          
          {/* Instructions */}
          <div className="mt-24 space-y-10">
            <div className="flex items-center gap-6 glow-1">
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent w-16 text-right">1.</span>
              <p className="text-3xl font-medium text-gray-700">Enter Bookmark Title</p>
            </div>
            <div className="flex items-center gap-6 glow-2">
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent w-16 text-right">2.</span>
              <p className="text-3xl font-medium text-gray-700">Give us the link</p>
            </div>
            <div className="flex items-center gap-6 glow-3">
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent w-16 text-right">3.</span>
              <p className="text-3xl font-medium text-gray-700">Forget about it</p>
            </div>
          </div>
          
          {/* Made By */}
          <div className="mt-16 text-center">
            <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Made by Soumik Roy with ❤️
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <a 
                href="https://www.linkedin.com/in/mesoumikr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-2xl hover:scale-125 transition-transform duration-200"
                title="LinkedIn"
              >
                <svg className="w-8 h-8 fill-blue-600 hover:fill-blue-700" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              <a 
                href="mailto:soumikroy7272@gmail.com"
                className="text-2xl hover:scale-125 transition-transform duration-200"
                title="Gmail"
              >
                <svg className="w-8 h-8 fill-red-600 hover:fill-red-700" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
              </a>
              
              <a 
                href="https://www.instagram.com/soumik.roy_?igsh=MXE2eWtleWV5b24xMA==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-2xl hover:scale-125 transition-transform duration-200"
                title="Instagram"
              >
                <svg className="w-8 h-8 fill-pink-600 hover:fill-pink-700" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login/Dashboard Card */}
      <div className="flex-1 flex items-center justify-center px-8">
        {!user ? (
          <div className="text-center space-y-6 bg-white/30 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-white/40">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                MarkSync
              </h1>
              <p className="text-gray-600 text-lg">Your Beautiful Bookmark Manager</p>
            </div>
            <button
              onClick={login}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 font-semibold"
            >
              Login with Google
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6 border border-white/20">

          <div className="text-center border-b border-gray-200 pb-4">
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name || "User avatar"}
              className="w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-purple-200 shadow-lg"
            />
            <h2 className="font-bold text-2xl text-gray-900 mb-1">
              {user.user_metadata.full_name}
            </h2>
            <p className="text-sm text-gray-500">Manage Your Bookmarks</p>
          </div>

          <div className="space-y-3">
            <input
              placeholder="Bookmark Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-gray-200 p-3 rounded-xl w-full text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            />

            <input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border-2 border-gray-200 p-3 rounded-xl w-full text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            />

            <button
              onClick={addBookmark}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white w-full py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Save Bookmark
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📚</p>
                <p>No bookmarks yet. Start saving!</p>
              </div>
            ) : (
              bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-4 rounded-xl flex justify-between items-center hover:shadow-md transition-all group hover:scale-[1.02]"
                >
                  <a 
                    href={b.url} 
                    target="_blank" 
                    className="text-gray-800 hover:text-purple-600 transition-colors font-medium flex-1 truncate pr-3"
                  >
                    {b.title}
                  </a>

                  <button
                    onClick={() => deleteBookmark(b.id)}
                    className="text-red-400 hover:text-red-600 font-bold text-xl transition-all hover:scale-125 hover:rotate-90 duration-200"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={logout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            Logout
          </button>

        </div>
        )}
      </div>
    </div>
    </>
  );
}



