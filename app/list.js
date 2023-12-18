import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function List(listen) {
    ui.init(this, 'list', false)

    this.compose = async () => {
        const query = {
            'query': '{ routes(feeds: "tampere") { shortName longName } }'
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        const hid = request.cookie('home')
        const home = hid ? `<a id="home" href="#p=1;stop=${hid}">Näytä kotipysäkki</a>` : ''
        this.tree.innerHTML =
            `<h2>Tampereen seudun joukkoliikenteen linjat</h2>${home}<table><tbody></tbody></table>`
        const content = this.tree.querySelector('tbody')
        if (json) {
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
