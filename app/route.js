import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// All patterns (stop lists) for a route
export function Route(l) {
    ui.init(this, 'route')

    this.compose = async () => {
        const rid = request.hash(this.title)
        const query = {
            'query': `{route(id:"${env.feed}:${rid}"){` +
                'patterns{stops{gtfsId name zoneId}headsign}longName}}'
        }
        const json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            document.title = `${rid} ${json.data.route.longName} | ${document.title}`
            let i = 0
            let list = ''
            let html = ''
            for (const pat of json.data.route.patterns) {
                // Generate jump anchors to pattern headings
                list += `<li><a data-i="${i++}">&#8594; ${pat.headsign}</a></li>`
                html += `<h2>${rid} &#8594; ${pat.headsign}</h2><table><tbody>`
                for (const stop of pat.stops) {
                    const sid = stop.gtfsId.split(':')[1]
                    html +=
                        `<tr><th class="zone">${stop.zoneId}</th>` +
                            `<th class="stop">${sid}</th>` +
                            `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
                }
                html += '</tbody></table>'
            }
            this.tree.innerHTML = html
            const jump = document.createElement('ul')
            jump.innerHTML = list
            jump.addEventListener('click', (ev) => {
                const h = this.tree.querySelectorAll('h2')[ev.target.dataset.i]
                h.scrollIntoView()
                h.after(jump)
            }, true)
            this.tree.querySelector('h2').after(jump)
        } else this.tree.innerHTML = `<h2>${l.str.error}</h2>`
    }
}
