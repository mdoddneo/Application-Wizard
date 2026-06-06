import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  increment,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  Sparkles,
  Smartphone,
  Info,
  FolderHeart,
  Globe,
  Trash2,
  Play,
  ArrowRight,
  Monitor,
  Heart,
  Check,
  Code,
  Share2,
  FolderGit,
  PenSquare,
} from "lucide-react";

import { db, auth, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from "./firebase";
import { AppItem, CommentItem, ActiveTab } from "./types";

// Components
import Header from "./components/Header";
import PhonePreview from "./components/PhonePreview";
import PromptWizard from "./components/PromptWizard";
import Marketplace from "./components/Marketplace";
import CodeEditor from "./components/CodeEditor";
import VaultDashboard from "./components/VaultDashboard";
import OnboardingOverlay from "./components/OnboardingOverlay";
import ThemeControlPanel from "./components/ThemeControlPanel";
import AppValuationPanel from "./components/AppValuationPanel";

export default function App() {
  // Navigation & Workspace states
  const [activeTab, setActiveTab] = useState<ActiveTab>("design-studio");
  const [previewPlatform, setPreviewPlatform] = useState<"ios" | "android" | "cross-platform">("ios");
  const [activeStudioView, setActiveStudioView] = useState<"preview" | "manual-code">("preview");

  // Walkthrough & design tour states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // User auth details
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);

  // App list & state
  const [activeApp, setActiveApp] = useState<AppItem | null>(null);
  const [sharedApps, setSharedApps] = useState<AppItem[]>([]);
  const [vaultApps, setVaultApps] = useState<AppItem[]>([]);
  const [commentsByApp, setCommentsByApp] = useState<{ [appId: string]: CommentItem[] }>({});
  const [likedAppIds, setLikedAppIds] = useState<string[]>([]);

  // Compiler state details
  const [compilerLoading, setCompilerLoading] = useState(false);
  const [compilerStatusText, setCompilerStatusText] = useState("");

  // Sync / Fullscreen simulation states for physical testing
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [loadingFullscreenApp, setLoadingFullscreenApp] = useState(false);

  // Setup guest credentials fallback if user is not logged in
  useEffect(() => {
    let savedGuestId = localStorage.getItem("appcraft_guest_id");
    let savedGuestEmail = localStorage.getItem("appcraft_guest_email");

    if (!savedGuestId) {
      const randSeed = Math.floor(100000 + Math.random() * 900000);
      savedGuestId = `guest_${randSeed}`;
      savedGuestEmail = `guest_${randSeed}@appcraft.io`;
      localStorage.setItem("appcraft_guest_id", savedGuestId);
      localStorage.setItem("appcraft_guest_email", savedGuestEmail);
    }

    setGuestId(savedGuestId);
    setGuestEmail(savedGuestEmail);

    // Watch Google Auth session state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsGuest(false);
      } else {
        setCurrentUser(null);
        setIsGuest(true);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync mobile QR code scan launcher (detects previewId link parameter on boot)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pId = params.get("previewId");
    const isFull = params.get("fullscreen") === "true";

    if (pId) {
      setLoadingFullscreenApp(true);
      if (isFull) {
        setFullscreenMode(true);
      }
      
      getDoc(doc(db, "apps", pId))
        .then((docSnap) => {
          if (docSnap.exists()) {
            const fetchedApp = { id: docSnap.id, ...docSnap.data() } as AppItem;
            setActiveApp(fetchedApp);
            setActiveTab("design-studio");
            setActiveStudioView("preview");
            setPreviewPlatform(fetchedApp.platform || "ios");
          } else {
            console.warn("Deep linked app target not found in Firestore.");
          }
        })
        .catch((err) => {
          console.error("Failed to query physical sync application: ", err);
        })
        .finally(() => {
          setLoadingFullscreenApp(false);
        });
    }
  }, []);

  const activeUserId = currentUser ? currentUser.uid : guestId;
  const activeUserEmail = currentUser ? currentUser.email || "Craft user" : guestEmail;

  // Sync Shared Apps from Firestore
  useEffect(() => {
    const appsQuery = query(collection(db, "apps"), where("published", "==", true));
    
    const unsubscribe = onSnapshot(
      appsQuery,
      (snapshot) => {
        const list: AppItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AppItem);
        });
        const sorted = list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSharedApps(sorted);

        // Fetch comments for all shared apps
        snapshot.forEach((docRef) => {
          const commentsQuery = collection(db, "apps", docRef.id, "comments");
          onSnapshot(commentsQuery, (cmtSnapshot) => {
            const commentsList: CommentItem[] = [];
            cmtSnapshot.forEach((cDoc) => {
              commentsList.push({ id: cDoc.id, ...cDoc.data() } as CommentItem);
            });
            setCommentsByApp((prev) => ({
              ...prev,
              [docRef.id]: commentsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            }));
          }, (err) => {
            console.error("Comments onSnapshot error ignored: ", err);
          });
        });
      },
      (error) => {
        console.error("Firestore Fetch Shared error: ", error);
        // Fallback placeholder apps if network is offline or unprovisioned yet
        setSharedApps([]);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync User Vault Apps from Firestore
  useEffect(() => {
    if (!activeUserId) return;

    const vaultQuery = query(collection(db, "apps"), where("creatorId", "==", activeUserId));
    
    const unsubscribe = onSnapshot(
      vaultQuery,
      (snapshot) => {
        const list: AppItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AppItem);
        });
        setVaultApps(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (error) => {
        console.error("Firestore Fetch Vault error: ", error);
      }
    );

    return () => unsubscribe();
  }, [activeUserId]);

  // Auto trigger Design Studio Guide Tour for new sessions
  useEffect(() => {
    if (loadingAuth === false && activeUserId) {
      const completed = localStorage.getItem(`appcraft_onboarding_${activeUserId}`);
      if (!completed) {
        setIsOnboardingOpen(true);
      }
    }
  }, [loadingAuth, activeUserId]);

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    if (activeUserId) {
      localStorage.setItem(`appcraft_onboarding_${activeUserId}`, "true");
    }
  };

  // Handle Google OAuth logins
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      alert("Popup authentication closed or failed. Session is continuous on Guest mode.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setActiveApp(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Fun status text rotation
  const triggerStatusTicks = (callback: () => Promise<void>) => {
    const timeline = [
      "Consulting Gemini cognitive parser...",
      "Analyzing layout constraints and safe boundaries...",
      "Styling elements with dynamic Tailwind tokens...",
      "Assembling robust JS logic & event handlers...",
      "Embedding standalone responsive iframe structure...",
      "Polishing margins, alignments, and active-states...",
    ];

    let tIndex = 0;
    setCompilerStatusText(timeline[0]);
    const timer = setInterval(() => {
      tIndex++;
      if (tIndex < timeline.length) {
        setCompilerStatusText(timeline[tIndex]);
      }
    }, 1200);

    setCompilerLoading(true);

    callback().finally(() => {
      clearInterval(timer);
      setCompilerLoading(false);
      setCompilerStatusText("");
    });
  };

  // Execute App Creation via server endpoint
  const handleCompileNewApp = async (promptText: string, options: any) => {
    triggerStatusTicks(async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            platform: previewPlatform,
            category: options.category,
            extraInstructions: options.extraGuidelines,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Gemini compiler backend returned bad status.");
        }

        const data = await response.json();

        // Save new App to Firestore
        const newAppId = `app_${Math.random().toString(36).substr(2, 9)}`;
        const newAppDoc: AppItem = {
          id: newAppId,
          title: data.title || "Untitled Creation",
          description: data.description || "A custom applet generated via prompt.",
          prompt: promptText,
          code: data.code,
          platform: previewPlatform,
          category: data.category || options.category || "Utility",
          icon: data.icon || "smartphone",
          creatorId: activeUserId,
          creatorEmail: activeUserEmail,
          published: false,
          likesCount: 0,
          viewsCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          features: data.features || ["Responsive controls", "Interactive state mechanics"],
          lastAiCode: data.code,
        };

        // Write directly to firestore
        try {
          await setDoc(doc(db, "apps", newAppId), newAppDoc);
        } catch (dbErr) {
          console.error("Local Firestore document insert blocked by security rules. Storing sessionally: ", dbErr);
        }

        setActiveApp(newAppDoc);
        setActiveStudioView("preview");
      } catch (err: any) {
        alert(`Compiler Fail: ${err.message || String(err)}`);
      }
    });
  };

  // Execute Refinement (improvement/edit) prompt via server endpoint
  const handleRefineApp = async (refinementPrompt: string) => {
    if (refinementPrompt === "__RESET_WORKSPACE__") {
      setActiveApp(null);
      return;
    }

    if (!activeApp) return;

    triggerStatusTicks(async () => {
      try {
        const response = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: refinementPrompt,
            currentCode: activeApp.code,
            platform: previewPlatform,
            extraInstructions: "",
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Gemini refinement backend failed.");
        }

        const data = await response.json();

        // Update local state first
        const updatedApp: AppItem = {
          ...activeApp,
          title: data.title || activeApp.title,
          description: data.description || activeApp.description,
          code: data.code,
          features: data.features || activeApp.features,
          updatedAt: new Date().toISOString(),
          lastAiCode: data.code,
        };

        // Persist update in firestore
        try {
          await updateDoc(doc(db, "apps", activeApp.id), {
            title: updatedApp.title,
            description: updatedApp.description,
            code: updatedApp.code,
            features: updatedApp.features,
            updatedAt: updatedApp.updatedAt,
            lastAiCode: data.code,
          });
        } catch (dbErr) {
          console.error("Refined persist failed: ", dbErr);
        }

        setActiveApp(updatedApp);
        setActiveStudioView("preview");
      } catch (err: any) {
        alert(`Refinement Fail: ${err.message || String(err)}`);
      }
    });
  };

  // Toggle Publish draft app state
  const handleTogglePublish = async (app: AppItem) => {
    const nextPublishedValue = !app.published;
    try {
      await updateDoc(doc(db, "apps", app.id), {
        published: nextPublishedValue,
      });

      // Update current active app if it matches
      if (activeApp && activeApp.id === app.id) {
        setActiveApp({ ...activeApp, published: nextPublishedValue });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "apps");
    }
  };

  // Like app increment trigger
  const handleLikeApp = async (appId: string) => {
    if (likedAppIds.includes(appId)) return; // Prevents duplicate likes sessionally
    try {
      await updateDoc(doc(db, "apps", appId), {
        likesCount: increment(1),
      });
      setLikedAppIds((prev) => [...prev, appId]);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `apps/${appId}`);
    }
  };

  // Delete App draft
  const handleDeleteApp = async (appId: string) => {
    if (!confirm("Are you sure you want to permanently delete this application creation? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "apps", appId));
      if (activeApp && activeApp.id === appId) {
        setActiveApp(null);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `apps/${appId}`);
    }
  };

  // Add Comment review helper
  const handleAddComment = async (appId: string, commentText: string) => {
    if (!activeUserId) return;
    try {
      const commentId = `cmt_${Math.random().toString(36).substr(2, 9)}`;
      const commentDoc = {
        id: commentId,
        appId: appId,
        userId: activeUserId,
        userEmail: activeUserEmail,
        commentText: commentText,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "apps", appId, "comments", commentId), commentDoc);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `apps/${appId}/comments`);
    }
  };

  // Launch pre-built app from Marketplace or Vault directly inside Studio
  const handleRunApp = (app: AppItem) => {
    setActiveApp(app);
    setActiveTab("design-studio");
    setActiveStudioView("preview");
    setPreviewPlatform(app.platform || "ios");
  };

  // Override / Clone App to make modifications
  const handleTweakApp = (app: AppItem) => {
    // Clones app under user's ownership
    const clonedId = `app_${Math.random().toString(36).substr(2, 9)}`;
    const clonedApp: AppItem = {
      ...app,
      id: clonedId,
      title: `${app.title} (Customized)`,
      creatorId: activeUserId,
      creatorEmail: activeUserEmail,
      published: false,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAiCode: app.lastAiCode || app.code,
    };

    setDoc(doc(db, "apps", clonedId), clonedApp)
      .then(() => {
        setActiveApp(clonedApp);
        setActiveTab("design-studio");
        setActiveStudioView("preview");
        setPreviewPlatform(clonedApp.platform || "ios");
      })
      .catch((err) => {
        console.error("Cloning failed, loading transiently: ", err);
        setActiveApp(clonedApp);
        setActiveTab("design-studio");
      });
  };

  if (loadingFullscreenApp) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Smartphone className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h3 className="text-lg font-bold font-display tracking-tight text-white">Connecting Sync Bridge...</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
          Retrieving code bundle from your secure cloud sandbox to run directly on physical device browser.
        </p>
      </div>
    );
  }

  if (fullscreenMode && activeApp) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col h-screen w-screen overflow-hidden font-sans">
        {/* Top Developer chrome */}
        <div className="h-11 bg-slate-900 border-b border-slate-850 px-4 flex items-center justify-between text-xs font-sans shrink-0">
          <div className="flex items-center gap-2 max-w-[50%]">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-slate-100 font-bold truncate text-[11px] uppercase tracking-wider font-mono">
              {activeApp.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">Physical Mobile Mode</span>
            <button
              onClick={() => {
                setFullscreenMode(false);
                // Clean URL parameters without reloading
                const url = new URL(window.location.href);
                url.searchParams.delete("fullscreen");
                url.searchParams.delete("previewId");
                window.history.replaceState({}, "", url.toString());
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition cursor-pointer text-[11px]"
            >
              Exit Developer Frame
            </button>
          </div>
        </div>
        {/* Full View Standalone app execution */}
        <div className="flex-1 bg-white relative">
          {activeApp.code ? (
            <iframe
              srcDoc={activeApp.code}
              sandbox="allow-scripts allow-forms allow-popups allow-modals"
              title={activeApp.title}
              className="w-full h-full border-0 absolute inset-0 bg-white"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-500">
              <p className="text-xs">Awaiting live script sequence...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header section wrapper */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        loadingAuth={loadingAuth}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        isGuest={isGuest}
        guestUserEmail={activeUserEmail}
        onStartTour={() => setIsOnboardingOpen(true)}
      />

      {/* Main Panel Content Workspace */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto flex flex-col">
        {activeTab === "design-studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
            {/* Left Prompt and controls workspace: col 5 */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <PromptWizard
                onGenerate={handleCompileNewApp}
                loading={compilerLoading}
                statusText={compilerStatusText}
                activeAppTitle={activeApp?.title}
                onRefine={handleRefineApp}
              />

              {activeApp && (
                <ThemeControlPanel
                  currentHtml={activeApp.code}
                  onUpdateCode={(newCode) => {
                    if (activeApp) {
                      const updated = { ...activeApp, code: newCode, updatedAt: new Date().toISOString() };
                      setActiveApp(updated);
                      // Sync up to Firestore if accessible
                      updateDoc(doc(db, "apps", activeApp.id), { code: newCode, updatedAt: updated.updatedAt })
                        .catch((e) => console.error("Theme updater sync error: ", e));
                    }
                  }}
                />
              )}

              {activeApp && (
                <AppValuationPanel app={activeApp} />
              )}
            </div>

            {/* Right Live Device Showcase / Code view: col 7 */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {activeApp && (
                <div className="flex items-center gap-1.5 self-end bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setActiveStudioView("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeStudioView === "preview"
                        ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Interactive Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveStudioView("manual-code")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeStudioView === "manual-code"
                        ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Manual Code Tweak</span>
                  </button>
                </div>
              )}

              <div className="flex-1">
                {activeStudioView === "preview" ? (
                  <PhonePreview
                    app={activeApp}
                    platform={previewPlatform}
                    setPlatform={setPreviewPlatform}
                    onCodeClick={() => setActiveStudioView("manual-code")}
                  />
                ) : (
                  <CodeEditor
                    initialCode={activeApp ? activeApp.code : ""}
                    lastAiCode={activeApp ? activeApp.lastAiCode || activeApp.code : ""}
                    appName={activeApp ? activeApp.title : ""}
                    onSave={(newSource) => {
                      if (activeApp) {
                        const updated = { ...activeApp, code: newSource, updatedAt: new Date().toISOString() };
                        setActiveApp(updated);
                        // Save to firestore if writable
                        updateDoc(doc(db, "apps", activeApp.id), { code: newSource, updatedAt: updated.updatedAt }).catch((e) =>
                          console.error("Editor direct write blocked: ", e)
                        );
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "marketplace" && (
          <Marketplace
            apps={sharedApps}
            comments={commentsByApp}
            currentUserId={activeUserId}
            onRun={handleRunApp}
            onTweak={handleTweakApp}
            onLike={handleLikeApp}
            onDelete={handleDeleteApp}
            onAddComment={handleAddComment}
            likedApps={likedAppIds}
          />
        )}

        {activeTab === "my-vault" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <FolderGit className="w-5 h-5 text-indigo-500" />
                <span>My Creative App Vault</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Your sandbox drafts and published mobile-optimized application properties reside safely here. Toggle their publication status to instantaneously post or take down items in our Shared Marketplace.
              </p>
            </div>

            <VaultDashboard 
              apps={vaultApps} 
              onTweak={handleTweakApp} 
              onRun={handleRunApp} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vaultApps.length === 0 ? (
                <div className="col-span-full text-center p-16 border border-dashed border-slate-300 bg-white shadow-sm rounded-2xl">
                  <p className="text-slate-500 font-medium">Your Creative Vault is entirely empty.</p>
                  <button
                    onClick={() => setActiveTab("design-studio")}
                    className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow shadow-indigo-600/10"
                  >
                    <span>Create Your Very First Draft App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                vaultApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-200 hover:border-indigo-300 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display font-bold text-slate-900 text-base">{app.title}</h3>
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-205 mt-1">
                            {app.category || "Utility"}
                          </span>
                        </div>

                        {app.published ? (
                          <span className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-full border border-indigo-100">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-full border border-slate-200">
                            <span>Local Draft</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{app.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-2">
                        Created: {new Date(app.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 pt-3 flex-wrap">
                      <button
                        onClick={() => handleRunApp(app)}
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow shadow-indigo-600/5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run</span>
                      </button>

                      <button
                        onClick={() => handleTogglePublish(app)}
                        className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition ${
                          app.published
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100/90 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/95 border border-emerald-200"
                        }`}
                      >
                        {app.published ? "Take Down" : "Publish"}
                      </button>

                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="text-red-500 hover:text-red-650 p-2 ml-auto hover:bg-red-50 rounded-lg transition"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Persistent global footer */}
      <footer className="border-t border-slate-250/80 py-4 px-6 mt-12 bg-white shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-550">
          <span>Application Wizard Workspace • Version 1.4.0 (Stable)</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-slate-600 font-medium">Full-Stack Express proxy is operational</span>
            </span>
            <span className="text-slate-400">Local Time: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </footer>

      {/* Interactive Walkthrough / Onboarding Tutorial Flow */}
      <OnboardingOverlay
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}
