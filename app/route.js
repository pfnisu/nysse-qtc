import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function Route() {
    ui.init(this, 'route')

    this.compose = async () => {
        const rid = request.hash(this.title)
        const query = {
            'query': `{ route(id: "tampere:${rid}") { longName stops { gtfsId name zoneId } } }`
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            document.title = `${rid} ${json.data.route.longName} | ${document.title}`
            this.tree.innerHTML =
                `<h2>${rid} ${json.data.route.longName}</h2><table><tbody></tbody></table>`
            const content = this.tree.querySelector('tbody')
            for (const stop of json.data.route.stops) {
                const sid = stop.gtfsId.split(':')[1]
                content.innerHTML += 
                    `<tr><th class="zone">${stop.zoneId}</th><th class="stop">${sid}</th>` +
                        `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
            }
        } else this.tree.innerHTML = '<h2>Yhteysvirhe...</h2>'
    }
}
