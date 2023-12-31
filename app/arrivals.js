import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function Arrivals() {
    ui.init(this, 'arrivals', true, 'tbody')

    // Compose arrival UI every 30 sec
    this.interval = 30000

    this.compose = async () => {
        const sid = request.hash('stop')
        const query = {
            'query': `{ stop(id: "tampere:${sid}") {` +
                'stoptimesWithoutPatterns(timeRange: 86400, numberOfDepartures: 10) {' +
                    'scheduledArrival realtimeArrival headsign trip { route { shortName } } } } }'
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            this.tree.innerHTML = ''
            for (const stop of json.data.stop.stoptimesWithoutPatterns) {
                const time = new Date(stop.scheduledArrival * 1000)
                const diff = Math.round((stop.realtimeArrival - stop.scheduledArrival) / 60)
                this.tree.innerHTML +=
                    `<tr><td>${time.toUTCString().substring(17, 22)}</td>` +
                        `<th class="diff">${diff > 0 ? '+' : ''}${diff !== 0 ? diff : ''}</th>` +
                        `<th class="route">${stop.trip.route.shortName}</th>` +
                        `<td>&nbsp;&#8594;<a href="#p=0;route=${stop.trip.route.shortName}">` +
                            `${stop.headsign}</a></td></tr>`
            }
            this.tree.innerHTML ||= '<tr><th class="diff">Ei vuoroja vuorokauden sisään</th></tr>'
        } else this.tree.innerHTML = '<tr><td>Yhteysvirhe...</td></tr>'
    }
}
