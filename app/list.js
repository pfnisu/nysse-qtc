import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function List(listen) {
    ui.init(this, 'list', false)

    this.compose = async () => {
        const query = {
            'query': '{ routes(feeds: "tampere") { shortName longName }' +
                'alerts(feeds: "tampere") { alertHash alertDescriptionText } }'
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        const hid = request.cookie('home')
        const home = hid ? `<a href="#p=1;stop=${hid}">Näytä kotipysäkki</a>` : ''
        this.tree.innerHTML =
            '<h2>Tampereen seudun joukkoliikenteen linjat</h2>' +
            `<div style="display:none" id="alert"></div><div id="home"></div>` +
            '<table><tbody></tbody></table>'
        const alerts = this.tree.querySelector('#alert')
        const content = this.tree.querySelector('tbody')
        if (json) {
            // Remove duplicate alerts
            const set = [...new Map(json.data.alerts.map(a => [a.alertHash, a])).values()]
            alerts.innerHTML = set.reduce((cat, a) => `${cat}<p>${a.alertDescriptionText}</p>`, '')
            const show = '&#8505; Näytä tiedotteet'
            const hide = '&#10005; Sulje tiedotteet'
            const toggle = alerts.innerHTML ? `<button>${show}</button><br/>` : ''
            this.tree.querySelector('#home').innerHTML = `${toggle}${home}`
            this.tree.querySelector('button')?.addEventListener('click', (ev) => {
                const a = this.tree.querySelector('#alert')
                a.style.display = a.style.display === 'none' ? '' : 'none'
                ev.target.innerHTML = a.style.display === 'none' ? show : hide
            })
            json.data.routes.sort((a, b) => parseInt(a.shortName) - parseInt(b.shortName))
            for (const route of json.data.routes)
                content.innerHTML += 
                    `<tr><th class="route">${route.shortName}</th>` +
                        `<td><a href="#p=0;route=${route.shortName}">${route.longName}</a></td></tr>`
        } else content.innerHTML = '<td>Yhteysvirhe...</td>'
    }

    // Listen for home stop change -notification from Stops
    listen(() => this.compose())
}
