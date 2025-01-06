import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// Alerts and favorites menu
export function Alerts(l) {
    ui.init(this, 'alerts')

    // Generate menu contents based on alerts box and cookie state
    const menu = () => {
        const box = $('#alert', this)
        const hid = request.cookie('home')
        const did = request.cookie('dest')
        $('ul', this).innerHTML =
            (box.innerHTML ?
                `<li><button>${box.className ? l.str.open : l.str.close}</button></li>` :
                '') +
            (hid ?
                `<li><a href="#p=1;stop=${hid}">${l.str.goHome}</a></li>` :
                '') +
            (did ?
                `<li><a href="#p=1;stop=${did}">${l.str.goDest}</a></li>` :
                '')
        // Tree gets overwritten on reload, listener can be GC'd
        $('button', this)?.addEventListener('click', (ev) => {
            ev.target.textContent = box.classList.toggle('hidden') ?
                l.str.open :
                l.str.close
            request.cookie('alerts', box.className)
        })
    }

    this.load = async () => {
        this.tree.innerHTML =
            `<h2>${l.str.listHead}</h2>` +
            `<div${request.cookie('alerts') ? ' class="hidden"' : ''} id="alert"></div>` +
            '<ul></ul>'
        const json = await request.http(env.uri, 'POST', {
            'query': `{alerts(feeds:"${env.feed}"){` +
                `alertDescriptionText(language:"${request.cookie('lang') || 'fi'}")` +
                'alertSeverityLevel}}'
        }, env.key)
        if (json) {
            // Sort alerts by severity
            const order = ['SEVERE', 'WARNING', 'INFO']
            json.data.alerts.sort((a, b) =>
                order.indexOf(a.alertSeverityLevel) - order.indexOf(b.alertSeverityLevel))
            // Generate alerts content for selected lang
            $('#alert', this).innerHTML = json.data.alerts.reduce((cat, a) => {
                // Skip alerts with no description
                return a.alertDescriptionText ?
                    `${cat}<p class="${a.alertSeverityLevel.toLowerCase()}">` +
                        `${a.alertDescriptionText}</p>` :
                    cat
            }, '')
        }
        menu()
    }

    // Listen for lang and favorite stop change notifications
    ui.listen('lang', this.load)
    ui.listen('fav', menu)
}
