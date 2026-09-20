import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import SYS from '@/data/systemProfile'
import { UPDATE_VERSION } from '@/data/softwareUpdate'

/* ── Software Update ───────────────────────────────────────────────────────
   The state of the one update this Mac has waiting for it.

     available → downloading → installing → installed

   The ticker lives here rather than in the pane because macOS keeps
   downloading after you navigate away from Software Update, and a progress
   bar that freezes the moment the pane unmounts would be a worse lie than
   the update itself.

   Installed state is persisted: a visitor who has already run the update
   should not be nagged about it again, and the version they are running has
   to survive a reload or About This Mac would quietly roll back.

   A download caught mid-flight by a reload does *not* survive — see
   `onRehydrateStorage`. Half a download is not a state a real Mac resumes
   into from cold, and persisting it would leave a dead bar on screen with
   no ticker behind it.                                                     */

const DOWNLOAD_MS = 4500
const INSTALL_MS  = 3000
const TICK_MS     = 100

let timer = null

const stopTicker = () => { clearInterval(timer); timer = null }

const useUpdateStore = create(
  persist(
    (set, get) => ({
      stage: 'available',          // available | downloading | installing | installed
      progress: 0,                 // 0–100 within the current stage
      installedVersion: null,      // null until the update has actually run

      /** The version this Mac is running right now. */
      currentVersion: () => get().installedVersion ?? SYS.osVersion,

      /** True while there is something to install — what the badge keys off. */
      isPending: () => get().stage !== 'installed',

      download() {
        if (get().stage !== 'available') return
        stopTicker()
        set({ stage: 'downloading', progress: 0 })
        const started = performance.now()
        timer = setInterval(() => {
          const { stage } = get()
          const span = stage === 'downloading' ? DOWNLOAD_MS : INSTALL_MS
          const elapsed = performance.now() - started - (stage === 'installing' ? DOWNLOAD_MS : 0)
          const pct = Math.min(100, (elapsed / span) * 100)
          if (pct < 100) { set({ progress: pct }); return }

          if (stage === 'downloading') set({ stage: 'installing', progress: 0 })
          else {
            stopTicker()
            set({ stage: 'installed', progress: 100, installedVersion: UPDATE_VERSION })
          }
        }, TICK_MS)
      },

      /* Only reachable from the Terminal, which is the right place for it:
         nobody uninstalls a macOS update from the Software Update pane. */
      reset() {
        stopTicker()
        set({ stage: 'available', progress: 0, installedVersion: null })
      },
    }),
    {
      name: 'portfolio-software-update',
      partialize: (s) => ({ stage: s.stage, installedVersion: s.installedVersion }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.stage === 'downloading' || state.stage === 'installing') {
          state.stage = 'available'
          state.progress = 0
        }
      },
    },
  ),
)

export default useUpdateStore
