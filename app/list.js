import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// List of all routes and alerts
export function List(l, listenLang, listenHome) {
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
            alerts.innerHTML = set.reduce((cat, a) => {
                const t = a.find((t) => t.language === lang)
                // Skip alerts with no description
                return t?.text ? `${cat}<p>${t.text}</p>` : cat
            }, '')
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
            let html = ''
            for (const route of json.data.routes)
                html +=
                    `<tr><th class="route">${route.shortName}</th>` +
                        `<td><a href="#p=0;route=${route.shortName}">` +
                            `${route.longName}</a></td></tr>`
            content.innerHTML = html
        } else content.innerHTML = `<tr><td>${l.str.error}</td></tr>`
    }

    // Listen for lang and home stop change notifications
    listenLang(() => this.compose())
    listenHome(() => this.compose())
}
