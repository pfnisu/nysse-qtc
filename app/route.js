import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function Route(l) {
    ui.init(this, 'route')

    this.compose = async () => {
        const rid = request.hash(this.title)
        const query = {
            'query': `{route(id:"${env.feed}:${rid}"){` +
                'longName patterns{headsign stops{gtfsId name zoneId}}}}'
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            document.title = `${rid} ${json.data.route.longName} | ${document.title}`
            this.tree.innerHTML = ''
            for (const pattern of json.data.route.patterns) {
                this.tree.innerHTML +=
                    `<h2>${rid} &#8594; ${pattern.headsign}</h2>` +
                    '<table><tbody></tbody></table>'
                const content = this.tree.querySelector('table:last-of-type>tbody')
                for (const stop of pattern.stops) {
                    const sid = stop.gtfsId.split(':')[1]
                    content.innerHTML +=
                        `<tr><th class="zone">${stop.zoneId}</th>` +
                            `<th class="stop">${sid}</th>` +
                            `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
                }
            }
        } else this.tree.innerHTML = `<h2>${l.str.error}</h2>`
    }
}
