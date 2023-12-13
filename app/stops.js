import ui from './lib/ui.js'
import request from './lib/request.js'

export function Stops(api) {
    ui.init(this, 'Pysäkit')

    this.compose = async () => {
        const sid = request.hash('stop')
        if (sid) {
            this.interval = 30000
            const query = {
                'query': `{
                    stop(id: "tampere:${sid}") {
                        name
                        stoptimesWithoutPatterns(timeRange: 86400, numberOfDepartures: 20) {
                            scheduledArrival
                            realtimeArrival
                            trip {
                                route {
                                    shortName
                                    longName
                                }
                            }
                        }
                    }
                }`
            }
            let json = await request.http(api.uri, 'POST', query, api.key)
            if (json) {
                document.title = `${sid} ${json.data.stop.name} | ${document.title}`
                this.tree.innerHTML =
                    `<h1>${sid} ${json.data.stop.name}</h1>
                    <table></table>`
                const content = this.tree.querySelector('table')
                for (const stop of json.data.stop.stoptimesWithoutPatterns) {
                    const time = new Date(stop.scheduledArrival * 1000)
                    content.innerHTML +=
                        `<tr><td>${time.toUTCString().split(' ')[4]}</td>
                        <th>${stop.trip.route.shortName}</th>
                        <td>
                            <a href="#p=0;route=${stop.trip.route.shortName}">
                                ${stop.trip.route.longName}
                            </a>
                        </td>`
                }
            } else this.tree.innerHTML = '<h1>Yhteysvirhe...</h1>'
        } else {
            this.interval = 0
            this.tree.innerHTML =
                `<h1>Etsi pysäkkejä nimellä tai numerolla</h1>
                <form>
                    <input type="text"/><button>Etsi</button>
                </form>
                <table></table>`
            const content = this.tree.querySelector('table')
            const search = this.tree.querySelector('input')
            search.focus()
            this.tree.querySelector('button').addEventListener('click', async (ev) => {
                ev.preventDefault()
                content.innerHTML = ''
                const query = {
                    'query': `{
                        stops(feeds: "tampere", name: "${search.value}") {
                            gtfsId
                            name
                        }
                    }`
                }
                let json = await request.http(api.uri, 'POST', query, api.key)
                if (json) {
                    for (const stop of json.data.stops) {
                        const sid = stop.gtfsId.split(':')[1]
                        content.innerHTML +=
                            `<tr>
                                <td>${sid}</td>
                                <td><a href="#p=1;stop=${sid}">${stop.name}</a></td>
                            </tr>`
                    }
                }
            })
        }
    }
}
