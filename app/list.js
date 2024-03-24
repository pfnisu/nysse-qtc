import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'
import {Alerts} from './alerts.js'

// List of all routes. Parent view of Alerts
export function List(l) {
    ui.init(this, 'list')

    this.load = async () => {
        const query = {
            'query': `{routes(feeds:"${env.feed}"){shortName longName}` +
                `alerts(feeds:"${env.feed}"){alertDescriptionTextTranslations{` +
                    'language text}alertHash alertSeverityLevel}}'
        }
        const json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            let html = '<div></div><table><tbody>'
            json.data.routes.sort((a, b) =>
                parseInt(a.shortName) - parseInt(b.shortName))
            for (const route of json.data.routes)
                html +=
                    `<tr><th class="route">${route.shortName}</th>` +
                        `<td><a href="#p=0;route=${route.shortName}">` +
                            `${route.longName}</a></td></tr>`
            this.tree.innerHTML = `${html}</tbody></table>`

            // Remove duplicate alerts
            const set = [...new Map(json.data.alerts.map(a => [
                a.alertHash, [
                    ...a.alertDescriptionTextTranslations,
                    a.alertSeverityLevel
                ]
            ])).values()]
            ui.bind([new Alerts(l, set)], $('div', this))
        } else this.tree.innerHTML = `<h2>${l.str.error}</h2>`
    }
}
