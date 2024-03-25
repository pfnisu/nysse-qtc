import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// Stop search
export function Search(l) {
    // Static view, latest search persists
    ui.init(this, 'search')

    this.load = async () => {
        this.tree.innerHTML =
            `<h2>${l.str.searchHead}</h2>` +
            '<form><input type="text"/>' +
                `<button id="search">${l.str.search}</button>` +
            '</form><table><tbody></tbody></table>'
        $('#search', this).addEventListener('click', async (ev) => {
            ev.preventDefault()
            const json = await request.http(env.uri, 'POST', {
                'query': `{stops(feeds:"${env.feed}",maxResults:30,` +
                    `name:"${$('input', this).value}")` +
                        '{gtfsId name zoneId}}'
            }, env.key)
            let html = ''
            if (json) {
                // Sort results 1st by zone, 2nd by stop
                json.data.stops.sort((a, b) =>
                    a.zoneId.charCodeAt() - b.zoneId.charCodeAt() ||
                        a.gtfsId.split(':')[1] - b.gtfsId.split(':')[1])
                for (const stop of json.data.stops) {
                    const sid = stop.gtfsId.split(':')[1]
                    html +=
                        `<tr><th class="zone">${stop.zoneId}</th>` +
                            `<th class="stop">${sid}</th>` +
                            `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
                }
            } else html = `<tr><td>${l.str.error}</td></tr>`
            $('tbody', this).innerHTML = html
        })
    }

    ui.listen('lang', this.load)
}
