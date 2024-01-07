import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function List(l, listen) {
    ui.init(this, 'list', false)

    this.compose = async () => {
        const query = {
            'query': `{routes(feeds:"${env.feed}"){shortName longName}` +
                `alerts(feeds:"${env.feed}"){alertDescriptionTextTranslations{` +
                    'language text}alertHash}}'
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        const hid = request.cookie('home')
        const state = request.cookie('alerts')
        const home = hid ? `<li><a href="#p=1;stop=${hid}">${l.str.goHome}</a></li>` : ''
        this.tree.innerHTML =
            `<h2>${l.str.listHead}</h2>` +
            `<div${state === null ? '' : ' class="hidden"'} id="alert"></div>` +
            '<ul></ul><table><tbody></tbody></table>'
        const alerts = this.tree.querySelector('#alert')
        const content = this.tree.querySelector('tbody')
        if (json) {
            // Remove duplicate alerts
            const set = [...new Map(json.data.alerts.map(a => [
                a.alertHash,
                a.alertDescriptionTextTranslations
            ])).values()]
            const lang = request.cookie('lang') || 'fi'
            alerts.innerHTML = set.reduce((cat, a) =>
                `${cat}<p>${a.find((t) => t.language === lang)?.text || l.str.noLang}</p>`,
                '')
            const toggle = alerts.innerHTML
                ? `<li><button>${state === null ? l.str.close : l.str.open}</button></li>`
                : ''
            this.tree.querySelector('ul').innerHTML = `${toggle}${home}`
            this.tree.querySelector('button')?.addEventListener('click', (ev) => {
                const a = this.tree.querySelector('#alert')
                a.classList.toggle('hidden')
                ev.target.innerHTML = a.classList.contains('hidden')
                    ? l.str.open
                    : l.str.close
                request.cookie('alerts', a.className)
            })
            json.data.routes.sort((a, b) => parseInt(a.shortName) - parseInt(b.shortName))
            for (const route of json.data.routes)
                content.innerHTML += 
                    `<tr><th class="route">${route.shortName}</th>` +
                        `<td><a href="#p=0;route=${route.shortName}">` +
                            `${route.longName}</a></td></tr>`
        } else content.innerHTML = `<tr><td>${l.str.error}</td></tr>`
    }

    // Listen for home stop and lang change notifications
    listen(() => this.compose())
    l.listen(() => this.compose())
}
