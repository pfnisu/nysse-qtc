import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// Stop search
export function Search(l) {
    // Static view, latest search persists
    ui.init(this, 'search')

    // Clear previous input and update search history
    this.reset = () => {
        const input = $('input', this)
        input.value = ''
        input.focus()
        const s1 = request.cookie('search1')
        const s2 = request.cookie('search2')
        $('div', this).innerHTML =
            (s1 ?
                `<button data-h="${s1}">\u279d ${s1}</button> ` :
                '') +
            (s2 ?
                `<button data-h="${s2}">\u279d ${s2}</button>` :
                '')
    }

    this.load = async () => {
        this.tree.innerHTML =
            `<h2>${l.str.searchHead}</h2>` +
            '<form><input type="text"/>' +
                `<button id="search">${l.str.search}</button><div></div>` +
            '</form><table><tbody></tbody></table>'
        $('form', this).addEventListener('click', async (ev) => {
            ev.preventDefault()
            const input = ev.target.id ? $('input', this).value : ev.target.dataset.h
            if (/^[0-9]{4}$/.test(input)) request.hash('stop', input)
            else if (input) {
                // Rotate search history cookies
                if (ev.target.id) {
                    request.cookie('search2', request.cookie('search1'))
                    request.cookie('search1', input)
                }
                const json = await request.http(env.uri, 'POST', {
                    'query': `{stops(name:"${input}"){gtfsId name zoneId}}`
                }, env.key)
                let html = ''
                if (json?.data.stops.length) {
                    // Exclude stops from other feeds
                    const stops = json.data.stops.filter((s) =>
                        s.gtfsId.startsWith(env.feed))
                    // Sort results 1st by zone, 2nd by stop id
                    stops.sort((a, b) =>
                        a.zoneId.charCodeAt() - b.zoneId.charCodeAt() ||
                            a.gtfsId.split(':')[1] - b.gtfsId.split(':')[1])
                    for (const stop of stops) {
                        const sid = stop.gtfsId.split(':')[1]
                        html +=
                            `<tr><th class="zone">${stop.zoneId}</th>` +
                                `<th class="stop">${sid}</th>` +
                                `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
                    }
                } else html = `<tr><td>${json ? l.str.noStops : l.str.error}</td></tr>`
                $('tbody', this).innerHTML = html
            }
        })
    }

    ui.listen('lang', this.load)
}
