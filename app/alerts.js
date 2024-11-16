import ui, {$} from './lib/ui.js'
import request from './lib/request.js'

// Alerts and favorites menu
export function Alerts(l, set) {
    ui.init(this, 'alerts')

    this.load = async () => {
        const state = request.cookie('alerts')
        const lang = request.cookie('lang') || 'fi'
        const hid = request.cookie('home')
        const did = request.cookie('dest')
        this.tree.innerHTML =
            `<h2>${l.str.listHead}</h2>` +
            `<div${state === null ? '' : ' class="hidden"'} id="alert"></div>` +
            '<ul></ul>'
        const alerts = $('#alert', this)
        // Generate alerts content for selected lang
        alerts.innerHTML = set.reduce((cat, a) => {
            const t = a.find((t) => t.language === lang)
            // Skip alerts with no description
            return t?.text ? `${cat}<p class="${a[0].toLowerCase()}">${t.text}</p>` : cat
        }, '')
        $('ul', this).innerHTML =
            (alerts.innerHTML
                ? `<li><button>${state ? l.str.open : l.str.close}</button></li>`
                : '') +
            (hid
                ? `<li><a href="#p=1;stop=${hid}">${l.str.goHome}</a></li>`
                : '') +
            (did
                ? `<li><a href="#p=1;stop=${did}">${l.str.goDest}</a></li>`
                : '')
        // Tree gets overwritten on reload, listener can be GC'd
        $('button', this)?.addEventListener('click', (ev) => {
            alerts.classList.toggle('hidden')
            ev.target.innerHTML = alerts.classList.contains('hidden')
                ? l.str.open
                : l.str.close
            request.cookie('alerts', alerts.className)
        })
    }

    // Listen for lang and favorite stop change notifications
    ui.listen('lang', this.load)
    ui.listen('fav', this.load)
}
