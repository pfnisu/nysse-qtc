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
            const jump = document.createElement('ul')
            let i = 0
            for (const pat of json.data.route.patterns) {
                // Generate jump anchors to pattern headings
                jump.innerHTML +=
                    `<li><a href="#p=0;route=${rid};pattern=${i}">` +
                        `&#8594; ${pat.headsign}</a></li>`
                this.tree.innerHTML +=
                    `<h2 id="p=0;route=${rid};pattern=${i++}">` +
                        `${rid} &#8594; ${pat.headsign}</h2>` +
                    '<table><tbody></tbody></table>'
                const content = this.tree.querySelector('table:last-of-type>tbody')
                for (const stop of pat.stops) {
                    const sid = stop.gtfsId.split(':')[1]
                    content.innerHTML +=
                        `<tr><th class="zone">${stop.zoneId}</th>` +
                            `<th class="stop">${sid}</th>` +
                            `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
                }
            }
            this.tree.querySelector('h2').after(jump)
        } else this.tree.innerHTML = `<h2>${l.str.error}</h2>`
    }
}
