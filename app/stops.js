import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'
import {Arrivals} from './arrivals.js'

export function Stops(title) {
    ui.init(this, 'Pysäkit')
    const arrivals = new Arrivals()

    // Format a day offset as YYYYMMDD
    // 0...6 = Sunday - Saturday, null = Closest weekday
    const day = (offset = null) => {
        let dt = new Date()
        const today = dt.getUTCDay()
        offset ??= today < 6 ? today : 8
        dt.setUTCDate(dt.getUTCDate() + (offset - today))
        return dt.toJSON().split('T')[0].replaceAll('-', '')
    }
    const dates = { mon: day(), sat: day(6), sun: day(7) }

    // Generate sorted timetable from route timestamps
    const timetable = (data, root) => {
        let table = new Array(24)
        for (const route of data) {
            for (const time of route.stoptimes) {
                const dt = new Date(time.scheduledArrival * 1000).toUTCString()
                const hour = parseInt(dt.substring(17, 19))
                table[hour] ??= []
                table[hour].push({
                    minute: dt.substring(20, 22),
                    route: route.pattern.route.shortName
                })
            }
        }
        // Sparse array, iterating as object
        for (const hour in table) {
            table[hour].sort((a, b) => a.minute - b.minute)
            let row = `<tr><th>${hour.toString().padStart(2, '0')}</th><td>`
            for (const trip of table[hour])
                row += ` <p>${trip.minute}<span class="route">${trip.route}</span></p>`
            root.innerHTML += `${row}</td></tr>`
        }
        root.innerHTML ||= '<tr><th>Ei vuoroja</th></tr>'
    }

    this.compose = async () => {
        const sid = request.hash('stop')
        if (sid) {
            // Using aliases to get everything in one query
            const query = {
                'query': `{ stop(id: "${env.feed}:${sid}") { name zoneId ` +
                    `mon: stoptimesForServiceDate(date: "${dates.mon}") {` +
                        'pattern { route { shortName } } stoptimes { scheduledArrival } }' +
                    `sat: stoptimesForServiceDate(date: "${dates.sat}") {` +
                        'pattern { route { shortName } } stoptimes { scheduledArrival } }' +
                    `sun: stoptimesForServiceDate(date: "${dates.sun}") {` +
                        'pattern { route { shortName } } stoptimes { scheduledArrival } } } }'
            }
            let json = await request.http(env.uri, 'POST', query, env.key)
            if (json) {
                document.title = `${json.data.stop.zoneId} ${sid} ${json.data.stop.name} | ${this.title}${title}`
                const hid = request.cookie('home')
                const done = '&#10003; Kotipysäkki'
                this.tree.innerHTML =
                    `<h2>${json.data.stop.zoneId} ${sid} ${json.data.stop.name}</h2>` +
                    `<button id="home">${sid === hid ? done : 'Aseta kotipysäkiksi'}</button><table></table>` +
                    '<h2>Maanantai-perjantai</h2><table id="mon"><tbody></tbody></table>' +
                    '<h2>Lauantai</h2><table id="sat"><tbody></tbody></table>' +
                    '<h2>Sunnuntai</h2><table id="sun"><tbody></tbody></table>'
                this.tree.querySelector('#home').addEventListener('click', async (ev) => {
                    ev.preventDefault()
                    request.cookie('home', sid)
                    ev.target.innerHTML = done
                    // Notify listeners when home stop is set
                    this.notify()
                })

                timetable(json.data.stop.mon, this.tree.querySelector('#mon>tbody'))
                timetable(json.data.stop.sat, this.tree.querySelector('#sat>tbody'))
                timetable(json.data.stop.sun, this.tree.querySelector('#sun>tbody'))

                // Arrivals is a live view, updating separately
                ui.bind([arrivals], this.tree.querySelector('table'))
            } else this.tree.innerHTML = '<h2>Yhteysvirhe...</h2>'
        } else {
            this.tree.innerHTML =
                '<h2>Etsi pysäkkejä nimellä tai numerolla</h2>' +
                '<form><input type="text"/><button id="search">Etsi</button></form><table><tbody></tbody></table>'
            const content = this.tree.querySelector('tbody')
            const search = this.tree.querySelector('input')
            search.focus()
            this.tree.querySelector('#search').addEventListener('click', async (ev) => {
                ev.preventDefault()
                content.innerHTML = ''
                const query = {
                    'query': `{ stops(feeds: "${env.feed}", maxResults: 20, ` +
                        `name: "${search.value}") { gtfsId name zoneId } }`
                }
                let json = await request.http(env.uri, 'POST', query, env.key)
                if (json) {
                    // Sort results 1st by zone, 2nd by stop
                    json.data.stops.sort((a, b) =>
                        a.zoneId.charCodeAt() - b.zoneId.charCodeAt() ||
                            a.gtfsId.split(':')[1] - b.gtfsId.split(':')[1])
                    for (const stop of json.data.stops) {
                        const sid = stop.gtfsId.split(':')[1]
                        content.innerHTML +=
                            `<tr><th class="zone">${stop.zoneId}</th><th class="stop">${sid}</th>` +
                                `<td><a href="#p=1;stop=${sid}">${stop.name}</a></td></tr>`
                    }
                } else content.innerHTML = '<tr><td>Yhteysvirhe...</td></tr>'
            })
        }
    }
}
