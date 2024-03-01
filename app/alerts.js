import ui, {$} from './lib/ui.js'
import request from './lib/request.js'

// Alerts and favorites menu
export function Alerts(l, listenLang, listenHome, set) {
    ui.init(this, 'alerts')

    this.compose = async () => {
        const state = request.cookie('alerts')
        const lang = request.cookie('lang') || 'fi'
        const hid = request.cookie('home')
        const did = request.cookie('dest')
        this.tree.innerHTML =
            `<div${state === null ? '' : ' class="hidden"'} id="alert"></div>` +
            '<ul></ul>'
        const alerts = $('#alert', this)
        alerts.innerHTML = set.reduce((cat, a) => {
            const severity = a[a.length - 1] === 'SEVERE' ? ' class="severe"' : ''
            const t = a.find((t) => t.language === lang)
            // Skip alerts with no description
            return t?.text ? `${cat}<p${severity}>${t.text}</p>` : cat
        }, '')
        const toggle = alerts.innerHTML
            ? `<li><button>${state ? l.str.open : l.str.close}</button></li>`
            : ''
        const home = hid
            ? `<li><a href="#p=1;stop=${hid}">${l.str.goHome}</a></li>`
            : ''
        const dest = did
            ? `<li><a href="#p=1;stop=${did}">${l.str.goDest}</a></li>`
            : ''
        $('ul', this).innerHTML = `${toggle}${home}${dest}`
        // Tree gets overwritten on re-compose, listener can be GC'd
        $('button', this)?.addEventListener('click', (ev) => {
            alerts.classList.toggle('hidden')
            ev.target.innerHTML = alerts.classList.contains('hidden')
                ? l.str.open
                : l.str.close
            request.cookie('alerts', alerts.className)
        })
    }

    // Listen for lang and home stop change notifications
    listenLang(this.compose)
    listenHome(this.compose)
}
