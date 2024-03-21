import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// All patterns (stop lists) for a route
export function Route(l) {
    ui.init(this, 'route', 0)
    const jump = document.createElement('ul')
    let pid, title

    this.start = () => {
        document.title = title
        $('[disabled]', this)?.removeAttribute('disabled')
        const h = pid ? $(`[data-h="${pid}"]`, this) : $('h2', this)
        h.after(jump)
        if (pid) {
            $(`[data-b="${pid}"]`, this).setAttribute('disabled', '')
            h.scrollIntoView()
        }
    }

    this.stop = () => pid = null

    this.compose = async () => {
        const rid = request.hash(this.name)
        const query = {
            'query': `{route(id:"${env.feed}:${rid}"){` +
                'patterns{stops{gtfsId name zoneId}headsign code}longName}}'
        }
        const json = await request.http(env.uri, 'POST', query, env.key)
        if (json?.data.route) {
            title = `${rid} ${json.data.route.longName} | ${document.title}`
            let list = ''
            let html = ''
            for (const pat of json.data.route.patterns) {
                // Generate jump anchors to pattern headings
                list +=
                    `<li><button data-b="${pat.code}">` +
                    `&#10141; ${pat.headsign}</button></li>`
                html +=
                    `<h2 data-h="${pat.code}">` +
                    `${rid} &#10141; ${pat.headsign}</h2><table><tbody>`
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
                if (ev.target.dataset.b) {
                    pid = ev.target.dataset.b
                    this.start()
                }
            }, true)
        } else this.tree.innerHTML = `<h2>${json ? l.str.badRoute : l.str.error}</h2>`
    }

    ui.listen('pattern', (ev) => pid = ev.detail)
}
