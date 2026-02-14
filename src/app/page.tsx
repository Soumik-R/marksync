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
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) fetchBookmarks();
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) fetchBookmarks();
    });

    // Channel Function
    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-start p-8">
      {/* Left Section - Project Name */}
      <div className="flex-1 flex items-start justify-center px-8">
        <h1 className="text-8xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          MARKSYNC
        </h1>
      </div>

      {/* Right Section - Login/Dashboard Card */}
      <div className="flex-1 flex items-center justify-center px-8">
        {!user ? (
          <div className="text-center space-y-6">
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
  );
}



