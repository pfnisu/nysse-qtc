import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

export function Arrivals(l) {
    ui.init(this, 'arrivals', true, 'tbody')

    // Compose arrival UI every 30 sec
    this.interval = 30000

    this.compose = async () => {
        const sid = request.hash('stop')
        const query = {
            'query': `{stop(id:"${env.feed}:${sid}"){stoptimesWithoutPatterns(`+
                'timeRange:86400,numberOfDepartures:15,omitCanceled:false){' +
                    'scheduledArrival realtimeArrival headsign trip{' +
                        'route{shortName}}realtimeState}}}'
        }
        let json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            html = ''
            for (const dep of json.data.stop.stoptimesWithoutPatterns) {
                let sign =
                    `&#8594;<a href="#p=0;route=${dep.trip.route.shortName}">` +
                    `${dep.headsign}</a>`
                if (dep.realtimeState == 'CANCELED')
                    sign = `&#10005;<a>${l.str.canceled}</a>`
                const dt = new Date(dep.scheduledArrival * 1000)
                const diff =
                    Math.round((dep.realtimeArrival - dep.scheduledArrival) / 60)
                html +=
                    `<tr><td>${dt.toUTCString().substring(17, 22)}</td>` +
                        '<th class="diff">' +
                            `${diff > 0 ? '+' : ''}${diff !== 0 ? diff : ''}</th>` +
                        `<th class="route">${dep.trip.route.shortName}</th>` +
                        `<td>&nbsp;${sign}</td></tr>`
            }
            this.tree.innerHTML =
                html || `<tr><th class="diff">${l.str.noArrivals}</th></tr>`
        } else this.tree.innerHTML = `<tr><td>${l.str.error}</td></tr>`
    }
}
