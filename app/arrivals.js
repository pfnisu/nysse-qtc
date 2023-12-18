import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function Arrivals() {
    ui.init(this, 'arrivals')

    // Compose arrival UI every 30 sec
    this.interval = 30000

    this.compose = async () => {
        const sid = request.hash('stop')
        if (!sid) return
        const query = {
            'query': `{ stop(id: "tampere:${sid}") {` +
                'stoptimesWithoutPatterns(timeRange: 86400, numberOfDepartures: 10) {' +
                    'scheduledArrival realtimeArrival headsign trip { route { shortName } } } } }'
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            this.tree.innerHTML = '<table><tbody></tbody></table>'
            const content = this.tree.querySelector('tbody')
            for (const stop of json.data.stop.stoptimesWithoutPatterns) {
                const time = new Date(stop.scheduledArrival * 1000)
                const diff = Math.round((stop.realtimeArrival - stop.scheduledArrival) / 60)
                content.innerHTML +=
                    `<tr><td>${time.toUTCString().substring(17, 22)}</td>` +
                        `<th class="diff">${diff > 0 ? '+' : ''}${diff !== 0 ? diff : ''}</th>` +
                        `<th class="route">${stop.trip.route.shortName}</th>` +
                        `<td><a href="#p=0;route=${stop.trip.route.shortName}">` +
                            `${stop.headsign}</a></td></tr>`
            }
        } else this.tree.innerHTML = '<h1>Yhteysvirhe...</h1>'
    }
}
