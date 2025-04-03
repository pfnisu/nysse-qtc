import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// All patterns (stop lists) for a route
export function Route(l) {
    ui.init(this, 'route', 0)
    const jump = document.createElement('ul')
    let pid, title

    this.start = () => {
        // Update jump list and position only with valid API response
        if (title) {
            document.title = title
            $('[disabled]', this)?.removeAttribute('disabled')
            const h = pid ? $(`[data-h="${pid}"]`, this) : $('h2', this)
            h.after(jump)
            // Pattern id is set via notification or click event and
            // used to scroll to matching heading
            if (pid) {
                $(`[data-b="${pid}"]`, this).setAttribute('disabled', '')
                h.scrollIntoView()
            }
        }
    }

    this.stop = () => pid = null

    this.load = async () => {
        const rid = request.hash(this.name)
        const json = await request.http(env.uri, 'POST', {
            'query': `{route(id:"${env.feed}:${rid}"){` +
                'patterns{stops{gtfsId name zoneId}headsign code}longName}}'
        }, env.key)
        title = null
        if (json?.data.route) {
            title = `${rid} ${json.data.route.longName} | ${document.title}`
            let list = ''
            let html = ''
            for (const pat of json.data.route.patterns) {
                // Generate jump list to pattern headings
                list +=
                    `<li><button data-b="${pat.code}">` +
                    `\u279d ${pat.headsign}</button></li>`
                html +=
                    `<h2 data-h="${pat.code}">` +
                    `${rid} \u279d ${pat.headsign}</h2><table><tbody>`
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

    // Listen for pattern id from Arrivals
    ui.listen('pid', (ev) => pid = ev.detail)

    // Update title on lang change
    ui.listen('lang', () => title = title?.replace(/\|.*\|/, `| ${l.str.lines} |`))
}
