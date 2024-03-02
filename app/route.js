import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// All patterns (stop lists) for a route
export function Route(l) {
    ui.init(this, 'route', 0)
    const jump = document.createElement('ul')

    this.start = (i = null) => {
        $('[disabled]', this)?.removeAttribute('disabled')
        const h = $('h2', this, true)[i ?? 0]
        if (i) h.scrollIntoView()
        h.after(jump)
    }

    this.compose = async () => {
        const rid = request.hash(this.title)
        const query = {
            'query': `{route(id:"${env.feed}:${rid}"){` +
                'patterns{stops{gtfsId name zoneId}headsign}longName}}'
        }
        const json = await request.http(env.uri, 'POST', query, env.key)
        if (json?.data.route) {
            document.title = `${rid} ${json.data.route.longName} | ${document.title}`
            let i = 0
            let list = ''
            let html = ''
            for (const pat of json.data.route.patterns) {
                // Generate jump anchors to pattern headings
                list += `<li><button data-i="${i++}">&#10141; ${pat.headsign}</button></li>`
                html += `<h2>${rid} &#10141; ${pat.headsign}</h2><table><tbody>`
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
            jump.innerHTML = list
            jump.addEventListener('click', (ev) => {
                if (ev.target.dataset.i) {
                    this.start(ev.target.dataset.i)
                    ev.target.setAttribute('disabled', '')
                }
            }, true)
            $('h2', this).after(jump)
        } else this.tree.innerHTML = `<h2>${json ? l.str.badRoute : l.str.error}</h2>`
    }
}
