import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function Stops(title) {
    ui.init(this, 'Pysäkit')

    this.compose = async () => {
        const sid = request.hash('stop')
        if (sid) {
            // Compose stop UI every 30 sec
            this.interval = 30000
            const query = {
                'query': `{ stop(id: "tampere:${sid}") {` +
                    'name stoptimesWithoutPatterns(timeRange: 86400, numberOfDepartures: 20) {' +
                        'scheduledArrival realtimeArrival headsign trip { route { shortName } } } } }'
            }
            let json = await request.http(env.uri, 'POST', query, env.key)
            if (json) {
                document.title = `${sid} ${json.data.stop.name} | ${this.title}${title}`
                const hid = request.cookie('home')
                const done = '&#10003; Kotipysäkki'
                this.tree.innerHTML =
                    `<h1>${sid} ${json.data.stop.name}</h1>` +
                    `<button id="home">${sid === hid ? done : 'Aseta kotipysäkiksi'}</button><table></table>`
                this.tree.querySelector('#home').addEventListener('click', async (ev) => {
                    ev.preventDefault()
                    request.cookie('home', sid)
                    ev.target.innerHTML = done
                    // Notify listeners when home stop is set
                    this.notify()
                })
                const content = this.tree.querySelector('table')
                for (const stop of json.data.stop.stoptimesWithoutPatterns) {
                    const time = new Date(stop.scheduledArrival * 1000)
                    const diff = Math.round((stop.realtimeArrival - stop.scheduledArrival) / 60)
                    content.innerHTML +=
                        `<tr><td>${time.toUTCString().substring(17, 22)}</td>` +
                            `<td class="diff">${diff > 0 ? '+' : ''}${diff !== 0 ? diff : ''}</td>` +
                            `<th class="route">${stop.trip.route.shortName}</th>` +
                            `<td><a href="#p=0;route=${stop.trip.route.shortName}">` +
                                `${stop.headsign}</a></td></tr>`
                }
            } else this.tree.innerHTML = '<h1>Yhteysvirhe...</h1>'
        } else {
            // Compose search UI only on demand
            this.interval = 0
            this.tree.innerHTML =
                '<h1>Etsi pysäkkejä nimellä tai numerolla</h1>' +
                '<form><input type="text"/><button id="search">Etsi</button></form><table></table>'
            const content = this.tree.querySelector('table')
            const search = this.tree.querySelector('input')
            search.focus()
            this.tree.querySelector('#search').addEventListener('click', async (ev) => {
                ev.preventDefault()
                content.innerHTML = ''
                const query = {
                    'query': `{ stops(feeds: "tampere", name: "${search.value}") { gtfsId name } }`
                }
                let json = await request.http(env.uri, 'POST', query, env.key)
                if (json) {
                    for (const stop of json.data.stops) {
                        const sid = stop.gtfsId.split(':')[1]
                        content.innerHTML +=
                            `<tr><th class="stop">${sid}</th>` +
                                `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
                    }
                }
            })
        }
    }
}
