import ui from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'
import {Arrivals} from './arrivals.js'
import {Search} from './search.js'

// Timetables for a stop. Parent view of Arrivals and Search
export function Stops(l, listenLang, highlight) {
    ui.init(this, l.str.stops)
    const arrivals = new Arrivals(l)
    const search = new Search(l, listenLang)

    // Format a day offset as YYYYMMDD
    // 0...6 = Sunday - Saturday, null = Closest weekday
    const day = (offset = null) => {
        let dt = new Date()
        const today = dt.getUTCDay() || 7
        offset ??= today < 6 ? today : 8
        dt.setUTCDate(dt.getUTCDate() + offset - today)
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
        let html = ''
        // Sparse array, iterating as object
        for (const hour in table) {
            table[hour].sort((a, b) => a.minute - b.minute)
            html += `<tr><th>${hour.toString().padStart(2, '0')}</th><td>`
            for (const trip of table[hour])
                html += ` <p>${trip.minute}<span class="route">${trip.route}</span></p>`
            html += '</td></tr>'
        }
        root.innerHTML = html || `<tr><th>${l.str.noTrips}</th></tr>`
    }

    this.compose = async () => {
        const sid = request.hash('stop')
        if (sid) {
            // Using aliases to get everything in one query
            const query = {
                'query': `{stop(id:"${env.feed}:${sid}"){` +
                    `mon:stoptimesForServiceDate(date:"${dates.mon}"){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    `sat:stoptimesForServiceDate(date:"${dates.sat}"){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    `sun:stoptimesForServiceDate(date:"${dates.sun}"){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    'name zoneId}}'
            }
            const json = await request.http(env.uri, 'POST', query, env.key)
            if (json?.data.stop) {
                document.title =
                    `${json.data.stop.zoneId} ${sid} ${json.data.stop.name}` +
                    ` | ${document.title}`
                const hid = request.cookie('home')
                this.tree.innerHTML =
                    `<h2>${json.data.stop.zoneId} ${sid} ${json.data.stop.name}</h2>` +
                    `<button id="home">${sid === hid ? l.str.home : l.str.setHome}` +
                    '</button><table></table>' +
                    `<h2>${l.str.monFri}</h2><table id="mon"><tbody></tbody></table>` +
                    `<h2>${l.str.sat}</h2><table id="sat"><tbody></tbody></table>` +
                    `<h2>${l.str.sun}</h2><table id="sun"><tbody></tbody></table>`
                this.tree.querySelector('#home').addEventListener('click', (ev) => {
                    request.cookie('home', sid)
                    ev.target.innerHTML = l.str.home
                    // Notify listeners when home stop is set
                    this.notify()
                })

                // Arrivals is a live view, updating separately
                ui.bind([arrivals], this.tree.querySelector('table'))

                timetable(json.data.stop.mon, this.tree.querySelector('#mon>tbody'))
                timetable(json.data.stop.sat, this.tree.querySelector('#sat>tbody'))
                timetable(json.data.stop.sun, this.tree.querySelector('#sun>tbody'))
                highlight()
            } else this.tree.innerHTML = `<h2>${json ? l.str.badStop : l.str.error}</h2>`
        } else {
            ui.bind([search], this.tree)
            const input = search.tree.querySelector('input')
            input.value = ''
            input.focus()
        }
    }

    listenLang(() => this.title = l.str.stops)
}
