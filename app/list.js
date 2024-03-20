import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'
import {Alerts} from './alerts.js'

// List of all routes. Parent view of Alerts
export function List(l) {
    ui.init(this, 'list')

    this.compose = async () => {
        const query = {
            'query': `{routes(feeds:"${env.feed}"){shortName longName}` +
                `alerts(feeds:"${env.feed}"){alertDescriptionTextTranslations{` +
                    'language text}alertHash alertSeverityLevel}}'
        }
        const json = await request.http(env.uri, 'POST', query, env.key)
        this.tree.innerHTML =
            `<h2>${l.str.listHead}</h2>` +
            '<div></div><table><tbody></tbody></table>'
        let html = ''
        if (json) {
            // Remove duplicate alerts
            const set = [...new Map(json.data.alerts.map(a => [
                a.alertHash, [
                    ...a.alertDescriptionTextTranslations,
                    a.alertSeverityLevel
                ]
            ])).values()]
            ui.bind([new Alerts(l, set)], $('div', this))

            json.data.routes.sort((a, b) =>
                parseInt(a.shortName) - parseInt(b.shortName))
            for (const route of json.data.routes)
                html +=
                    `<tr><th class="route">${route.shortName}</th>` +
                        `<td><a href="#p=0;route=${route.shortName}">` +
                            `${route.longName}</a></td></tr>`
        } else html = `<tr><td>${l.str.error}</td></tr>`
        $('tbody', this).innerHTML = html
    }

    ui.listen('lang', () => $('h2', this).innerHTML = l.str.listHead)
}
