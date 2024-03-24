import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'

// Realtime trip arrivals for a stop
export function Arrivals(l) {
    // Compose UI every 30 sec
    ui.init(this, 'arrivals', 30000, 'tbody')

    this.compose = async () => {
        const sid = request.hash('stop')
        const query = {
            'query': `{stop(id:"${env.feed}:${sid}"){stoptimesWithoutPatterns(`+
                'timeRange:86400,numberOfDepartures:15,omitCanceled:false){' +
                    'scheduledArrival realtimeArrival headsign trip{' +
                        'pattern{code}}realtimeState}}}'
        }
        const json = await request.http(env.uri, 'POST', query, env.key)
        if (json) {
            let html = ''
            for (const dep of json.data.stop.stoptimesWithoutPatterns) {
                const rid = dep.trip.pattern.code.split(':')[1]
                let sign =
                    `&#10141;<a href="#p=0;route=${rid}" ` +
                    `data-p="${dep.trip.pattern.code}">${dep.headsign}</a>`
                if (dep.realtimeState == 'CANCELED')
                    sign = `&#10005;<a>${l.str.canceled}</a>`
                const dt = new Date(dep.scheduledArrival * 1000)
                const diff =
                    Math.round((dep.realtimeArrival - dep.scheduledArrival) / 60)
                html +=
                    `<tr><td>${dt.toUTCString().substring(17, 22)}</td>` +
                        '<th class="diff">' +
                            `${diff > 0 ? '+' : ''}${diff !== 0 ? diff : ''}</th>` +
                        `<th class="route">${rid}</th>` +
                        `<td>&nbsp;${sign}</td></tr>`
            }
            this.tree.innerHTML =
                html || `<tr><td>${l.str.noArrivals}</td></tr>`
        } else this.tree.innerHTML = `<tr><td>${l.str.error}</td></tr>`
    }

    // Notify with pattern data
    this.tree.addEventListener('click', (ev) => {
        if (ev.target.dataset.p) ui.notify('pid', ev.target.dataset.p)
    })
}
