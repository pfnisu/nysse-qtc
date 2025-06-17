import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'
import {Alerts} from './alerts.js'

// List of all routes. Parent view of Alerts
export function List(l) {
    ui.init(this, 'list')

    this.load = async () => {
        this.tree.innerHTML = '<div></div><table></table>'
        ui.bind([new Alerts(l)], $('div', this))

        const json = await request.http(env.uri, 'POST', {
            'query': `{routes(feeds:"${env.feed}"){shortName longName}}`
        }, env.key)
        if (json) {
            // Sort route list alphanumerically
            const comp = new Intl.Collator('fi', { numeric: true }).compare
            json.data.routes.sort((a, b) => comp(a.shortName, b.shortName))
            let html = '<tbody>'
            for (const route of json.data.routes)
                html +=
                    `<tr><th class="route">${route.shortName}</th>` +
                        `<td><a href="#p=0;route=${route.shortName}">` +
                            `${route.longName}</a></td></tr>`
            $('table', this).innerHTML = `${html}</tbody>`
        } else this.tree.innerHTML = `<h2>${l.str.error}</h2>`
    }
}
