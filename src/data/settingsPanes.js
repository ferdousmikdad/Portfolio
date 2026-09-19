/* ── System Settings pane icons ─────────────────────────────────────────────
   Real macOS 26 (Tahoe) artwork, pulled off this machine rather than redrawn:
   every settings pane ships as an ExtensionKit bundle under
   /System/Library/ExtensionKit/Extensions, and NSWorkspace.icon(forFile:)
   renders the composed tile — enclosure gradient, glyph, drop shadow — at
   1024pt. Downsampled to 128 here, which is 2× the largest size any of them
   is drawn at.

   Three panes (General, Battery, Headphones) carry no baked icon: their
   bundles declare an ISGraphicIconConfiguration instead, and the system
   composes symbol-on-enclosure at draw time. Those three were composed the
   same way against the sampled enclosure ramp (#555 → #191919, 22.4% corner
   radius, 14% inset).                                                       */

import about            from '@/assets/icons/settings/about.png'
import accessibility    from '@/assets/icons/settings/accessibility.png'
import appearance       from '@/assets/icons/settings/appearance.png'
import appleid          from '@/assets/icons/settings/appleid.png'
import battery          from '@/assets/icons/settings/battery.png'
import bluetooth        from '@/assets/icons/settings/bluetooth.png'
import datetime         from '@/assets/icons/settings/datetime.png'
import desktopdock      from '@/assets/icons/settings/desktopdock.png'
import displays         from '@/assets/icons/settings/displays.png'
import family           from '@/assets/icons/settings/family.png'
import focus            from '@/assets/icons/settings/focus.png'
import gamecenter       from '@/assets/icons/settings/gamecenter.png'
import gamecontroller   from '@/assets/icons/settings/gamecontroller.png'
import general          from '@/assets/icons/settings/general.png'
import headphones       from '@/assets/icons/settings/headphones.png'
import internetaccounts from '@/assets/icons/settings/internetaccounts.png'
import keyboard         from '@/assets/icons/settings/keyboard.png'
import language         from '@/assets/icons/settings/language.png'
import lockscreen       from '@/assets/icons/settings/lockscreen.png'
import loginitems       from '@/assets/icons/settings/loginitems.png'
import menubar          from '@/assets/icons/settings/menubar.png'
import mouse            from '@/assets/icons/settings/mouse.png'
import network          from '@/assets/icons/settings/network.png'
import notifications    from '@/assets/icons/settings/notifications.png'
import printers         from '@/assets/icons/settings/printers.png'
import privacy          from '@/assets/icons/settings/privacy.png'
import screentime       from '@/assets/icons/settings/screentime.png'
import sharing          from '@/assets/icons/settings/sharing.png'
import siri             from '@/assets/icons/settings/siri.png'
import softwareupdate   from '@/assets/icons/settings/softwareupdate.png'
import sound            from '@/assets/icons/settings/sound.png'
import spotlight        from '@/assets/icons/settings/spotlight.png'
import startupdisk      from '@/assets/icons/settings/startupdisk.png'
import storage          from '@/assets/icons/settings/storage.png'
import timemachine      from '@/assets/icons/settings/timemachine.png'
import touchid          from '@/assets/icons/settings/touchid.png'
import trackpad         from '@/assets/icons/settings/trackpad.png'
import transferreset    from '@/assets/icons/settings/transferreset.png'
import users            from '@/assets/icons/settings/users.png'
import wallpaper        from '@/assets/icons/settings/wallpaper.png'
import wifi            from '@/assets/icons/settings/wifi.png'

export const PANE_ICONS = {
  about, accessibility, appearance, appleid, battery, bluetooth, datetime,
  desktopdock, displays, family, focus, gamecenter, gamecontroller, general,
  headphones, internetaccounts, keyboard, language, lockscreen, loginitems,
  menubar, mouse, network, notifications, printers, privacy, screentime,
  sharing, siri, softwareupdate, sound, spotlight, startupdisk, storage,
  timemachine, touchid, trackpad, transferreset, users, wallpaper, wifi,
}

/* The sidebar's grouping and order, taken from
   /System/Applications/System Settings.app/Contents/Resources/Sidebar.plist —
   panes this portfolio has nothing to say about are dropped, but nothing is
   reordered and no group is merged.                                          */
export const SIDEBAR_GROUPS = [
  [
    { id: 'wifi',      icon: 'wifi',      label: 'Wi-Fi'     },
    { id: 'bluetooth', icon: 'bluetooth', label: 'Bluetooth' },
    { id: 'network',   icon: 'network',   label: 'Network'   },
    { id: 'battery',   icon: 'battery',   label: 'Battery'   },
  ],
  [
    { id: 'general',       icon: 'general',       label: 'General'       },
    { id: 'accessibility', icon: 'accessibility', label: 'Accessibility' },
    { id: 'appearance',    icon: 'appearance',    label: 'Appearance'    },
    { id: 'siri',          icon: 'siri',          label: 'Mikuda & Siri' },
    { id: 'desktopdock',   icon: 'desktopdock',   label: 'Desktop & Dock' },
    { id: 'displays',      icon: 'displays',      label: 'Displays'      },
    { id: 'menubar',       icon: 'menubar',       label: 'Menu Bar'      },
    { id: 'spotlight',     icon: 'spotlight',     label: 'Spotlight'     },
    { id: 'wallpaper',     icon: 'wallpaper',     label: 'Wallpaper'     },
  ],
  [
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'sound',         icon: 'sound',         label: 'Sound'         },
    { id: 'focus',         icon: 'focus',         label: 'Focus'         },
    { id: 'screentime',    icon: 'screentime',    label: 'Screen Time'   },
  ],
  [
    { id: 'privacy',    icon: 'privacy',    label: 'Privacy & Security' },
    { id: 'touchid',    icon: 'touchid',    label: 'Touch ID & Password' },
    { id: 'users',      icon: 'users',      label: 'Users & Groups'     },
    { id: 'lockscreen', icon: 'lockscreen', label: 'Lock Screen'        },
  ],
  [
    { id: 'keyboard', icon: 'keyboard', label: 'Keyboard' },
    { id: 'trackpad', icon: 'trackpad', label: 'Trackpad' },
    { id: 'mouse',    icon: 'mouse',    label: 'Mouse'    },
    { id: 'printers', icon: 'printers', label: 'Printers & Scanners' },
  ],
  [
    { id: 'storage',        icon: 'storage',        label: 'Storage'         },
    { id: 'softwareupdate', icon: 'softwareupdate', label: 'Software Update' },
    { id: 'about',          icon: 'about',          label: 'About'           },
  ],
]

export const PANE_TITLES = Object.fromEntries(
  SIDEBAR_GROUPS.flat().map(p => [p.id, p.label])
)
